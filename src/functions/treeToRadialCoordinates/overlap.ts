import { ALLOWED_NODE_SPACING, UNCENTERED_ROOT_COORDINATES } from "../../parameters";
import { PolarContour, PolarCoordinate, PolarOverlapCheck, Skill, Tree } from "../../types";
import {
    angleBetweenPolarCoordinates,
    arcToAngleRadians,
    cartesianToPositivePolarCoordinates,
    polarToCartesianCoordinates,
} from "../coordinateSystem";
import {
    extractTreeIds,
    findLowestCommonAncestorIdOfNodes,
    getRadialTreeContourByLevel,
    returnPathFromRootToNode,
} from "../extractInformationFromTree";
import { fixLevelOverflow } from "./levelOverflow";

export function handleOverlap(tree: Tree<Skill>) {
    let result: Tree<Skill> = { ...tree };

    result = fixLevelOverflow(result);

    result = fixOverlapWithinSubTreesOfLevel1(result);

    result = mockShiftSubTreesToMinimizeSpace(result);

    return result;

    function mockShiftSubTreesToMinimizeSpace(tree: Tree<Skill>) {
        const subTrees = tree.children;

        if (!subTrees.length) return tree;

        let result = { ...tree };

        const subTreesContour = getSubTreesContour(subTrees);

        subTrees.forEach((_, idx) => {
            const isLastSubTree = idx === subTrees.length - 1;

            if (!isLastSubTree) {
                const currentSubTreeContour = subTreesContour[idx];
                const nextSubTreeContour = subTreesContour[idx + 1];

                const overlap = checkForOverlapBetweenContours(currentSubTreeContour, nextSubTreeContour);

                if (overlap) {
                    const treesToShift = getIdsFromCurrentToLastSubTrees(subTrees, idx);

                    result = shiftNodesCounterClockWise(
                        result,
                        { byBiggestOverlap: treesToShift, byHalfOfBiggestOverlap: [] },
                        overlap.biggestOverlapAngle
                    );
                    //agarro todas las ids del subtree en el que estoy ahora
                    //Y todas las ids de todos los subtrees a la derecha de este
                    //Muevo todos esos subtrees overlap amount
                }
            }

            // const subTreeIds: string[] = [];

            // extractTreeIds(subTree, subTreeIds);

            // rotatedSubtrees.push(shiftNodesCounterClockWise(subTree, { byBiggestOverlap: subTreeIds, byHalfOfBiggestOverlap: [] }, 1.2 * idx));
        });

        return result;

        function getIdsFromCurrentToLastSubTrees(subTrees: Tree<Skill>[], currentSubTreeIdx: number) {
            const result: string[] = [];

            const subTreesToExtactIds = subTrees.slice(currentSubTreeIdx + 1);

            subTreesToExtactIds.forEach((subTree) => {
                extractTreeIds(subTree, result);
            });

            return result;
        }

        function checkForOverlapBetweenContours(
            currentSubTreeContour: { contourByLevel: { [x: string]: PolarContour[] }; treeLevels: string[] },
            nextSubTreeContour: { contourByLevel: { [x: string]: PolarContour[] }; treeLevels: string[] }
        ): PolarOverlapCheck {
            let result: PolarOverlapCheck = undefined;

            const levelsOfShallowerTree = getLevelsOfShallowerTree();

            levelsOfShallowerTree.forEach((level) => {
                const currentSubTreeLevelContour = currentSubTreeContour.contourByLevel[level];
                const currentSubTreeLevelLeftmostNode = currentSubTreeLevelContour[0].leftNode;
                const currentSubTreeLevelRightmostNode = currentSubTreeLevelContour[currentSubTreeLevelContour.length - 1].rightNode;
                const currentSubTreeLevelOuterContour: PolarContour[] = [
                    { leftNode: currentSubTreeLevelLeftmostNode, rightNode: currentSubTreeLevelRightmostNode },
                ];

                const nextSubTreeLevelContour = nextSubTreeContour.contourByLevel[level];
                const nextSubTreeLevelLeftmostNode = nextSubTreeLevelContour[0].leftNode;
                const nextSubTreeLevelRightmostNode = nextSubTreeLevelContour[nextSubTreeLevelContour.length - 1].rightNode;
                const nextSubTreeLevelOuterContour: PolarContour[] = [
                    { leftNode: nextSubTreeLevelLeftmostNode, rightNode: nextSubTreeLevelRightmostNode },
                ];

                const levelContour = [...currentSubTreeLevelOuterContour, ...nextSubTreeLevelOuterContour];

                const levelBiggestOverlap = getLevelBiggestOverlap(levelContour);

                const updateBiggestTreeOverlap =
                    levelBiggestOverlap !== undefined &&
                    (result === undefined || levelBiggestOverlap.biggestOverlapAngle >= result.biggestOverlapAngle);

                if (updateBiggestTreeOverlap) result = { ...levelBiggestOverlap };
            });

            return result;

            function getLevelsOfShallowerTree() {
                if (currentSubTreeContour.treeLevels.length < nextSubTreeContour.treeLevels.length) return currentSubTreeContour.treeLevels;

                return nextSubTreeContour.treeLevels;
            }
        }
    }

    function getSubTreesContour(subTrees: Tree<Skill>[]) {
        const result: { contourByLevel: { [x: string]: PolarContour[] }; treeLevels: string[] }[] = [];

        subTrees.forEach((subTree) => {
            const subTreeWithRootNode = { ...tree, children: [subTree] };

            const contourByLevel = getRadialTreeContourByLevel(subTreeWithRootNode);

            result.push(contourByLevel);
        });

        return result;
    }
}

function fixOverlapWithinSubTreesOfLevel1(tree: Tree<Skill>): Tree<Skill> {
    const subTrees = tree.children;

    if (!subTrees.length) return tree;

    const subTreesWithoutOverlap: Tree<Skill>[] = [];

    subTrees.forEach((subTree) => {
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

                result = shiftNodesCounterClockWise(result, treesToShift, polarOverlap.biggestOverlapAngle);
            }

            loopAvoider++;
        }

        return result;
    }
}

function checkForOverlap(tree: Tree<Skill>): PolarOverlapCheck {
    //The first contour is from the rightmost tree instead of the leftmost
    const { contourByLevel, treeLevels } = getRadialTreeContourByLevel(tree);

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
