import { Modal, Pressable, StyleSheet, View } from "react-native";
import Animated, { Easing, FadeInDown, FadeOutDown, ZoomOut } from "react-native-reanimated";
import { colors } from "../parameters";
import AppButton, { ButtonState } from "./AppButton";
import AppText from "./AppText";
import { useContext } from "react";
import { HandleAlertContext } from "app/_layout";

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
        borderRadius: ICON_HEIGHT,
        backgroundColor: colors.line,
        position: "absolute",
        top: 0,
    },
});

// ME FALTA CONECTAR ESTE COMPONENTE CON EL ESTADO QUE SACO DE<LAYOUT></LAYOUT >
//     Y METER LOS ICONOS (CON UN POCO DE SUERTE UNOS LOTTIE?)

function AlertModal({ open, state, subtitle, title, buttonAction, buttonText }: AlertProps) {
    const { close } = useContext(HandleAlertContext);

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
                            onPress={buttonAction ?? close}
                            pressableStyle={{ width: "100%" }}
                            text={{ idle: buttonText ?? "Confirm" }}
                            style={{ backgroundColor: "#B863E3" }}
                            textStyle={{ fontSize: 18, lineHeight: 18 }}
                        />
                    </View>
                    <View style={styles.iconContainer} />
                </Animated.View>
            </View>
        </Modal>
    );
}

export default AlertModal;
