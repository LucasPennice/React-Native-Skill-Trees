import { Button, Modal, View } from "react-native";
import CanvasTest from "../canvas/CanvasTest";
import { hideLabel, selectCanvasDisplaySettings, toggleTreeSelector } from "../canvasDisplaySettingsSlice";
import { changeTree, unselectTree } from "../currentTreeSlice";
import { useAppDispatch, useAppSelector } from "../reduxHooks";
import { centerFlex, mockSkillTreeArray } from "../types";
import ProgressIndicator from "./ProgressIndicator";
import SettingsMenu from "./SettingsMenu";

export const NAV_HEGIHT = 75;

function HomePage() {
    const { menuOpen, showLabel, treeSelectorOpen } = useAppSelector(selectCanvasDisplaySettings);

    const dispatch = useAppDispatch();

    return (
        <View style={{ position: "relative" }}>
            <CanvasTest />
            <ProgressIndicator />
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
