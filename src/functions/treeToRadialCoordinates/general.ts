import { Coordinates, Skill, Tree } from "../../types";
import { treeToCoordArray } from "../treeToHierarchicalCoordinates";
import { firstIteration } from "./firstInstance";
import { handleOverlap } from "./overlap";

//☢️ The canvas has the positive y axis pointing downwards, this changes how calculations are to be made ☢️

export function PlotCircularTree(completeTree: Tree<Skill>) {
    let result: Tree<Skill> = { ...completeTree };

    result = firstIteration(completeTree, completeTree);

    result = handleOverlap(result);

    let treeCoordinates: Coordinates[] = [];
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
