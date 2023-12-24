import Error from "@/../assets/lotties/error.json";
import Loading from "@/../assets/lotties/loading.json";
import Success from "@/../assets/lotties/success.json";
import Logo from "@/../assets/lotties/logo.json";
import { useHandleLottiePlay } from "@/useHandleLottiePlay";
import { HandleAlertContext } from "app/_layout";
import LottieView from "lottie-react-native";
import { useContext } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import Animated, { Easing, FadeInDown, ZoomOut } from "react-native-reanimated";
import { colors } from "../parameters";
import AppButton, { ButtonState } from "./AppButton";
import AppText from "./AppText";

const ALERT_HEIGHT = 350;
const ICON_HEIGHT = 90;

export type AlertProps = {
    open: boolean;
    title: string;
    subtitle: string;
    buttonText?: string;
    buttonAction?: () => void;
    state: ButtonState;
};

export const defaultAlertValues: AlertProps = {
    open: false,
    state: "idle",
    subtitle: "subtitle",
    title: "title",
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#00000080" },
    tapToCloseZone: { flex: 1 },
    alertContainer: { height: ALERT_HEIGHT, position: "relative", alignItems: "center", justifyContent: "flex-end" },
    alertContentContainer: {
        height: ALERT_HEIGHT - ICON_HEIGHT / 2,
        width: "100%",
        backgroundColor: colors.darkGray,
        position: "relative",
        alignItems: "center",
        justifyContent: "space-between",
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        paddingTop: ICON_HEIGHT / 2 + 20,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    iconContainer: {
        width: ICON_HEIGHT,
        height: ICON_HEIGHT,
        overflow: "hidden",
        borderRadius: ICON_HEIGHT,
        backgroundColor: colors.clearGray,
        position: "absolute",
        justifyContent: "center",
        alignItems: "center",
        top: 0,
    },
});

const getLottieSource = (state: ButtonState) => {
    switch (state) {
        case "error":
            return Error;
        case "success":
            return Success;
        case "loading":
            return Loading;
        case "idle":
            return Logo;
        default:
            return Loading;
    }
};

function AlertModal({ open, state, subtitle, title, buttonAction, buttonText }: AlertProps) {
    const { close } = useContext(HandleAlertContext);

    const animationRef = useHandleLottiePlay(open, state === "idle" ? 1500 : undefined);

    const actionAndClose = (fn?: () => void) => () => {
        if (fn) fn();
        close();
    };

    return (
        <Modal animationType="fade" transparent={true} visible={open} onRequestClose={close} presentationStyle={"overFullScreen"}>
            <View style={styles.container}>
                <Pressable onPress={close} style={styles.tapToCloseZone} />
                <Animated.View
                    style={styles.alertContainer}
                    exiting={ZoomOut.easing(Easing.bezierFn(0.83, 0, 0.17, 1))}
                    entering={FadeInDown.withInitialValues({ transform: [{ translateY: ALERT_HEIGHT }] })
                        .duration(800)
                        .easing(Easing.bezierFn(0.83, 0, 0.17, 1))}>
                    <View style={styles.alertContentContainer}>
                        <AppText children={title} fontSize={32} style={{ fontFamily: "helveticaBold", textAlign: "center" }} />
                        <AppText children={subtitle} fontSize={20} style={{ opacity: 0.8, textAlign: "center" }} />
                        <AppButton
                            onPress={actionAndClose(buttonAction)}
                            pressableStyle={{ width: "100%" }}
                            text={{ idle: buttonText ?? "Confirm" }}
                            style={{ backgroundColor: colors.softPurle }}
                            textStyle={{ fontSize: 18, lineHeight: 18 }}
                        />
                    </View>
                    <View style={styles.iconContainer}>
                        <LottieView source={getLottieSource(state)} ref={animationRef} loop={state === "loading"} style={{ width: ICON_HEIGHT }} />
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

export default AlertModal;
