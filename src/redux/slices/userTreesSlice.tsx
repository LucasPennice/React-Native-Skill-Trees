import { HOMEPAGE_TREE_ID } from "@/parameters";
import { ColorGradient, SkillIcon } from "@/types";
import { EntityState, PayloadAction, Update, createEntityAdapter, createSlice } from "@reduxjs/toolkit";
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
        addUserTree: userTreesAdapter.addOne,
        updateUserTrees: userTreesAdapter.updateMany,
        removeUserTree: (state, action: PayloadAction<{ treeId: string; nodes: string[] }>) => {
            userTreesAdapter.removeOne(state, action.payload.treeId);
        },
        overwriteUserTreesSlice: (state, action: PayloadAction<UserTreeSlice>) => {
            console.log("usertrees");
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
            const treeOfNewNodes = state.entities[action.payload.treeId];

            if (!treeOfNewNodes) throw new Error("treeOfNewNodes undefined addNodes at builder.add");

            const newNodeIds = action.payload.nodesToAdd.map((n) => n.nodeId);

            userTreesAdapter.updateOne(state, { id: action.payload.treeId, changes: { nodes: [...treeOfNewNodes.nodes, ...newNodeIds] } });
        });
    },
});

export const { addUserTree, removeUserTree, updateUserTree, updateUserTrees, overwriteUserTreesSlice } = userTreesSlice.actions;

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
