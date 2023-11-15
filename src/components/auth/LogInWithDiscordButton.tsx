import { colors } from "@/parameters";
import { useOAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { useCallback } from "react";
import { Pressable, StyleSheet } from "react-native";
import DiscordIcon from "../Icons/DiscordIcon";

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

export const LogInWithDiscordButton = () => {
    const { startOAuthFlow } = useOAuth({ strategy: "oauth_discord" });

    const logInDiscord = useCallback(async () => {
        try {
            const { createdSessionId, setActive } = await startOAuthFlow();

            if (createdSessionId && setActive) {
                await setActive({ session: createdSessionId });
                router.push("/(app)/home");
            }
        } catch (err) {
            console.error("OAuth error", err);
        }
    }, []);

    return (
        <Pressable onPressIn={logInDiscord} style={style.container}>
            <DiscordIcon width={35} height={35} fill={colors.white} />
        </Pressable>
    );
};

export default LogInWithDiscordButton;
