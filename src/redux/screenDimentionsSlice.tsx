import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./reduxStore";

// Define a type for the slice state
export type ScreenDimentions = {
    width: number;
    height: number;
};

// Define the initial state using that type
const initialState: ScreenDimentions = {
    width: 0,
    height: 0,
};

export const screenDimentionsSlice = createSlice({
    name: "screenDimentions",
    initialState,
    reducers: {
        updateDimentions: (state, action: PayloadAction<ScreenDimentions>) => {
            state.height = action.payload.height;
            state.width = action.payload.width;
        },
    },
});

export const { updateDimentions } = screenDimentionsSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectScreenDimentions = (state: RootState) => state.screenDimentions;

export default screenDimentionsSlice.reducer;
