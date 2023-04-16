import { StyleProp, ViewStyle } from "react-native/types";
import { colors } from "./pages/homepage/canvas/parameters";

export type Skill = {
    name: string;
    id: string;
    isCompleted?: boolean;
};

export type SelectedNode = string | null;

export interface Tree<T> {
    isRoot?: boolean;
    parentId: string | undefined;
    treeId?: string;
    treeName?: string;
    accentColor?: string;
    data: T;
    children?: Tree<T>[];
}
export interface TreeWithCoord<T> {
    isRoot?: boolean;
    parentId: string | undefined;
    treeId?: string;
    treeName?: string;
    accentColor?: string;
    x: number;
    y: number;
    level: number;
    data: T;
    children?: TreeWithCoord<T>[];
}

export type ModifiableProperties<T> = {
    [Property in keyof T]: T[Property];
};

export const MENU_DAMPENING = { damping: 20, stiffness: 300 };

export const mockSkillTreeArray: Tree<Skill>[] = [
    {
        treeId: "IQ Skills",
        treeName: "IQ Skills",
        isRoot: true,
        parentId: undefined,
        accentColor: colors.green,
        data: { id: `Coding`, name: "Coding", isCompleted: true },
        children: [
            {
                parentId: "Coding",
                data: { id: `Management`, name: "Management" },
                children: [
                    {
                        data: { id: `Lead Gen`, name: "Lead Gen" },
                        parentId: "Management",
                        children: [
                            {
                                parentId: "Lead Gen",
                                data: { id: `Strategy`, name: "Strategy" },
                                children: [{ data: { id: "Cashflow Management", name: "Cashflow Management" }, parentId: "Strategy" }],
                            },
                        ],
                    },
                    {
                        data: { id: `Messi`, name: "Messi" },
                        parentId: "Management",
                    },
                ],
            },
            {
                parentId: "Coding",
                data: { id: `Voice Influx`, name: "Voice Influx" },
                children: [
                    {
                        data: { id: `Cadence`, name: "Cadence" },
                        parentId: "Voice Influx",
                    },
                    {
                        data: { id: `Sexo`, name: "Sexo" },
                        parentId: "Voice Influx",
                    },
                    {
                        data: { id: `Fernandez`, name: "Fernandez" },
                        parentId: "Voice Influx",
                    },
                ],
            },
            {
                data: { id: "English", name: "English" },
                parentId: "Coding",
                children: [
                    {
                        parentId: "English",
                        data: {
                            isCompleted: true,
                            id: "Public Speaking",
                            name: "Public Speaking",
                        },
                        children: [
                            {
                                data: { name: "Sales", id: "Sales" },
                                parentId: "Public Speaking",
                                children: [{ data: { id: "Leadership", name: "Leadership" }, parentId: "Sales" }],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        treeId: "EQ Skills",
        treeName: "EQ Skills",
        isRoot: true,
        parentId: undefined,
        accentColor: colors.blue,
        data: { id: `People Management`, name: "People Management", isCompleted: true },
        children: [
            {
                data: { id: `Confidence`, name: "Confidence" },
                parentId: "People Management",
            },
            {
                data: { id: "Energy Investments", name: "Energy Investments", isCompleted: true },
                parentId: "People Management",
                children: [
                    {
                        data: { id: `Copywriting`, name: "Copywriting" },
                        parentId: "Energy Investments",
                    },
                ],
            },
        ],
    },
];

export const centerFlex: StyleProp<ViewStyle> = { display: "flex", justifyContent: "center", alignItems: "center" };

export type DnDZone = {
    type: "PARENT" | "ONLY_CHILDREN" | "LEFT_BROTHER" | "RIGHT_BROTHER";
    ofNode: string;
    x: number;
    y: number;
    width: number;
    height: number;
};

export type CirclePositionInCanvas = { x: number; y: number; id: string };
export type CirclePositionInCanvasWithLevel = { x: number; y: number; id: string; level: number; parentId: string | null };

export type CanvasDimentions = {
    canvasWidth: number;
    canvasHeight: number;
    horizontalMargin: number;
    verticalMargin: number;
};

export const mockNewNodeData: Skill = { id: "Cock", name: "ReCock", isCompleted: false };
