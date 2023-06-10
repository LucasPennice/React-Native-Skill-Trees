import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import AppText from "../../../components/AppText";
import FlingToDismissModal from "../../../components/FlingToDismissModal";
import { findParentOfNode } from "../../../functions/extractInformationFromTree";
import { deleteNodeWithChildren } from "../../../functions/mutateTree";
import { centerFlex, colors } from "../../../parameters";
import { useAppDispatch } from "../../../redux/reduxHooks";
import { setSelectedNode, updateUserTrees } from "../../../redux/userTreesSlice";
import { Skill, Tree } from "../../../types";
import useCurrentTree from "../../../useCurrentTree";

type Props = {
    nodeToDelete: Tree<Skill> | null;
    closeModalAndClearState: () => void;
    open: boolean;
};

function SelectChildrenToHoistWhenDeletingParentModal({ nodeToDelete, closeModalAndClearState, open }: Props) {
    const currentTree = useCurrentTree();
    const dispatch = useAppDispatch();

    if (!nodeToDelete) return <></>;

    const candidatesToHoist = nodeToDelete.children;

    const deleteParentAndHoistChildren = (childrenToHoist: Tree<Skill>) => () => {
        const newTree = deleteNodeWithChildren(currentTree, nodeToDelete, childrenToHoist);

        dispatch(updateUserTrees(newTree));

        closeModalAndClearState();

        dispatch(setSelectedNode(null));
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
                        const isComplete = children.data.isCompleted;
                        return (
                            <Pressable key={idx} style={[centerFlex, styles.pressable]} onPress={confirmDeleteNode(children)}>
                                <View>
                                    <AppText style={{ color: "white", fontFamily: "helveticaBold" }} fontSize={20}>
                                        {children.data.name}
                                    </AppText>
                                    <AppText style={{ color: "#FFFFFF5D" }} fontSize={20}>
                                        {numberOfChildrenString(children.children.length)}
                                    </AppText>
                                </View>
                                <View
                                    style={[
                                        centerFlex,
                                        {
                                            borderColor: isComplete ? children.accentColor.color1 : colors.line,
                                            borderWidth: 3,
                                            width: 40,
                                            aspectRatio: 1,
                                            borderRadius: 60,
                                        },
                                    ]}>
                                    <AppText style={{ color: isComplete ? children.accentColor.color1 : "white" }} fontSize={20}>
                                        {children.data.name[0]}
                                    </AppText>
                                </View>
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

export default SelectChildrenToHoistWhenDeletingParentModal;

function numberOfChildrenString(number: number) {
    if (number === 0) return "No skills stem from this";

    if (number === 1) return "1 Skill stem from this";

    return `${number} Skills stem from this`;
}
