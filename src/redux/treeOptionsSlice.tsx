import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Skill, Tree } from "../types";
import type { RootState } from "./reduxStore";

type State = {
    tree: undefined | Tree<Skill>;
};

// Define the initial state using that type
const initialState: State = {
    tree: undefined,
};

export const treeOptionsSlice = createSlice({
    name: "treeOptionsSlice",
    initialState,
    reducers: {
        setTree: (state, action: PayloadAction<Tree<Skill> | undefined>) => {
            state.tree = action.payload;
        },
    },
});

export const { setTree } = treeOptionsSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectTreeOptions = (state: RootState) => state.treeOptions;

export default treeOptionsSlice.reducer;
