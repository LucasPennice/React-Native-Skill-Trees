import { NormalizedNode, Skill, Tree, getDefaultSkillValue } from "../types";
import { expect, test } from "@jest/globals";
import { MigrationState, migrateFromCurrentTreeToNormalizedSlice, shouldMigrateNodesAndTrees, shouldMigrateToHomeTree } from "./migration";
import { defaultCanvasDisplaySettings } from "./slices/canvasDisplaySettingsSlice";
import { homeTreeSliceInitialState } from "./slices/homeTreeSlice";
import { HOMEPAGE_TREE_ID, HOMETREE_ROOT_ID } from "../parameters";
import { EntityState } from "@reduxjs/toolkit";
import { TreeData } from "./slices/userTreesSlice";

test("shouldMigrateToHomeTree - Undefined home tree state - Expected true", () => {
    const inputCanvasSettings: MigrationState["canvasDisplaySettings"] = {
        ...defaultCanvasDisplaySettings,
        homepageTreeColor: homeTreeSliceInitialState.accentColor,
        homepageTreeName: homeTreeSliceInitialState.treeName,
        homepageTreeIcon: homeTreeSliceInitialState.icon.text,
    };

    expect(shouldMigrateToHomeTree(inputCanvasSettings, undefined)).toBe(true);
});

test("shouldMigrateToHomeTree - Default home tree state values - Expected true", () => {
    const inputCanvasSettings: MigrationState["canvasDisplaySettings"] = {
        ...defaultCanvasDisplaySettings,
        homepageTreeColor: homeTreeSliceInitialState.accentColor,
        homepageTreeName: homeTreeSliceInitialState.treeName,
        homepageTreeIcon: homeTreeSliceInitialState.icon.text,
    };

    expect(shouldMigrateToHomeTree(inputCanvasSettings, homeTreeSliceInitialState)).toBe(true);
});

test("shouldMigrateToHomeTree - Default home tree state values different from initial - Expected false", () => {
    const inputCanvasSettings: MigrationState["canvasDisplaySettings"] = {
        ...defaultCanvasDisplaySettings,
        homepageTreeColor: homeTreeSliceInitialState.accentColor,
        homepageTreeName: homeTreeSliceInitialState.treeName,
        homepageTreeIcon: homeTreeSliceInitialState.icon.text,
    };

    expect(shouldMigrateToHomeTree(inputCanvasSettings, { ...homeTreeSliceInitialState, treeName: "Other name" })).toBe(false);
});

test("shouldMigrateNodesAndTrees - undefined currentTree / Installing app for the first time case - Expected false", () => {
    const inputNodeState: MigrationState["nodes"] = { ids: [], entities: {} };
    const inputUserTreeState: MigrationState["userTrees"] = { ids: [], entities: {} };

    const inputCurrentTreeState: MigrationState["currentTree"] = undefined;

    expect(shouldMigrateNodesAndTrees(inputNodeState, inputUserTreeState, inputCurrentTreeState)).toBe(false);
});

test("shouldMigrateNodesAndTrees - Migration necessary case - Expected true", () => {
    const inputNodeState: MigrationState["nodes"] = { ids: [], entities: {} };
    const inputUserTreeState: MigrationState["userTrees"] = { ids: [], entities: {} };

    const inputCurrentTreeState: MigrationState["currentTree"] = { userTrees: [], currentTreeId: undefined };

    expect(shouldMigrateNodesAndTrees(inputNodeState, inputUserTreeState, inputCurrentTreeState)).toBe(true);
});

test("migrateFromCurrentTreeToNormalizedSlice - Empty userTrees - Expected only home root node", () => {
    const inputUserTrees: Tree<Skill>[] = [];

    const inputCanvasSettings: MigrationState["canvasDisplaySettings"] = {
        ...defaultCanvasDisplaySettings,
        homepageTreeColor: homeTreeSliceInitialState.accentColor,
        homepageTreeName: homeTreeSliceInitialState.treeName,
        homepageTreeIcon: homeTreeSliceInitialState.icon.text,
    };

    const output: { nodeState: EntityState<NormalizedNode>; userTrees: EntityState<TreeData> } = {
        nodeState: {
            entities: {
                [HOMETREE_ROOT_ID]: {
                    category: "USER",
                    childrenIds: [],
                    data: getDefaultSkillValue(inputCanvasSettings.homepageTreeName!, false, {
                        isEmoji: false,
                        text: inputCanvasSettings.homepageTreeName![0],
                    }),
                    isRoot: true,
                    level: 0,
                    nodeId: HOMETREE_ROOT_ID,
                    parentId: null,
                    treeId: HOMEPAGE_TREE_ID,
                    x: 0,
                    y: 0,
                },
            },
            ids: [HOMETREE_ROOT_ID],
        },
        userTrees: { entities: {}, ids: [] },
    };

    expect(migrateFromCurrentTreeToNormalizedSlice(inputUserTrees, inputCanvasSettings)).toStrictEqual(output);
});

