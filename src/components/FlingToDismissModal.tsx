import * as ExpoNavigationBar from "expo-navigation-bar";
import { Dimensions, Modal, Platform, Pressable, SafeAreaView, StatusBar, View, ViewStyle } from "react-native";
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
};

const ModalWithGesturesEnabled = gestureHandlerRootHOC(({ children, closeModal, leftHeaderButton, modalContainerStyles }: PropsContextType) => {
    const { width } = Dimensions.get("screen");

    const flingGesture = Gesture.Fling()
        .direction(Directions.DOWN)
        .onStart((e) => {
            runOnJS(closeModal)();
        });

    const DRAG_BAR_WIDTH = 150;
    const MODAL_PADDING = 10;
    const buttonWidth = (width - DRAG_BAR_WIDTH) / 2 - MODAL_PADDING;

    return (
        <GestureDetector gesture={flingGesture}>
            <SafeAreaView style={[{ justifyContent: "flex-end", backgroundColor: colors.darkGray, flex: 1, maxWidth: 600 }, modalContainerStyles]}>
                <View style={{ borderRadius: 10, flex: 1, padding: MODAL_PADDING }}>
                    <View style={[centerFlex, { position: "relative", height: 45 }]}>
                        {leftHeaderButton && (
                            <Pressable
                                onPress={closeModal}
                                style={[
                                    centerFlex,
                                    {
                                        alignItems: "flex-start",
                                        height: 48,
                                        position: "absolute",
                                        width: buttonWidth,
                                        left: 0,
                                        paddingLeft: 10,
                                    },
                                ]}>
                                <AppText style={{ color: colors.accent }} fontSize={16}>
                                    Close
                                </AppText>
                            </Pressable>
                        )}
                        <View
                            style={{
                                backgroundColor: `${colors.line}`,
                                width: DRAG_BAR_WIDTH,
                                height: 4,
                                borderRadius: 10,
                                position: "absolute",
                            }}
                        />
                        {leftHeaderButton && (
                            <Pressable
                                onPress={leftHeaderButton.onPress}
                                style={[
                                    centerFlex,
                                    {
                                        minHeight: 48,
                                        width: buttonWidth,
                                        position: "absolute",
                                        alignItems: "flex-end",
                                        right: 0,
                                        paddingRight: 10,
                                    },
                                ]}>
                                <AppText style={{ color: colors.accent }} fontSize={16}>
                                    {leftHeaderButton.title}
                                </AppText>
                            </Pressable>
                        )}
                        {!leftHeaderButton && (
                            <Pressable
                                onPress={closeModal}
                                style={[
                                    centerFlex,
                                    {
                                        minHeight: 48,
                                        width: buttonWidth,
                                        alignItems: "flex-end",
                                        position: "absolute",
                                        right: 0,
                                        paddingRight: 10,
                                    },
                                ]}>
                                <AppText style={{ color: colors.accent }} fontSize={16}>
                                    Close
                                </AppText>
                            </Pressable>
                        )}
                    </View>
                    {children}
                </View>
            </SafeAreaView>
        </GestureDetector>
    );
});

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
