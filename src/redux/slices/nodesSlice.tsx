import { NormalizedNode, getDefaultSkillValue } from "@/types";
import { PayloadAction, Update, createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../reduxStore";
import { addUserTree, removeUserTree, updateUserTree } from "./newUserTreesSlice";

const nodesAdapter = createEntityAdapter<NormalizedNode>({ selectId: (node) => node.nodeId });
export const { selectAll: selectAllNodes, selectTotal: selectTotalNodeNumber } = nodesAdapter.getSelectors<RootState>((state) => state.nodes);

const initialState = nodesAdapter.getInitialState();

export type NodeSlice = typeof initialState;

export const nodesSlice = createSlice({
    name: "nodesSlice",
    initialState,
    reducers: {
        updateNode: nodesAdapter.updateOne,
        updateNodes: nodesAdapter.updateMany,
        addNodes: (state, action: PayloadAction<{ treeId: string; nodesToAdd: NormalizedNode[] }>) => {
            nodesAdapter.addMany(state, action.payload.nodesToAdd);
        },
        removeNodes: (state, action: PayloadAction<{ treeId: string; nodesToDelete: string[] }>) => {
            //Remove the nodeToDelete id from the parent node
            action.payload.nodesToDelete.forEach((nodeToDeleteId) => {
                const nodeToDelete = state.entities[nodeToDeleteId];

                if (!nodeToDelete) throw new Error("nodeToDelete undefined at removeNodes");

                if (nodeToDelete.parentId) {
                    const parentNode = state.entities[nodeToDelete.parentId];

                    if (!parentNode) throw new Error("parentNode undefined at removeNodes");

                    const childrenWithoutNodeToDelete = parentNode.childrenIds.filter((id) => id !== nodeToDeleteId);

                    nodesAdapter.updateOne(state, { id: parentNode.nodeId, changes: { childrenIds: childrenWithoutNodeToDelete } });
                }
            });

            //Remove the nodes to delete

            nodesAdapter.removeMany(state, action.payload.nodesToDelete);
        },
    },
    extraReducers: (builder) => {
        builder.addCase(addUserTree, (state, action) => {
            const rootNode: NormalizedNode = {
                category: "SKILL_TREE",
                childrenIds: [],
                data: getDefaultSkillValue(action.payload.treeName, false, action.payload.icon),
                isRoot: true,
                level: 0,
                nodeId: action.payload.rootNodeId,
                parentId: null,
                treeId: action.payload.treeId,
                x: 0,
                y: 0,
            };

            nodesAdapter.addOne(state, rootNode);
        });
        builder.addCase(updateUserTree, (state, action) => {
            const rootNodeId = action.payload.rootNodeId;
            const rootNode = state.entities[rootNodeId];

            if (!rootNode) throw new Error("rootNode undefined add updateUserTree builder.addCase in nodeSlice");

            const updateIcon = action.payload.update.changes.icon !== undefined;
            const updateName = action.payload.update.changes.treeName !== undefined;

            const updates: Update<NormalizedNode> = {
                id: rootNodeId,
                changes: {
                    data: {
                        ...rootNode.data,
                        icon: updateIcon ? action.payload.update.changes.icon! : rootNode.data.icon,
                        name: updateName ? action.payload.update.changes.treeName! : rootNode.data.name,
                    },
                },
            };

            nodesAdapter.updateOne(state, updates);
        });
        builder.addCase(removeUserTree, (state, action) => {
            nodesAdapter.removeMany(state, action.payload.nodes);
        });
    },
});

export const { addNodes, removeNodes, updateNode, updateNodes } = nodesSlice.actions;

export default nodesSlice.reducer;

export const selectNodesOfTree = (treeId: string) => (state: RootState) => {
    const userTree = state.userTrees.entities[treeId];

    if (!userTree) throw new Error("userTree undefined at selectNodesOfTree");

    let result: NormalizedNode[] = [];

    for (const nodeId of userTree.nodes) {
        const foundNode = state.nodes.entities[nodeId];

        if (foundNode) result.push(foundNode);
    }

    return result;
};

export const selectNodeById = (nodeId: string) => (state: RootState) => {
    const node = state.nodes.entities[nodeId];

    if (!node) throw new Error("node undefined at selectNodeById");

    return node;
};

// 🚨 MI PROBLEMA AHORA ES QUE NO SE
//     - SI EL ESTADO SE CARGO BIEN, PARA LO CUAL ESTABA PROBANDO EN HOME LOS SELECTORS
// - TAMPOCO SE COMO ARMAR LOS SELECTORS
// - MAS LO QUE TENGO ANOTADO EN EL CUADERNO
