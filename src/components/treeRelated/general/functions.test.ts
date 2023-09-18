import { expect, test } from "@jest/globals";
import { normalizedNodeToTree } from "./functions";
import { NormalizedNode, Skill, Tree } from "@/types";
import { TreeData } from "@/redux/slices/newUserTreesSlice";

test("Normalizing Tree with 1 node", () => {
    const nodes: NormalizedNode[] = [
        {
            category: "SKILL_TREE",
            childrenIds: [],
            data: {
                usefulResources: [],
                icon: { isEmoji: false, text: "text" },
                isCompleted: false,
                logs: [],
                milestones: [],
                motivesToLearn: [],
                name: "skillName",
            },
            isRoot: true,
            level: 0,
            nodeId: "rootId",
            parentId: null,
            treeId: "mockTreeId",
            x: 0,
            y: 0,
        },
    ];

    const treeData: TreeData = {
        accentColor: {
            label: "Red",
            color1: "#FE453A",
            color2: "#FF9F23",
        },
        treeName: "Name",
        rootNodeId: "rootId",
        nodes: ["rootId"],
        treeId: "mockTreeId",
        icon: { isEmoji: false, text: "text" },
    };

    const expectedResult: Tree<Skill> = {
        accentColor: treeData.accentColor,
        treeId: treeData.treeId,
        treeName: treeData.treeName,
        category: nodes[0].category,
        children: [],
        data: nodes[0].data,
        isRoot: nodes[0].isRoot,
        level: nodes[0].level,
        nodeId: nodes[0].nodeId,
        parentId: nodes[0].parentId,
        x: nodes[0].x,
        y: nodes[0].y,
    };

    expect(normalizedNodeToTree(nodes, treeData)).toStrictEqual(expectedResult);
});

test("Normalizing Tree general", () => {
    const nodes: NormalizedNode[] = [
        {
            category: "SKILL_TREE",
            childrenIds: ["1-1", "1-2", "1-3"],
            data: {
                usefulResources: [],
                icon: { isEmoji: false, text: "text" },
                isCompleted: false,
                logs: [],
                milestones: [],
                motivesToLearn: [],
                name: "skillName",
            },
            isRoot: true,
            level: 0,
            nodeId: "rootId",
            parentId: null,
            treeId: "mockTreeId",
            x: 0,
            y: 0,
        },
        {
            category: "SKILL",
            childrenIds: ["2-1"],
            data: {
                usefulResources: [],
                icon: { isEmoji: false, text: "text" },
                isCompleted: false,
                logs: [],
                milestones: [],
                motivesToLearn: [],
                name: "skillName",
            },
            isRoot: false,
            level: 1,
            nodeId: "1-1",
            parentId: "rootId",
            treeId: "mockTreeId",
            x: 0,
            y: 0,
        },
        {
            category: "SKILL",
            childrenIds: [],
            data: {
                usefulResources: [],
                icon: { isEmoji: false, text: "text" },
                isCompleted: false,
                logs: [],
                milestones: [],
                motivesToLearn: [],
                name: "skillName",
            },
            isRoot: false,
            level: 1,
            nodeId: "1-2",
            parentId: "rootId",
            treeId: "mockTreeId",
            x: 0,
            y: 0,
        },
        {
            category: "SKILL",
            childrenIds: [],
            data: {
                usefulResources: [],
                icon: { isEmoji: false, text: "text" },
                isCompleted: false,
                logs: [],
                milestones: [],
                motivesToLearn: [],
                name: "skillName",
            },
            isRoot: false,
            level: 1,
            nodeId: "1-3",
            parentId: "rootId",
            treeId: "mockTreeId",
            x: 0,
            y: 0,
        },
        {
            category: "SKILL",
            childrenIds: [],
            data: {
                usefulResources: [],
                icon: { isEmoji: false, text: "text" },
                isCompleted: false,
                logs: [],
                milestones: [],
                motivesToLearn: [],
                name: "skillName",
            },
            isRoot: false,
            level: 2,
            nodeId: "2-1",
            parentId: "1-1",
            treeId: "mockTreeId",
            x: 0,
            y: 0,
        },
    ];

    const treeData: TreeData = {
        accentColor: {
            label: "Red",
            color1: "#FE453A",
            color2: "#FF9F23",
        },
        treeName: "Name",
        rootNodeId: "rootId",
        nodes: ["rootId", "1-1", "1-2", "1-3", "2-1"],
        icon: { isEmoji: false, text: "text" },
        treeId: "mockTreeId",
    };

    const rootNode = nodes[0];
    const node11 = nodes[1];
    const node12 = nodes[2];
    const node13 = nodes[3];
    const node21 = nodes[4];

    const expectedResult: Tree<Skill> = {
        accentColor: treeData.accentColor,
        treeId: treeData.treeId,
        treeName: treeData.treeName,
        category: rootNode.category,
        children: [
            {
                accentColor: treeData.accentColor,
                treeId: treeData.treeId,
                treeName: treeData.treeName,
                category: node11.category,
                data: node11.data,
                isRoot: node11.isRoot,
                level: node11.level,
                nodeId: node11.nodeId,
                parentId: node11.parentId,
                x: node11.x,
                y: node11.y,
                children: [
                    {
                        accentColor: treeData.accentColor,
                        treeId: treeData.treeId,
                        treeName: treeData.treeName,
                        category: node21.category,
                        data: node21.data,
                        isRoot: node21.isRoot,
                        level: node21.level,
                        nodeId: node21.nodeId,
                        parentId: node21.parentId,
                        x: node21.x,
                        y: node21.y,
                        children: [],
                    },
                ],
            },
            {
                accentColor: treeData.accentColor,
                treeId: treeData.treeId,
                treeName: treeData.treeName,
                category: node12.category,
                data: node12.data,
                isRoot: node12.isRoot,
                level: node12.level,
                nodeId: node12.nodeId,
                parentId: node12.parentId,
                x: node12.x,
                y: node12.y,
                children: [],
            },
            {
                accentColor: treeData.accentColor,
                treeId: treeData.treeId,
                treeName: treeData.treeName,
                category: node13.category,
                data: node13.data,
                isRoot: node13.isRoot,
                level: node13.level,
                nodeId: node13.nodeId,
                parentId: node13.parentId,
                x: node13.x,
                y: node13.y,
                children: [],
            },
        ],
        data: rootNode.data,
        isRoot: rootNode.isRoot,
        level: rootNode.level,
        nodeId: rootNode.nodeId,
        parentId: rootNode.parentId,
        x: rootNode.x,
        y: rootNode.y,
    };

    expect(normalizedNodeToTree(nodes, treeData)).toStrictEqual(expectedResult);
});
