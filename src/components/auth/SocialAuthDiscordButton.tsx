import { CLERK_DISCORD_AUTHORIZED_REDIRECT_URI, colors } from "@/parameters";
import { useAppDispatch } from "@/redux/reduxHooks";
import { updateFirstTimeOpeningApp } from "@/redux/slices/syncSlice";
import { SocialAuthButton } from "@/types";
import useRunOnAuth from "@/useRunOnAuth";
import { useOAuth } from "@clerk/clerk-expo";
import { useCallback } from "react";
import { Alert, StyleSheet, TouchableOpacity } from "react-native";
import AppText from "../AppText";
import DiscordIcon from "../Icons/DiscordIcon";
import { mixpanel } from "app/_layout";

// 🚨 the screen that calls this component should run useWarmUpBrowser 🚨

export const SocialAuthDiscordButton = ({ actingAs, text, preferred }: SocialAuthButton) => {
    const { runOnSignIn, runOnSignUp } = useRunOnAuth();

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
            // const { createdSessionId, setActive } = await startOAuthFlow({ redirectUrl: CLERK_DISCORD_AUTHORIZED_REDIRECT_URI });

            if (createdSessionId && setActive) {
                await setActive({ session: createdSessionId });

                dispatch(updateFirstTimeOpeningApp());

                if (actingAs === "logIn") return runOnSignIn();
                if (actingAs === "signUp") return runOnSignUp();
            }
        } catch (err) {
            console.error(JSON.stringify(err));
            mixpanel.track("ERROR Discord Auth", { err });
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
