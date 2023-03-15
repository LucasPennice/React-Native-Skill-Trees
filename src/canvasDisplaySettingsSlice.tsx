import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./reduxStore";

// Define a type for the slice state
type CanvasDisplaySettings = {
    showLabel: boolean;
    menuOpen: boolean;
    treeSelectorOpen: boolean;
};

// Define the initial state using that type
const initialState: CanvasDisplaySettings = {
    showLabel: false,
    menuOpen: false,
    treeSelectorOpen: false,
};

export const canvasDisplaySettingsSlice = createSlice({
    name: "canvasDisplaySettings",
    initialState,
    reducers: {
        toggleShowLabel: (state) => {
            state.showLabel = !state.showLabel;
        },
        toggleSettingsMenuOpen: (state) => {
            state.menuOpen = !state.menuOpen;
        },
        toggleTreeSelector: (state) => {
            state.treeSelectorOpen = !state.treeSelectorOpen;
            state.menuOpen = false;
        },
    },
});

export const { toggleShowLabel, toggleSettingsMenuOpen, toggleTreeSelector } = canvasDisplaySettingsSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectCanvasDisplaySettings = (state: RootState) => state.canvasDisplaySettings;

export default canvasDisplaySettingsSlice.reducer;
