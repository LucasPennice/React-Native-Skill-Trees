import { colors } from "@/parameters";
import { useOAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { useCallback } from "react";
import { Pressable, StyleSheet } from "react-native";
import DiscordIcon from "../Icons/DiscordIcon";
import { RoutesParams } from "routes";
import { SocialAuthButton } from "@/types";

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

    const logInDiscord = useCallback(async () => {
        try {
            const { createdSessionId, setActive } = await startOAuthFlow();

            if (createdSessionId && setActive) {
                await setActive({ session: createdSessionId });

                let params: RoutesParams["home"] = {};

                if (actingAs === "logIn") params.handleLogInSync = "true";
                if (actingAs === "signUp") params.handleSignUpSync = "true";

                console.log(params);
                router.push({ pathname: "/(app)/home", params });
            }
        } catch (err) {
            console.error("OAuth error", err);
        }
    }, []);

    return (
        <Pressable onPressIn={logInDiscord} style={style.container}>
            <DiscordIcon width={35} height={35} fill={colors.white} pointerEvents={"none"} />
        </Pressable>
    );
};

export default SocialAuthDiscordButton;
