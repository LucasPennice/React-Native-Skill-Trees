import { Button, Modal, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { closeAllMenues, selectCanvasDisplaySettings, toggleChildrenHoistSelector } from "../canvasDisplaySettingsSlice";
import { deleteNodeWithChildren, selectCurrentTree } from "../currentTreeSlice";
import { useAppDispatch, useAppSelector } from "../reduxHooks";
import { findParentOfNode } from "../treeFunctions";
import { centerFlex } from "../types";

function ChildrenHoistSelectorModal() {
    const { openMenu, candidatesToHoist } = useAppSelector(selectCanvasDisplaySettings);
    const { value: currentTree } = useAppSelector(selectCurrentTree);

    const dispatch = useAppDispatch();

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={openMenu == "childrenHoistSelector"}
            onRequestClose={() => dispatch(toggleChildrenHoistSelector())}>
            <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
                <View style={[centerFlex, { flex: 1 }]}>
                    <Text>Click the children that will now become the parent</Text>
                    <Button onPress={() => dispatch(toggleChildrenHoistSelector())} title="cancel!" />
                    <ScrollView style={[{ flex: 1, width: "100%", marginTop: 20 }]}>
                        {candidatesToHoist !== null &&
                            currentTree &&
                            candidatesToHoist.map((children, idx) => {
                                const nodeToDelete = findParentOfNode(currentTree, children.node.id);

                                return (
                                    <Pressable
                                        key={idx}
                                        style={{
                                            paddingHorizontal: 20,
                                            paddingVertical: 40,
                                            marginHorizontal: 20,
                                            marginBottom: 20,
                                            borderRadius: 12,
                                            backgroundColor: "lightgray",
                                        }}
                                        onPress={() => {
                                            dispatch(deleteNodeWithChildren({ childrenToHoist: children, nodeToDelete }));
                                            dispatch(closeAllMenues());
                                        }}>
                                        <Text>{children.node.name}</Text>
                                    </Pressable>
                                );
                            })}
                    </ScrollView>
                </View>
            </SafeAreaView>
        </Modal>
    );
}

export default ChildrenHoistSelectorModal;
