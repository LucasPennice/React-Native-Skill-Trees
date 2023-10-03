import { router } from "expo-router";
import { deleteNodeWithNoChildren, updateNodeAndTreeCompletion } from "../../../functions/mutateTree";
import { NormalizedNode, Skill, Tree } from "../../../types";

function selectedNodeMenuQueryFns(selectedNode: NormalizedNode | undefined, clearSelectedNode: () => void) {
    return {
        closeMenu: clearSelectedNode,
        goToSkillPage: () => {
            if (!selectedNode) throw new Error("No selected node at goToSkillPage");
            router.push(`/myTrees/${selectedNode.treeId}/${selectedNode.nodeId}`);
        },
        goToTreePage: () => {
            if (!selectedNode) throw new Error("No selected node at goToTreePage");
            //@ts-ignore
            router.push(`/myTrees/${selectedNode.treeId}`);
        },
        goToEditTreePage: () => {
            if (!selectedNode) throw new Error("No selected node at goToTreePage");
            //@ts-ignore
            router.push({ pathname: `/myTrees`, params: { editingTreeId: selectedNode.treeId } });
        },
    };
}

function selectedNodeMenuMutateFns(
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

export { selectedNodeMenuMutateFns, selectedNodeMenuQueryFns };
