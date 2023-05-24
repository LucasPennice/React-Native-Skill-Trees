import * as ExpoNavigationBar from "expo-navigation-bar";
import { createContext, useContext } from "react";
import { Modal, Platform, Pressable, SafeAreaView, StatusBar, View } from "react-native";
import { Directions, Gesture, GestureDetector, gestureHandlerRootHOC } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { centerFlex, colors } from "../parameters";
import AppText from "./AppText";

type PropsContext = { closeModal: () => void; children: JSX.Element; leftHeaderButton: { onPress: () => void; title: string } | undefined } | null;

const PropsContext = createContext<PropsContext>(null);

const ModalWithGesturesEnabled = gestureHandlerRootHOC(() => {
    const props = useContext(PropsContext);

    if (!props) return <></>;

    const { children, closeModal, leftHeaderButton } = props;

    const flingGesture = Gesture.Fling()
        .direction(Directions.DOWN)
        .onStart((e) => {
            runOnJS(closeModal)();
        });

    return (
        <GestureDetector gesture={flingGesture}>
            <SafeAreaView style={[{ flex: 1, justifyContent: "flex-end", backgroundColor: colors.darkGray }]}>
                <View
                    style={{
                        borderRadius: 10,
                        flex: 1,
                        width: "100%",
                        padding: 10,
                    }}>
                    <View style={[centerFlex, { position: "relative" }]}>
                        {leftHeaderButton && (
                            <Pressable onPress={closeModal} style={{ alignSelf: "flex-start" }}>
                                <AppText style={{ color: colors.accent, padding: 10 }} fontSize={16}>
                                    Close
                                </AppText>
                            </Pressable>
                        )}
                        <View style={{ backgroundColor: `${colors.line}`, width: 150, height: 6, borderRadius: 10, position: "absolute" }} />
                        {leftHeaderButton && (
                            <Pressable onPress={leftHeaderButton.onPress} style={{ alignSelf: "flex-end", position: "absolute" }}>
                                <AppText style={{ color: colors.accent, padding: 10 }} fontSize={16}>
                                    {leftHeaderButton.title}
                                </AppText>
                            </Pressable>
                        )}
                        {!leftHeaderButton && (
                            <Pressable onPress={closeModal} style={{ alignSelf: "flex-end" }}>
                                <AppText style={{ color: colors.accent, padding: 10 }} fontSize={16}>
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
                <ModalWithGesturesEnabled />
            </PropsContext.Provider>
        </Modal>
    );
}

export default FlingToDismissModal;
