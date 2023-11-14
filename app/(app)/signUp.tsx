import AppButton, { ButtonState } from "@/components/AppButton";
import AppText from "@/components/AppText";
import AppTextInput from "@/components/AppTextInput";
import XMarkIcon from "@/components/Icons/XMarkIcon";
import Logo from "@/components/Logo";
import { colors } from "@/parameters";
import { useSignUp } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import { logoSharedTransitionStyle } from "./welcomeScreen";

const useHandleErrorMessages = () => {
    const [error, setState] = useState({ email: "", password: "", code: "" });

    const updatePasswordError = (message: string) =>
        setState((prev) => {
            return { ...prev, password: message };
        });

    const updateCodeError = (message: string) =>
        setState((prev) => {
            return { ...prev, code: message };
        });

    const updateEmailError = (message: string) =>
        setState((prev) => {
            return { ...prev, email: message };
        });

    const resetErrors = () => setState({ email: "", password: "", code: "" });

    return { error, updateEmailError, updatePasswordError, resetErrors, updateCodeError };
};

const useHandleSubmitState = () => {
    const [submitState, setState] = useState<ButtonState>("idle");

    const setSubmitError = () => setState("error");
    const setSubmitLoading = () => setState("loading");
    const resetSubmitState = () => setState("idle");

    return { submitState, setSubmitError, setSubmitLoading, resetSubmitState };
};

function SignUp() {
    const style = StyleSheet.create({
        container: { alignItems: "center", flex: 1, padding: 15 },
    });

    const { error, updateEmailError, updatePasswordError, resetErrors, updateCodeError } = useHandleErrorMessages();
    const { setSubmitError, setSubmitLoading, submitState, resetSubmitState } = useHandleSubmitState();

    const { isLoaded, signUp, setActive } = useSignUp();

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
            await signUp.create({ emailAddress, password });

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

    return (
        <View style={style.container}>
            <Header />

            <View style={{ width: "100%", flex: 1, gap: 10, alignItems: "center", marginTop: 70 }}>
                <Animated.View sharedTransitionTag="sharedTag" sharedTransitionStyle={logoSharedTransitionStyle}>
                    <Logo />
                </Animated.View>

                {!pendingVerification && (
                    <Animated.View style={{ width: "100%", gap: 10, marginTop: 20 }} entering={FadeInRight} exiting={FadeOutLeft}>
                        <AppTextInput
                            textState={[emailAddress, setEmailAddress]}
                            inputProps={{ autoCapitalize: "none", spellCheck: false }}
                            placeholder={"Email"}
                        />
                        {error.email !== "" && <AppText children={error.email} fontSize={14} style={{ color: colors.pink }} />}
                        <AppTextInput textState={[password, setPassword]} inputProps={{ secureTextEntry: true }} placeholder={"Password"} />
                        {error.password !== "" && <AppText children={error.password} fontSize={14} style={{ color: colors.pink }} />}

                        <AppButton
                            state={submitState}
                            onPress={onSignUpPress}
                            text={{ idle: "CREATE ACCOUNT", error: "Fix errors and try again", success: "Success!" }}
                            style={{ backgroundColor: colors.background, marginTop: 10 }}
                            textStyle={{ fontFamily: "helveticaBold" }}
                        />
                    </Animated.View>
                )}
                {pendingVerification && (
                    <Animated.View style={{ width: "100%", gap: 10, marginTop: 20 }} entering={FadeInRight} exiting={FadeOutLeft}>
                        <AppTextInput textState={[code, setCode]} inputProps={{ autoCapitalize: "none", spellCheck: false }} placeholder={"Code"} />
                        {error.code !== "" && <AppText children={error.code} fontSize={14} style={{ color: colors.pink }} />}

                        <AppButton
                            state={submitState}
                            onPress={onPressVerify}
                            text={{ idle: "Verify Email", error: "Error", success: "Success!" }}
                            style={{ backgroundColor: colors.background, marginTop: 10 }}
                            textStyle={{ fontFamily: "helveticaBold" }}
                        />
                    </Animated.View>
                )}
            </View>
        </View>
    );
}

const Header = () => {
    const style = StyleSheet.create({
        container: { flexDirection: "row", justifyContent: "center", alignItems: "center", width: "100%", position: "relative" },
    });

    const goToWelcomeScreen = () => router.push("/(app)/welcomeScreen");

    return (
        <View style={style.container}>
            <Pressable onPressIn={goToWelcomeScreen} style={{ position: "absolute", left: 0, width: 45, height: 45 }}>
                <XMarkIcon width={25} height={25} fill={colors.unmarkedText} />
            </Pressable>
            <AppText fontSize={18} children={"Sign Up"} style={{ paddingTop: 2, fontFamily: "helveticaBold" }} />
            <View />
        </View>
    );
};

export default SignUp;
