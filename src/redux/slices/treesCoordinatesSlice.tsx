import { AnyAction, PayloadAction, createSlice } from "@reduxjs/toolkit";
import { handleTreeBuild } from "../../functions/coordinateSystem";
import { CanvasDimensions, CoordinatesWithTreeData, DnDZone, Skill, Tree } from "../../types";
import type { RootState } from "../reduxStore";
import { updateUserTrees } from "./userTreesSlice";
import { ScreenDimentions } from "./screenDimentionsSlice";
import { CanvasDisplaySettings } from "./canvasDisplaySettingsSlice";
import { buildHomepageTree } from "../../functions/treeToRadialCoordinates/general";

const DEFAULT_HOME_TREE: TreeCoordinateData = {
    addNodePositions: [],
    nodeCoordinates: [],
    canvasDimensions: {
        canvasHeight: 0,
        canvasWidth: 0,
        extendedForDepthGuides: false,
        heightData: { maxCoordinate: 0, minCoordinate: 0, treeHeight: 0 },
        widthData: { maxCoordinate: 0, minCoordinate: 0, treeWidth: 0 },
    },
};

export type TreeCoordinateData = {
    nodeCoordinates: CoordinatesWithTreeData[];
    addNodePositions: DnDZone[];
    canvasDimensions: CanvasDimensions;
};

// Define a type for the slice state
export type TreeCoordinates = {
    homeTree: TreeCoordinateData;
    trees: { [key: string]: TreeCoordinateData };
};

// Define the initial state using that type
const initialState: TreeCoordinates = {
    homeTree: DEFAULT_HOME_TREE,
    trees: {},
};

export const treeCoordinatesSlice = createSlice({
    name: "treeCoordinates",
    initialState,
    reducers: {
        calculateHierarchicalTreeCoordinatesInitially: (
            state,
            action: PayloadAction<{ treeToCheck: Tree<Skill> | undefined; screenDimensions: ScreenDimentions }>
        ) => {
            const { screenDimensions, treeToCheck } = action.payload;

            if (treeToCheck === undefined) return;

            const treeId = treeToCheck.treeId;

            if (state.trees[treeId]) return;

            const {
                dndZoneCoordinates,
                canvasDimentions: canvasDimensions,
                centeredCoordinatedWithTreeData,
            } = handleTreeBuild(treeToCheck, screenDimensions, "hierarchy");

            state.trees = {
                ...state.trees,
                [treeId]: { addNodePositions: dndZoneCoordinates, canvasDimensions, nodeCoordinates: centeredCoordinatedWithTreeData },
            };
        },
        calculateHomeTreeCoordinatesInitially: (
            state,
            action: PayloadAction<{ userTrees: Tree<Skill>[]; canvasDisplaySettings: CanvasDisplaySettings; screenDimensions: ScreenDimentions }>
        ) => {
            const homeTreeCalculated = state.homeTree.nodeCoordinates.length > 0;

            if (homeTreeCalculated) return;

            const { canvasDisplaySettings, screenDimensions, userTrees } = action.payload;

            const homeTree = buildHomepageTree(userTrees, canvasDisplaySettings);

            const {
                dndZoneCoordinates,
                canvasDimentions: canvasDimensions,
                centeredCoordinatedWithTreeData,
            } = handleTreeBuild(homeTree, screenDimensions, "radial");

            state.homeTree = { addNodePositions: dndZoneCoordinates, canvasDimensions, nodeCoordinates: centeredCoordinatedWithTreeData };
        },
        // clearHomeTreeState: (state) => {
        //     state.homeTree = DEFAULT_HOME_TREE;
        // },
    },
    extraReducers: (builder) => {
        builder.addCase(updateUserTrees, (state, action) => {
            const { screenDimensions, updatedTree } = action.payload;

            if (!updatedTree) return;

            const {
                dndZoneCoordinates,
                canvasDimentions: canvasDimensions,
                centeredCoordinatedWithTreeData,
            } = handleTreeBuild(updatedTree, screenDimensions, "hierarchy");

            state.trees = {
                ...state.trees,
                [updatedTree.treeId]: { addNodePositions: dndZoneCoordinates, canvasDimensions, nodeCoordinates: centeredCoordinatedWithTreeData },
            };
        });
        builder.addMatcher(
            (action: AnyAction) => {
                const isCanvasDisplaySettingsAction = action.type.includes("canvasDisplaySettings");

                return isCanvasDisplaySettingsAction;
            },
            (state, action) => {
                // console.log("Hay que actualizar el home tree");
            }
        );
    },
});

export const { calculateHierarchicalTreeCoordinatesInitially, calculateHomeTreeCoordinatesInitially } = treeCoordinatesSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectHomeTreeCoordinates = (state: RootState) => state.treeCoordinates.homeTree;
export const selectTreesCoordinates = (state: RootState) => state.treeCoordinates.trees;

export default treeCoordinatesSlice.reducer;
