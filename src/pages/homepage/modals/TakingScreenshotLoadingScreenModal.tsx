import { Modal, View } from "react-native";
import AppText from "../../../components/AppText";
import { colors } from "../canvas/parameters";
import { centerFlex } from "../../../types";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

function TakingScreenshotLoadingScreenModal({ open }: { open: boolean }) {
    const styles = useAnimatedStyle(() => {
        return { width: withTiming(open ? 200 : 0, { duration: 1000, easing: Easing.bezierFn(0.83, 0, 0.17, 1) }) };
    }, [open]);

    return (
        <Modal animationType="fade" transparent={true} visible={open}>
            <View style={[centerFlex, { flex: 1, opacity: 1 }]}>
                <View
                    style={[
                        centerFlex,
                        { backgroundColor: colors.darkGray, height: 250, width: 250, borderRadius: 10, padding: 20, justifyContent: "space-evenly" },
                    ]}>
                    <AppText fontSize={100} style={{ color: "white", lineHeight: 120 }}>
                        🌴
                    </AppText>
                    <AppText fontSize={13} style={{ color: "white" }}>
                        Turning your skill tree into an image
                    </AppText>
                    <View style={{ backgroundColor: `${colors.accent}5D`, height: 8, width: 200, borderRadius: 5 }}>
                        <Animated.View style={[styles, { backgroundColor: colors.accent, height: 8, borderRadius: 5 }]} />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

export default TakingScreenshotLoadingScreenModal;
