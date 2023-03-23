import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./reduxStore";
import { Book, TreeNode } from "./types";

// Define a type for the slice state
type CanvasDisplaySettings = {
    showLabel: boolean;
    openMenu: "treeSelector" | "treeSettings" | "childrenHoistSelector" | null;
    candidatesToHoist: TreeNode<Book>[] | null;
};

// Define the initial state using that type
const initialState: CanvasDisplaySettings = {
    showLabel: false,
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
        toggleChildrenHoistSelector: (state, action?: PayloadAction<TreeNode<Book>[]>) => {
            if (state.openMenu === "childrenHoistSelector") {
                state.openMenu = null;
                state.candidatesToHoist = null;
            } else {
                state.openMenu = "childrenHoistSelector";
                state.candidatesToHoist = action.payload;
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

export const { toggleShowLabel, toggleSettingsMenuOpen, toggleTreeSelector, closeAllMenues, hideLabel, toggleChildrenHoistSelector } =
    canvasDisplaySettingsSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectCanvasDisplaySettings = (state: RootState) => state.canvasDisplaySettings;

export default canvasDisplaySettingsSlice.reducer;
