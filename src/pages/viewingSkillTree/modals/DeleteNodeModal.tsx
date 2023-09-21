import { normalizedNodeToTree } from "@/components/treeRelated/general/functions";
import { deleteNodeAndHoistChild } from "@/functions/misc";
import { TreeData, selectTreeById } from "@/redux/slices/userTreesSlice";
import { removeNodes, selectNodesOfTree, updateNodes } from "@/redux/slices/nodesSlice";
import { Update } from "@reduxjs/toolkit";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import AppText from "../../../components/AppText";
import FlingToDismissModal from "../../../components/FlingToDismissModal";
import NodeView from "../../../components/NodeView";
import { findParentOfNode } from "../../../functions/extractInformationFromTree";
import { centerFlex, colors } from "../../../parameters";
import { useAppDispatch, useAppSelector } from "../../../redux/reduxHooks";
import { NormalizedNode } from "../../../types";

type Props = {
    nodeToDelete: NormalizedNode;
    closeModalAndClearState: () => void;
    open: boolean;
};

function useGetSelectedTree(treeId: string) {
    //We can guarantee here that the type is TreeData because we will never pass the home tree id to the selector
    const treeData = useAppSelector(selectTreeById(treeId)) as TreeData;
    const treeNodes = useAppSelector(selectNodesOfTree(treeId));

    const selectedTree = normalizedNodeToTree(treeNodes, treeData);

    return selectedTree;
}

function DeleteNodeModal({ nodeToDelete, closeModalAndClearState, open }: Props) {
    const currentTree = useGetSelectedTree(nodeToDelete.treeId);

    const nodesOfTree = useAppSelector(selectNodesOfTree(nodeToDelete.treeId));

    const dispatch = useAppDispatch();

    const candidatesToHoist = nodesOfTree.filter((n) => nodeToDelete.childrenIds.includes(n.nodeId));

    const deleteParentAndHoistChildren = (childrenToHoist: NormalizedNode) => () => {
        const nodeToHoist = nodesOfTree.find((node) => node.nodeId === childrenToHoist.nodeId);

        if (!nodeToHoist) throw new Error("nodeToHoist undefined at deleteParentAndHoistChildren");

        const { nodeIdToDelete, updatedNodes } = deleteNodeAndHoistChild(nodesOfTree, nodeToHoist);

        const updatedNodesReducerFormat: Update<NormalizedNode>[] = updatedNodes.map((updatedNode) => {
            return {
                id: updatedNode.nodeId,
                changes: { childrenIds: updatedNode.childrenIds, parentId: updatedNode.parentId },
            };
        });
        dispatch(updateNodes(updatedNodesReducerFormat));
        dispatch(removeNodes({ treeId: childrenToHoist.treeId, nodesToDelete: [nodeIdToDelete] }));

        closeModalAndClearState();
    };

    const confirmDeleteNode = (children: NormalizedNode) => () => {
        const parent = findParentOfNode(currentTree, children.nodeId);

        const parentName = parent ? parent.data.name : "";

        return Alert.alert(
            `Delete ${parentName} and replace it with ${children.data.name}?`,
            "",
            [
                { text: "No", style: "cancel" },
                { text: "Yes", onPress: deleteParentAndHoistChildren(children), style: "destructive" },
            ],
            { cancelable: true }
        );
    };

    return (
        <FlingToDismissModal closeModal={closeModalAndClearState} open={open}>
            <View style={[centerFlex, { flex: 1 }]}>
                <ScrollView style={[{ flex: 1, width: "100%", marginTop: 20 }]}>
                    {candidatesToHoist.map((candidate, idx) => {
                        const blockDelete = checkIfShouldBlockDelete(nodeToDelete, candidate, nodesOfTree);

                        const notifyWhyDeleteBlocked = () =>
                            Alert.alert(
                                "When this child is hosted skills will be complete without it's parent being complete. Breaking this skill tree's dependencies"
                            );

                        return (
                            <Pressable
                                key={idx}
                                style={[centerFlex, styles.pressable, { opacity: blockDelete ? 0.3 : 1 }]}
                                onPress={blockDelete ? notifyWhyDeleteBlocked : confirmDeleteNode(candidate)}>
                                <View>
                                    <AppText style={{ color: "#FFFFFF", fontFamily: "helveticaBold", marginBottom: 5 }} fontSize={20}>
                                        {candidate.data.name}
                                    </AppText>
                                    <AppText style={{ color: "#FFFFFF5D" }} fontSize={18}>
                                        {numberOfChildrenString(candidate.childrenIds.length)}
                                    </AppText>
                                </View>
                                <NodeView
                                    node={{ ...candidate, accentColor: currentTree.accentColor }}
                                    completePercentage={candidate.data.isCompleted ? 100 : 0}
                                    size={60}
                                />
                            </Pressable>
                        );
                    })}
                </ScrollView>
            </View>
        </FlingToDismissModal>
    );
}

const styles = StyleSheet.create({
    pressable: {
        paddingHorizontal: 20,
        paddingVertical: 25,
        marginHorizontal: 10,
        marginBottom: 20,
        borderRadius: 12,
        backgroundColor: colors.background,
        flexDirection: "row",
        justifyContent: "space-between",
    },
});

export default DeleteNodeModal;

function numberOfChildrenString(number: number) {
    if (number === 0) return "No skills stem from this";

    if (number === 1) return "1 Skill stem from this";

    return `${number} Skills stem from this`;
}

function checkIfShouldBlockDelete(nodeToDelete: NormalizedNode, candidate: NormalizedNode, nodesOfTree: NormalizedNode[]) {
    if (candidate.data.isCompleted) return false;

    //These are the children of the candidate node if it were to be hoisted
    const possibleChildrenOfCandidate = nodesOfTree.filter((n) => {
        if (n.nodeId === candidate.nodeId) return false;
        if (nodeToDelete.childrenIds.includes(n.nodeId)) return true;
        return false;
    });

    const anyPossibleChildrenOfCandidateComplete = possibleChildrenOfCandidate.find((n) => n.data.isCompleted);

    if (anyPossibleChildrenOfCandidateComplete) return true;

    return false;
}
