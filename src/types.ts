import { StyleProp, ViewStyle } from "react-native/types";

export type Skill = {
    name: string;
    isCompleted?: boolean;
};

export type SelectedNode = string | null;

export interface Tree<T> {
    isRoot: boolean;
    parentId: string | undefined;
    treeId: string;
    nodeId: string;
    treeName: string;
    accentColor: string;
    x: number;
    y: number;
    level: number;
    data: T;
    children: Tree<T>[];
}

export type ModifiableProperties<T> = {
    [Property in keyof T]: T[Property];
};

export type DnDZone = {
    type: "PARENT" | "ONLY_CHILDREN" | "LEFT_BROTHER" | "RIGHT_BROTHER";
    ofNode: string;
    x: number;
    y: number;
    width: number;
    height: number;
};

export type CirclePositionInCanvas = { x: number; y: number; id: string };
export type NodeCoordinate = { x: number; y: number; id: string; level: number; parentId: string | null };

export type CanvasDimensions = {
    canvasWidth: number;
    canvasHeight: number;
};
