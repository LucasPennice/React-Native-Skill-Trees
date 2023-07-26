import { CoordinatesWithTreeData, LevelOverflow, NodeCategory, Skill, Tree } from "../../types";

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
    let result: Tree<Skill> = { ...completeTree };

    let levelOverflow: LevelOverflow = undefined;

    let limiter = 0;

    let distanceToCenterPerLevel: DistanceToCenterPerLevel = getDistanceToCenterPerLevel(completeTree);
    do {
        result = firstIteration(completeTree, completeTree, distanceToCenterPerLevel);

        result = fixOverlapWithinSubTreesOfLevel1(result);

        // result = shiftSubTreeToFinalAngle(result);

        // levelOverflow = checkForLevelOverflow(result);

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
        x: tree.x,
        y: tree.y,
        level: tree.level,
        parentId: tree.parentId,
    });

    function getCategory(): NodeCategory {
        if (tree.isRoot) return "USER";

        if (tree.level === 1) return "SKILL_TREE";

        return "SKILL";
    }
}
