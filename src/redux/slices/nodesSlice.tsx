import { HOMEPAGE_TREE_ID, HOMETREE_ROOT_ID } from "@/parameters";
import { NormalizedNode, getDefaultSkillValue } from "@/types";
import { PayloadAction, Update, createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../reduxStore";
import { updateHomeIcon, updateHomeName } from "./homeTreeSlice";
import { addUserTree, removeUserTree, updateUserTree } from "./userTreesSlice";

const nodesAdapter = createEntityAdapter<NormalizedNode>({ selectId: (node) => node.nodeId });
export const {
    selectAll: selectAllNodes,
    selectEntities: selectNodesTable,
    selectTotal: selectTotalNodeNumber,
    selectIds: selectAllNodeIds,
} = nodesAdapter.getSelectors<RootState>((state) => state.nodes);

const initialState = nodesAdapter.getInitialState();

export type NodeSlice = typeof initialState;

export const nodesSlice = createSlice({
    name: "nodesSlice",
    initialState,
    reducers: {
        updateNodes: nodesAdapter.updateMany,
        addNode: nodesAdapter.addOne,
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
        overwriteNodeSlice: (state, action: PayloadAction<NodeSlice>) => {
            state.entities = action.payload.entities;
            state.ids = action.payload.ids;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(addUserTree, (state, action) => {
            const newTreeRootNode: NormalizedNode = {
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

            nodesAdapter.addOne(state, newTreeRootNode);

            const homeRootNode = state.entities[HOMETREE_ROOT_ID];

            if (!homeRootNode) throw new Error("homeRootNode not found at addUserTree extra reducer");

            nodesAdapter.updateOne(state, {
                id: HOMETREE_ROOT_ID,
                changes: { childrenIds: [...homeRootNode.childrenIds, newTreeRootNode.nodeId] },
            });

            nodesAdapter.addOne(state, homeRootNode);
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
            const nodeIds = Object.keys(state.entities);
            const rootNodeIdOfTreeToDelete = nodeIds.find((id) => state.entities[id]!.isRoot && state.entities[id]?.treeId === action.payload.treeId);

            if (!rootNodeIdOfTreeToDelete) throw new Error(`rootNodeIdOfTreeToDelete undefined at extraReducer for removeUserTree`);

            nodesAdapter.removeMany(state, action.payload.nodes);

            const homeRootNode = state.entities[HOMETREE_ROOT_ID];

            if (!homeRootNode) throw new Error("homeRootNode is undefined at extraReducer for removeUserTree");

            nodesAdapter.updateOne(state, {
                id: HOMETREE_ROOT_ID,
                changes: { childrenIds: homeRootNode.childrenIds.filter((cId) => cId !== rootNodeIdOfTreeToDelete) },
            });
        });
        builder.addCase(updateHomeIcon, (state, action) => {
            const homeRootNode = state.entities[HOMETREE_ROOT_ID];

            if (!homeRootNode) throw new Error("homeRootNode is undefined at extraReducer for updateHomeIcon");

            nodesAdapter.updateOne(state, {
                id: HOMETREE_ROOT_ID,
                changes: { data: { ...homeRootNode.data, icon: action.payload } },
            });
        });
        builder.addCase(updateHomeName, (state, action) => {
            const homeRootNode = state.entities[HOMETREE_ROOT_ID];

            if (!homeRootNode) throw new Error("homeRootNode is undefined at extraReducer for updateHomeIcon");

            nodesAdapter.updateOne(state, {
                id: HOMETREE_ROOT_ID,
                changes: { data: { ...homeRootNode.data, name: action.payload } },
            });
        });
    },
});

export const { addNodes, removeNodes, updateNodes, addNode, overwriteNodeSlice } = nodesSlice.actions;

export default nodesSlice.reducer;

export const selectNodesOfTree = (treeId: string) => (state: RootState) => {
    if (treeId === HOMEPAGE_TREE_ID) {
        const allNodesIds = state.nodes.ids;
        return allNodesIds.map((nodeId) => {
            const node = state.nodes.entities[nodeId];
            if (!node) throw new Error(`node of id ${nodeId} not found at selectedNodesOfTree for home tree`);
            return node;
        });
    }

    const userTree = state.userTrees.entities[treeId];

    if (!userTree) throw new Error("userTree undefined at selectNodesOfTree");

    let result: NormalizedNode[] = [];

    for (const nodeId of userTree.nodes) {
        const foundNode = state.nodes.entities[nodeId];

        if (foundNode) result.push(foundNode);
    }

    return result;
};

export const selectNodeById = (nodeId?: string) => (state: RootState) => {
    if (!nodeId) return undefined;

    const node = state.nodes.entities[nodeId];

    if (!node) return undefined;

    return node;
};
