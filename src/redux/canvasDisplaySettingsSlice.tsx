import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./reduxStore";
import { colors } from "../parameters";

// Define a type for the slice state
export type CanvasDisplaySettings = {
    showLabel: boolean;
    oneColorPerTree: boolean;
    showCircleGuide: boolean;
    homepageTreeColor: string;
};

// Define the initial state using that type
export const defaultCanvasDisplaySettings: CanvasDisplaySettings = {
    showLabel: true,
    oneColorPerTree: false,
    showCircleGuide: false,
    homepageTreeColor: colors.accent,
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
        setHomepageTreeColor: (state, action: PayloadAction<string>) => {
            state.homepageTreeColor = action.payload;
        },
        setOneColorPerTree: (state, action: PayloadAction<boolean>) => {
            state.oneColorPerTree = action.payload;
        },
        populateCanvasDisplaySettings: (state, action: PayloadAction<CanvasDisplaySettings>) => {
            state.homepageTreeColor = action.payload.homepageTreeColor;
            state.oneColorPerTree = action.payload.oneColorPerTree;
            state.showCircleGuide = action.payload.showCircleGuide;
            state.showLabel = action.payload.showLabel;
        },
    },
});

export const { setHomepageTreeColor, setOneColorPerTree, setShowCircleGuide, setShowLabel, populateCanvasDisplaySettings } =
    canvasDisplaySettingsSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectCanvasDisplaySettings = (state: RootState) => state.canvasDisplaySettings;

export default canvasDisplaySettingsSlice.reducer;
