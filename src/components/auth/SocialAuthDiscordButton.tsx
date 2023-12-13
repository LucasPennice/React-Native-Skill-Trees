import { colors } from "@/parameters";
import { SocialAuthButton } from "@/types";
import { useOAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { useCallback } from "react";
import { Alert, StyleSheet, TouchableOpacity } from "react-native";
import { RoutesParams } from "routes";
import DiscordIcon from "../Icons/DiscordIcon";
import { updateFirstTimeOpeningApp } from "@/redux/slices/syncSlice";
import { useAppDispatch } from "@/redux/reduxHooks";
import AppText from "../AppText";

// 🚨 the screen that calls this component should run useWarmUpBrowser 🚨

export const SocialAuthDiscordButton = ({ actingAs, text, preferred }: SocialAuthButton) => {
    const style = StyleSheet.create({
        container: {
            width: "100%",
            height: 55,
            flexDirection: "row",
            borderWidth: 1,
            borderColor: preferred ? colors.white : colors.darkGray,
            backgroundColor: preferred ? colors.white : colors.darkGray,
            borderRadius: 10,
            gap: 10,
            justifyContent: "center",
            alignItems: "center",
        },
    });

    const { startOAuthFlow } = useOAuth({ strategy: "oauth_discord" });
    const dispatch = useAppDispatch();

    const logInDiscord = useCallback(async () => {
        try {
            const { createdSessionId, setActive } = await startOAuthFlow();

            if (createdSessionId && setActive) {
                await setActive({ session: createdSessionId });

                dispatch(updateFirstTimeOpeningApp());

                let params: RoutesParams["home"] = {};

                if (actingAs === "logIn") params.handleLogInSync = "true";
                if (actingAs === "signUp") params.handleSignUpSync = "true";

                router.push({ pathname: "/(app)/home", params });
            }
        } catch (err) {
            return Alert.alert("Navigator error", "Please reset the app and try again, if the issue persists please contact the developer");
        }
    }, []);

    return (
        <TouchableOpacity onPressIn={logInDiscord} style={style.container}>
            <DiscordIcon width={20} height={20} fill={preferred ? colors.darkGray : colors.white} pointerEvents={"none"} />
            <AppText children={text} fontSize={18} style={{ color: preferred ? colors.darkGray : colors.white, fontFamily: "helveticaBold" }} />
        </TouchableOpacity>
    );
};

export default SocialAuthDiscordButton;
