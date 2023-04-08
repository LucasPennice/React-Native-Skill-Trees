import { createSlice, current, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./reduxStore";
import {
    deleteNodeWithNoChildren as deleteNodeWithNoChildrenFn,
    deleteNodeWithChildren as deleteNodeWithChildrenFn,
    editTreeProperties as editTreePropertiesFn,
} from "../pages/homepage/treeFunctions";
import { ModifiableProperties, Skill, Tree } from "../types";

// Define a type for the slice state
type CurrentTreeSlice = {
    userTrees: Tree<Skill>[];
    currentTreeId: string | undefined;
};

// Define the initial state using that type
const initialState: CurrentTreeSlice = {
    userTrees: [],
    currentTreeId: undefined,
};

export type ModifiableNodeProperties = { name?: string; isCompleted?: boolean };

const getCurrentTree = (state: CurrentTreeSlice) => {
    const { currentTreeId, userTrees } = state;

    if (currentTreeId === undefined) return undefined;

    const tentativeCurrentTree = userTrees.find((t) => t.treeId === currentTreeId);

    if (tentativeCurrentTree !== undefined) return tentativeCurrentTree;

    return undefined;
};

export const currentTreeSlice = createSlice({
    name: "currentTree",
    initialState,
    reducers: {
        changeTree: (state, action: PayloadAction<string>) => {
            state.currentTreeId = action.payload;
        },
        unselectTree: (state) => {
            state.currentTreeId = undefined;
        },
        editNodeProperty: (state, action: PayloadAction<{ targetNode: Tree<Skill>; newProperties: Tree<Skill> }>) => {
            const currentTree = getCurrentTree(state);

            const result = editTreePropertiesFn(currentTree, action.payload.targetNode, action.payload.newProperties);

            if (result === undefined) throw "editNodeProperty error fn returned undefined";

            state.userTrees = state.userTrees.map((tree, idx) => {
                if (tree.treeId === result.treeId) return result;

                return tree;
            });
        },
        deleteNodeWithNoChildren: (state, action: PayloadAction<Tree<Skill>>) => {
            const currentTree = getCurrentTree(state);

            const result = deleteNodeWithNoChildrenFn(currentTree, action.payload);

            if (result === undefined) throw "deleteNodeWithNoChildrenFn error fn returned undefined";

            state.userTrees = state.userTrees.map((tree, idx) => {
                if (tree.treeId === result.treeId) return result;

                return tree;
            });
        },
        deleteNodeWithChildren: (state, action: PayloadAction<{ nodeToDelete: Tree<Skill>; childrenToHoist: Tree<Skill> }>) => {
            const currentTree = getCurrentTree(state);

            const result = deleteNodeWithChildrenFn(currentTree, action.payload.nodeToDelete, action.payload.childrenToHoist);

            if (result === undefined) throw "deleteNodeWithNoChildrenFn error fn returned undefined";

            state.userTrees = state.userTrees.map((tree, idx) => {
                if (tree.treeId === result.treeId) return result;

                return tree;
            });
        },
        populateUserTrees: (state, action: PayloadAction<Tree<Skill>[]>) => {
            state.userTrees = action.payload;
        },
        updateUserTrees: (state, action: PayloadAction<Tree<Skill>>) => {
            const treeToUpdate = action.payload;

            state.userTrees = state.userTrees.map((tree) => {
                if (tree.treeId === treeToUpdate.treeId) return treeToUpdate;

                return tree;
            });
        },
    },
});

export const { changeTree, unselectTree, deleteNodeWithNoChildren, deleteNodeWithChildren, editNodeProperty, populateUserTrees, updateUserTrees } =
    currentTreeSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export function selectCurrentTree(state: RootState) {
    const { currentTreeId, userTrees } = state.currentTree;

    if (currentTreeId === undefined) return undefined;

    const tentativeCurrentTree = userTrees.find((t) => t.treeId === currentTreeId);

    if (tentativeCurrentTree !== undefined) return tentativeCurrentTree;

    return undefined;
}

export const selectTreeSlice = (state: RootState) => state.currentTree;

export default currentTreeSlice.reducer;
