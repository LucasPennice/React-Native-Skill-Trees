import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Alert } from "react-native";
import { StackNavigatorParams } from "../../../../App";
import { countSkillNodes, treeCompletedSkillPercentage } from "../../../functions/extractInformationFromTree";
import { deleteNodeWithNoChildren, editTreeProperties } from "../../../functions/mutateTree";
import { useAppDispatch } from "../../../redux/reduxHooks";
import { removeUserTree, setSelectedNode, updateUserTrees } from "../../../redux/userTreesSlice";
import { Skill, Tree } from "../../../types";
import { SelectedNodeMenuFunctions } from "./SelectedNodeMenu";

function useGetMenuFunctions(params: {
    selectedNode: Tree<Skill> | undefined;
    navigation: NativeStackNavigationProp<StackNavigatorParams, "ViewingSkillTree" | "Home", undefined>;
    openChildrenHoistSelector?: (childrenToHoist: Tree<Skill>[]) => void;
    selectedTree?: Tree<Skill> | undefined;
    clearSelectedNode: () => void;
}) {
    const { navigation, openChildrenHoistSelector, selectedNode, selectedTree, clearSelectedNode } = params;
    const dispatch = useAppDispatch();

    const nonEditingFns = {
        closeMenu: clearSelectedNode,
        goToSkillPage: () => {
            if (!selectedNode) throw new Error("No selected node at goToSkillPage");
            navigation.navigate("SkillPage", selectedNode);
        },
        goToTreePage: () => {
            if (!selectedNode) throw new Error("No selected node at goToTreePage");
            navigation.navigate("ViewingSkillTree", { treeId: selectedNode.treeId });
        },
    };

    if (!openChildrenHoistSelector || !selectedTree) return nonEditingFns;

    return {
        ...nonEditingFns,
        editing: {
            updateNode: (updatedNode: Tree<Skill>) => {
                if (!selectedNode) throw new Error("No selected node at updateNode");

                let updatedRootNode = editTreeProperties(selectedTree, selectedNode, updatedNode);

                if (!updatedRootNode) throw new Error("Error saving tree in PopUpMenu");

                const treeSkillCompletion = treeCompletedSkillPercentage(updatedRootNode);

                if (treeSkillCompletion === 100) updatedRootNode = { ...updatedRootNode, data: { ...updatedRootNode.data, isCompleted: true } };
                if (treeSkillCompletion !== 100) updatedRootNode = { ...updatedRootNode, data: { ...updatedRootNode.data, isCompleted: false } };

                dispatch(updateUserTrees(updatedRootNode));
            },
            handleDeleteNode: (node: Tree<Skill>) => {
                if (!selectedTree) throw new Error("No selectedTree at deleteNode");
                if (!selectedNode) throw new Error("No selected node at deleteNode");

                const isLastChildrenRemaining = countSkillNodes(selectedTree) === 1;

                if (isLastChildrenRemaining) return confirmDeleteTree();

                if (node.children.length !== 0) return openChildrenHoistSelector(node.children);

                const result = deleteNodeWithNoChildren(selectedTree, node);

                dispatch(updateUserTrees(result));
                dispatch(setSelectedNode(null));

                function confirmDeleteTree() {
                    return Alert.alert(
                        `Deleting ${node.data.name} will also delete ${selectedTree!.treeName}`,
                        "Are you sure you want to continue?",
                        [
                            { text: "No", style: "cancel" },
                            { text: "Yes", onPress: deleteTree, style: "destructive" },
                        ],
                        { cancelable: true }
                    );
                }

                function deleteTree() {
                    dispatch(removeUserTree(selectedTree!.treeId));
                    navigation.navigate("MyTrees", {});
                }
            },
        },
    } as SelectedNodeMenuFunctions;
}

export default useGetMenuFunctions;
