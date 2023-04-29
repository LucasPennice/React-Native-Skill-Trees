import { CIRCLE_SIZE, DISTANCE_BETWEEN_GENERATIONS } from "../../parameters";
import { Skill, Tree } from "../../types";
import {
    angleBetweenPolarCoordinates,
    arcToAngleRadians,
    cartesianToPositivePolarCoordinates,
    polarToCartesianCoordinates,
    returnSmallestBetweenAngleAndComplement,
} from "../coordinateSystem";
import { extractTreeIds, findTreeHeight } from "../extractInformationFromTree";
import { mutateEveryTree } from "../mutateTree";
import {
    ALLOWED_NODE_SPACING,
    PolarContour,
    PolarCoordinate,
    PolarOverlapCheck,
    UNCENTERED_ROOT_COORDINATES,
    getTreesToShiftForCircularTree,
    shiftNodesClockWise,
} from "./general";

export function handleOverlap(tree: Tree<Skill>) {
    let overlapInTree = true;
    let loopAvoider = -1;
    let result: Tree<Skill> = { ...tree };

    result = fixOverlapWithinSubTreesOfLevel1(tree);

    result = fixLevelOverflow(result);

    result = mockShiftSubTreesToMinimizeSpace(result);

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

    function mockShiftSubTreesToMinimizeSpace(tree: Tree<Skill>) {
        const subTrees = tree.children;

        if (!subTrees) return tree;

        const rotatedSubtrees: Tree<Skill>[] = [];

        subTrees.forEach((subTree, idx) => {
            const subTreeIds: string[] = [];

            extractTreeIds(subTree, subTreeIds);

            rotatedSubtrees.push(shiftNodesClockWise(subTree, { byBiggestOverlap: subTreeIds, byHalfOfBiggestOverlap: [] }, 1.2 * idx));
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
        let loopAvoider = 0;

        while (overlapWithinTree && loopAvoider < 10) {
            const polarOverlap = checkForOverlap(result);

            if (polarOverlap === undefined) overlapWithinTree = false;
            if (polarOverlap !== undefined) {
                //We append the rootNode to the subTree so that the path finding functions can work correctly
                const subTreeWithRootNode = { ...tree, children: [subTree] };
                const treesToShift = getTreesToShiftForCircularTree(subTreeWithRootNode, polarOverlap.nodesInConflict);

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

    function getTreeContourByLevel(tree: Tree<Skill>, result: { [key: string]: PolarContour[] }) {
        //Base Case 👇

        if (!tree.children) return;

        //Recursive Case 👇

        const leftmostNode = tree.children[tree.children.length - 1];
        const rightmostNode = tree.children[0];

        const key = `${tree.level + 1}`;

        const leftmostNodePolarCoordinates = {
            ...cartesianToPositivePolarCoordinates({ x: leftmostNode.x, y: leftmostNode.y }, UNCENTERED_ROOT_COORDINATES),
            id: leftmostNode.data.id,
        };
        const rightmostNodetNodePolarCoordinates = {
            ...cartesianToPositivePolarCoordinates({ x: rightmostNode.x, y: rightmostNode.y }, UNCENTERED_ROOT_COORDINATES),
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
        const overlapBetweenThisAndNextContour = checkForOverlapBetweenNodes(nextContour.leftNode, currentContour.rightNode);
        const poorSpacing = checkForPoorSpacing(nextContour.leftNode, currentContour.rightNode);

        if (overlapBetweenThisAndNextContour)
            result = {
                biggestOverlapAngle: overlapBetweenThisAndNextContour,
                nodesInConflict: [currentContour.rightNode.id, nextContour.leftNode.id],
            };

        if (overlapBetweenThisAndNextContour === undefined && poorSpacing !== undefined) {
            result = {
                biggestOverlapAngle: arcToAngleRadians(ALLOWED_NODE_SPACING, nextContour.leftNode.distanceToCenter) - poorSpacing,
                nodesInConflict: [currentContour.rightNode.id, nextContour.leftNode.id],
            };
        }
    }

    return result;

    function checkForOverlapBetweenNodes(nextContourLeftNode: PolarCoordinate, currentContourRightNode: PolarCoordinate): undefined | number {
        //If the rightToLeft angle is larger than leftToRight then we have overlap
        const rightToLeftAngle = angleBetweenPolarCoordinates(currentContourRightNode, nextContourLeftNode);
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

function fixLevelOverflow(tree: Tree<Skill>) {
    const subTrees = tree.children;

    if (!subTrees) return tree;

    let treeAngleSpanPerLevel: number[] = [];

    subTrees.forEach((subTree) => {
        const subTreeContour: PolarContour[] = [];

        getSubTreeContour(subTree, subTreeContour);

        updateLevelAngleSpan(subTreeContour, treeAngleSpanPerLevel);
    });

    const levelOverflow = checkForLevelOverlow(treeAngleSpanPerLevel);

    if (!levelOverflow) return tree;

    const updatedTree = increaseRadiusOfLevelAndBelow(tree, levelOverflow!);

    return updatedTree;

    function increaseRadiusOfLevelAndBelow(tree: Tree<Skill>, levelOverflow: LevelOverflow) {
        if (!levelOverflow) throw "levelOverflow undefined at increaseRadiusOfLevelAndBelow";

        const result = mutateEveryTree(tree, factoryUpdateRadiusOfTree(levelOverflow));

        if (!result) throw "result undefined at increaseRadiusOfLevelAndBelow";

        return result;
    }
}

function factoryUpdateRadiusOfTree(levelOverflow: LevelOverflow) {
    return function updateRadiusOfTree(tree: Tree<Skill>): Tree<Skill> {
        const result = { ...tree };

        if (tree.level < levelOverflow!.level) return result;

        const oldPolarCoord = cartesianToPositivePolarCoordinates({ x: result.x, y: result.y }, UNCENTERED_ROOT_COORDINATES);
        const newRadius = (levelOverflow!.overflow * oldPolarCoord.distanceToCenter) / (2 * Math.PI);

        const newCoord = polarToCartesianCoordinates({ angleInRadians: oldPolarCoord.angleInRadians, distanceToCenter: newRadius });

        return { ...result, x: newCoord.x, y: newCoord.y };
    };
}

type LevelOverflow = undefined | { overflow: number; level: number };

function checkForLevelOverlow(treeAngleSpanPerLevel: number[]): LevelOverflow {
    const overflowAngle = treeAngleSpanPerLevel.find((span) => span > 2 * Math.PI);
    const overflowLevel = treeAngleSpanPerLevel.findIndex((span) => span > 2 * Math.PI);

    if (overflowAngle === undefined) return undefined;

    return { level: overflowLevel, overflow: overflowAngle };
}

function angleSpanOfLevel(leftmostNode: PolarContour["leftNode"], rightmostNode: PolarContour["rightNode"]) {
    const leftPolarCoordinates: PolarCoordinate = { angleInRadians: leftmostNode.angleInRadians, distanceToCenter: leftmostNode.distanceToCenter };
    const rightPolarCoordinates: PolarCoordinate = { angleInRadians: rightmostNode.angleInRadians, distanceToCenter: rightmostNode.distanceToCenter };

    const angleBetweenNodes = angleBetweenPolarCoordinates(rightPolarCoordinates, leftPolarCoordinates);

    const scaledDownCircleSize = (2 * CIRCLE_SIZE) / DISTANCE_BETWEEN_GENERATIONS;

    const angleSpanPadding = arcToAngleRadians(ALLOWED_NODE_SPACING + scaledDownCircleSize, leftPolarCoordinates.distanceToCenter);

    const result = angleBetweenNodes + angleSpanPadding;

    return result;
}

function updateLevelAngleSpan(subTreeContour: PolarContour[], treeAngleSpanPerLevel: number[]) {
    //Because the root node of the subtrees is at level one, and we use the level as the index for subTreeContour,
    //The first position of the contour contains undefined, so we ignore the first position

    const contourQty = subTreeContour.length - 1;

    for (let level = 1; level <= contourQty; level++) {
        const levelContour = subTreeContour[level];

        const levelAngleSpan = angleSpanOfLevel(levelContour.leftNode, levelContour.rightNode);

        if (treeAngleSpanPerLevel[level] !== undefined) treeAngleSpanPerLevel[level] = treeAngleSpanPerLevel[level] + levelAngleSpan;
        if (treeAngleSpanPerLevel[level] === undefined) treeAngleSpanPerLevel[level] = levelAngleSpan;
    }
}

function getSubTreeContour(tree: Tree<Skill>, treeContour: PolarContour[]) {
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
