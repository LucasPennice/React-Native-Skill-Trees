import { createSlice, current, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./reduxStore";
import { deleteNodeWithNoChildren as deleteNodeWithNoChildrenFn } from "./treeFunctions";
import { Book, TreeNode } from "./types";

// Define a type for the slice state
type CurrentTreeSlice = {
    value: TreeNode<Book> | undefined;
};

// Define the initial state using that type
const initialState: CurrentTreeSlice = {
    value: undefined,
};

export const currentTreeSlice = createSlice({
    name: "currentTree",
    initialState,
    reducers: {
        changeTree: (state, action: PayloadAction<TreeNode<Book>>) => {
            state.value = action.payload;
        },
        unselectTree: (state) => {
            state.value = undefined;
        },
        markNodeAsComplete: (state, action: PayloadAction<TreeNode<Book>["node"]["id"]>) => {},
        deleteNodeWithNoChildren: (state, action: PayloadAction<TreeNode<Book>>) => {
            state.value = deleteNodeWithNoChildrenFn(state.value, action.payload);
        },
    },
});

export const { changeTree, unselectTree, deleteNodeWithNoChildren } = currentTreeSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectCurrentTree = (state: RootState) => state.currentTree;

export default currentTreeSlice.reducer;
