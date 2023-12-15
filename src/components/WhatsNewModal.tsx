import FontAwesome from "@expo/vector-icons/FontAwesome";
import { colors } from "@/parameters";
import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { Easing, FadeInDown } from "react-native-reanimated";
import { whatsNewDataArray } from "whatsNewData";
import AppButton from "./AppButton";
import AppText from "./AppText";
import { updateWhatsNewLatestVersionShown } from "@/redux/slices/userVariablesSlice";
import { useAppDispatch } from "@/redux/reduxHooks";

const MODAL_HEIGHT = 600;
const ICON_HEIGHT = 90;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#00000080" },
    tapToCloseZone: { flex: 1 },
    alertContainer: {
        height: MODAL_HEIGHT - ICON_HEIGHT / 2,
        width: "100%",
        backgroundColor: colors.darkGray,
        alignItems: "center",
        justifyContent: "space-between",
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        padding: 30,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
    },
    rowContainer: {
        width: "100%",
        paddingHorizontal: 10,
        flex: 1,
        justifyContent: "center",
        gap: 40,
    },
    arrowButton: {
        backgroundColor: colors.clearGray,
        width: 45,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
});

const useSelectedIdx = () => {
    const [idx, setIdx] = useState(whatsNewDataArray.length - 1);

    const decrease = () =>
        setIdx((p) => {
            if (p - 1 >= 0) return p - 1;
            return p;
        });

    const increase = () =>
        setIdx((p) => {
            if (p + 1 < whatsNewDataArray.length) return p + 1;
            return p;
        });

    const disableIncrease = idx === whatsNewDataArray.length - 1;
    const disableDecrease = idx === 0;

    return { idx, increase, decrease, disableDecrease, disableIncrease };
};

const useUpdateWhatsNewLatestVersionShown = (open: boolean) => {
    const dispatch = useAppDispatch();
    useEffect(() => {
        if (!open) return;

        dispatch(updateWhatsNewLatestVersionShown(whatsNewDataArray[whatsNewDataArray.length - 1].version));
    }, [open]);
};

function WhatsNewModal({ open, close }: { open: boolean; close: () => void }) {
    const { decrease, idx, increase, disableDecrease, disableIncrease } = useSelectedIdx();

    useUpdateWhatsNewLatestVersionShown(open);

    return (
        <Modal animationType="fade" transparent={true} visible={open} onRequestClose={close} presentationStyle={"overFullScreen"}>
            <View style={styles.container}>
                <Pressable onPress={close} style={styles.tapToCloseZone} />
                <Animated.View
                    style={styles.alertContainer}
                    entering={FadeInDown.withInitialValues({ transform: [{ translateY: MODAL_HEIGHT }] })
                        .duration(800)
                        .easing(Easing.bezierFn(0.83, 0, 0.17, 1))}>
                    <AppText
                        fontSize={32}
                        children={whatsNewDataArray[idx].title ?? "What's new in Skill Trees"}
                        style={{ fontFamily: "helveticaBold", textAlign: "center" }}
                    />

                    <View style={styles.rowContainer}>
                        {whatsNewDataArray[idx].row.map((rowData, idx) => {
                            return (
                                <View style={styles.row} key={idx}>
                                    {rowData.icon}
                                    <View style={{ flex: 1, gap: 5 }}>
                                        <AppText fontSize={18} children={rowData.title} />
                                        <AppText fontSize={16} children={rowData.subtitle} style={{ opacity: 0.6 }} />
                                    </View>
                                </View>
                            );
                        })}
                    </View>

                    <View style={{ flexDirection: "row", gap: 10 }}>
                        <TouchableOpacity
                            onPress={decrease}
                            disabled={disableDecrease}
                            style={[styles.arrowButton, { paddingRight: 3, opacity: disableDecrease ? 0.2 : 1 }]}>
                            <FontAwesome name={"chevron-left"} size={24} color={colors.unmarkedText} />
                        </TouchableOpacity>

                        <AppButton
                            onPress={close}
                            pressableStyle={{ flex: 1 }}
                            text={{ idle: "Continue" }}
                            style={{ backgroundColor: colors.softPurle }}
                            textStyle={{ fontSize: 18, lineHeight: 18 }}
                        />
                        <TouchableOpacity
                            onPress={increase}
                            disabled={disableIncrease}
                            style={[styles.arrowButton, { paddingLeft: 3, opacity: disableIncrease ? 0.2 : 1 }]}>
                            <FontAwesome name={"chevron-right"} size={24} color={colors.unmarkedText} />
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

export default WhatsNewModal;
