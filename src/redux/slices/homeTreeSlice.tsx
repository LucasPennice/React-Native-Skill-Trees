import { ColorGradient } from "@/types";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { HOMEPAGE_TREE_ID, HOMETREE_ROOT_ID, PURPLE_GRADIENT } from "../../parameters";
import { RootState } from "../reduxStore";
import { TreeData } from "./userTreesSlice";

export const homeTreeSliceInitialState: Omit<TreeData, "nodes"> = {
    accentColor: PURPLE_GRADIENT,
    icon: { text: "L", isEmoji: false },
    rootNodeId: HOMETREE_ROOT_ID,
    treeId: HOMEPAGE_TREE_ID,
    treeName: "Life Skills",
    showOnHomeScreen: true,
};

export type HomeTreeSlice = typeof homeTreeSliceInitialState;

export const homeTreeSlice = createSlice({
    name: "homeTreeSlice",
    initialState: homeTreeSliceInitialState,
    reducers: {
        updateHomeAccentColor: (state, action: PayloadAction<ColorGradient>) => {
            state.accentColor = action.payload;
        },
        updateHomeIcon: (state, action: PayloadAction<TreeData["icon"]>) => {
            state.icon = action.payload;
        },
        updateHomeName: (state, action: PayloadAction<string>) => {
            state.treeName = action.payload;
        },
    },
});

export const { updateHomeAccentColor, updateHomeIcon, updateHomeName } = homeTreeSlice.actions;

export default homeTreeSlice.reducer;

export const selectHomeTree = (state: RootState) => state.homeTree;
