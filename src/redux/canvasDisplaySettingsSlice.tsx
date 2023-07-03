import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WHITE_GRADIENT } from "../parameters";
import { ColorGradient } from "../types";
import type { RootState } from "./reduxStore";

// Define a type for the slice state
export type CanvasDisplaySettings = {
    showLabel: boolean;
    oneColorPerTree: boolean;
    showCircleGuide: boolean;
    showIcons: boolean;
    homepageTreeColor: ColorGradient;
    homepageTreeName: string;
    homepageTreeIcon: string;
};

// Define the initial state using that type
export const defaultCanvasDisplaySettings: CanvasDisplaySettings = {
    showLabel: true,
    oneColorPerTree: false,
    showCircleGuide: false,
    showIcons: true,
    homepageTreeColor: WHITE_GRADIENT,
    homepageTreeIcon: "L",
    homepageTreeName: "Life Skills",
};

export const canvasDisplaySettingsSlice = createSlice({
    name: "canvasDisplaySettings",
    initialState: defaultCanvasDisplaySettings,
    reducers: {
        setShowLabel: (state, action: PayloadAction<boolean>) => {
            state.showLabel = action.payload;
        },
        setHomepageTreeName: (state, action: PayloadAction<string>) => {
            state.homepageTreeName = action.payload;
        },
        setShowCircleGuide: (state, action: PayloadAction<boolean>) => {
            state.showCircleGuide = action.payload;
        },
        setShowIcons: (state, action: PayloadAction<boolean>) => {
            state.showIcons = action.payload;
        },
        setHomepageTreeColor: (state, action: PayloadAction<ColorGradient>) => {
            state.homepageTreeColor = action.payload;
        },
        setHomepageTreeIcon: (state, action: PayloadAction<string>) => {
            state.homepageTreeIcon = action.payload;
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

export const {
    setHomepageTreeColor,
    setOneColorPerTree,
    setShowCircleGuide,
    setHomepageTreeIcon,
    setShowLabel,
    populateCanvasDisplaySettings,
    setShowIcons,
    setHomepageTreeName,
} = canvasDisplaySettingsSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectCanvasDisplaySettings = (state: RootState) => state.canvasDisplaySettings;

export default canvasDisplaySettingsSlice.reducer;
