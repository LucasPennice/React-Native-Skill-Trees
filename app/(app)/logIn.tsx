import AppButton from "@/components/AppButton";
import AppText from "@/components/AppText";
import AppTextInput from "@/components/AppTextInput";
import XMarkIcon from "@/components/Icons/XMarkIcon";
import Logo from "@/components/Logo";
import { colors } from "@/parameters";
import { useSignIn } from "@clerk/clerk-expo";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";
import { useHandleButtonState, useHandleClerkErrorMessages } from "./signUp";
import { logoSharedTransitionStyle } from "./welcomeScreen";

const style = StyleSheet.create({
    container: { alignItems: "center", flex: 1, padding: 15 },
});

export default function SignInScreen() {
    const { error, resetErrors, updateIdentifierError, updatePasswordError } = useHandleClerkErrorMessages();
    const { setSubmitError, setSubmitLoading, submitState, resetSubmitState } = useHandleButtonState();

    const { signIn, setActive, isLoaded } = useSignIn();

    const [emailAddress, setEmailAddress] = React.useState("");
    const [password, setPassword] = React.useState("");

    const onSignInPress = async () => {
        if (!isLoaded) return;

        setSubmitLoading();
        resetErrors();

        try {
            const completeSignIn = await signIn.create({ identifier: emailAddress, password });
            // This is an important step,
            // This indicates the user is signed in
            await setActive({ session: completeSignIn.createdSessionId });
            resetSubmitState();
        } catch (err: any) {
            const errors: { meta: { paramName: string }; longMessage: string }[] = err.errors;

            for (let i = 0; i < errors.length; i++) {
                const er = errors[i];
                if (er.meta.paramName === "identifier") {
                    updateIdentifierError(er.longMessage);
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
    return (
        <View style={style.container}>
            <Header />

            <View style={{ width: "100%", flex: 1, gap: 10, alignItems: "center", marginTop: 70 }}>
                <Animated.View sharedTransitionTag="sharedTag" sharedTransitionStyle={logoSharedTransitionStyle}>
                    <Logo />
                </Animated.View>

                <Animated.View style={{ width: "100%", gap: 10, marginTop: 20 }} entering={FadeInRight}>
                    <AppTextInput
                        textState={[emailAddress, setEmailAddress]}
                        inputProps={{ autoCapitalize: "none", spellCheck: false }}
                        placeholder={"Email"}
                    />
                    {error.identifier !== "" && <AppText children={error.identifier} fontSize={14} style={{ color: colors.pink }} />}
                    <AppTextInput textState={[password, setPassword]} inputProps={{ secureTextEntry: true }} placeholder={"Password"} />
                    {error.password !== "" && <AppText children={error.password} fontSize={14} style={{ color: colors.pink }} />}

                    <AppButton
                        state={submitState}
                        onPress={onSignInPress}
                        text={{ idle: "SIGN IN", error: "Please try again", success: "Success!" }}
                        style={{ backgroundColor: colors.background, marginTop: 10 }}
                        textStyle={{ fontFamily: "helveticaBold" }}
                    />
                </Animated.View>
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
            <AppText fontSize={18} children={"Log In"} style={{ paddingTop: 2, fontFamily: "helveticaBold" }} />
            <View />
        </View>
    );
};
