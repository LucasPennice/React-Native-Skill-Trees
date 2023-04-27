import { DISTANCE_BETWEEN_CHILDREN } from "../parameters";
import { Skill, Tree } from "../types";
import {
    extractTreeIds,
    findDistanceBetweenNodesById,
    findLowestCommonAncestorIdOfNodes,
    returnPathFromRootToNode,
} from "./extractInformationFromTree";
import { Coordinates, treeToCoordArray } from "./treeToHierarchicalCoordinates";

//☢️ The canvas has the positive y axis pointing downwards, this changes how calculations are to be made ☢️

type PolarCoordinate = { angleInRadians: number; distanceToCenter: number };

type PolarContour = { leftNode: PolarCoordinate & { id: string }; rightNode: PolarCoordinate & { id: string } };

type PolarOverlapCheck = undefined | { biggestOverlapAngle: number; nodesInConflict: [string, string] };

// const ALLOWED_NODE_SPACING = 0.5;
const ALLOWED_NODE_SPACING = 0.5;

const UNCENTERED_ROOT_COORDINATES = { x: 0, y: 0 };

export function PlotCircularTree(completeTree: Tree<Skill>) {
    let result: Tree<Skill> = { ...completeTree };

    result = firstIteration(completeTree);

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

    function firstIteration(tree: Tree<Skill>, currentTreeMod?: PolarCoordinate, childrenIdx?: number) {
        const currentMod: PolarCoordinate = {
            angleInRadians: currentTreeMod ? currentTreeMod.angleInRadians : 0,
            distanceToCenter: currentTreeMod ? currentTreeMod.distanceToCenter : 0,
        };

        //Base Case 👇
        const coord = polarToCartesianCoordinates(currentMod);

        const distance = findDistanceBetweenNodesById(completeTree, tree.data.id);
        const level = distance ? distance - 1 : 0;

        let result: Tree<Skill> = { ...tree, x: coord.x, y: coord.y, level, children: undefined };

        if (!tree.children) return result;

        result.children = [];

        //Recursive Case 👇

        if (tree.isRoot) {
            const anglePerChildren = (2 * Math.PI) / tree.children.length;

            for (let idx = 0; idx < tree.children.length; idx++) {
                const firstLevelChildrenMod = { angleInRadians: 0, distanceToCenter: 1 };
                const element = tree.children[idx];

                const d = firstIteration(element, firstLevelChildrenMod, idx);

                if (d) result.children.push(d);
            }
        } else {
            const isFirstNode = childrenIdx === 0;
            const childrenDistanceToCenter = currentMod.distanceToCenter + 1;

            const angleBetweenChildrenInRadians = arcToAngleRadians(ALLOWED_NODE_SPACING, childrenDistanceToCenter);
            const childrenAngleSpan = (tree.children.length - 1) * angleBetweenChildrenInRadians;

            let desiredAngleToCenterChildren = childrenAngleSpan / 2;

            if (isFirstNode === true) result.x = polarToCartesianCoordinates(currentMod).x;

            for (let idx = 0; idx < tree.children.length; idx++) {
                const childrenMod = {
                    angleInRadians: currentMod.angleInRadians + idx * angleBetweenChildrenInRadians - desiredAngleToCenterChildren,
                    distanceToCenter: childrenDistanceToCenter,
                };

                const element = tree.children[idx];

                const d = firstIteration(element, childrenMod, idx);

                if (d) result.children.push(d);
            }
        }

        if (result.children.length === 0) delete result["children"];

        return result;
    }

    function handleOverlap(tree: Tree<Skill>) {
        let overlapInTree = true;
        let loopAvoider = -1;
        let result: Tree<Skill> = { ...tree };

        result = fixOverlapWithinSubTreesOfLevel1(tree);

        result = foo(result);

        //Fix overlap within each subtree
        //Check for level overlow
        //Fix level overflow if there is any
        //If there is overlap between subtrees fix all of them (the while loop)

        // while (overlapInTree && loopAvoider < 0) {
        //     const polarOverlap = checkForOverlap(result, rootNodeCoordinates);

        //     if (polarOverlap !== undefined) {
        //         const treesToShift = getTreesToShift(result, polarOverlap.nodesInConflict);

        //         result = shiftNodesClockWise(result, treesToShift, polarOverlap.biggestOverlapAngle, rootNodeCoordinates);
        //     } else {
        //         overlapInTree = false;
        //     }
        //     loopAvoider++;
        // }

        return result;

        function foo(tree: Tree<Skill>) {
            const subTrees = tree.children;

            if (!subTrees) return tree;

            const rotatedSubtrees: Tree<Skill>[] = [];

            subTrees.forEach((subTree, idx) => {
                const subTreeIds: string[] = [];

                extractTreeIds(subTree, subTreeIds);

                rotatedSubtrees.push(shiftNodesClockWise(subTree, { byBiggestOverlap: subTreeIds, byHalfOfBiggestOverlap: [] }, 1.5 * idx));
            });

            return { ...tree, children: rotatedSubtrees };
        }
    }

    function fixOverlapWithinSubTreesOfLevel1(tree: Tree<Skill>): Tree<Skill> {
        const subTrees = tree.children;

        if (!subTrees) return tree;

        const subTreesWithoutOverlap: Tree<Skill>[] = [];

        subTrees.forEach((subTree, idx) => {
            const subTreeWithoutOverlap = fixOverlapWithinTree(subTree, idx);

            subTreesWithoutOverlap.push(subTreeWithoutOverlap);
        });

        return { ...tree, children: subTreesWithoutOverlap };

        function fixOverlapWithinTree(subTree: Tree<Skill>, idx: number) {
            let result: Tree<Skill> = { ...subTree };

            let overlapWithinTree = true;
            //🚨 deberia ser la depth del arbol, idealmente no deberia haber
            let loopAvoider = 0;

            while (overlapWithinTree && loopAvoider < 10) {
                const polarOverlap = checkForOverlap(result);

                if (polarOverlap === undefined) overlapWithinTree = false;
                console.log("polarOverlap", polarOverlap);
                if (polarOverlap !== undefined) {
                    //We append the rootNode to the subTree so that the path finding functions can work correctly
                    const subTreeWithRootNode = { ...tree, children: [subTree] };
                    const treesToShift = getTreesToShift(subTreeWithRootNode, polarOverlap.nodesInConflict);

                    console.log(treesToShift);

                    result = shiftNodesClockWise(result, treesToShift, polarOverlap.biggestOverlapAngle);
                }
                loopAvoider++;
            }

            return result;
        }
    }

    function checkForOverlap(tree: Tree<Skill>): PolarOverlapCheck {
        //The first contour is from the rightmost tree instead of the leftmost
        const contourByLevelWithUnorderedContours: { [key: string]: PolarContour[] } = {};
        getTreeContourByLevel(tree, contourByLevelWithUnorderedContours);

        const treeLevels = Object.keys(contourByLevelWithUnorderedContours);

        const contourByLevel = { ...contourByLevelWithUnorderedContours };

        treeLevels.forEach((level) => {
            contourByLevel[level] = contourByLevel[level].reverse();
        });

        let result: PolarOverlapCheck = undefined;

        treeLevels.forEach((key) => {
            const levelContour = contourByLevel[key];

            const levelBiggestOverlap = getLevelBiggestOverlap(levelContour);

            const updateBiggestTreeOverlap =
                levelBiggestOverlap !== undefined && (result === undefined || levelBiggestOverlap.biggestOverlapAngle >= result.biggestOverlapAngle);

            if (updateBiggestTreeOverlap) result = { ...levelBiggestOverlap };
        });

        return result as PolarOverlapCheck;
    }

    function getLevelBiggestOverlap(levelContour: PolarContour[]) {
        let result: PolarOverlapCheck = undefined;

        for (let idx = 0; idx < levelContour.length; idx++) {
            const isOnLastContour = idx === levelContour.length - 1;

            //We return on the last item because we compare the current contour with the next one, and the next contour doesn't exist on this iteration
            if (isOnLastContour) return result;

            const currentContour = levelContour[idx];
            const nextContour = levelContour[idx + 1];

            //I define two nodes perfectly overlapping as poor spacing and not overlap
            console.log("💀", nextContour.leftNode, currentContour.rightNode);
            const overlapBetweenThisAndNextContour = checkForOverlapBetweenNodes(nextContour.leftNode, currentContour.rightNode);
            const poorSpacing = checkForPoorSpacing(nextContour.leftNode, currentContour.rightNode);
            console.log("💀");

            if (overlapBetweenThisAndNextContour)
                result = {
                    biggestOverlapAngle: overlapBetweenThisAndNextContour,
                    nodesInConflict: [currentContour.rightNode.id, nextContour.leftNode.id],
                };

            if (overlapBetweenThisAndNextContour === undefined && poorSpacing !== undefined) {
                console.log(
                    "poorspacing",
                    poorSpacing,
                    arcToAngleRadians(ALLOWED_NODE_SPACING, nextContour.leftNode.distanceToCenter),
                    arcToAngleRadians(ALLOWED_NODE_SPACING, nextContour.leftNode.distanceToCenter) - poorSpacing
                );
                result = {
                    biggestOverlapAngle: arcToAngleRadians(ALLOWED_NODE_SPACING, nextContour.leftNode.distanceToCenter) - poorSpacing,
                    nodesInConflict: [currentContour.rightNode.id, nextContour.leftNode.id],
                };
            }
        }

        return result;

        function checkForOverlapBetweenNodes(nextContourLeftNode: PolarCoordinate, currentContourRightNode: PolarCoordinate): undefined | number {
            //If the rightToLeft angle is larger than leftToRight then we have overlap
            const leftAngleNormalized = ifComplementSmallerThanAngleReturnIt(nextContourLeftNode.angleInRadians);
            const rightAngleNormalized = ifComplementSmallerThanAngleReturnIt(currentContourRightNode.angleInRadians);

            const rightToLeftAngle = leftAngleNormalized - rightAngleNormalized;
            const leftToRightAngle = 2 * Math.PI - rightToLeftAngle;

            const overlap = rightToLeftAngle < leftToRightAngle;

            if (!overlap) return undefined;

            return rightToLeftAngle + arcToAngleRadians(ALLOWED_NODE_SPACING, nextContourLeftNode.distanceToCenter);
        }

        function checkForPoorSpacing(nextContourLeftNode: PolarCoordinate, currentContourRightNode: PolarCoordinate): undefined | number {
            const deltaAngle = Math.abs(Math.abs(nextContourLeftNode.angleInRadians) - Math.abs(currentContourRightNode.angleInRadians));

            const roundedDelta = parseFloat(deltaAngle.toFixed(5));

            if (roundedDelta < arcToAngleRadians(ALLOWED_NODE_SPACING, nextContourLeftNode.distanceToCenter)) return roundedDelta;

            return undefined;
        }
    }
}

