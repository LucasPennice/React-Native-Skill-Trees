import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./reduxStore";

// Define a type for the slice state
type CanvasDisplaySettings = {
    showLabel: boolean;
    oneColorPerTree: boolean;
    showCircleGuide: boolean;
    homepageTreeColor: string;
};

// Define the initial state using that type
const initialState: CanvasDisplaySettings = {
    showLabel: false,
    oneColorPerTree: false,
    showCircleGuide: false,
    homepageTreeColor: "#FFFFFF",
};

export const canvasDisplaySettingsSlice = createSlice({
    name: "canvasDisplaySettings",
    initialState,
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
        populateCanvasSettings: (state, action: PayloadAction<CanvasDisplaySettings>) => {
            state = action.payload;
        },
    },
});

export const { setHomepageTreeColor, setOneColorPerTree, setShowCircleGuide, setShowLabel, populateCanvasSettings } =
    canvasDisplaySettingsSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectCanvasDisplaySettings = (state: RootState) => state.canvasDisplaySettings;

export default canvasDisplaySettingsSlice.reducer;
