import { ColorGradient, NormalizedNode } from "@/types";
import { Dictionary, createEntityAdapter, createSlice } from "@reduxjs/toolkit";

type TreeSkere = {
    treeId: string;
    treeName: string;
    accentColor: ColorGradient;
    nodes: { [nodeId: string]: NormalizedNode };
};

const initialState: { allIds: string[]; byId: { [treeId: string]: TreeSkere } } = { allIds: [], byId: {} };

export const slice = createSlice({
    name: "userTreesSlice",
    initialState,
    reducers: {},
});

export const {} = slice.actions;

const S = {
    trees: {
        byId: {
            treeId: "asd",
            color: "asd",
            nodes: ["node1", "node2"],
        },
        allIds: [""],
    },
    nodes: {
        byId: {
            foo: "todas las propiedades del nodo",
        },
        allIds: ["node1", "node2"],
    },
};
