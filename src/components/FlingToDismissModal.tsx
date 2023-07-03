import * as ExpoNavigationBar from "expo-navigation-bar";
import { createContext, useContext } from "react";
import { Dimensions, KeyboardAvoidingView, Modal, Platform, Pressable, SafeAreaView, StatusBar, View } from "react-native";
import { Directions, Gesture, GestureDetector, gestureHandlerRootHOC } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { centerFlex, colors } from "../parameters";
import AppText from "./AppText";

type PropsContextType = {
    closeModal: () => void;
    children: JSX.Element;
    leftHeaderButton: { onPress: () => void; title: string } | undefined;
} | null;

const PropsContext = createContext<PropsContextType>(null);

const ModalWithGesturesEnabled = gestureHandlerRootHOC(() => {
    const props = useContext(PropsContext);
    const { width } = Dimensions.get("screen");

    if (!props) return <></>;

    const { children, closeModal, leftHeaderButton } = props;

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
            <SafeAreaView style={[{ justifyContent: "flex-end", backgroundColor: colors.darkGray, flex: 1, maxWidth: 600 }]}>
                <View style={{ borderRadius: 10, flex: 1, padding: MODAL_PADDING }}>
                    <View style={[centerFlex, { position: "relative", height: 50 }]}>
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
                                height: 6,
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
    if (Platform.OS === "android") ExpoNavigationBar.setBackgroundColorAsync(colors.darkGray);

    return (
        <Modal
            animationType="slide"
            transparent={Platform.OS === "android" ? true : false}
            visible={open}
            onRequestClose={closeModal}
            presentationStyle={Platform.OS === "android" ? "overFullScreen" : "formSheet"}>
            <StatusBar backgroundColor={colors.background} barStyle="light-content" />
            <PropsContext.Provider value={{ closeModal, children, leftHeaderButton }}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "padding"} style={{ flex: 1 }}>
                    <ModalWithGesturesEnabled />
                </KeyboardAvoidingView>
            </PropsContext.Provider>
        </Modal>
    );
}

export default FlingToDismissModal;
