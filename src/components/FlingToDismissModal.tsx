import * as ExpoNavigationBar from "expo-navigation-bar";
import { Dimensions, Modal, Platform, SafeAreaView, StatusBar, StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";
import { Directions, Gesture, GestureDetector, gestureHandlerRootHOC } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { centerFlex, colors } from "../parameters";
import AppText from "./AppText";

type PropsContextType = {
    closeModal: () => void;
    open: boolean;
    children: JSX.Element;
    leftHeaderButton?: { onPress: () => void; title: string };
    modalContainerStyles?: ViewStyle;
    hideFlingToDismiss?: boolean;
};

const { width } = Dimensions.get("screen");

const DRAG_BAR_WIDTH = 150;
const MODAL_PADDING = 10;
const buttonWidth = (width - DRAG_BAR_WIDTH) / 2 - MODAL_PADDING;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 4,
        backgroundColor: colors.darkGray,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },
    rightButton: { justifyContent: "center", minHeight: 48, width: buttonWidth, alignItems: "flex-end", position: "absolute", right: 0 },
    leftButton: { justifyContent: "center", minHeight: 48, width: buttonWidth, alignItems: "flex-start", position: "absolute", left: 0 },
    dragBar: { backgroundColor: colors.darkGray, width: DRAG_BAR_WIDTH, height: 4, borderRadius: 10, position: "absolute" },
});

const ModalWithGesturesEnabled = gestureHandlerRootHOC(
    ({ children, closeModal, leftHeaderButton, modalContainerStyles, hideFlingToDismiss }: PropsContextType) => {
        const flingGesture = Gesture.Fling()
            .direction(Directions.DOWN)
            .onStart((e) => {
                runOnJS(closeModal)();
            });

        return (
            <GestureDetector gesture={flingGesture}>
                <SafeAreaView
                    style={[{ justifyContent: "flex-end", backgroundColor: colors.background, flex: 1, maxWidth: 600 }, modalContainerStyles]}>
                    <View style={{ borderRadius: 10, flex: 1, padding: MODAL_PADDING }}>
                        {!hideFlingToDismiss && (
                            <View style={[centerFlex, { position: "relative", height: 45 }]}>
                                {leftHeaderButton && (
                                    <TouchableOpacity onPress={leftHeaderButton.onPress} style={styles.leftButton}>
                                        <View style={styles.container}>
                                            <AppText fontSize={14} children={"Close"} />
                                        </View>
                                    </TouchableOpacity>
                                )}
                                <View style={styles.dragBar} />
                                {leftHeaderButton && (
                                    <TouchableOpacity onPress={leftHeaderButton.onPress} style={styles.rightButton}>
                                        <View style={styles.container}>
                                            <AppText fontSize={14} children={leftHeaderButton.title} />
                                        </View>
                                    </TouchableOpacity>
                                )}
                                {!leftHeaderButton && (
                                    <TouchableOpacity onPress={closeModal} style={styles.rightButton}>
                                        <View style={styles.container}>
                                            <AppText fontSize={14} children={"Close"} />
                                        </View>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                        {children}
                    </View>
                </SafeAreaView>
            </GestureDetector>
        );
    }
);

function FlingToDismissModal(props: PropsContextType) {
    const { closeModal, open } = props;

    if (Platform.OS === "android") ExpoNavigationBar.setBackgroundColorAsync(colors.darkGray);

    return (
        <Modal
            animationType="slide"
            transparent={Platform.OS === "android" ? true : false}
            visible={open}
            onRequestClose={closeModal}
            presentationStyle={Platform.OS === "android" ? "overFullScreen" : "formSheet"}>
            <StatusBar backgroundColor={colors.background} barStyle="light-content" />
            <ModalWithGesturesEnabled {...props} />
        </Modal>
    );
}

export default FlingToDismissModal;
