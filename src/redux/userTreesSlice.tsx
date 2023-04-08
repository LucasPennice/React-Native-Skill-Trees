import { createSlice, current, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./reduxStore";
import { Skill, Tree } from "../types";

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

        populateUserTrees: (state, action: PayloadAction<Tree<Skill>[]>) => {
            state.userTrees = action.payload;
        },
        mutateUserTree: (state, action: PayloadAction<Tree<Skill> | undefined>) => {
            //We pass the new value of the mutated tree
            //And then update the value of userTrees with the new state
            const valueToMutate = action.payload;

            if (valueToMutate === undefined) throw "deleteNodeWithNoChildrenFn error fn returned undefined";

            state.userTrees = state.userTrees.map((tree) => {
                if (tree.treeId === valueToMutate.treeId) return valueToMutate;

                return tree;
            });
        },
        // updateUserTrees: (state, action: PayloadAction<Tree<Skill>>) => {
        //     const treeToUpdate = action.payload;

        //     state.userTrees = state.userTrees.map((tree) => {
        //         if (tree.treeId === treeToUpdate.treeId) return treeToUpdate;

        //         return tree;
        //     });
        // },
    },
});

export const { changeTree, unselectTree, mutateUserTree, populateUserTrees } = userTreesSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export function selectCurrentTree(state: RootState) {
    const { currentTreeId, userTrees } = state.currentTree;

    if (currentTreeId === undefined) return undefined;

    const tentativeCurrentTree = userTrees.find((t) => t.treeId === currentTreeId);

    if (tentativeCurrentTree !== undefined) return tentativeCurrentTree;

    return undefined;
}

export const selectTreeSlice = (state: RootState) => state.currentTree;

export default userTreesSlice.reducer;
