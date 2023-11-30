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

const style = StyleSheet.create({
    container: {
        width: 70,
        height: 70,
        borderWidth: 1,
        borderColor: `${colors.white}80`,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
});

// 🚨 the screen that calls this component should run useWarmUpBrowser 🚨

export const SocialAuthDiscordButton = ({ actingAs }: SocialAuthButton) => {
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
            <DiscordIcon width={35} height={35} fill={colors.white} pointerEvents={"none"} />
        </TouchableOpacity>
    );
};

export default SocialAuthDiscordButton;
