import { HOMEPAGE_TREE_ID, HOMETREE_ROOT_ID, WHITE_GRADIENT } from "../../parameters";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../reduxStore";
import { TreeData } from "./userTreesSlice";
import { ColorGradient } from "@/types";

export const homeTreeSliceInitialState: Omit<TreeData, "nodes"> = {
    accentColor: WHITE_GRADIENT,
    icon: { text: "L", isEmoji: false },
    rootNodeId: HOMETREE_ROOT_ID,
    treeId: HOMEPAGE_TREE_ID,
    treeName: "Life Skills",
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
