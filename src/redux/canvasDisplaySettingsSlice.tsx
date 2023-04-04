import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./reduxStore";
import { Skill, Tree } from "../types";

// Define a type for the slice state
type CanvasDisplaySettings = {
    showLabel: boolean;
    openMenu: "treeSelector" | "treeSettings" | "childrenHoistSelector" | "newNode" | null;
    candidatesToHoist: Tree<Skill>[] | null;
    showDragAndDropGuides: boolean;
};

// Define the initial state using that type
const initialState: CanvasDisplaySettings = {
    showLabel: false,
    showDragAndDropGuides: false,
    openMenu: null,
    candidatesToHoist: null,
};

export const canvasDisplaySettingsSlice = createSlice({
    name: "canvasDisplaySettings",
    initialState,
    reducers: {
        toggleShowLabel: (state) => {
            state.showLabel = !state.showLabel;
        },
        toggleShowDnDGuides: (state) => {
            state.showDragAndDropGuides = !state.showDragAndDropGuides;
        },
        toggleSettingsMenuOpen: (state) => {
            if (state.openMenu === "treeSettings") {
                state.openMenu = null;
            } else {
                state.openMenu = "treeSettings";
            }
        },
        toggleTreeSelector: (state) => {
            if (state.openMenu === "treeSelector") {
                state.openMenu = null;
            } else {
                state.openMenu = "treeSelector";
            }
        },
        closeChildrenHoistSelector: (state) => {
            state.openMenu = null;
            state.candidatesToHoist = null;
        },
        openChildrenHoistSelector: (state, action: PayloadAction<Tree<Skill>[]>) => {
            state.openMenu = "childrenHoistSelector";
            state.candidatesToHoist = action.payload;
        },
        toggleNewNode: (state) => {
            if (state.openMenu === "newNode") {
                state.openMenu = null;
            } else {
                state.openMenu = "newNode";
            }
        },
        closeAllMenues: (state) => {
            state.openMenu = null;
        },
        hideLabel: (state) => {
            state.showLabel = false;
        },
    },
});

export const {
    toggleShowLabel,
    toggleSettingsMenuOpen,
    toggleTreeSelector,
    closeAllMenues,
    hideLabel,
    closeChildrenHoistSelector,
    openChildrenHoistSelector,
    toggleNewNode,
    toggleShowDnDGuides,
} = canvasDisplaySettingsSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectCanvasDisplaySettings = (state: RootState) => state.canvasDisplaySettings;

export default canvasDisplaySettingsSlice.reducer;
