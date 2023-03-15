import { Button, Dimensions, Modal, Pressable, Text, View } from "react-native";
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";
import CanvasTest from "./canvas/CanvasTest";
import { selectCanvasDisplaySettings, toggleSettingsMenuOpen, toggleShowLabel, toggleTreeSelector } from "./canvasDisplaySettingsSlice";
import { selectCurrentTree, changeTree, unselectTree } from "./currentTreeSlice";
import { useAppDispatch, useAppSelector } from "./reduxHooks";
import { centerFlex, mockSkillTreeArray, treeMock } from "./types";

export const NAV_HEGIHT = 75;

function HomePage() {
    const { height, width } = Dimensions.get("window");

    const { menuOpen, showLabel, treeSelectorOpen } = useAppSelector(selectCanvasDisplaySettings);

    const dispatch = useAppDispatch();

    const animated = useAnimatedStyle(() => {
        return {
            width: withSpring(menuOpen ? width - 20 : 65, { damping: 27, stiffness: 300 }),
        };
    }, [menuOpen]);

    return (
        <View style={{ position: "relative" }}>
            <CanvasTest />
            <Pressable
                onPress={() => {
                    dispatch(toggleSettingsMenuOpen());
                }}>
                <View style={{ position: "absolute", bottom: 10, left: 10 }}>
                    <Animated.View
                        style={[
                            animated,
                            {
                                position: "relative",
                                height: 65,
                                backgroundColor: "gray",
                                borderRadius: 40,
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-evenly",
                            },
                        ]}>
                        {menuOpen && (
                            <>
                                <Pressable
                                    style={{ backgroundColor: "white", opacity: showLabel ? 1 : 0.5, width: 70 }}
                                    onPress={() => dispatch(toggleShowLabel())}>
                                    <Text>Show Label</Text>
                                </Pressable>
                                <Pressable
                                    style={{ backgroundColor: "white", opacity: showLabel ? 1 : 0.5, width: 70 }}
                                    onPress={() => dispatch(toggleTreeSelector())}>
                                    <Text>Change Tree</Text>
                                </Pressable>
                            </>
                        )}
                    </Animated.View>
                </View>
            </Pressable>

            <Modal animationType="slide" transparent={true} visible={treeSelectorOpen} onRequestClose={() => dispatch(toggleTreeSelector())}>
                <View style={[centerFlex, { flex: 1, backgroundColor: "white" }]}>
                    <Button onPress={() => dispatch(toggleTreeSelector())} title="close!" />
                    <Button onPress={() => dispatch(unselectTree())} title="Unselect" />
                    {mockSkillTreeArray.map((tree, idx) => {
                        return (
                            <Button
                                key={idx}
                                onPress={() => {
                                    dispatch(unselectTree());
                                    dispatch(toggleTreeSelector());
                                    setTimeout(() => {
                                        dispatch(changeTree(tree));
                                    }, 50);
                                }}
                                title="Select tree mock"
                            />
                        );
                    })}
                </View>
            </Modal>
        </View>
    );
}

export default HomePage;
