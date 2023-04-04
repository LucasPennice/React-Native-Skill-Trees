import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Skill } from "../types";
import type { RootState } from "./reduxStore";

// Define the initial state using that type
const initialState: Skill = {
    id: "",
    name: "",
    isCompleted: false,
};

export const newNodeSlice = createSlice({
    name: "newNodeSlice",
    initialState,
    reducers: {
        clearNewNodeState: (state) => {
            state.id = initialState.id;
            state.isCompleted = initialState.isCompleted;
            state.name = initialState.name;
        },
        setNewNode: (state, action: PayloadAction<Skill>) => {
            state.id = action.payload.id;
            state.isCompleted = action.payload.isCompleted;
            state.name = action.payload.name;
        },
    },
});

export const { clearNewNodeState, setNewNode } = newNodeSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectNewNode = (state: RootState) => state.newNode;

export default newNodeSlice.reducer;
