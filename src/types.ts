export type Skill = {
    name: string;
    isCompleted?: boolean;
};

export type CartesianCoordinate = { x: number; y: number };

export type ParentId = string | null;

export interface Tree<T> {
    isRoot: boolean;
    parentId: ParentId;
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

export type CirclePositionInCanvas = CartesianCoordinate & { id: string };
export type Coordinates = CartesianCoordinate & { id: string; level: number; parentId: ParentId; name: string };

export type NodeCoordinate = CartesianCoordinate & { id: string; level: number; parentId: ParentId };

export type ModifiableProperties<T> = {
    [Property in keyof T]: T[Property];
};

export type HierarchicalContour = { leftNode: { coord: number; id: string }; rightNode: { coord: number; id: string } };

export type DnDZone = {
    type: "PARENT" | "ONLY_CHILDREN" | "LEFT_BROTHER" | "RIGHT_BROTHER";
    ofNode: string;
    x: number;
    y: number;
    width: number;
    height: number;
};

export type CanvasDimensions = {
    canvasWidth: number;
    canvasHeight: number;
};

export type PolarCoordinate = { angleInRadians: number; distanceToCenter: number };

export type PolarContour = { leftNode: PolarCoordinate & { id: string }; rightNode: PolarCoordinate & { id: string } };

export type PolarOverlapCheck = undefined | { biggestOverlapAngle: number; nodesInConflict: [string, string] };

export type RadialDistanceTable = { [key: string]: { current: number; original: number } };
