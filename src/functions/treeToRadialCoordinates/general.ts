import { CoordinatesWithTreeData, LevelOverflow, Skill, Tree } from "../../types";
import { treeToCoordArray } from "../treeToHierarchicalCoordinates";
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

    let distanceToCenterPerLevel: DistanceToCenterPerLevel = getDistanceToCenterPerLevel(completeTree);
    do {
        result = firstIteration(completeTree, completeTree, distanceToCenterPerLevel);

        result = fixOverlapWithinSubTreesOfLevel1(result);

        result = shiftSubTreeToFinalAngle(result);

        levelOverflow = checkForLevelOverflow(result);

        if (levelOverflow !== undefined) distanceToCenterPerLevel = updateDistanceToCenterPerLevel(distanceToCenterPerLevel, levelOverflow);
    } while (levelOverflow);

    let treeCoordinates: CoordinatesWithTreeData[] = [];
    treeToCoordArray(result, treeCoordinates);

    const smallestXCoordinate = Math.min(...treeCoordinates.map((c) => c.x));
    const smallestYCoordinate = Math.min(...treeCoordinates.map((c) => c.y));

    if (smallestXCoordinate < 0)
        treeCoordinates = treeCoordinates.map((c) => {
            return { ...c, x: c.x + Math.abs(smallestXCoordinate) };
        });
    if (smallestYCoordinate < 0)
        treeCoordinates = treeCoordinates.map((c) => {
            return { ...c, y: c.y + Math.abs(smallestYCoordinate) };
        });

    return treeCoordinates;
}
