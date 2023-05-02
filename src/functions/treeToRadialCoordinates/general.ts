import { Skill, Tree } from "../../types";
import { cartesianToPositivePolarCoordinates, polarToCartesianCoordinates } from "../coordinateSystem";
import { findLowestCommonAncestorIdOfNodes, returnPathFromRootToNode } from "../extractInformationFromTree";
import { Coordinates, treeToCoordArray } from "../treeToHierarchicalCoordinates";
import { firstIteration } from "./firstInstance";
import { handleOverlap } from "./overlap";

//☢️ The canvas has the positive y axis pointing downwards, this changes how calculations are to be made ☢️

export type PolarCoordinate = { angleInRadians: number; distanceToCenter: number };

export type PolarContour = { leftNode: PolarCoordinate & { id: string }; rightNode: PolarCoordinate & { id: string } };

export type PolarOverlapCheck = undefined | { biggestOverlapAngle: number; nodesInConflict: [string, string] };

export type RadialDistanceTable = { [key: string]: { current: number; original: number } };

export const ALLOWED_NODE_SPACING = 0.5;

export const UNCENTERED_ROOT_COORDINATES = { x: 0, y: 0 };

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

export function getTreesToShiftForCircularTree(result: Tree<Skill>, nodesInConflict: [string, string]) {
    const treesToShift: { byBiggestOverlap: string[]; byHalfOfBiggestOverlap: string[] } = { byBiggestOverlap: [], byHalfOfBiggestOverlap: [] };

    const pathToRightNode = returnPathFromRootToNode(result, nodesInConflict[1]);
    const nodesInConflictLCA = findLowestCommonAncestorIdOfNodes(result, ...nodesInConflict);

    if (!nodesInConflictLCA) throw "getTreesToShift nodesInConflictLCA";

    const lcaIndex = pathToRightNode.findIndex((id) => id === nodesInConflictLCA);

    if (lcaIndex === -1) throw "getTreesToShift lcaIndex error";

    getTreesToShiftFromNodePathInConflict(result);

    return treesToShift;

    function getTreesToShiftFromNodePathInConflict(tree: Tree<Skill>) {
        //Base Case 👇
        if (!tree.children.length) return undefined;
        if (tree.isRoot) treesToShift.byHalfOfBiggestOverlap.push(tree.nodeId);

        //Recursive Case 👇
        const currentLevel = tree.level;
        const lcaLevel = lcaIndex;
        const nodeInPathIndexForChildren = tree.children.findIndex((t) => t.nodeId === pathToRightNode[currentLevel + 1]);
        const areAnyOfChildrenInPath = nodeInPathIndexForChildren === -1 ? false : true;

        if (!areAnyOfChildrenInPath) return undefined;

        for (let i = 0; i < tree.children.length; i++) {
            const child = tree.children[i];

            if (i === nodeInPathIndexForChildren) {
                if (currentLevel >= lcaLevel) {
                    treesToShift.byBiggestOverlap.push(child.nodeId);
                    addEveryChildFromTreeToArray(child, treesToShift.byBiggestOverlap);
                } else {
                    treesToShift.byHalfOfBiggestOverlap.push(child.nodeId);
                }
                if (child.nodeId === pathToRightNode[pathToRightNode.length - 1]) addEveryChildFromTreeToArray(child, treesToShift.byBiggestOverlap);
                getTreesToShiftFromNodePathInConflict(child);
            }

            if (i < nodeInPathIndexForChildren) {
                if (currentLevel >= lcaLevel) {
                    treesToShift.byBiggestOverlap.push(child.nodeId);
                    addEveryChildFromTreeToArray(child, treesToShift.byBiggestOverlap);
                } else {
                    treesToShift.byHalfOfBiggestOverlap.push(child.nodeId);
                    addEveryChildFromTreeToArray(child, treesToShift.byHalfOfBiggestOverlap);
                }
            }
        }
    }

    function addEveryChildFromTreeToArray(tree: Tree<Skill>, arrToAdd: string[]) {
        if (!tree.children.length) return;

        for (let i = 0; i < tree.children.length; i++) {
            const element = tree.children[i];

            arrToAdd.push(element.nodeId);

            addEveryChildFromTreeToArray(element, arrToAdd);
        }
    }
}

export function shiftNodesCounterClockWise(
    result: Tree<Skill>,
    treesToShift: { byBiggestOverlap: string[]; byHalfOfBiggestOverlap: string[] },
    overlapAngle: number
) {
    const shiftAngleForTree = getShiftAngleForTree(result.nodeId);

    const treeCoordBeforeShift = cartesianToPositivePolarCoordinates({ x: result.x, y: result.y }, UNCENTERED_ROOT_COORDINATES);

    const shiftedPolarCoord: PolarCoordinate = {
        ...treeCoordBeforeShift,
        angleInRadians: treeCoordBeforeShift.angleInRadians - shiftAngleForTree,
    };

    const shiftedCartesianCoord = polarToCartesianCoordinates(shiftedPolarCoord);

    const updatedTree: Tree<Skill> = { ...result, x: shiftedCartesianCoord.x, y: shiftedCartesianCoord.y };

    //Base Case 👇

    if (!result.children.length) return updatedTree;

    updatedTree.children = [];

    //Recursive Case 👇

    for (let i = 0; i < result.children.length; i++) {
        const element = result.children[i];

        updatedTree.children.push(shiftNodesCounterClockWise(element, treesToShift, overlapAngle));
    }

    return updatedTree;

    function getShiftAngleForTree(treeId: string) {
        const shiftByBiggestOverlap = Boolean(treesToShift.byBiggestOverlap.find((id) => id === treeId));

        if (shiftByBiggestOverlap) return overlapAngle;

        const shiftByHalfOfBiggestOverlap = Boolean(treesToShift.byHalfOfBiggestOverlap.find((id) => id === treeId));

        if (shiftByHalfOfBiggestOverlap) return overlapAngle / 2;

        return 0;
    }
}
