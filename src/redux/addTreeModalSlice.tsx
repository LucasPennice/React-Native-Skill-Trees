import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Skill } from "../types";
import type { RootState } from "./reduxStore";

// Define the initial state using that type
const initialState = {
    open: false,
};

export const addTreeModalSlice = createSlice({
    name: "addTreeModalSlice",
    initialState,
    reducers: {
        open: (state) => {
            state.open = true;
        },
        close: (state) => {
            state.open = false;
        },
    },
});

export const { close, open } = addTreeModalSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectAddTree = (state: RootState) => state.addTree;

export default addTreeModalSlice.reducer;