test("migrateFromCurrentTreeToNormalizedSlice - General Case", () => {
    const inputUserTrees: Tree<Skill>[] = [
        {
            treeName: "TgHshshdhdj",
            accentColor: { label: "Orange", color1: "#FF9F23", color2: "#BF5AF2" },
            isRoot: false,
            parentId: "homepageRoot",
            treeId: "8sDjNU7jCKLgXmuY6Fa7N9Zw",
            level: 0,
            nodeId: "YnOYZ6TzIXPO9n1ctCjYALBx",
            category: "SKILL_TREE",
            children: [
                {
                    accentColor: { label: "Orange", color1: "#FF9F23", color2: "#BF5AF2" },
                    treeId: "8sDjNU7jCKLgXmuY6Fa7N9Zw",
                    treeName: "TgHshshdhdj",
                    category: "SKILL",
                    children: [
                        {
                            accentColor: { label: "Orange", color1: "#FF9F23", color2: "#BF5AF2" },
                            treeId: "8sDjNU7jCKLgXmuY6Fa7N9Zw",
                            treeName: "TgHshshdhdj",
                            category: "SKILL",
                            children: [],
                            data: {
                                name: "1",
                                isCompleted: false,
                                icon: { isEmoji: false, text: "" },
                                logs: [],
                                milestones: [],
                                motivesToLearn: [],
                                usefulResources: [],
                            },
                            isRoot: false,
                            level: 2,
                            nodeId: "uY8KrW6D5FKsuw8VZviwKYbK",
                            parentId: "5Bd1Codzk0WsWtCAGX2tP1Ej",
                            x: 0,
                            y: 0,
                        },
                        {
                            accentColor: { label: "Orange", color1: "#FF9F23", color2: "#BF5AF2" },
                            treeId: "8sDjNU7jCKLgXmuY6Fa7N9Zw",
                            treeName: "TgHshshdhdj",
                            category: "SKILL",
                            children: [],
                            data: {
                                name: "2",
                                isCompleted: false,
                                icon: { isEmoji: false, text: "" },
                                logs: [],
                                milestones: [],
                                motivesToLearn: [],
                                usefulResources: [],
                            },
                            isRoot: false,
                            level: 2,
                            nodeId: "hCV7q7oJOlbeMeYlyMtIZYlK",
                            parentId: "5Bd1Codzk0WsWtCAGX2tP1Ej",
                            x: 0,
                            y: 0,
                        },
                        {
                            accentColor: { label: "Orange", color1: "#FF9F23", color2: "#BF5AF2" },
                            treeId: "8sDjNU7jCKLgXmuY6Fa7N9Zw",
                            treeName: "TgHshshdhdj",
                            category: "SKILL",
                            children: [],
                            data: {
                                name: "3",
                                isCompleted: false,
                                icon: { isEmoji: false, text: "" },
                                logs: [],
                                milestones: [],
                                motivesToLearn: [],
                                usefulResources: [],
                            },
                            isRoot: false,
                            level: 2,
                            nodeId: "q3O24bcBKTYNzaK0qcs2P1tO",
                            parentId: "5Bd1Codzk0WsWtCAGX2tP1Ej",
                            x: 0,
                            y: 0,
                        },
                    ],
                    data: {
                        name: "A",
                        isCompleted: false,
                        icon: { isEmoji: false, text: "" },
                        logs: [],
                        milestones: [],
                        motivesToLearn: [],
                        usefulResources: [],
                    },
                    isRoot: false,
                    level: 1,
                    nodeId: "5Bd1Codzk0WsWtCAGX2tP1Ej",
                    parentId: "YnOYZ6TzIXPO9n1ctCjYALBx",
                    x: 0,
                    y: 0,
                },
                {
                    accentColor: { label: "Orange", color1: "#FF9F23", color2: "#BF5AF2" },
                    treeId: "8sDjNU7jCKLgXmuY6Fa7N9Zw",
                    treeName: "TgHshshdhdj",
                    category: "SKILL",
                    children: [],
                    data: {
                        name: "Bdbdjd",
                        isCompleted: false,
                        icon: { isEmoji: false, text: "" },
                        logs: [],
                        milestones: [],
                        motivesToLearn: [],
                        usefulResources: [],
                    },
                    isRoot: false,
                    level: 1,
                    nodeId: "W9YGjEAjIW5jyZk4UqIsKVDX",
                    parentId: "YnOYZ6TzIXPO9n1ctCjYALBx",
                    x: 0,
                    y: 0,
                },
                {
                    accentColor: { label: "Orange", color1: "#FF9F23", color2: "#BF5AF2" },
                    treeId: "8sDjNU7jCKLgXmuY6Fa7N9Zw",
                    treeName: "TgHshshdhdj",
                    category: "SKILL",
                    children: [],
                    data: {
                        name: "C",
                        isCompleted: false,
                        icon: { isEmoji: false, text: "" },
                        logs: [],
                        milestones: [],
                        motivesToLearn: [],
                        usefulResources: [],
                    },
                    isRoot: false,
                    level: 1,
                    nodeId: "8HQgjPwxHMNJnJEfSCJihr2d",
                    parentId: "YnOYZ6TzIXPO9n1ctCjYALBx",
                    x: 0,
                    y: 0,
                },
            ],
            x: 0,
            y: 0,
            data: {
                name: "TgHshshdhdj",
                isCompleted: false,
                icon: { isEmoji: false, text: "T" },
                logs: [],
                milestones: [],
                motivesToLearn: [],
                usefulResources: [],
            },
        },
    ];

    const inputCanvasSettings: MigrationState["canvasDisplaySettings"] = {
        ...defaultCanvasDisplaySettings,
        homepageTreeColor: homeTreeSliceInitialState.accentColor,
        homepageTreeName: homeTreeSliceInitialState.treeName,
        homepageTreeIcon: homeTreeSliceInitialState.icon.text,
    };

    const output: { nodeState: EntityState<NormalizedNode>; userTrees: EntityState<TreeData> } = {
        nodeState: {
            entities: {
                homepageRoot: {
                    nodeId: "homepageRoot",
                    isRoot: true,
                    childrenIds: ["YnOYZ6TzIXPO9n1ctCjYALBx"],
                    data: {
                        isCompleted: false,
                        icon: { isEmoji: false, text: "L" },
                        logs: [],
                        milestones: [],
                        motivesToLearn: [],
                        usefulResources: [],
                        name: "Life Skills",
                    },
                    level: 0,
                    parentId: null,
                    treeId: "HomepageTree",
                    x: 0,
                    y: 0,
                    category: "USER",
                },
                uY8KrW6D5FKsuw8VZviwKYbK: {
                    category: "SKILL",
                    data: {
                        name: "1",
                        isCompleted: false,
                        icon: { isEmoji: false, text: "" },
                        logs: [],
                        milestones: [],
                        motivesToLearn: [],
                        usefulResources: [],
                    },
                    isRoot: false,
                    level: 2,
                    nodeId: "uY8KrW6D5FKsuw8VZviwKYbK",
                    parentId: "5Bd1Codzk0WsWtCAGX2tP1Ej",
                    treeId: "8sDjNU7jCKLgXmuY6Fa7N9Zw",
                    x: 0,
                    y: 0,
                    childrenIds: [],
                },
                hCV7q7oJOlbeMeYlyMtIZYlK: {
                    category: "SKILL",
                    data: {
                        name: "2",
                        isCompleted: false,
                        icon: { isEmoji: false, text: "" },
                        logs: [],
                        milestones: [],
                        motivesToLearn: [],
                        usefulResources: [],
                    },
                    isRoot: false,
                    level: 2,
                    nodeId: "hCV7q7oJOlbeMeYlyMtIZYlK",
                    parentId: "5Bd1Codzk0WsWtCAGX2tP1Ej",
                    treeId: "8sDjNU7jCKLgXmuY6Fa7N9Zw",
                    x: 0,
                    y: 0,
                    childrenIds: [],
                },
                q3O24bcBKTYNzaK0qcs2P1tO: {
                    category: "SKILL",
                    data: {
                        name: "3",
                        isCompleted: false,
                        icon: { isEmoji: false, text: "" },
                        logs: [],
                        milestones: [],
                        motivesToLearn: [],
                        usefulResources: [],
                    },
                    isRoot: false,
                    level: 2,
                    nodeId: "q3O24bcBKTYNzaK0qcs2P1tO",
                    parentId: "5Bd1Codzk0WsWtCAGX2tP1Ej",
                    treeId: "8sDjNU7jCKLgXmuY6Fa7N9Zw",
                    x: 0,
                    y: 0,
                    childrenIds: [],
                },
                "5Bd1Codzk0WsWtCAGX2tP1Ej": {
                    category: "SKILL",
                    data: {
                        name: "A",
                        isCompleted: false,
                        icon: { isEmoji: false, text: "" },
                        logs: [],
                        milestones: [],
                        motivesToLearn: [],
                        usefulResources: [],
                    },
                    isRoot: false,
                    level: 1,
                    nodeId: "5Bd1Codzk0WsWtCAGX2tP1Ej",
                    parentId: "YnOYZ6TzIXPO9n1ctCjYALBx",
                    treeId: "8sDjNU7jCKLgXmuY6Fa7N9Zw",
                    x: 0,
                    y: 0,
                    childrenIds: ["uY8KrW6D5FKsuw8VZviwKYbK", "hCV7q7oJOlbeMeYlyMtIZYlK", "q3O24bcBKTYNzaK0qcs2P1tO"],
                },
                W9YGjEAjIW5jyZk4UqIsKVDX: {
                    category: "SKILL",
                    data: {
                        name: "Bdbdjd",
                        isCompleted: false,
                        icon: { isEmoji: false, text: "" },
                        logs: [],
                        milestones: [],
                        motivesToLearn: [],
                        usefulResources: [],
                    },
                    isRoot: false,
                    level: 1,
                    nodeId: "W9YGjEAjIW5jyZk4UqIsKVDX",
                    parentId: "YnOYZ6TzIXPO9n1ctCjYALBx",
                    treeId: "8sDjNU7jCKLgXmuY6Fa7N9Zw",
                    x: 0,
                    y: 0,
                    childrenIds: [],
                },
                "8HQgjPwxHMNJnJEfSCJihr2d": {
                    category: "SKILL",
                    data: {
                        name: "C",
                        isCompleted: false,
                        icon: { isEmoji: false, text: "" },
                        logs: [],
                        milestones: [],
                        motivesToLearn: [],
                        usefulResources: [],
                    },
                    isRoot: false,
                    level: 1,
                    nodeId: "8HQgjPwxHMNJnJEfSCJihr2d",
                    parentId: "YnOYZ6TzIXPO9n1ctCjYALBx",
                    treeId: "8sDjNU7jCKLgXmuY6Fa7N9Zw",
                    x: 0,
                    y: 0,
                    childrenIds: [],
                },
                YnOYZ6TzIXPO9n1ctCjYALBx: {
                    category: "SKILL_TREE",
                    data: {
                        name: "TgHshshdhdj",
                        isCompleted: false,
                        icon: { isEmoji: false, text: "T" },
                        logs: [],
                        milestones: [],
                        motivesToLearn: [],
                        usefulResources: [],
                    },
                    isRoot: true,
                    level: 0,
                    nodeId: "YnOYZ6TzIXPO9n1ctCjYALBx",
                    parentId: "homepageRoot",
                    treeId: "8sDjNU7jCKLgXmuY6Fa7N9Zw",
                    x: 0,
                    y: 0,
                    childrenIds: ["5Bd1Codzk0WsWtCAGX2tP1Ej", "W9YGjEAjIW5jyZk4UqIsKVDX", "8HQgjPwxHMNJnJEfSCJihr2d"],
                },
            },
            ids: [
                "homepageRoot",
                "uY8KrW6D5FKsuw8VZviwKYbK",
                "hCV7q7oJOlbeMeYlyMtIZYlK",
                "q3O24bcBKTYNzaK0qcs2P1tO",
                "5Bd1Codzk0WsWtCAGX2tP1Ej",
                "W9YGjEAjIW5jyZk4UqIsKVDX",
                "8HQgjPwxHMNJnJEfSCJihr2d",
                "YnOYZ6TzIXPO9n1ctCjYALBx",
            ],
        },
        userTrees: {
            entities: {
                "8sDjNU7jCKLgXmuY6Fa7N9Zw": {
                    icon: { isEmoji: false, text: "T" },
                    accentColor: { label: "Orange", color1: "#FF9F23", color2: "#BF5AF2" },
                    nodes: [
                        "uY8KrW6D5FKsuw8VZviwKYbK",
                        "hCV7q7oJOlbeMeYlyMtIZYlK",
                        "q3O24bcBKTYNzaK0qcs2P1tO",
                        "5Bd1Codzk0WsWtCAGX2tP1Ej",
                        "W9YGjEAjIW5jyZk4UqIsKVDX",
                        "8HQgjPwxHMNJnJEfSCJihr2d",
                        "YnOYZ6TzIXPO9n1ctCjYALBx",
                    ],
                    rootNodeId: "YnOYZ6TzIXPO9n1ctCjYALBx",
                    treeId: "8sDjNU7jCKLgXmuY6Fa7N9Zw",
                    treeName: "TgHshshdhdj",
                    showOnHomeScreen: true,
                },
            },
            ids: ["8sDjNU7jCKLgXmuY6Fa7N9Zw"],
        },
    };

    expect(migrateFromCurrentTreeToNormalizedSlice(inputUserTrees, inputCanvasSettings)).toStrictEqual(output);
});
