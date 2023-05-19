export type Milestone = {
    complete: boolean;
    title: string;
    description: string;
    completedOn: string | undefined;
    id: string;
};

export type SkillResource = {
    title: string;
    url?: string;
    description: string;
    id: string;
};

export type SkillLogs = {
    date: string;
    text: string;
    id: string;
};

export type MotiveToLearn = {
    text: string;
    id: string;
};

export type SkillLevel = {
    ideal: string;
    starting: string;
};

export type Skill = {
    name: string;
    isCompleted?: boolean;
    milestones?: Milestone[];
    skillLevel?: SkillLevel;
    motivesToLearn?: MotiveToLearn[];
    usefulResources?: SkillResource[];
    logs?: SkillLogs[];
};

export const skillStringDetailsKeys: (keyof Skill)[] = ["logs", "motivesToLearn"];

export const getDefaultSkillValue = (name: string, isCompleted: boolean): Skill => {
    return { name, isCompleted };
};

export type CartesianCoordinate = { x: number; y: number };

export type ParentId = string | null;

export type NodeCategory = "SKILL" | "SKILL_TREE" | "USER";

export type Tree<T> = CartesianCoordinate & {
    isRoot: boolean;
    parentId: ParentId;
    treeId: string;
    nodeId: string;
    treeName: string;
    accentColor: string;
    level: number;
    data: T;
    children: Tree<T>[];
    category: NodeCategory;
};

export type CirclePositionInCanvas = CartesianCoordinate & { id: string };
export type Coordinates = CartesianCoordinate & { id: string; level: number; parentId: ParentId; name: string };

export type CoordinatesWithTreeData = CartesianCoordinate & {
    isRoot: boolean;
    parentId: ParentId;
    treeId: string;
    nodeId: string;
    treeName: string;
    accentColor: string;
    level: number;
    data: Skill;
    category: NodeCategory;
};

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

export type PolarContourByLevel = {
    contourByLevel: {
        [level: string]: PolarContour[];
    };
    treeLevels: string[];
};
export type LevelOverflow = undefined | { overflow: number; level: number };
