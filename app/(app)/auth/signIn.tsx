import AppButton from "@/components/AppButton";
import AppText from "@/components/AppText";
import AppTextInput from "@/components/AppTextInput";
import PasswordInput from "@/components/PasswordInput";
import { SocialAuthDiscordButton } from "@/components/auth/SocialAuthDiscordButton";
import { BACKGROUND_COLOR } from "@/components/subscription/functions";
import { colors } from "@/parameters";
import { useAppDispatch } from "@/redux/reduxHooks";
import { updateFirstTimeOpeningApp } from "@/redux/slices/syncSlice";
import { useWarmUpBrowser } from "@/useWarmUpBrowser";
import { useSignIn } from "@clerk/clerk-expo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";
import React, { useState } from "react";
import { Dimensions, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import { RoutesParams } from "routes";
import { useHandleButtonState, useHandleClerkErrorMessages } from "./signUp";

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

    const navigateToSignUp = () => router.push("/(app)/auth/signUp");

    const [showEmailAndPassword, setShowEmailAndPassword] = useState(false);
    const back = () => {
        if (showEmailAndPassword) {
            setShowEmailAndPassword(false);
            setEmailAddress("");
            setPassword("");

            return;
        }

        router.back();
    };

    return (
        <Animated.View style={style.container} exiting={FadeOutLeft}>
            <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", height: 40, justifyContent: "flex-start" }} onPress={back}>
                <FontAwesome name={"chevron-left"} size={18} color={colors.softPurle} />
                <AppText children={"Back"} fontSize={18} style={{ color: colors.softPurle, marginLeft: 10, paddingTop: 3 }} />
            </TouchableOpacity>

            {!showEmailAndPassword && (
                <Animated.View style={{ flex: 1, justifyContent: "space-around", marginTop: 20, paddingHorizontal: 20 }} exiting={FadeOutLeft}>
                    <View>
                        <AppText children={"Sign In"} fontSize={42} style={{ textAlign: "center", marginBottom: 15, fontFamily: "helveticaBold" }} />
                        <AppText
                            children={"What did you use to access your Skill Trees account last time?"}
                            fontSize={22}
                            style={{ textAlign: "center", opacity: 0.8 }}
                        />
                    </View>

                    <View style={{ gap: 10 }}>
                        <SocialAuthDiscordButton actingAs={"logIn"} text={"Sign in with Discord"} preferred />
                        <TouchableOpacity style={style.emailButton} onPress={() => setShowEmailAndPassword(true)}>
                            <FontAwesome name={"envelope"} size={18} color={colors.white} />
                            <AppText children={"Email and Password"} fontSize={18} style={{ fontFamily: "helveticaBold" }} />
                        </TouchableOpacity>
                    </View>

                    <AppButton
                        onPress={navigateToSignUp}
                        text={{ idle: "I need a new account" }}
                        color={{ idle: colors.darkGray }}
                        pressableStyle={{ alignItems: "center" }}
                        style={{ paddingHorizontal: 15, borderRadius: 15, width: 180 }}
                    />
                </Animated.View>
            )}

            {showEmailAndPassword && (
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
                        <AppTextInput
                            textState={[emailAddress, setEmailAddress]}
                            inputProps={{ autoCapitalize: "none", spellCheck: false }}
                            placeholder={"Username or Email"}
                            containerStyles={{
                                borderRadius: 0,
                                borderTopLeftRadius: 10,
                                borderTopRightRadius: 10,
                                borderBottomWidth: 1,
                                borderColor: `${colors.clearGray}80`,
                                height: 60,
                            }}
                        />
                        <PasswordInput
                            textState={[password, setPassword]}
                            inputProps={{ secureTextEntry: true }}
                            placeholder={"Password"}
                            onBlur={onSignInPress}
                            containerStyles={{ borderRadius: 0, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, height: 60 }}
                        />

                        {error.identifier !== "" && (
                            <AppText children={error.identifier} fontSize={14} style={{ color: colors.pink, marginBottom: 10 }} />
                        )}
                        {error.password !== "" && <AppText children={error.password} fontSize={14} style={{ color: colors.pink }} />}
                    </KeyboardAvoidingView>

                    <View style={{ position: "absolute", bottom: 0, width: "100%" }}>
                        <AppButton
                            state={submitState}
                            onPress={onSignInPress}
                            text={{ idle: "Sign In", error: "Please try again", success: "Success!" }}
                            style={{ backgroundColor: colors.softPurle, height: 60 }}
                            textStyle={{ fontFamily: "helveticaBold", fontSize: 18, lineHeight: 18 }}
                        />
                    </View>
                </Animated.View>
            )}
        </Animated.View>
    );
}
