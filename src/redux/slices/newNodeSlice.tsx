import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DnDZone } from "../../types";
import type { RootState } from "./../reduxStore";

// Define a type for the slice state
type NewNodesSlice = {
    selectedDndZone: DnDZone | undefined;
};

// Define the initial state using that type
const initialState: NewNodesSlice = {
    selectedDndZone: undefined,
};

export const newNodeSlice = createSlice({
    name: "currentTree",
    initialState,
    reducers: {
        setSelectedDndZone: (state, action: PayloadAction<DnDZone>) => {
            state.selectedDndZone = action.payload;
        },
        clearSelectedDndZone: (state) => {
            state.selectedDndZone = undefined;
        },
    },
});

export const { clearSelectedDndZone, setSelectedDndZone } = newNodeSlice.actions;

export const selectNewNodes = (state: RootState) => state.newNodes;

export default newNodeSlice.reducer;
