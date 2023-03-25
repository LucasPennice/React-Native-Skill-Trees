import { Button, Modal, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { closeAllMenues, selectCanvasDisplaySettings, closeChildrenHoistSelector } from "../../../redux/canvasDisplaySettingsSlice";
import { deleteNodeWithChildren, selectCurrentTree } from "../../../redux/currentTreeSlice";
import { useAppDispatch, useAppSelector } from "../../../redux/reduxHooks";
import { findTreeNodeById } from "../treeFunctions";
import { centerFlex } from "../../../types";

function ChildrenHoistSelectorModal() {
    const { openMenu, candidatesToHoist } = useAppSelector(selectCanvasDisplaySettings);
    const { value: currentTree } = useAppSelector(selectCurrentTree);

    const dispatch = useAppDispatch();

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={openMenu == "childrenHoistSelector"}
            onRequestClose={() => dispatch(closeChildrenHoistSelector())}>
            <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
                <View style={[centerFlex, { flex: 1 }]}>
                    <Text>Click the children that will now become the parent</Text>
                    <Button onPress={() => dispatch(closeChildrenHoistSelector())} title="cancel!" />
                    <ScrollView style={[{ flex: 1, width: "100%", marginTop: 20 }]}>
                        {candidatesToHoist !== null &&
                            currentTree &&
                            candidatesToHoist.map((children, idx) => {
                                const nodeToDelete = findTreeNodeById(currentTree, children.parentId ?? null);

                                if (!nodeToDelete) return <></>;

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
                                        <Text>{children.data.name}</Text>
                                        {children.parentId && <Text>{children.parentId}</Text>}
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
