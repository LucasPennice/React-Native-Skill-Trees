import { Skill, Tree } from "../../types";
import { angleBetweenPolarCoordinates, arcToAngleRadians, cartesianToPositivePolarCoordinates } from "../coordinateSystem";
import { extractTreeIds } from "../extractInformationFromTree";
import {
    ALLOWED_NODE_SPACING,
    PolarContour,
    PolarCoordinate,
    PolarOverlapCheck,
    UNCENTERED_ROOT_COORDINATES,
    getTreesToShiftForCircularTree,
    shiftNodesClockWise,
} from "./general";
import { fixLevelOverflow } from "./levelOverflow";

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
        const subTreeWithoutOverlap = fixOverlapWithinTree(subTree);
        subTreesWithoutOverlap.push(subTreeWithoutOverlap);
    });

    return { ...tree, children: subTreesWithoutOverlap };

    function fixOverlapWithinTree(subTree: Tree<Skill>) {
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
