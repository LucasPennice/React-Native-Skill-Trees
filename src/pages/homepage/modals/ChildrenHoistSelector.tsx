import { Button, Modal, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { closeAllMenues, selectCanvasDisplaySettings, closeChildrenHoistSelector } from "../../../redux/canvasDisplaySettingsSlice";
import { deleteNodeWithChildren, selectCurrentTree } from "../../../redux/currentTreeSlice";
import { useAppDispatch, useAppSelector } from "../../../redux/reduxHooks";
import { findTreeNodeById } from "../treeFunctions";
import { centerFlex } from "../../../types";
import { colors } from "../canvas/parameters";
import AppText from "../../../AppText";
import { Fragment } from "react";

function ChildrenHoistSelectorModal() {
    const { openMenu, candidatesToHoist } = useAppSelector(selectCanvasDisplaySettings);
    const currentTree = useAppSelector(selectCurrentTree);

    const dispatch = useAppDispatch();

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={openMenu == "childrenHoistSelector"}
            onRequestClose={() => dispatch(closeChildrenHoistSelector())}>
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.line }}>
                <View style={[centerFlex, { flex: 1 }]}>
                    <View style={[centerFlex, { flexDirection: "row", margin: 10, gap: 10 }]}>
                        <AppText style={{ fontSize: 20, color: "white", flex: 1 }}>
                            The skill that you click will take the place of the deleted skill
                        </AppText>
                        <Pressable
                            onPress={() => dispatch(closeChildrenHoistSelector())}
                            style={[centerFlex, { paddingVertical: 15, borderRadius: 10 }]}>
                            <AppText style={{ fontSize: 20, color: `${colors.accent}9D` }}>Close</AppText>
                        </Pressable>
                    </View>
                    <ScrollView style={[{ flex: 1, width: "100%", marginTop: 20 }]}>
                        {candidatesToHoist !== null &&
                            currentTree &&
                            candidatesToHoist.map((children, idx) => {
                                const nodeToDelete = findTreeNodeById(currentTree, children.parentId ?? null);

                                if (!nodeToDelete) return <Fragment key={idx}></Fragment>;

                                return (
                                    <Pressable
                                        key={idx}
                                        style={[
                                            centerFlex,
                                            {
                                                paddingHorizontal: 20,
                                                paddingVertical: 25,
                                                marginHorizontal: 10,
                                                marginBottom: 20,
                                                borderRadius: 12,
                                                backgroundColor: colors.background,
                                                flexDirection: "row",
                                            },
                                        ]}
                                        onPress={() => {
                                            dispatch(deleteNodeWithChildren({ childrenToHoist: children, nodeToDelete }));
                                            dispatch(closeAllMenues());
                                        }}>
                                        <View
                                            style={[
                                                centerFlex,
                                                { borderColor: colors.accent, borderWidth: 4, width: 60, aspectRatio: 1, borderRadius: 60 },
                                            ]}>
                                            <AppText style={{ fontSize: 30, color: "white" }}>{children.data.name[0]}</AppText>
                                        </View>
                                        <AppText style={{ color: "white", flex: 1, textAlign: "center", fontSize: 24 }}>{children.data.name}</AppText>
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
