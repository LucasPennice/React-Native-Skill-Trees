import AppButton from "@/components/AppButton";
import AppText from "@/components/AppText";
import AppTextInput from "@/components/AppTextInput";
import Logo from "@/components/Logo";
import PasswordInput from "@/components/PasswordInput";
import Spacer from "@/components/Spacer";
import RedirectToSupportPage from "@/components/auth/RedirectToSupportPage";
import { SocialAuthDiscordButton } from "@/components/auth/SocialAuthDiscordButton";
import { colors } from "@/parameters";
import { useAppDispatch } from "@/redux/reduxHooks";
import { updateFirstTimeOpeningApp } from "@/redux/slices/syncSlice";
import { useWarmUpBrowser } from "@/useWarmUpBrowser";
import { useSignIn } from "@clerk/clerk-expo";
import { router } from "expo-router";
import React from "react";
import { Dimensions, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";
import { RoutesParams } from "routes";
import { useHandleButtonState, useHandleClerkErrorMessages } from "./signUp";

const { height } = Dimensions.get("window");

const style = StyleSheet.create({
    container: { alignItems: "center", height, padding: 15, position: "relative" },
});

export default function SignInScreen() {
    const { error, resetErrors, updateIdentifierError, updatePasswordError } = useHandleClerkErrorMessages();
    const { setSubmitError, setSubmitLoading, submitState } = useHandleButtonState();
    const dispatch = useAppDispatch();
    useWarmUpBrowser();

    const { signIn, setActive, isLoaded } = useSignIn();

    const [emailAddress, setEmailAddress] = React.useState("");
    const [password, setPassword] = React.useState("");

    const onSignInPress = async () => {
        if (!isLoaded) return;

        setSubmitLoading();
        resetErrors();

        try {
            const completeSignIn = await signIn.create({ identifier: emailAddress.replace(" ", ""), password });

            await setActive({ session: completeSignIn.createdSessionId });

            dispatch(updateFirstTimeOpeningApp());

            const params: RoutesParams["home"] = { handleLogInSync: "true" };

            router.push({ pathname: "/home", params });
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

    const navigateToSignUp = () => router.push("/signUp");

    return (
        <View style={style.container}>
            <View style={{ width: "100%", flex: 1, gap: 10, alignItems: "center" }}>
                <Logo />

                <Animated.View style={{ width: "100%", gap: 10, marginTop: 20 }} entering={FadeInRight}>
                    <View style={{ width: "100%", flexDirection: "row", justifyContent: "space-evenly" }}>
                        {/* <SocialAuthGoogleButton actingAs={"logIn"} /> */}
                        <SocialAuthDiscordButton actingAs={"logIn"} />
                    </View>

                    <View
                        style={{
                            flexDirection: "row",
                            marginVertical: 10,
                            alignItems: "center",
                        }}>
                        <Spacer style={{ flex: 1 }} />
                        <AppText children={`or`} fontSize={18} style={{ color: "#E6E8E680", marginBottom: 5, width: 150, textAlign: "center" }} />
                        <Spacer style={{ flex: 1 }} />
                    </View>

                    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "position"} style={{ height: 250 }}>
                        <AppTextInput
                            textState={[emailAddress, setEmailAddress]}
                            inputProps={{ autoCapitalize: "none", spellCheck: false }}
                            placeholder={"Username or Email"}
                            containerStyles={{ marginBottom: 10 }}
                        />
                        {error.identifier !== "" && (
                            <AppText children={error.identifier} fontSize={14} style={{ color: colors.pink, marginBottom: 10 }} />
                        )}
                        <PasswordInput
                            textState={[password, setPassword]}
                            inputProps={{ secureTextEntry: true }}
                            placeholder={"Password"}
                            onBlur={onSignInPress}
                        />
                        {error.password !== "" && <AppText children={error.password} fontSize={14} style={{ color: colors.pink }} />}

                        <AppButton
                            state={submitState}
                            onPress={onSignInPress}
                            text={{ idle: "SIGN IN", error: "Please try again", success: "Success!" }}
                            style={{ backgroundColor: colors.background, marginTop: 10 }}
                            textStyle={{ fontFamily: "helveticaBold" }}
                        />

                        <Pressable onPressIn={navigateToSignUp} style={{ flexDirection: "row", alignItems: "center", height: 45 }}>
                            <AppText children={"No account?"} fontSize={14} />
                            <AppText
                                children={"Sign up"}
                                fontSize={14}
                                style={{ color: colors.accent, fontFamily: "helveticaBold", paddingLeft: 3 }}
                            />
                        </Pressable>
                    </KeyboardAvoidingView>
                </Animated.View>
            </View>

            <RedirectToSupportPage />
        </View>
    );
}
