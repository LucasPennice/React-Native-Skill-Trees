import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StackNavigatorParams } from "../../../../App";
import { treeCompletedSkillPercentage } from "../../../functions/extractInformationFromTree";
import { deleteNodeWithNoChildren, editTreeProperties } from "../../../functions/mutateTree";
import { Skill, Tree } from "../../../types";

function getMenuNonEditingFunctions(
    selectedNode: Tree<Skill> | undefined,
    navigation: NativeStackNavigationProp<StackNavigatorParams, "ViewingSkillTree" | "Home", undefined>,
    clearSelectedNode: () => void
) {
    return {
        closeMenu: clearSelectedNode,
        goToSkillPage: () => {
            if (!selectedNode) throw new Error("No selected node at goToSkillPage");
            navigation.navigate("SkillPage", selectedNode);
        },
        goToTreePage: () => {
            if (!selectedNode) throw new Error("No selected node at goToTreePage");
            navigation.navigate("ViewingSkillTree", { treeId: selectedNode.treeId });
        },
        goToEditTreePage: () => {
            if (!selectedNode) throw new Error("No selected node at goToTreePage");
            navigation.navigate("MyTrees", { editingTreeId: selectedNode.treeId });
        },
    };
}

function getMenuEditingFunctions(
    functions: {
        openChildrenHoistSelector: (nodeToDelete: Tree<Skill>) => void;
        updateUserTrees: (v: Tree<Skill> | undefined) => void;
        clearSelectedNode: () => void;
    },
    state: { selectedTree: Tree<Skill> | undefined; selectedNode: Tree<Skill> | undefined }
) {
    const { selectedNode, selectedTree } = state;
    const { clearSelectedNode, openChildrenHoistSelector, updateUserTrees } = functions;

    return {
        updateNode: (updatedNode: Tree<Skill>) => {
            if (!selectedNode) throw new Error("No selected node at updateNode");

            let updatedRootNode = editTreeProperties(selectedTree, selectedNode, updatedNode);

            if (!updatedRootNode) throw new Error("Error saving tree in PopUpMenu");

            const treeSkillCompletion = treeCompletedSkillPercentage(updatedRootNode);

            if (treeSkillCompletion === 100) updatedRootNode = { ...updatedRootNode, data: { ...updatedRootNode.data, isCompleted: true } };
            if (treeSkillCompletion !== 100) updatedRootNode = { ...updatedRootNode, data: { ...updatedRootNode.data, isCompleted: false } };

            updateUserTrees(updatedRootNode);
        },
        handleDeleteNode: (node: Tree<Skill>) => {
            if (!selectedTree) throw new Error("No selectedTree at deleteNode");
            if (!selectedNode) throw new Error("No selected node at deleteNode");

            if (node.children.length !== 0) return openChildrenHoistSelector(node);

            const result = deleteNodeWithNoChildren(selectedTree, node);

            updateUserTrees(result);
            clearSelectedNode();
        },
    };
}

export { getMenuNonEditingFunctions, getMenuEditingFunctions };
