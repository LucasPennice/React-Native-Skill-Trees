import { Skill, Tree } from "../types";
import { findDistanceBetweenNodesById } from "./extractInformationFromTree";
import { Coordinates, getTreesToShift, treeToCoordArray } from "./treeToHierarchicalCoordinates";

type PolarCoordinate = { angleInRadians: number; distanceToCenter: number };

type PolarContour = { leftNode: PolarCoordinate & { id: string }; rightNode: PolarCoordinate & { id: string } };

type PolarOverlapCheck = undefined | { biggestOverlapAngle: number; nodesInConflict: [string, string] };

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
                const firstLevelChildrenMod = { angleInRadians: anglePerChildren * idx, distanceToCenter: 1 };
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

        //Fix overlap within each subtree
        //Check for level overlow
        //Fix level overflow if there is any
        //If there is overlap between subtrees fix all of them (the while loop)

        // while (overlapInTree && loopAvoider < 0) {
        //     const polarOverlap = checkForOverlap(result, rootNodeCoordinates);

        //     if (polarOverlap !== undefined) {
        //         const treesToShift = getTreesToShift(result, polarOverlap.nodesInConflict);

        //         result = shiftNodes(result, treesToShift, polarOverlap.biggestOverlapAngle, rootNodeCoordinates);
        //     } else {
        //         overlapInTree = false;
        //     }
        //     loopAvoider++;
        // }

        return result;
    }

    function fixOverlapWithinSubTreesOfLevel1(tree: Tree<Skill>): Tree<Skill> {
        const subTrees = tree.children;

        if (!subTrees) return tree;

        const subTreesWithoutOverlap: Tree<Skill>[] = [];

        subTrees.forEach((subTree) => {
            const subTreeWithoutOverlap = fixOverlapWithinSubTree(subTree);

            subTreesWithoutOverlap.push(subTreeWithoutOverlap);
        });

        return { ...tree, children: subTreesWithoutOverlap };

        function fixOverlapWithinSubTree(subTree: Tree<Skill>) {
            let overlapInTree = true;
            let loopAvoider = -1;

            let result: Tree<Skill> = { ...subTree };

            while (overlapInTree && loopAvoider < 10) {
                const polarOverlap = checkForOverlap(result);

                if (polarOverlap !== undefined) {
                    const treesToShift = getTreesToShift(tree, polarOverlap.nodesInConflict);
                    result = shiftNodes(result, treesToShift, polarOverlap.biggestOverlapAngle);
                } else {
                    overlapInTree = false;
                }
                loopAvoider++;
            }

            return result;
        }
    }

    function checkForOverlap(tree: Tree<Skill>): PolarOverlapCheck {
        const contourByLevel: { [key: string]: PolarContour[] } = {};
        getTreeContourByLevel(tree, contourByLevel);

        let result: PolarOverlapCheck = undefined;

        const treeLevels = Object.keys(contourByLevel);

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

            // const nodeSpacing = nextContour.leftNode.angleInRadians - currentContour.rightNode.angleInRadians;

            // const poorSpacing = !overlap && nodeSpacing < ALLOWED_NODE_SPACING && (result === undefined || result.biggestOverlapAngle < nodeSpacing);

            if (overlapBetweenThisAndNextContour)
                result = {
                    biggestOverlapAngle: overlapBetweenThisAndNextContour,
                    nodesInConflict: [currentContour.rightNode.id, nextContour.leftNode.id],
                };

            // if (poorSpacing)
            //     result = {
            //         biggestOverlapAngle: ALLOWED_NODE_SPACING - nodeSpacing,
            //         nodesInConflict: [currentContour.rightNode.id, nextContour.leftNode.id],
            //     };
        }

        return result;

        function checkForOverlapBetweenNodes(leftNode: PolarCoordinate, rightNode: PolarCoordinate): undefined | number {
            return 0.07;
            const leftNodeAngleQuadrant = getAngleQuadrant(leftNode.angleInRadians);
            const rightNodeAngleQuadrant = getAngleQuadrant(rightNode.angleInRadians);

            console.log("----");
            console.log(leftNodeAngleQuadrant, rightNodeAngleQuadrant);
            const useLeftNodeNegativeAngle = checkForSpecialCase(leftNodeAngleQuadrant, rightNodeAngleQuadrant);
            console.log(useLeftNodeNegativeAngle);
            console.log("----");

            let leftNodeAngle = leftNode.angleInRadians;

            if (useLeftNodeNegativeAngle) leftNodeAngle = -leftNodeAngle;

            const overlap = rightNode.angleInRadians < leftNodeAngle;

            if (!overlap) return undefined;

            return Math.abs(leftNodeAngle - rightNode.angleInRadians);
        }

        function checkForSpecialCase(leftNodeAngleQuadrant: number, rightNodeAngleQuadrant: number) {
            //Let's say that we draw an arc (clockwise) from the left to the right node
            //If that arc intersects with the positive segment of the x axis then we return true
            //It seemed simpler to hard code the 7 edge cases insted of that logic
            if (rightNodeAngleQuadrant === 1 && leftNodeAngleQuadrant === 4) return true;
            if (rightNodeAngleQuadrant === 1 && leftNodeAngleQuadrant === 3) return true;
            if (rightNodeAngleQuadrant === 2 && leftNodeAngleQuadrant === 4) return true;
            if (rightNodeAngleQuadrant === 1 && leftNodeAngleQuadrant === 2) return true;
            if (rightNodeAngleQuadrant === 2 && leftNodeAngleQuadrant === 3) return true;
            if (rightNodeAngleQuadrant === 3 && leftNodeAngleQuadrant === 4) return true;
            return false;
        }
    }

    function shiftNodes(result: Tree<Skill>, treesToShift: { byBiggestOverlap: string[]; byHalfOfBiggestOverlap: string[] }, overlapAngle: number) {
        const shiftAngleForTree = getShiftAngleForTree(result.data.id);

        const treeCoordBeforeShift = cartesianToPolarCoordinates({ x: result.x, y: result.y }, UNCENTERED_ROOT_COORDINATES);

        console.log({ x: result.x, y: result.y });

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

            updatedTree.children.push(shiftNodes(element, treesToShift, overlapAngle));
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
}

function getTreeContourByLevel(tree: Tree<Skill>, result: { [key: string]: PolarContour[] }) {
    //Base Case 👇

    if (!tree.children) return;

    //Recursive Case 👇

    const rightmostNode = tree.children[0];
    const leftmostNode = tree.children[tree.children.length - 1];

    const key = `${tree.level}`;

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

    if (angleInRadians < 0) return { angleInRadians: angleInRadians + 2 * Math.PI, distanceToCenter };

    return { angleInRadians, distanceToCenter };
}

function getAngleQuadrant(angleRadians: number) {
    if (0 <= angleRadians && angleRadians < Math.PI / 2) return 1;
    if (Math.PI / 2 <= angleRadians && angleRadians < Math.PI) return 2;
    if (Math.PI <= angleRadians && angleRadians < (3 / 2) * Math.PI) return 3;
    return 4;
}
