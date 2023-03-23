import { createSlice, current, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./reduxStore";
import {
    deleteNodeWithNoChildren as deleteNodeWithNoChildrenFn,
    deleteNodeWithChildren as deleteNodeWithChildrenFn,
    editNodeProperty as editNodePropertyFn,
} from "./treeFunctions";
import { Book, Tree } from "./types";

// Define a type for the slice state
type CurrentTreeSlice = {
    value: Tree<Book> | undefined;
};

// Define the initial state using that type
const initialState: CurrentTreeSlice = {
    value: undefined,
};

export type ModifiableNodeProperties = { name?: string; isCompleted?: boolean };

export const currentTreeSlice = createSlice({
    name: "currentTree",
    initialState,
    reducers: {
        changeTree: (state, action: PayloadAction<Tree<Book>>) => {
            state.value = action.payload;
        },
        unselectTree: (state) => {
            state.value = undefined;
        },
        editNodeProperty: (state, action: PayloadAction<{ targetNode: Tree<Book>; newProperties: ModifiableNodeProperties }>) => {
            state.value = editNodePropertyFn(state.value, action.payload.targetNode, action.payload.newProperties);
        },
        deleteNodeWithNoChildren: (state, action: PayloadAction<Tree<Book>>) => {
            state.value = deleteNodeWithNoChildrenFn(state.value, action.payload);
        },
        deleteNodeWithChildren: (state, action: PayloadAction<{ nodeToDelete: Tree<Book>; childrenToHoist: Tree<Book> }>) => {
            state.value = deleteNodeWithChildrenFn(state.value, action.payload.nodeToDelete, action.payload.childrenToHoist);
        },
    },
});

export const { changeTree, unselectTree, deleteNodeWithNoChildren, deleteNodeWithChildren, editNodeProperty } = currentTreeSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectCurrentTree = (state: RootState) => state.currentTree;

export default currentTreeSlice.reducer;
