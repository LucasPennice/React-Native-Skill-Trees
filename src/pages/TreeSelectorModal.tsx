import { Button, Modal, View } from "react-native";
import { hideLabel, selectCanvasDisplaySettings, toggleTreeSelector } from "../canvasDisplaySettingsSlice";
import { changeTree, unselectTree } from "../currentTreeSlice";
import { useAppDispatch, useAppSelector } from "../reduxHooks";
import { centerFlex, mockSkillTreeArray } from "../types";

function TreeSelectorModal() {
    const { openMenu } = useAppSelector(selectCanvasDisplaySettings);

    const dispatch = useAppDispatch();

    return (
        <Modal animationType="slide" transparent={true} visible={openMenu == "treeSelector"} onRequestClose={() => dispatch(toggleTreeSelector())}>
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
    );
}

export default TreeSelectorModal;
