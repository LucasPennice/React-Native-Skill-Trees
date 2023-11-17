import AppButton, { ButtonState } from "@/components/AppButton";
import AppText from "@/components/AppText";
import AppTextInput from "@/components/AppTextInput";
import Logo from "@/components/Logo";
import PasswordInput from "@/components/PasswordInput";
import Spacer from "@/components/Spacer";
import SocialAuthDiscordButton from "@/components/auth/SocialAuthDiscordButton";
import SocialAuthGoogleButton from "@/components/auth/SocialAuthGoogleButton";
import { colors } from "@/parameters";
import { useWarmUpBrowser } from "@/useWarmUpBrowser";
import { useSignUp } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from "react-native";
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

function SignUp() {
    useWarmUpBrowser();

    const style = StyleSheet.create({
        container: { alignItems: "center", flex: 1, padding: 15 },
    });

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
            await signUp.create({ emailAddress, password, username });

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
    const onPressVerify = async () => {
        if (!isLoaded) return;

        setSubmitLoading();
        resetErrors();
        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({ code });

            await setActive({ session: completeSignUp.createdSessionId });

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

    const navigateToLogin = () => router.push("/logIn");

    return (
        <View style={style.container}>
            <View style={{ width: "100%", flex: 1, gap: 10, alignItems: "center" }}>
                <Logo />

                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "position"}>
                    {!pendingVerification && (
                        <Animated.View style={{ width: "100%", gap: 10, marginTop: 20 }} entering={FadeInRight} exiting={FadeOutLeft}>
                            <View style={{ width: "100%", flexDirection: "row", justifyContent: "space-evenly" }}>
                                <SocialAuthGoogleButton actingAs={"signUp"} />
                                <SocialAuthDiscordButton actingAs={"signUp"} />
                            </View>

                            <View
                                style={{
                                    flexDirection: "row",
                                    marginVertical: 10,
                                    alignItems: "center",
                                }}>
                                <Spacer style={{ flex: 1 }} />
                                <AppText
                                    children={`or`}
                                    fontSize={18}
                                    style={{ color: "#E6E8E680", marginBottom: 5, width: 150, textAlign: "center" }}
                                />
                                <Spacer style={{ flex: 1 }} />
                            </View>
                            <AppTextInput
                                textState={[username, setUsername]}
                                inputProps={{ autoCapitalize: "none", spellCheck: false }}
                                placeholder={"Username"}
                            />
                            {error.username !== "" && <AppText children={error.username} fontSize={14} style={{ color: colors.pink }} />}

                            <AppTextInput
                                textState={[emailAddress, setEmailAddress]}
                                inputProps={{ autoCapitalize: "none", spellCheck: false }}
                                placeholder={"Email"}
                            />
                            {error.email !== "" && <AppText children={error.email} fontSize={14} style={{ color: colors.pink }} />}
                            <PasswordInput textState={[password, setPassword]} inputProps={{ secureTextEntry: true }} placeholder={"Password"} />
                            {error.password !== "" && <AppText children={error.password} fontSize={14} style={{ color: colors.pink }} />}
                            <AppButton
                                state={submitState}
                                onPress={onSignUpPress}
                                text={{ idle: "CREATE ACCOUNT", error: "Fix errors and try again", success: "Success!" }}
                                style={{ backgroundColor: colors.background, marginTop: 10 }}
                                textStyle={{ fontFamily: "helveticaBold" }}
                            />

                            <Pressable onPressIn={navigateToLogin} style={{ flexDirection: "row", alignItems: "center", height: 45 }}>
                                <AppText children={"Have an account?"} fontSize={14} />
                                <AppText
                                    children={"Log In"}
                                    fontSize={14}
                                    style={{ color: colors.accent, fontFamily: "helveticaBold", paddingLeft: 3 }}
                                />
                            </Pressable>
                        </Animated.View>
                    )}
                    {pendingVerification && (
                        <Animated.View style={{ width: "100%", gap: 10, marginTop: 20 }} entering={FadeInRight} exiting={FadeOutLeft}>
                            <AppText children={"Please verify your email address"} fontSize={18} />
                            <AppText children={"Check your e-mail account a 6-digit code"} fontSize={16} style={{ color: `${colors.white}80` }} />
                            <AppTextInput
                                textState={[code.toString(), (v: string) => setCode(validateNumber(v))]}
                                inputProps={{
                                    autoCapitalize: "none",
                                    spellCheck: false,
                                    keyboardType: Platform.OS === "android" ? "numeric" : "number-pad",
                                }}
                                hideClearButton
                                placeholder={"Code"}
                            />
                            {error.code !== "" && <AppText children={error.code} fontSize={14} style={{ color: colors.pink }} />}

                            <AppButton
                                state={submitState}
                                onPress={onPressVerify}
                                text={{ idle: "Verify Email", error: "Please try again", success: "Success!" }}
                                style={{ backgroundColor: colors.background, marginTop: 10 }}
                                textStyle={{ fontFamily: "helveticaBold" }}
                            />
                        </Animated.View>
                    )}
                </KeyboardAvoidingView>
            </View>
        </View>
    );
}

export default SignUp;

const validateNumber = (tentativeNumber: string) => {
    const cleanNumber = tentativeNumber.replace(/[^0-9]/g, "");

    return cleanNumber;
};
