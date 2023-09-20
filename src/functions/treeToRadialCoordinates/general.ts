import { CanvasDisplaySettings } from "@/redux/slices/canvasDisplaySettingsSlice";
import { HOMEPAGE_TREE_ID, HOMETREE_ROOT_ID } from "../../parameters";
import { NodeCategory, NodeCoordinate, Skill, Tree, UpdateRadiusPerLevelTable, getDefaultSkillValue } from "../../types";
import { round8Decimals } from "../coordinateSystem";
import { updateRadiusPerLevelTable } from "../misc";
import { mutateEveryTreeNode } from "../mutateTree";
import { firstIteration } from "./firstInstance";
import { radiusPerLevelToAvoidLevelOvercrowd } from "./levelOvercrowd";
import { checkForLevelOverflow } from "./levelOverflow";
import { fixOverlapWithinSubTreesOfLevel1, shiftSubTreeToFinalAngle } from "./overlap";

//☢️ The canvas has the positive y axis pointing downwards, this changes how calculations are to be made ☢️

//There are 2 cases of level overflow
// 1 - The nodes are perfectly spaced and when adding a new node the average space is less than the minimum allowed space
// So, we don't have space between nodes, this is level overcrowd
// 2 - We do have the necessary space to add the new node, but the sibling subtree is taking that space, if we insert the tree without
// Increasing the radius we will overlap the nodes, this is level overflow

export function plotCircularTree(completeTree: Tree<Skill>) {
    //We invert the tree because the Skia canvas is mirrored vertically
    let result: Tree<Skill> = invertTree(completeTree);

    let limiter = 0;

    let radiusPerLevelTable = radiusPerLevelToAvoidLevelOvercrowd(completeTree);

    let levelOverflow: UpdateRadiusPerLevelTable = undefined;

    do {
        result = firstIteration(result, result, radiusPerLevelTable);

        result = fixOverlapWithinSubTreesOfLevel1(result);

        result = shiftSubTreeToFinalAngle(result, radiusPerLevelTable);

        levelOverflow = checkForLevelOverflow(result, radiusPerLevelTable);

        if (levelOverflow) radiusPerLevelTable = updateRadiusPerLevelTable(radiusPerLevelTable, levelOverflow);

        limiter++;
    } while (levelOverflow && limiter !== 100);

    let treeCoordinates: NodeCoordinate[] = [];
    radialTreeToCoordArray(result, treeCoordinates);

    return treeCoordinates;
}

function radialTreeToCoordArray(tree: Tree<Skill>, result: NodeCoordinate[]) {
    // Recursive Case 👇
    if (tree.children.length) {
        for (let i = 0; i < tree.children.length; i++) {
            const element = tree.children[i];
            radialTreeToCoordArray(element, result);
        }
    }

    // Non Recursive Case 👇

    result.push({
        accentColor: tree.accentColor,
        data: tree.data,
        isRoot: tree.isRoot,
        category: getCategory(),
        nodeId: tree.nodeId,
        treeId: tree.treeId,
        treeName: tree.treeName,
        x: round8Decimals(tree.x),
        y: round8Decimals(tree.y),
        level: tree.level,
        parentId: tree.parentId,
    });

    function getCategory(): NodeCategory {
        if (tree.isRoot) return "USER";

        if (tree.level === 1) return "SKILL_TREE";

        return "SKILL";
    }
}

export function invertTree<T extends { children: T[] }>(rootNode: T) {
    //Base Case 👇
    if (!rootNode.children.length) return rootNode;

    //Recursive Case 👇

    let result: T = { ...rootNode, children: [] };

    for (let idx = rootNode.children.length - 1; idx !== -1; idx--) {
        const element = rootNode.children[idx];

        const d = invertTree(element);

        result.children.push(d);
    }

    return result;
}

export function buildHomepageTree(userTrees: Tree<Skill>[], canvasDisplaySettings: CanvasDisplaySettings) {
    const { homepageTreeColor, homepageTreeName, homepageTreeIcon } = canvasDisplaySettings;

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

    const isEmoji = homepageTreeIcon !== "";
    const text = isEmoji ? homepageTreeIcon : homepageTreeName[0];

    const result: Tree<Skill> = {
        accentColor: homepageTreeColor,
        nodeId: HOMETREE_ROOT_ID,
        isRoot: true,
        children: subTreesWithUpdatedLevel,
        data: getDefaultSkillValue(homepageTreeName, false, { isEmoji, text }),
        level: 0,
        parentId: null,
        treeId: HOMEPAGE_TREE_ID,
        treeName: homepageTreeName,
        x: 0,
        y: 0,
        category: "USER",
    };

    return result;
}
