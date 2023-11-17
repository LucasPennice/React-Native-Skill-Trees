import { colors } from "@/parameters";
import { SocialAuthButton } from "@/types";
import { useOAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { useCallback } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { RoutesParams } from "routes";
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

export const SocialAuthGoogleButton = ({ actingAs }: SocialAuthButton) => {
    const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

    const logInGoogle = useCallback(async () => {
        try {
            const { createdSessionId, setActive } = await startOAuthFlow();

            if (createdSessionId && setActive) {
                await setActive({ session: createdSessionId });

                let params: RoutesParams["home"] = {};

                if (actingAs === "logIn") params.handleLogInSync = "true";
                if (actingAs === "signUp") params.handleSignUpSync = "true";

                router.push({ pathname: "/(app)/home", params });
            }
        } catch (err) {
            console.error("OAuth error", err);
        }
    }, []);

    return (
        <TouchableOpacity onPressIn={logInGoogle} style={style.container}>
            <GoogleIcon width={30} height={30} fill={colors.white} pointerEvents={"none"} />
        </TouchableOpacity>
    );
};

export default SocialAuthGoogleButton;
