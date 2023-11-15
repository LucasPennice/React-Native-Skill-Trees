import { colors } from "@/parameters";
import { useOAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { useCallback } from "react";
import { Pressable, StyleSheet } from "react-native";
import GoogleIcon from "../Icons/GoogleIcon";

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

export const LogInWithGoogleButton = () => {
    const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

    const logInGoogle = useCallback(async () => {
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
        <Pressable onPressIn={logInGoogle} style={style.container}>
            <GoogleIcon width={30} height={30} fill={colors.white} />
        </Pressable>
    );
};

export default LogInWithGoogleButton;
