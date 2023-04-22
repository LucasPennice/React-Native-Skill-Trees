import { createSlice, current, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./reduxStore";
import { DnDZone, Skill, Tree } from "../types";
import { insertNodeBasedOnDnDZone } from "../functions/mutateTree";

// Define a type for the slice state
type UserTreesSlice = {
    userTrees: Tree<Skill>[];
    currentTreeId: string | undefined;
    selectedNode: string | null;
    selectedDndZone: DnDZone | undefined;
    newNode: Skill | undefined;
};

// Define the initial state using that type
const initialState: UserTreesSlice = {
    userTrees: [],
    currentTreeId: undefined,
    selectedNode: null,
    selectedDndZone: undefined,
    newNode: undefined,
};

export type ModifiableNodeProperties = { name?: string; isCompleted?: boolean };

export const userTreesSlice = createSlice({
    name: "currentTree",
    initialState,
    reducers: {
        changeTree: (state, action: PayloadAction<string>) => {
            state.currentTreeId = action.payload;
        },
        unselectTree: (state) => {
            state.currentTreeId = undefined;
        },

        populateUserTrees: (state, action: PayloadAction<Tree<Skill>[]>) => {
            state.userTrees = action.payload;
        },
        mutateUserTree: (state, action: PayloadAction<Tree<Skill> | undefined>) => {
            //We pass the new value of the mutated tree
            //And then update the value of userTrees with the new state
            const valueToMutate = action.payload;

            if (valueToMutate === undefined) throw "deleteNodeWithNoChildrenFn error fn returned undefined";

            state.userTrees = state.userTrees.map((tree) => {
                if (tree.treeId === valueToMutate.treeId) return valueToMutate;

                return tree;
            });
        },
        appendToUserTree: (state, action: PayloadAction<Tree<Skill>>) => {
            state.userTrees = [...state.userTrees, action.payload];
        },
        removeUserTree: (state, action: PayloadAction<string>) => {
            const treeToDeleteId = action.payload;

            state.userTrees = state.userTrees.filter((t) => t.treeId !== treeToDeleteId);
        },
        setSelectedNode: (state, action: PayloadAction<string | null>) => {
            state.selectedNode = action.payload;
        },
        setSelectedDndZone: (state, action: PayloadAction<DnDZone | undefined>) => {
            state.selectedDndZone = action.payload;
        },
        clearNewNodeState: (state) => {
            state.newNode = undefined;
        },
        setNewNode: (state, action: PayloadAction<Skill>) => {
            state.newNode = { ...action.payload };
        },
    },
});

export const {
    changeTree,
    unselectTree,
    mutateUserTree,
    populateUserTrees,
    appendToUserTree,
    removeUserTree,
    setSelectedNode,
    setSelectedDndZone,
    clearNewNodeState,
    setNewNode,
} = userTreesSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export function selectCurrentTree(state: RootState) {
    const { currentTreeId, userTrees } = state.currentTree;

    if (currentTreeId === undefined) return undefined;

    const tentativeCurrentTree = userTrees.find((t) => t.treeId === currentTreeId);

    if (tentativeCurrentTree !== undefined) return tentativeCurrentTree;

    return undefined;
}

export const selectTentativeTree = (state: RootState) => {
    const { selectedDndZone, newNode } = state.currentTree;
    const currentTree = selectCurrentTree(state);

    const tentativeNewTree = selectedDndZone && currentTree && newNode ? insertNodeBasedOnDnDZone(selectedDndZone, currentTree, newNode) : undefined;

    return tentativeNewTree;
};

export const selectTreeSlice = (state: RootState) => state.currentTree;

export default userTreesSlice.reducer;
