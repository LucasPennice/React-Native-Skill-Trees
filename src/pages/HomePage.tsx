import { Button, Modal, Text, View } from "react-native";
import CanvasTest from "../canvas/CanvasTest";
import { hideLabel, selectCanvasDisplaySettings, toggleChildrenHoistSelector, toggleTreeSelector } from "../canvasDisplaySettingsSlice";
import { changeTree, selectCurrentTree, unselectTree } from "../currentTreeSlice";
import { useAppDispatch, useAppSelector } from "../reduxHooks";
import { centerFlex, mockSkillTreeArray } from "../types";
import ProgressIndicator from "./ProgressIndicator";
import SettingsMenu from "./SettingsMenu";
import TreeName from "./TreeName";

export const NAV_HEGIHT = 75;

function HomePage() {
    const { treeSelectorOpen, childrenHoistSelectorOpen } = useAppSelector(selectCanvasDisplaySettings);

    const dispatch = useAppDispatch();

    return (
        <View style={{ position: "relative" }}>
            <CanvasTest />
            <ProgressIndicator />
            <TreeName />
            <SettingsMenu />

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
                                    dispatch(hideLabel());
                                    setTimeout(() => {
                                        dispatch(changeTree(tree));
                                    }, 100);
                                }}
                                title={`Select ${tree.treeName ?? "Tree"}`}
                            />
                        );
                    })}
                </View>
            </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={childrenHoistSelectorOpen}
                onRequestClose={() => dispatch(toggleChildrenHoistSelector())}>
                <View style={[centerFlex, { flex: 1, backgroundColor: "white" }]}>
                    <Button onPress={() => dispatch(toggleChildrenHoistSelector())} title="close!" />
                    <Text>Shoy el children hoist selector</Text>
                </View>
            </Modal>
        </View>
    );
}

export default HomePage;
