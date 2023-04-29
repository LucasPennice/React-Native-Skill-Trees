import { Skill, Tree } from "../../types";
import { cartesianToPositivePolarCoordinates, polarToCartesianCoordinates, returnSmallestBetweenAngleAndComplement } from "../coordinateSystem";
import { findLowestCommonAncestorIdOfNodes, returnPathFromRootToNode } from "../extractInformationFromTree";
import { Coordinates, treeToCoordArray } from "../treeToHierarchicalCoordinates";
import { firstIteration } from "./firstInstance";
import { handleOverlap } from "./overlap";

//☢️ The canvas has the positive y axis pointing downwards, this changes how calculations are to be made ☢️

export type PolarCoordinate = { angleInRadians: number; distanceToCenter: number };

export type PolarContour = { leftNode: PolarCoordinate & { id: string }; rightNode: PolarCoordinate & { id: string } };

export type PolarOverlapCheck = undefined | { biggestOverlapAngle: number; nodesInConflict: [string, string] };

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
        if (!tree.children) return undefined;
        if (tree.isRoot) treesToShift.byHalfOfBiggestOverlap.push(tree.data.id);

        //Recursive Case 👇
        const currentLevel = tree.level;
        const lcaLevel = lcaIndex;
        const nodeInPathIndexForChildren = tree.children.findIndex((t) => t.data.id === pathToRightNode[currentLevel + 1]);
        const areAnyOfChildrenInPath = nodeInPathIndexForChildren === -1 ? false : true;

        if (!areAnyOfChildrenInPath) return undefined;

        for (let i = 0; i < tree.children.length; i++) {
            const child = tree.children[i];

            if (i === nodeInPathIndexForChildren) {
                if (currentLevel >= lcaLevel) {
                    treesToShift.byBiggestOverlap.push(child.data.id);
                    addEveryChildFromTreeToArray(child, treesToShift.byBiggestOverlap);
                } else {
                    treesToShift.byHalfOfBiggestOverlap.push(child.data.id);
                }
                if (child.data.id === pathToRightNode[pathToRightNode.length - 1]) addEveryChildFromTreeToArray(child, treesToShift.byBiggestOverlap);
                getTreesToShiftFromNodePathInConflict(child);
            }

            if (i < nodeInPathIndexForChildren) {
                if (currentLevel >= lcaLevel) {
                    treesToShift.byBiggestOverlap.push(child.data.id);
                    addEveryChildFromTreeToArray(child, treesToShift.byBiggestOverlap);
                } else {
                    treesToShift.byHalfOfBiggestOverlap.push(child.data.id);
                    addEveryChildFromTreeToArray(child, treesToShift.byHalfOfBiggestOverlap);
                }
            }
        }
    }

    function addEveryChildFromTreeToArray(tree: Tree<Skill>, arrToAdd: string[]) {
        if (!tree.children) return;

        for (let i = 0; i < tree.children.length; i++) {
            const element = tree.children[i];

            arrToAdd.push(element.data.id);

            addEveryChildFromTreeToArray(element, arrToAdd);
        }
    }
}

export function shiftNodesClockWise(
    result: Tree<Skill>,
    treesToShift: { byBiggestOverlap: string[]; byHalfOfBiggestOverlap: string[] },
    overlapAngle: number
) {
    const shiftAngleForTree = getShiftAngleForTree(result.data.id);

    const treeCoordBeforeShift = cartesianToPositivePolarCoordinates({ x: result.x, y: result.y }, UNCENTERED_ROOT_COORDINATES);

    const shiftedPolarCoord: PolarCoordinate = {
        ...treeCoordBeforeShift,
        angleInRadians: treeCoordBeforeShift.angleInRadians - shiftAngleForTree,
    };

    const shiftedCartesianCoord = polarToCartesianCoordinates(shiftedPolarCoord);

    const updatedTree: Tree<Skill> = { ...result, x: shiftedCartesianCoord.x, y: shiftedCartesianCoord.y };

    //Base Case 👇

    if (!result.children) return updatedTree;

    updatedTree.children = [];

    //Recursive Case 👇

    for (let i = 0; i < result.children.length; i++) {
        const element = result.children[i];

        updatedTree.children.push(shiftNodesClockWise(element, treesToShift, overlapAngle));
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

export function getSubTreeContour(tree: Tree<Skill>, treeContour: PolarContour[]) {
    // Base case 👇

    //By design the root of my subtree is at level 1
    const subTreeRoot = tree.level === 1;

    if (!tree.children || subTreeRoot) {
        const leftmostNode = tree;
        const rightmostNode = tree;
        updateTreeContour(leftmostNode, rightmostNode, treeContour);

        if (!tree.children) return;
    }

    //Recursive case 👇
    const rightmostNode = tree.children[0];
    const leftmostNode = tree.children[tree.children.length - 1];

    updateTreeContour(leftmostNode, rightmostNode, treeContour);

    for (let i = 0; i < tree.children.length; i++) getSubTreeContour(tree.children[i], treeContour);

    return;

    function updateTreeContour(leftMostTree: Tree<Skill>, rightMostTree: Tree<Skill>, treeContour: PolarContour[]) {
        const level = leftMostTree.level;

        const leftMostPolarCoord = cartesianToPositivePolarCoordinates({ x: leftMostTree.x, y: leftMostTree.y }, UNCENTERED_ROOT_COORDINATES);
        const rightMostPolarCoord = cartesianToPositivePolarCoordinates({ x: rightMostTree.x, y: rightMostTree.y }, UNCENTERED_ROOT_COORDINATES);

        if (treeContour[level] === undefined) {
            treeContour[level] = {
                leftNode: { ...leftMostPolarCoord, id: leftMostTree.data.id },
                rightNode: { ...rightMostPolarCoord, id: rightMostTree.data.id },
            };
            return;
        }

        const contourLeftAngleNormalized = returnSmallestBetweenAngleAndComplement(treeContour[level].leftNode.angleInRadians);
        const tentativeLeftContourNormalized = returnSmallestBetweenAngleAndComplement(leftMostPolarCoord.angleInRadians);

        const updateLeftNode = contourLeftAngleNormalized < tentativeLeftContourNormalized;

        if (updateLeftNode) treeContour[level].leftNode = { ...leftMostPolarCoord, id: leftMostTree.data.id };

        const contourRightAngleNormalized = returnSmallestBetweenAngleAndComplement(treeContour[level].rightNode.angleInRadians);
        const tentativeRightContourNormalized = returnSmallestBetweenAngleAndComplement(rightMostPolarCoord.angleInRadians);

        //Remember that the Y axis of the canvas points "down"
        const updateRightNode = contourRightAngleNormalized > tentativeRightContourNormalized;

        if (updateRightNode) treeContour[level].rightNode = { ...rightMostPolarCoord, id: rightMostTree.data.id };

        return;
    }
}
