import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StackNavigatorParams } from "../../../../App";
import { deleteNodeWithNoChildren, updateNodeAndTreeCompletion } from "../../../functions/mutateTree";
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
            try {
                if (!selectedNode) throw new Error("No selected node at updateNode");

                const updatedRootNode = updateNodeAndTreeCompletion(selectedTree, updatedNode);

                updateUserTrees(updatedRootNode);
            } catch (error) {
                console.error(error);
            }
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

export { getMenuEditingFunctions, getMenuNonEditingFunctions };
