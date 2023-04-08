import { Modal, Pressable, SafeAreaView, View } from "react-native";
import { Directions, Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { centerFlex } from "./types";
import { colors } from "./pages/homepage/canvas/parameters";
import AppText from "./AppText";

function FlingToDismissModal({
    closeModal,
    open,
    children,
    leftHeaderButton,
}: {
    closeModal: () => void;
    open: boolean;
    children: JSX.Element;
    leftHeaderButton?: { onPress: () => void; title: string };
}) {
    const flingGesture = Gesture.Fling()
        .direction(Directions.DOWN)
        .onStart((e) => {
            runOnJS(closeModal)();
        });

    return (
        <Modal animationType="slide" transparent={true} visible={open} onRequestClose={closeModal}>
            <GestureDetector gesture={flingGesture}>
                <SafeAreaView style={[centerFlex, { flex: 1, justifyContent: "flex-end", backgroundColor: "#0000009D" }]}>
                    <View
                        style={{
                            backgroundColor: colors.darkGray,
                            borderRadius: 10,
                            flex: 1,
                            width: "100%",
                            transform: [{ translateY: 30 }],
                            padding: 10,
                        }}>
                        <View style={[centerFlex, { position: "relative" }]}>
                            {leftHeaderButton && (
                                <Pressable onPress={leftHeaderButton.onPress} style={{ alignSelf: "flex-start", position: "absolute" }}>
                                    <AppText style={{ color: colors.accent, fontSize: 16, padding: 10 }}>{leftHeaderButton.title}</AppText>
                                </Pressable>
                            )}
                            <View style={{ backgroundColor: `${colors.line}5D`, width: 150, height: 8, borderRadius: 10, position: "absolute" }} />
                            <Pressable onPress={closeModal} style={{ alignSelf: "flex-end" }}>
                                <AppText style={{ color: colors.accent, fontSize: 16, padding: 10 }}>Close</AppText>
                            </Pressable>
                        </View>
                        {children}
                    </View>
                </SafeAreaView>
            </GestureDetector>
        </Modal>
    );
}

export default FlingToDismissModal;
