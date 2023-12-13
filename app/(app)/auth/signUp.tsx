import AppButton, { ButtonState } from "@/components/AppButton";
import AppText from "@/components/AppText";
import AppTextInput from "@/components/AppTextInput";
import PasswordInput from "@/components/PasswordInput";
import SocialAuthDiscordButton from "@/components/auth/SocialAuthDiscordButton";
import { BACKGROUND_COLOR } from "@/components/subscription/functions";
import { colors } from "@/parameters";
import { useAppDispatch } from "@/redux/reduxHooks";
import { updateFirstTimeOpeningApp } from "@/redux/slices/syncSlice";
import { useWarmUpBrowser } from "@/useWarmUpBrowser";
import { useSignUp } from "@clerk/clerk-expo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";
import { useState } from "react";
import { Dimensions, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import { RoutesParams } from "routes";

export const useHandleClerkErrorMessages = () => {
    const [error, setState] = useState({ email: "", password: "", code: "", identifier: "", username: "" });

    const updatePasswordError = (message: string) =>
        setState((prev) => {
            return { ...prev, password: message };
        });

    const updateCodeError = (message: string) =>
        setState((prev) => {
            return { ...prev, code: message };
        });

    const updateIdentifierError = (message: string) =>
        setState((prev) => {
            return { ...prev, identifier: message };
        });

    const updateEmailError = (message: string) =>
        setState((prev) => {
            return { ...prev, email: message };
        });

    const updateUsernameError = (message: string) =>
        setState((prev) => {
            return { ...prev, username: message };
        });

    const resetErrors = () => setState({ email: "", password: "", code: "", identifier: "", username: "" });

    return { error, updateEmailError, updatePasswordError, resetErrors, updateCodeError, updateIdentifierError, updateUsernameError };
};

export const useHandleButtonState = () => {
    const [submitState, setState] = useState<ButtonState>("idle");

    const setSubmitError = () => setState("error");
    const setSubmitLoading = () => setState("loading");
    const resetSubmitState = () => setState("idle");
    const setSubmitSuccess = () => setState("success");

    return { submitState, setSubmitError, setSubmitLoading, resetSubmitState, setSubmitSuccess };
};

const { height } = Dimensions.get("window");

const style = StyleSheet.create({
    container: { height, padding: 15, paddingTop: 0, position: "relative", backgroundColor: BACKGROUND_COLOR },
    emailButton: {
        width: "100%",
        height: 55,
        flexDirection: "row",
        borderWidth: 1,
        borderColor: colors.clearGray,
        backgroundColor: colors.clearGray,
        borderRadius: 10,
        gap: 10,
        justifyContent: "center",
        alignItems: "center",
    },
});

function SignUp() {
    useWarmUpBrowser();
    // const { hideRedirectToLogin } = useLocalSearchParams<RoutesParams["signUp"]>();

    const dispatch = useAppDispatch();

    const { error, updateEmailError, updatePasswordError, resetErrors, updateCodeError, updateUsernameError } = useHandleClerkErrorMessages();
    const { setSubmitError, setSubmitLoading, submitState, resetSubmitState } = useHandleButtonState();

    const { isLoaded, signUp, setActive } = useSignUp();

    const [username, setUsername] = useState("");
    const [emailAddress, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");
    const [pendingVerification, setPendingVerification] = useState(false);
    const [code, setCode] = useState("");

    // start the sign up process.
    const onSignUpPress = async () => {
        if (!isLoaded) return;

        setSubmitLoading();
        resetErrors();

        try {
            await signUp.create({ emailAddress: emailAddress.replace(" ", ""), password, username });

            // send the email.
            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

            // change the UI to our pending section.
            setPendingVerification(true);
            resetSubmitState();
        } catch (err: any) {
            const errors: { meta: { paramName: string }; longMessage: string }[] = err.errors;

            for (let i = 0; i < errors.length; i++) {
                const er = errors[i];
                if (er.meta.paramName === "email_address") {
                    updateEmailError(er.longMessage);
                    continue;
                }

                if (er.meta.paramName === "password") {
                    updatePasswordError(er.longMessage);
                    continue;
                }

                if (er.meta.paramName === "username") {
                    updateUsernameError(er.longMessage);
                    continue;
                }
            }
            console.error(errors);
            setSubmitError();
        }
    };

    // This verifies the user using email code that is delivered.
    const onPressVerify = async (code: string) => {
        if (!isLoaded) return;

        setSubmitLoading();
        resetErrors();
        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({ code });

            await setActive({ session: completeSignUp.createdSessionId });

            dispatch(updateFirstTimeOpeningApp());

            const params: RoutesParams["home"] = { handleSignUpSync: "true" };
            router.push({ pathname: "/(app)/home", params });
        } catch (err: any) {
            const errors: { meta: { paramName: string }; longMessage: string }[] = err.errors;

            for (let i = 0; i < errors.length; i++) {
                const er = errors[i];
                if (er.meta.paramName === "code") {
                    updateCodeError(er.longMessage);
                    continue;
                }
            }
            console.error(errors);
            setSubmitError();
        }
    };

    const navigateToLogin = () => router.push("/(app)/auth/signIn");

    const [showEmailAndPassword, setShowEmailAndPassword] = useState(true);
    const back = () => {
        if (showEmailAndPassword) {
            setShowEmailAndPassword(false);
            setUsername("");
            setEmailAddress("");
            setPassword("");

            return;
        }

        router.back();
    };

    return (
        <Animated.View style={style.container} entering={FadeInRight} exiting={FadeOutLeft}>
            <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", height: 40, justifyContent: "flex-start" }} onPress={back}>
                <FontAwesome name={"chevron-left"} size={18} color={colors.softPurle} />
                <AppText children={"Back"} fontSize={18} style={{ color: colors.softPurle, marginLeft: 10, paddingTop: 3 }} />
            </TouchableOpacity>

            {!showEmailAndPassword && (
                <Animated.View style={{ flex: 1, justifyContent: "space-around", marginTop: 20, paddingHorizontal: 20 }} exiting={FadeOutLeft}>
                    <View>
                        <AppText children={"Sign Up"} fontSize={42} style={{ textAlign: "center", marginBottom: 15, fontFamily: "helveticaBold" }} />
                        <AppText
                            children={"Choose how you'd like to create your Skill Trees account."}
                            fontSize={22}
                            style={{ textAlign: "center", opacity: 0.8 }}
                        />
                    </View>

                    <View style={{ gap: 10 }}>
                        <SocialAuthDiscordButton actingAs={"signUp"} text={"Sign up with Discord"} preferred />
                        <TouchableOpacity style={style.emailButton} onPress={() => setShowEmailAndPassword(true)}>
                            <FontAwesome name={"envelope"} size={18} color={colors.white} />
                            <AppText children={"Email and Password"} fontSize={18} style={{ fontFamily: "helveticaBold" }} />
                        </TouchableOpacity>
                    </View>

                    <AppButton
                        onPress={navigateToLogin}
                        text={{ idle: "I already have an account" }}
                        color={{ idle: colors.darkGray }}
                        pressableStyle={{ alignItems: "center" }}
                        style={{ paddingHorizontal: 15, borderRadius: 15, width: 200 }}
                    />
                </Animated.View>
            )}

            {showEmailAndPassword && (
                <>
                    {!pendingVerification && (
                        <Animated.View
                            style={{
                                width: "100%",
                                paddingHorizontal: 20,
                                justifyContent: "center",
                                flex: 1,
                                position: "relative",
                                alignItems: "center",
                            }}
                            entering={FadeInRight}
                            exiting={FadeOutLeft}>
                            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "position"} style={{ width: "100%" }}>
                                <View>
                                    <AppTextInput
                                        textState={[username, setUsername]}
                                        inputProps={{ autoCapitalize: "none", spellCheck: false }}
                                        placeholder={"Username"}
                                        containerStyles={{
                                            borderRadius: 0,
                                            borderTopLeftRadius: 10,
                                            borderTopRightRadius: 10,
                                            borderBottomWidth: 1,
                                            borderColor: `${colors.clearGray}80`,
                                            height: 60,
                                        }}
                                    />
                                    <AppTextInput
                                        textState={[emailAddress, setEmailAddress]}
                                        inputProps={{ autoCapitalize: "none", spellCheck: false }}
                                        placeholder={"Email"}
                                        containerStyles={{ borderRadius: 0, borderBottomWidth: 1, borderColor: `${colors.clearGray}80`, height: 60 }}
                                    />
                                    <PasswordInput
                                        textState={[password, setPassword]}
                                        inputProps={{ secureTextEntry: true }}
                                        placeholder={"Password"}
                                        containerStyles={{ borderRadius: 0, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, height: 60 }}
                                    />
                                    {error.username !== "" && <AppText children={error.username} fontSize={14} style={{ color: colors.pink }} />}
                                    {error.email !== "" && <AppText children={error.email} fontSize={14} style={{ color: colors.pink }} />}
                                    {error.password !== "" && <AppText children={error.password} fontSize={14} style={{ color: colors.pink }} />}
                                </View>
                            </KeyboardAvoidingView>

                            <View style={{ position: "absolute", bottom: 0, width: "100%" }}>
                                <AppButton
                                    state={submitState}
                                    onPress={onSignUpPress}
                                    color={{ idle: colors.softPurle, success: colors.softPurle, loading: colors.softPurle }}
                                    text={{ idle: "Sign up", error: "Please try again", success: "Success!" }}
                                    style={{ backgroundColor: colors.softPurle, marginTop: 10, height: 60 }}
                                    textStyle={{ fontFamily: "helveticaBold", fontSize: 18, lineHeight: 18 }}
                                />
                            </View>
                        </Animated.View>
                    )}

                    {pendingVerification && (
                        <Animated.View
                            style={{
                                width: "100%",
                                paddingHorizontal: 20,
                                justifyContent: "center",
                                flex: 1,
                                position: "relative",
                                alignItems: "center",
                            }}
                            entering={FadeInRight}
                            exiting={FadeOutLeft}>
                            <View
                                style={{
                                    flex: 1,
                                    width: "100%",
                                    justifyContent: "center",
                                }}>
                                <AppText children={"Verify your email address"} fontSize={32} style={{ textAlign: "center" }} />
                                <AppText
                                    children={"Check your e-mail account a 6-digit code"}
                                    fontSize={16}
                                    style={{ color: `${colors.white}80`, marginBottom: 30, textAlign: "center", marginTop: 15 }}
                                />
                                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "position"} style={{ width: "100%" }}>
                                    <AppTextInput
                                        textState={[code.toString(), handleUpdateCode]}
                                        inputProps={{
                                            autoCapitalize: "none",
                                            spellCheck: false,
                                            keyboardType: Platform.OS === "android" ? "numeric" : "number-pad",
                                        }}
                                        hideClearButton
                                        placeholder={"Code"}
                                        containerStyles={{ borderRadius: 15, height: 60 }}
                                    />
                                    {error.code !== "" && <AppText children={error.code} fontSize={14} style={{ color: colors.pink }} />}
                                </KeyboardAvoidingView>
                            </View>

                            <View style={{ position: "absolute", bottom: 0, width: "100%" }}>
                                <AppButton
                                    state={submitState}
                                    onPress={() => onPressVerify(code)}
                                    color={{ idle: colors.softPurle, success: colors.softPurle, loading: colors.softPurle }}
                                    text={{ idle: "Verify Email", error: "Please try again", success: "Success!" }}
                                    style={{ backgroundColor: colors.softPurle, marginTop: 10, height: 60 }}
                                    textStyle={{ fontFamily: "helveticaBold", fontSize: 18, lineHeight: 18 }}
                                />
                            </View>
                        </Animated.View>
                    )}
                </>
            )}
        </Animated.View>
    );

    function handleUpdateCode(newCodeString: string) {
        setCode(validateNumber(newCodeString));

        if (newCodeString.length === 6) {
            Keyboard.dismiss();
            return onPressVerify(newCodeString);
        }
    }
}

export default SignUp;

const validateNumber = (tentativeNumber: string) => {
    const cleanNumber = tentativeNumber.replace(/[^0-9]/g, "");

    return cleanNumber;
};
