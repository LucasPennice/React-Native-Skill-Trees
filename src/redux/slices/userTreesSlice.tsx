import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Skill, Tree } from "../../types";
import { RootState } from "../reduxStore";
import { ScreenDimentions } from "./screenDimentionsSlice";

// Define a type for the slice state
type UserTreesSlice = {
    userTrees: Tree<Skill>[];
    currentTreeId: string | undefined;
};

// Define the initial state using that type
const initialState: UserTreesSlice = {
    userTrees: [],
    currentTreeId: undefined,
};

export type ModifiableNodeProperties = { name?: string; isCompleted?: boolean };

export const userTreesSlice = createSlice({
    name: "currentTree",
    initialState,
    reducers: {
        changeTree: (state, action: PayloadAction<string>) => {
            state.currentTreeId = action.payload;
        },
        unselectTree: (state) => {
            state.currentTreeId = undefined;
        },

        updateUserTrees: (
            state,
            action: PayloadAction<{
                updatedTree: Tree<Skill> | undefined;
                screenDimensions: ScreenDimentions;
            }>
        ) => {
            //We pass the new value of the mutated tree
            //And then update the value of userTrees with the new state
            const { updatedTree } = action.payload;

            if (updatedTree === undefined) throw new Error("updateUserTrees error tree is undefined");

            state.userTrees = state.userTrees.map((tree) => {
                if (tree.treeId === updatedTree.treeId) return updatedTree;

                return tree;
            });
        },
        saveNewTree: (
            state,
            action: PayloadAction<{
                newTree: Tree<Skill>;
                screenDimensions: ScreenDimentions;
            }>
        ) => {
            const { newTree } = action.payload;

            state.userTrees = [...state.userTrees, newTree];
        },
        removeUserTree: (state, action: PayloadAction<string>) => {
            const treeToDeleteId = action.payload;

            state.userTrees = state.userTrees.filter((t) => t.treeId !== treeToDeleteId);
        },

        updateUserTreeWithAppendedNode: (state, action: PayloadAction<Tree<Skill>>) => {
            state.userTrees = state.userTrees.map((tree) => {
                if (tree.treeId === action.payload.treeId) return action.payload;

                return tree;
            });
        },
    },
});

export const { changeTree, unselectTree, updateUserTrees, saveNewTree, removeUserTree, updateUserTreeWithAppendedNode } = userTreesSlice.actions;

export const selectTreeSlice = (state: RootState) => state.currentTree;
export const selectUserTrees = (state: RootState) => state.currentTree.userTrees;

export default userTreesSlice.reducer;
