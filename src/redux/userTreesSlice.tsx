import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { insertNodeBasedOnDnDZone } from "../functions/mutateTree";
import { DnDZone, Skill, Tree } from "../types";
import type { RootState } from "./reduxStore";
import { treeCompletedSkillPercentage } from "../functions/extractInformationFromTree";

// Define a type for the slice state
type UserTreesSlice = {
    userTrees: Tree<Skill>[];
    currentTreeId: string | undefined;
    selectedNode: string | null;
    selectedDndZone: DnDZone | undefined;
    newNode: Tree<Skill> | undefined;
};

// Define the initial state using that type
const initialState: UserTreesSlice = {
    userTrees: [],
    currentTreeId: undefined,
    selectedNode: null,
    selectedDndZone: undefined,
    newNode: undefined,
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

        populateUserTrees: (state, action: PayloadAction<Tree<Skill>[]>) => {
            state.userTrees = action.payload;
        },
        updateUserTrees: (state, action: PayloadAction<Tree<Skill> | undefined>) => {
            //We pass the new value of the mutated tree
            //And then update the value of userTrees with the new state
            const valueToMutate = action.payload;

            if (valueToMutate === undefined) throw new Error("updateUserTrees error tree is undefined");

            state.userTrees = state.userTrees.map((tree) => {
                if (tree.treeId === valueToMutate.treeId) return valueToMutate;

                return tree;
            });
        },
        appendToUserTree: (state, action: PayloadAction<Tree<Skill>>) => {
            state.userTrees = [...state.userTrees, action.payload];
        },
        removeUserTree: (state, action: PayloadAction<string>) => {
            const treeToDeleteId = action.payload;

            state.userTrees = state.userTrees.filter((t) => t.treeId !== treeToDeleteId);
        },
        setSelectedNode: (state, action: PayloadAction<string | null>) => {
            state.selectedNode = action.payload;
        },
        setSelectedDndZone: (state, action: PayloadAction<DnDZone | undefined>) => {
            state.selectedDndZone = action.payload;
        },
        clearNewNodeState: (state) => {
            state.newNode = undefined;
        },
        setNewNode: (state, action: PayloadAction<Tree<Skill>>) => {
            state.newNode = { ...action.payload };
        },
        updateUserTreeWithAppendedNode: (state, action: PayloadAction<Tree<Skill> | undefined>) => {
            state.selectedDndZone = undefined;
            state.newNode = undefined;

            const valueToMutate = action.payload;

            if (valueToMutate === undefined) throw new Error("updateUserTreeWithAppendedNode error tree is undefined");

            state.userTrees = state.userTrees.map((tree) => {
                if (tree.treeId === valueToMutate.treeId) return valueToMutate;

                return tree;
            });
        },
    },
});

export const {
    changeTree,
    unselectTree,
    updateUserTrees,
    populateUserTrees,
    appendToUserTree,
    removeUserTree,
    setSelectedNode,
    updateUserTreeWithAppendedNode,
    setSelectedDndZone,
    clearNewNodeState,
    setNewNode,
} = userTreesSlice.actions;

export const selectTreeSlice = (state: RootState) => state.currentTree;

export default userTreesSlice.reducer;
