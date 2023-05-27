import { ALLOWED_NODE_SPACING, UNCENTERED_ROOT_COORDINATES } from "../../parameters";
import { LevelOverflow, PolarContour, PolarContourByLevel, Skill, Tree } from "../../types";
import { angleBetweenPolarCoordinates, arcToAngleRadians, cartesianToPositivePolarCoordinates, movePointParallelToVector } from "../coordinateSystem";
import { findParentOfNode, getSubTreesContour } from "../extractInformationFromTree";
import { mutateEveryTree } from "../mutateTree";
import { DistanceToCenterPerLevel } from "./overlap";

//THIS VALUE OF PI SHOULD BE USE TO CHECK FOR OVERFLOW
export const ROUNDED_2PI = 6.289;

export function checkForLevelOverflow(treeInFinalPosition: Tree<Skill>): LevelOverflow {
    const subTrees = treeInFinalPosition.children;

    let result: LevelOverflow = undefined;

    if (!subTrees.length) return result;

    const subTreesContour = getSubTreesContour(treeInFinalPosition);

    const subTreesOuterContours = formatSubTreesContour(subTreesContour);

    const angleSpanPerLevel = getAngleSpanPerLevel(subTreesOuterContours);

    const angleSpans = Object.values(angleSpanPerLevel);

    const overflowAmount = angleSpans.find((span) => span > ROUNDED_2PI);
    const overflowLevel = angleSpans.findIndex((span) => span > ROUNDED_2PI) + 1;

    if (overflowAmount === undefined) return undefined;

    return { overflow: overflowAmount, level: overflowLevel };

    function formatSubTreesContour(subTreesContour: PolarContourByLevel[]) {
        const result: PolarContourByLevel = { contourByLevel: {}, treeLevels: [] };

        subTreesContour.forEach((treeContour) => {
            treeContour.treeLevels.forEach((level) => {
                const levelContour = treeContour.contourByLevel[level];

                const leftmostNode = levelContour[0].leftNode;
                const rightmostNode = levelContour[levelContour.length - 1].rightNode;

                const outerContourOfLevel: PolarContour = { leftNode: leftmostNode, rightNode: rightmostNode };

                if (!result.contourByLevel[level]) {
                    result.contourByLevel[level] = [outerContourOfLevel];
                } else {
                    result.contourByLevel[level].push(outerContourOfLevel);
                }

                if (!result.treeLevels.length || result.treeLevels.length < parseInt(level)) {
                    const foo = Array.from(Array(parseInt(level) + 1).keys()).map((l) => `${l}`);
                    const newTreeLevels = foo.slice(1, foo.length);
                    result.treeLevels = newTreeLevels;
                }
            });
        });
        return result;
    }
}

function getAngleSpanPerLevel(subTreesOuterContours: PolarContourByLevel) {
    const result: { [key: string]: number } = {};
    const levels = subTreesOuterContours.treeLevels.map((l) => parseInt(l));

    levels.forEach((level) => {
        const currentLevelContours = subTreesOuterContours.contourByLevel[level];

        currentLevelContours.forEach((contour, idx) => {
            //If there is only one node in the entire tree in that level
            if (currentLevelContours.length === 1) result[level] = 0;
            const isLastContour = idx === currentLevelContours.length - 1;

            let totalAngle = 0;

            let treeAngle = Math.abs(angleBetweenPolarCoordinates(contour.leftNode, contour.rightNode));

            totalAngle += treeAngle;

            if (!isLastContour) {
                const nextContour = currentLevelContours[idx + 1];

                let angleBetweenTrees = angleBetweenPolarCoordinates(contour.rightNode, nextContour.leftNode);

                totalAngle += Math.abs(angleBetweenTrees);
            }

            if (result[level] === undefined) {
                result[level] = totalAngle;
            } else {
                result[level] += totalAngle;
            }
        });
    });

    //Here we add the padding that trees have between them one time
    levels.forEach((level) => {
        const originalDistanceToCenter = level;
        result[level] += arcToAngleRadians(ALLOWED_NODE_SPACING, originalDistanceToCenter);
    });

    return result;
}

export function fixLevelOverflow(tree: Tree<Skill>, distanceToCenterPerLevel: DistanceToCenterPerLevel) {
    const result = mutateEveryTree(tree, factoryUpdateRadiusOfTree(distanceToCenterPerLevel, tree));

    if (!result) throw new Error("result undefined at increaseRadiusOfLevelAndBelow");

    return result;
}

function factoryUpdateRadiusOfTree(distanceToCenterPerLevel: DistanceToCenterPerLevel, wholeTree: Tree<Skill>) {
    return function updateRadiusOfTree(tree: Tree<Skill>): Tree<Skill> {
        const result = { ...tree };

        if (result.level === 0) return result;

        const oldPolarCoord = cartesianToPositivePolarCoordinates({ x: result.x, y: result.y }, UNCENTERED_ROOT_COORDINATES);

        const newRadius = distanceToCenterPerLevel[tree.level];

        const parentNode = findParentOfNode(wholeTree, tree.nodeId);

        if (!parentNode) throw new Error("!parentNode at factoryUpdateRadiusOfTree");

        if (newRadius === oldPolarCoord.distanceToCenter) return result;

        const translatedCoord = translateNodeToNewDistanceFromCenter();

        return { ...result, x: translatedCoord.x, y: translatedCoord.y };

        function translateNodeToNewDistanceFromCenter() {
            const directionVector = { x: parentNode!.x, y: parentNode!.y };

            const deltaRadius = newRadius - oldPolarCoord.distanceToCenter;

            return movePointParallelToVector(directionVector, deltaRadius, { x: result.x, y: result.y });
        }
    };
}
