import { BlurView } from "expo-blur";
import { Modal, SafeAreaView, TouchableHighlight, View } from "react-native";
import AppText from "../../../AppText";
import { selectCanvasDisplaySettings, toggleTreeSelector } from "../../../redux/canvasDisplaySettingsSlice";
import { changeTree, unselectTree } from "../../../redux/currentTreeSlice";
import { useAppDispatch, useAppSelector } from "../../../redux/reduxHooks";
import { centerFlex, mockSkillTreeArray } from "../../../types";
import { colors } from "../canvas/parameters";

function TreeSelectorModal() {
    const { openMenu } = useAppSelector(selectCanvasDisplaySettings);

    const dispatch = useAppDispatch();

    return (
        <Modal animationType="slide" transparent={true} visible={openMenu == "treeSelector"} onRequestClose={() => dispatch(toggleTreeSelector())}>
            <SafeAreaView style={[{ flex: 1 }]}>
                <BlurView intensity={30} style={[{ flex: 1, padding: 20 }]}>
                    <View style={[centerFlex, { flexDirection: "row", justifyContent: "space-between", marginBottom: 30 }]}>
                        <TouchableHighlight
                            onPress={() => dispatch(unselectTree())}
                            style={[centerFlex, { paddingVertical: 15, borderRadius: 10, backgroundColor: colors.background, width: 150 }]}>
                            <AppText style={{ fontSize: 20, color: `${colors.blue}` }}>Unselect All</AppText>
                        </TouchableHighlight>
                        <TouchableHighlight
                            onPress={() => dispatch(toggleTreeSelector())}
                            style={[centerFlex, { paddingVertical: 15, borderRadius: 10, backgroundColor: colors.background, width: 150 }]}>
                            <AppText style={{ fontSize: 20, color: `${colors.accent}` }}>Close</AppText>
                        </TouchableHighlight>
                    </View>
                    {mockSkillTreeArray.map((tree, idx) => {
                        return (
                            <TouchableHighlight
                                key={idx}
                                onPress={() => {
                                    dispatch(unselectTree());
                                    dispatch(toggleTreeSelector());
                                    setTimeout(() => {
                                        dispatch(changeTree(tree));
                                    }, 100);
                                }}
                                style={{ width: "100%", padding: 25, borderRadius: 10, backgroundColor: colors.background, marginBottom: 15 }}>
                                <AppText style={{ fontSize: 20, color: `white` }}>{tree.treeName ?? "Tree"}</AppText>
                            </TouchableHighlight>
                        );
                    })}
                </BlurView>
            </SafeAreaView>
        </Modal>
    );
}

export default TreeSelectorModal;
