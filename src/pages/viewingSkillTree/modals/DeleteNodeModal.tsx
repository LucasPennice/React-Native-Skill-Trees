import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import AppText from "../../../components/AppText";
import FlingToDismissModal from "../../../components/FlingToDismissModal";
import NodeView from "../../../components/NodeView";
import { checkIfTreeHasInvalidCompleteDependencies, findParentOfNode } from "../../../functions/extractInformationFromTree";
import { deleteNodeWithChildren } from "../../../functions/mutateTree";
import { centerFlex, colors } from "../../../parameters";
import { useAppDispatch, useAppSelector } from "../../../redux/reduxHooks";
import { selectSafeScreenDimentions } from "../../../redux/slices/screenDimentionsSlice";
import { updateUserTrees } from "../../../redux/slices/userTreesSlice";
import { Skill, Tree } from "../../../types";
import useCurrentTree from "../../../useCurrentTree";

type Props = {
    nodeToDelete: Tree<Skill> | null;
    closeModalAndClearState: () => void;
    open: boolean;
};

function DeleteNodeModal({ nodeToDelete, closeModalAndClearState, open }: Props) {
    const currentTree = useCurrentTree();
    const screenDimensions = useAppSelector(selectSafeScreenDimentions);
    const dispatch = useAppDispatch();

    if (!nodeToDelete) return <></>;

    const candidatesToHoist = nodeToDelete.children;

    const deleteParentAndHoistChildren = (childrenToHoist: Tree<Skill>) => () => {
        const updatedTree = deleteNodeWithChildren(currentTree, nodeToDelete, childrenToHoist);

        dispatch(updateUserTrees({ updatedTree, screenDimensions }));

        closeModalAndClearState();
    };

    const confirmDeleteNode = (children: Tree<Skill>) => () => {
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
                    {candidatesToHoist.map((children, idx) => {
                        const blockDelete = checkIfShouldBlockDelete(nodeToDelete, children);

                        const notifyWhyDeleteBlocked = () =>
                            Alert.alert(
                                "When this child is hosted skills will be complete without it's parent being complete. Breaking this skill tree's dependencies"
                            );

                        return (
                            <Pressable
                                key={idx}
                                style={[centerFlex, styles.pressable, { opacity: blockDelete ? 0.3 : 1 }]}
                                onPress={blockDelete ? notifyWhyDeleteBlocked : confirmDeleteNode(children)}>
                                <View>
                                    <AppText style={{ color: "#FFFFFF", fontFamily: "helveticaBold", marginBottom: 5 }} fontSize={20}>
                                        {children.data.name}
                                    </AppText>
                                    <AppText style={{ color: "#FFFFFF5D" }} fontSize={18}>
                                        {numberOfChildrenString(children.children.length)}
                                    </AppText>
                                </View>
                                <NodeView node={children} size={60} />
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

function checkIfShouldBlockDelete(nodeToDelete: Tree<Skill>, candidate: Tree<Skill>) {
    const newChildrenArrayWithStaleParentId = [...nodeToDelete.children.filter((c) => c.nodeId !== candidate.nodeId), ...candidate.children];
    const newChildrenArray = newChildrenArrayWithStaleParentId.map((c) => {
        return { ...c, parentId: candidate.nodeId };
    });

    const tentativeNewTree: Tree<Skill> = {
        ...nodeToDelete,
        nodeId: candidate.nodeId,
        data: candidate.data,
        children: newChildrenArray,
        parentId: nodeToDelete.parentId,
    };

    return checkIfTreeHasInvalidCompleteDependencies(tentativeNewTree);
}
