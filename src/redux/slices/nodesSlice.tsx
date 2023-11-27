import { HOMEPAGE_TREE_ID, HOMETREE_ROOT_ID } from "@/parameters";
import { NormalizedNode, getDefaultSkillValue } from "@/types";
import { PayloadAction, Update, createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../reduxStore";
import { updateHomeIcon, updateHomeName } from "./homeTreeSlice";
import { TreeData, addUserTrees, importUserTrees, removeUserTrees, updateUserTree } from "./userTreesSlice";

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
        createHomeRootNode: nodesAdapter.addOne,
        updateNodes: nodesAdapter.updateMany,
        addNodes: nodesAdapter.addMany,
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
        builder.addCase(addUserTrees, (state, action) => {
            const homeRootNode = state.entities[HOMETREE_ROOT_ID];
            if (!homeRootNode) throw new Error("homeRootNode not found at addUserTrees extra reducer");

            const treesToAdd = action.payload as readonly TreeData[];

            const newRootNodes: NormalizedNode[] = [];

            for (let i = 0; i < treesToAdd.length; i++) {
                const treeToAdd = treesToAdd[i];

                const rootNode: NormalizedNode = {
                    category: "SKILL_TREE",
                    childrenIds: [],
                    data: getDefaultSkillValue(treeToAdd.treeName, false, treeToAdd.icon),
                    isRoot: true,
                    level: 0,
                    nodeId: treeToAdd.rootNodeId,
                    parentId: null,
                    treeId: treeToAdd.treeId,
                    x: 0,
                    y: 0,
                };

                newRootNodes.push(rootNode);
            }

            nodesAdapter.addMany(state, newRootNodes);

            nodesAdapter.updateOne(state, {
                id: HOMETREE_ROOT_ID,
                changes: { childrenIds: [...homeRootNode.childrenIds, ...newRootNodes.map((n) => n.nodeId)] },
            });
        });
        builder.addCase(importUserTrees, (state, action) => {
            const homeRootNode = state.entities[HOMETREE_ROOT_ID];
            if (!homeRootNode) throw new Error("homeRootNode not found at addUserTrees extra reducer");

            nodesAdapter.addMany(state, action.payload.nodes);

            nodesAdapter.updateOne(state, {
                id: HOMETREE_ROOT_ID,
                changes: { childrenIds: [...homeRootNode.childrenIds, ...action.payload.trees.map((n) => n.rootNodeId)] },
            });
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

        builder.addCase(removeUserTrees, (state, action) => {
            const { nodes, treeIds } = action.payload;

            const nodeIds = Object.keys(state.entities);

            const getRootIdOfTreesToDelete = (nodeId: string) => {
                //Exists
                if (!state.entities[nodeId]) return false;
                //Is a root
                if (!state.entities[nodeId]!.isRoot) return false;
                //Their treeId is in the remove list
                if (!treeIds.includes(state.entities[nodeId]!.treeId)) return false;

                return true;
            };

            const rootIdOfTreesToDelete = nodeIds.filter(getRootIdOfTreesToDelete);

            if (rootIdOfTreesToDelete.length === 0) throw new Error(`rootIdOfTreesToDelete empty at extraReducer for removeUserTrees`);

            nodesAdapter.removeMany(state, nodes);

            const homeRootNode = state.entities[HOMETREE_ROOT_ID];

            if (!homeRootNode) throw new Error("homeRootNode is undefined at extraReducer for removeUserTrees");

            nodesAdapter.updateOne(state, {
                id: HOMETREE_ROOT_ID,
                changes: { childrenIds: homeRootNode.childrenIds.filter((childId) => !rootIdOfTreesToDelete.includes(childId)) },
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

export const { addNodes, removeNodes, updateNodes, createHomeRootNode, overwriteNodeSlice } = nodesSlice.actions;

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
