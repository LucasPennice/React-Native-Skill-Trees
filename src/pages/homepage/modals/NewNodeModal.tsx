import { BlurView } from "expo-blur";
import { useEffect, useState } from "react";
import { Modal, Pressable, SafeAreaView, TextInput, View, Dimensions, TouchableOpacity, TouchableHighlight } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import AppText from "../../../components/AppText";
import { selectCanvasDisplaySettings, toggleNewNode } from "../../../redux/canvasDisplaySettingsSlice";
import { useAppDispatch, useAppSelector } from "../../../redux/reduxHooks";
import { centerFlex } from "../../../types";
import { colors } from "../canvas/parameters";
import { setNewNode } from "../../../redux/newNodeSlice";

function NewNodeModal() {
    const { openMenu } = useAppSelector(selectCanvasDisplaySettings);
    const dispatch = useAppDispatch();

    const { width } = Dimensions.get("window");

    const [text, onChangeText] = useState("");
    const [isCompleted, setIsCompleted] = useState(false);

    const selectorWidth = width / 2 - 20 - 1;

    const animatedStyles = useAnimatedStyle(() => {
        return { left: withSpring(isCompleted ? selectorWidth : 2, { damping: 27, stiffness: 400 }) };
    });

    useEffect(() => {
        onChangeText("");
        setIsCompleted(false);
    }, [openMenu]);

    return (
        <Modal animationType="slide" transparent={true} visible={openMenu == "newNode"} onRequestClose={() => dispatch(toggleNewNode())}>
            <SafeAreaView style={[{ flex: 1 }]}>
                <BlurView intensity={30} style={{ flex: 1, padding: 20 }}>
                    <View style={[centerFlex, { flexDirection: "row", justifyContent: "flex-end" }]}>
                        <TouchableHighlight
                            onPress={() => dispatch(toggleNewNode())}
                            style={[centerFlex, { paddingVertical: 15, borderRadius: 10, backgroundColor: colors.background, width: 150 }]}>
                            <AppText style={{ fontSize: 20, color: `${colors.accent}` }}>Close</AppText>
                        </TouchableHighlight>
                    </View>
                    <AppText style={{ color: "lightgray", fontSize: 20, marginTop: 20 }}>Skill Name</AppText>
                    <TextInput
                        multiline
                        blurOnSubmit
                        //@ts-ignore
                        enterKeyHint="done"
                        onChangeText={onChangeText}
                        placeholder="Leadership"
                        value={text}
                        style={{ backgroundColor: colors.line, borderRadius: 10, fontSize: 24, padding: 10, marginTop: 10, color: "white" }}
                    />
                    <AppText style={{ color: "lightgray", fontSize: 20, marginTop: 20 }}>Have I Mastered This Skill?</AppText>
                    <View
                        style={[
                            centerFlex,
                            {
                                flexDirection: "row",
                                justifyContent: "space-evenly",
                                backgroundColor: colors.line,
                                borderRadius: 10,
                                padding: 15,
                                marginTop: 10,
                                position: "relative",
                                overflow: "hidden",
                            },
                        ]}>
                        <Animated.View
                            style={[
                                animatedStyles,
                                {
                                    position: "absolute",
                                    top: 2,
                                    height: 50,
                                    width: selectorWidth,
                                    borderRadius: 10,
                                    backgroundColor: colors.background,
                                    opacity: 0.4,
                                },
                            ]}
                        />
                        <Pressable style={[centerFlex, { flex: 1 }]} onPress={() => setIsCompleted(false)}>
                            <AppText style={{ fontSize: 20, color: "white" }}>No</AppText>
                        </Pressable>
                        <Pressable style={[centerFlex, { flex: 1 }]} onPress={() => setIsCompleted(true)}>
                            <AppText style={{ fontSize: 20, color: "white" }}>Yes</AppText>
                        </Pressable>
                    </View>
                    <View style={[centerFlex]}>
                        <TouchableHighlight
                            onPress={() => {
                                if (text === "") return;
                                dispatch(setNewNode({ name: text, isCompleted, id: `${Math.random() * 1202}` }));
                                dispatch(toggleNewNode());
                            }}
                            style={[
                                centerFlex,
                                { paddingVertical: 15, borderRadius: 10, backgroundColor: colors.background, width: 150, marginTop: 50 },
                            ]}>
                            <AppText style={{ fontSize: 20, color: `${colors.blue}` }}>Confirm</AppText>
                        </TouchableHighlight>
                    </View>
                </BlurView>
            </SafeAreaView>
        </Modal>
    );
}

export default NewNodeModal;
