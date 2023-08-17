import { CoordinatesWithTreeData, LevelOverflow, NodeCategory, Skill, Tree } from "../../types";
import { round8Decimals } from "../coordinateSystem";

import { firstIteration } from "./firstInstance";
import { checkForLevelOverflow } from "./levelOverflow";
import {
    DistanceToCenterPerLevel,
    fixOverlapWithinSubTreesOfLevel1,
    getDistanceToCenterPerLevel,
    shiftSubTreeToFinalAngle,
    updateDistanceToCenterPerLevel,
} from "./overlap";

//☢️ The canvas has the positive y axis pointing downwards, this changes how calculations are to be made ☢️

export function PlotCircularTree(completeTree: Tree<Skill>) {
    //We invert the tree because the Skia canvas is mirrored vertically
    let result: Tree<Skill> = invertTree(completeTree);

    let levelOverflow: LevelOverflow = undefined;

    let limiter = 0;

    let distanceToCenterPerLevel: DistanceToCenterPerLevel = getDistanceToCenterPerLevel(completeTree);
    do {
        result = firstIteration(result, result, distanceToCenterPerLevel);

        result = fixOverlapWithinSubTreesOfLevel1(result);

        result = shiftSubTreeToFinalAngle(result);

        levelOverflow = checkForLevelOverflow(result);

        if (levelOverflow !== undefined) distanceToCenterPerLevel = updateDistanceToCenterPerLevel(distanceToCenterPerLevel, levelOverflow);

        limiter++;
    } while (levelOverflow && limiter < 1000);

    let treeCoordinates: CoordinatesWithTreeData[] = [];
    radialTreeToCoordArray(result, treeCoordinates);

    return treeCoordinates;
}

function radialTreeToCoordArray(tree: Tree<Skill>, result: CoordinatesWithTreeData[]) {
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
