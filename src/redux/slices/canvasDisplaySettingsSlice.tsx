import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./../reduxStore";

// Define a type for the slice state
export type CanvasDisplaySettings = {
    showLabel: boolean;
    oneColorPerTree: boolean;
    showCircleGuide: boolean;
    showIcons: boolean;
};

// Define the initial state using that type
export const defaultCanvasDisplaySettings: CanvasDisplaySettings = {
    showLabel: true,
    oneColorPerTree: false,
    showCircleGuide: false,
    showIcons: true,
};

export const canvasDisplaySettingsSlice = createSlice({
    name: "canvasDisplaySettings",
    initialState: defaultCanvasDisplaySettings,
    reducers: {
        setShowLabel: (state, action: PayloadAction<boolean>) => {
            state.showLabel = action.payload;
        },

        setShowCircleGuide: (state, action: PayloadAction<boolean>) => {
            state.showCircleGuide = action.payload;
        },
        setShowIcons: (state, action: PayloadAction<boolean>) => {
            state.showIcons = action.payload;
        },

        setOneColorPerTree: (state, action: PayloadAction<boolean>) => {
            state.oneColorPerTree = action.payload;
        },
    },
});

export const { setOneColorPerTree, setShowCircleGuide, setShowLabel, setShowIcons } = canvasDisplaySettingsSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectCanvasDisplaySettings = (state: RootState) => state.canvasDisplaySettings;

export default canvasDisplaySettingsSlice.reducer;
