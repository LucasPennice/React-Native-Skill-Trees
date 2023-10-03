import { HomeTreeSlice } from "@/redux/slices/homeTreeSlice";
import { TreeData } from "@/redux/slices/userTreesSlice";
import { Dictionary } from "@reduxjs/toolkit";
import { HOMEPAGE_TREE_ID, HOMETREE_ROOT_ID } from "../../parameters";
import { NormalizedNode, Skill, Tree, UpdateRadiusPerLevelTable, getDefaultSkillValue } from "../../types";
import { normalizedNodeDictionaryToNodeCoordArray } from "../extractInformationFromTree";
import { updateRadiusPerLevelTable } from "../misc";
import { mutateEveryTreeNode } from "../mutateTree";
import { firstIteration } from "./firstInstance";
import { radiusPerLevelToAvoidLevelOvercrowd } from "./levelOvercrowd";
import { checkForLevelOverflow } from "./levelOverflow";
import { fixOverlapWithinSubTreesOfLevel1 } from "./overlapWithinSubTree";
import { shiftSubTreeToFinalAngle } from "./shiftSubTree";

//☢️ The canvas has the positive y axis pointing downwards, this changes how calculations are to be made ☢️

//There are 2 cases of level overflow
// 1 - The nodes are perfectly spaced and when adding a new node the average space is less than the minimum allowed space
// So, we don't have space between nodes, this is level overcrowd
// 2 - We do have the necessary space to add the new node, but the sibling subtree is taking that space, if we insert the tree without
// Increasing the radius we will overlap the nodes, this is level overflow

export function plotCircularTree(nodes: Dictionary<NormalizedNode>, treeData: Omit<TreeData, "nodes">) {
    const rootNode = nodes[treeData.rootNodeId];
    if (!rootNode) throw new Error("rootNode undefined at plotCircularTree");

    //We invert the tree because the Skia canvas is mirrored vertically
    const invertedNodes = reverseNodeChildrenArray(nodes);

    let result: Dictionary<NormalizedNode> = { ...invertedNodes };

    let limiter = 0;

    let radiusPerLevelTable = radiusPerLevelToAvoidLevelOvercrowd(nodes);

    let levelOverflow: UpdateRadiusPerLevelTable = undefined;

    do {
        result = firstIteration(result, treeData.rootNodeId, radiusPerLevelTable);

        result = fixOverlapWithinSubTreesOfLevel1(result, treeData.rootNodeId);

        result = shiftSubTreeToFinalAngle(result, treeData.rootNodeId);

        levelOverflow = checkForLevelOverflow(result, treeData.rootNodeId, radiusPerLevelTable);

        if (levelOverflow) radiusPerLevelTable = updateRadiusPerLevelTable(radiusPerLevelTable, levelOverflow);

        limiter++;
    } while (levelOverflow && limiter !== 100);

    const treeCoordinates = normalizedNodeDictionaryToNodeCoordArray(result, treeData);

    return treeCoordinates;
}

export function reverseNodeChildrenArray(nodes: Dictionary<NormalizedNode>) {
    const result: Dictionary<NormalizedNode> = {};

    const nodeIds = Object.keys(nodes);

    for (const nodeId of nodeIds) {
        const node = nodes[nodeId];
        if (!node) throw new Error("node undefined at reverseNodeChildrenArray");

        const nodeWithReversedChildren: NormalizedNode = {
            category: node.category,
            data: node.data,
            isRoot: node.isRoot,
            level: node.level,
            nodeId: node.nodeId,
            parentId: node.parentId,
            treeId: node.treeId,
            x: node.x,
            y: node.y,
            childrenIds: node.childrenIds.map((_, idx) => {
                const inversedIdx = node.childrenIds.length - 1 - idx;

                return node.childrenIds[inversedIdx];
            }),
        };

        result[nodeId] = nodeWithReversedChildren;
    }

    return result;
}

export function buildHomepageTree(userTrees: Tree<Skill>[], homeTreeData: HomeTreeSlice) {
    const { accentColor, treeName, icon } = homeTreeData;

    const subTreesWithUpdatedRootAndParentId = userTrees.map((tree) => {
        return { ...tree, isRoot: false, parentId: HOMETREE_ROOT_ID };
    });

    const subTreesWithUpdatedLevel = subTreesWithUpdatedRootAndParentId.map((uT) => {
        const result = mutateEveryTreeNode(uT, (node: Tree<Skill>) => {
            return { ...node, level: node.level + 1 };
        });

        if (!result) throw new Error("buildHomepageTree undefined tree error");

        return result;
    });

    const result: Tree<Skill> = {
        accentColor,
        nodeId: HOMETREE_ROOT_ID,
        isRoot: true,
        children: subTreesWithUpdatedLevel,
        data: getDefaultSkillValue(treeName, false, icon),
        level: 0,
        parentId: null,
        treeId: HOMEPAGE_TREE_ID,
        treeName,
        x: 0,
        y: 0,
        category: "USER",
    };

    return result;
}
