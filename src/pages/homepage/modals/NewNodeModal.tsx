import { BlurView } from "expo-blur";
import { useEffect, useState } from "react";
import { Modal, Pressable, SafeAreaView, TextInput, View } from "react-native";
import AppText from "../../../AppText";
import { selectCanvasDisplaySettings, toggleNewNode } from "../../../redux/canvasDisplaySettingsSlice";
import { useAppDispatch, useAppSelector } from "../../../redux/reduxHooks";
import { centerFlex } from "../../../types";
import { colors } from "../canvas/parameters";

function NewNodeModal() {
    const { openMenu } = useAppSelector(selectCanvasDisplaySettings);
    const dispatch = useAppDispatch();

    const [text, onChangeText] = useState("Useless Text");

    return (
        <Modal animationType="slide" transparent={true} visible={openMenu == "newNode"} onRequestClose={() => dispatch(toggleNewNode())}>
            <SafeAreaView style={[centerFlex, { flex: 1 }]}>
                <BlurView intensity={40} style={{ width: "90%", aspectRatio: 1, padding: 20 }}>
                    <Pressable onPress={() => dispatch(toggleNewNode())} style={[centerFlex, { paddingVertical: 15, borderRadius: 10 }]}>
                        <AppText style={{ fontSize: 20, color: `${colors.accent}9D` }}>Close</AppText>
                    </Pressable>
                    <TextInput placeholder={"gamner"} onChangeText={onChangeText} value={text} />
                </BlurView>
            </SafeAreaView>
        </Modal>
    );
}

export default NewNodeModal;
