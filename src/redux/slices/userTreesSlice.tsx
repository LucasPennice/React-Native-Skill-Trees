import { HOMEPAGE_TREE_ID } from "@/parameters";
import { ColorGradient, NormalizedNode, SkillIcon } from "@/types";
import { Dictionary, EntityState, PayloadAction, Update, createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../reduxStore";
import { addNodes, removeNodes } from "./nodesSlice";

export type TreeData = {
    treeId: string;
    treeName: string;
    accentColor: ColorGradient;
    nodes: string[];
    rootNodeId: string;
    icon: SkillIcon;
    showOnHomeScreen: boolean;
};

const userTreesAdapter = createEntityAdapter<TreeData>({ selectId: (tree) => tree.treeId });

const initialState: EntityState<TreeData> = userTreesAdapter.getInitialState({ showOnHomeScreen: true });

export type UserTreeSlice = typeof initialState;

export const userTreesSlice = createSlice({
    name: "userTreesSlice",
    initialState,
    reducers: {
        updateUserTree: (state, action: PayloadAction<{ update: Update<TreeData>; rootNodeId: string }>) => {
            userTreesAdapter.updateOne(state, action.payload.update);
        },
        addUserTrees: userTreesAdapter.addMany,
        importUserTrees: (state, action: PayloadAction<{ trees: TreeData[]; nodes: NormalizedNode[] }>) => {
            userTreesAdapter.addMany(state, action.payload.trees);
        },
        updateUserTrees: userTreesAdapter.updateMany,
        removeUserTrees: (state, action: PayloadAction<{ treeIds: string[]; nodes: string[] }>) => {
            userTreesAdapter.removeMany(state, action.payload.treeIds);
        },
        overwriteUserTreesSlice: (state, action: PayloadAction<UserTreeSlice>) => {
            state.entities = action.payload.entities;
            state.ids = action.payload.ids;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(removeNodes, (state, action) => {
            const treeWhereNodesRemoved = state.entities[action.payload.treeId];

            if (!treeWhereNodesRemoved) throw new Error("treeWhereNodesRemoved undefined removeNodes at builder.add");

            const nodesNotRemoved: string[] = treeWhereNodesRemoved.nodes.filter((nodeId) => {
                return !action.payload.nodesToDelete.includes(nodeId);
            });

            userTreesAdapter.updateOne(state, { id: action.payload.treeId, changes: { nodes: nodesNotRemoved } });
        });
        builder.addCase(addNodes, (state, action) => {
            const nodesToAdd = action.payload as readonly NormalizedNode[];

            const newNodeIdPerTree: Dictionary<string[]> = {};

            for (let i = 0; i < nodesToAdd.length; i++) {
                const nodeToAdd = nodesToAdd[i];

                if (newNodeIdPerTree[nodeToAdd.treeId] === undefined) {
                    newNodeIdPerTree[nodeToAdd.treeId] = [nodeToAdd.nodeId];
                    continue;
                }

                newNodeIdPerTree[nodeToAdd.treeId]!.push(nodeToAdd.nodeId);
            }

            const treesIdToUpdate = Object.keys(newNodeIdPerTree);

            const treeUpdates: Update<TreeData>[] = treesIdToUpdate.map((id) => {
                if (!state.entities[id]) throw new Error("entity undefined at addNodes extra reducer");

                return { id, changes: { nodes: [...state.entities[id]!.nodes, ...newNodeIdPerTree[id]!] } };
            });

            userTreesAdapter.updateMany(state, treeUpdates);
        });
    },
});

export const { addUserTrees, removeUserTrees, importUserTrees, updateUserTree, updateUserTrees, overwriteUserTreesSlice } = userTreesSlice.actions;

export default userTreesSlice.reducer;

export const selectTreeById =
    (treeId: string) =>
    (state: RootState): TreeData | Omit<TreeData, "nodes"> => {
        if (treeId === HOMEPAGE_TREE_ID) return state.homeTree;

        const userTree = state.userTrees.entities[treeId];

        if (!userTree) throw new Error("userTree undefined at selectTreeById");

        return userTree;
    };

export const {
    selectAll: selectAllTrees,
    selectEntities: selectAllTreesEntities,
    selectTotal: selectTotalTreeQty,
    selectIds: selectTreeIds,
} = userTreesAdapter.getSelectors<RootState>((state) => state.userTrees);