function ifComplementSmallerThanAngleReturnIt(angle: number) {
    const complement = angle - 2 * Math.PI;

    if (Math.abs(angle) < Math.abs(complement)) return angle;

    return complement;
}

function shiftNodesClockWise(
    result: Tree<Skill>,
    treesToShift: { byBiggestOverlap: string[]; byHalfOfBiggestOverlap: string[] },
    overlapAngle: number
) {
    const shiftAngleForTree = getShiftAngleForTree(result.data.id);

    const treeCoordBeforeShift = cartesianToPolarCoordinates({ x: result.x, y: result.y }, UNCENTERED_ROOT_COORDINATES);

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

function getTreeContourByLevel(tree: Tree<Skill>, result: { [key: string]: PolarContour[] }) {
    //Base Case 👇

    if (!tree.children) return;

    //Recursive Case 👇

    const leftmostNode = tree.children[tree.children.length - 1];
    const rightmostNode = tree.children[0];

    const key = `${tree.level + 1}`;

    const leftmostNodePolarCoordinates = {
        ...cartesianToPolarCoordinates({ x: leftmostNode.x, y: leftmostNode.y }, UNCENTERED_ROOT_COORDINATES),
        id: leftmostNode.data.id,
    };
    const rightmostNodetNodePolarCoordinates = {
        ...cartesianToPolarCoordinates({ x: rightmostNode.x, y: rightmostNode.y }, UNCENTERED_ROOT_COORDINATES),
        id: rightmostNode.data.id,
    };

    const contourToAppend: PolarContour = {
        leftNode: leftmostNodePolarCoordinates,
        rightNode: rightmostNodetNodePolarCoordinates,
    };

    if (result[key]) result[key] = [...result[key], contourToAppend];
    if (!result[key]) result[key] = [contourToAppend];

    for (let i = 0; i < tree.children.length; i++) {
        const element = tree.children[i];

        getTreeContourByLevel(element, result);
    }
}

function arcToAngleRadians(arcLength: number, circleRadius: number) {
    if (circleRadius === 0) return 0;
    return arcLength / circleRadius;
}

function polarToCartesianCoordinates(coord: PolarCoordinate) {
    const x = coord.distanceToCenter * Math.cos(coord.angleInRadians);
    const y = coord.distanceToCenter * Math.sin(coord.angleInRadians);

    return { x, y };
}

function cartesianToPolarCoordinates(point: { x: number; y: number }, center: { x: number; y: number }): PolarCoordinate {
    const translatedX = point.x - center.x;
    const translatedY = point.y - center.y;

    const angleInRadians = Math.atan2(translatedY, translatedX);

    const distanceToCenter = Math.sqrt(Math.pow(translatedX, 2) + Math.pow(translatedY, 2));

    if (angleInRadians < 0) {
        const result = roundPolarCoordinates({ angleInRadians: angleInRadians + 2 * Math.PI, distanceToCenter });
        return result;
    }

    const result = roundPolarCoordinates({ angleInRadians, distanceToCenter });
    return result;
}

function roundPolarCoordinates(pc: PolarCoordinate): PolarCoordinate {
    const roundedDistance = Math.round(pc.distanceToCenter);

    const roundedAngle = parseFloat(pc.angleInRadians.toFixed(5));

    return { angleInRadians: roundedAngle, distanceToCenter: roundedDistance };
}

function getTreesToShift(result: Tree<Skill>, nodesInConflict: [string, string]) {
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
