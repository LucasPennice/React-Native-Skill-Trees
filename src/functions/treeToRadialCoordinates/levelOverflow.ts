import { movePointParallelToVector } from "../../pages/viewingSkillTree/canvas/coordinateFunctions";
import { CIRCLE_SIZE, DISTANCE_BETWEEN_GENERATIONS } from "../../parameters";
import { Skill, Tree } from "../../types";
import { angleBetweenPolarCoordinates, arcToAngleRadians, cartesianToPositivePolarCoordinates } from "../coordinateSystem";
import { findParentOfNode } from "../extractInformationFromTree";
import { mutateEveryTree } from "../mutateTree";
import { ALLOWED_NODE_SPACING, PolarContour, PolarCoordinate, UNCENTERED_ROOT_COORDINATES, getSubTreeContour } from "./general";
import { getRadialTreeContourByLevel } from "./overlap";

export function fixLevelOverflow(tree: Tree<Skill>) {
    let updatedTree = { ...tree };
    let loopAvoider = 0;
    let levelOverflow: LevelOverflow | true = true;

    if (!updatedTree.children || !updatedTree.children.length) return tree;

    while (levelOverflow !== undefined && loopAvoider < 20) {
        let treeAngleSpanPerLevel: number[] = [];

        updatedTree.children!.forEach((subTree) => {
            const subTreeWithRootNode = { ...updatedTree, children: [subTree] };
            const radialTreeContour = getRadialTreeContourByLevel(subTreeWithRootNode);

            updateLevelAngleSpan(radialTreeContour, treeAngleSpanPerLevel);
        });

        levelOverflow = checkForLevelOverlow(treeAngleSpanPerLevel);

        console.log(levelOverflow);

        if (levelOverflow) updatedTree = increaseRadiusOfLevelAndBelow(updatedTree, levelOverflow!);
        loopAvoider++;
    }

    return updatedTree;

    function increaseRadiusOfLevelAndBelow(tree: Tree<Skill>, levelOverflow: LevelOverflow) {
        if (!levelOverflow) throw "levelOverflow undefined at increaseRadiusOfLevelAndBelow";

        const result = mutateEveryTree(tree, factoryUpdateRadiusOfTree(levelOverflow, tree));

        if (!result) throw "result undefined at increaseRadiusOfLevelAndBelow";

        return result;
    }
}

function factoryUpdateRadiusOfTree(levelOverflow: LevelOverflow, wholeTree: Tree<Skill>) {
    return function updateRadiusOfTree(tree: Tree<Skill>): Tree<Skill> {
        const result = { ...tree };

        if (tree.level < levelOverflow!.level) return result;

        const oldPolarCoord = cartesianToPositivePolarCoordinates({ x: result.x, y: result.y }, UNCENTERED_ROOT_COORDINATES);

        const radiusIncreaseIndex = levelOverflow!.overflow / (2 * Math.PI);

        const parentNode = findParentOfNode(wholeTree, tree.data.id);

        if (!parentNode) throw "!parentNode at factoryUpdateRadiusOfTree";

        const translatedCoord = translateNodeToNewDistanceFromCenter();

        return { ...result, x: translatedCoord.x, y: translatedCoord.y };

        function translateNodeToNewDistanceFromCenter() {
            const directionVector = { x: parentNode!.x, y: parentNode!.y };

            const deltaRadius = oldPolarCoord.distanceToCenter * (radiusIncreaseIndex - 1);

            return movePointParallelToVector(directionVector, deltaRadius, { x: result.x, y: result.y });
        }
    };
}

type LevelOverflow = undefined | { overflow: number; level: number };

function checkForLevelOverlow(treeAngleSpanPerLevel: number[]): LevelOverflow {
    const ROUNDED_2PI = 6.289;
    const overflowAngle = treeAngleSpanPerLevel.find((span) => span > ROUNDED_2PI);
    const overflowLevel = treeAngleSpanPerLevel.findIndex((span) => span > ROUNDED_2PI);

    if (overflowAngle === undefined) return undefined;

    return { level: overflowLevel, overflow: overflowAngle };
}

function angleSpanOfLevel(leftmostNode: PolarContour["leftNode"], rightmostNode: PolarContour["rightNode"], level: number) {
    const leftPolarCoordinates: PolarCoordinate = { angleInRadians: leftmostNode.angleInRadians, distanceToCenter: leftmostNode.distanceToCenter };
    const rightPolarCoordinates: PolarCoordinate = { angleInRadians: rightmostNode.angleInRadians, distanceToCenter: rightmostNode.distanceToCenter };

    const angleBetweenNodes = angleBetweenPolarCoordinates(rightPolarCoordinates, leftPolarCoordinates);

    const angleSpanPadding = arcToAngleRadians(ALLOWED_NODE_SPACING, level);

    const result = angleBetweenNodes + angleSpanPadding;

    return result;
}

function updateLevelAngleSpan(
    subTreeContour: { contourByLevel: { [x: string]: PolarContour[] }; treeLevels: string[] },
    treeAngleSpanPerLevel: number[]
) {
    //Because the root node of the subtrees is at level one, and we use the level as the index for subTreeContour,
    //The first position of the contour contains undefined, so we ignore the first position

    subTreeContour.treeLevels.forEach((l) => {
        const level = parseInt(l);
        const levelContours = subTreeContour.contourByLevel[level];

        levelContours.forEach((contour) => {
            const levelAngleSpan = parseFloat(angleSpanOfLevel(contour.leftNode, contour.rightNode, level).toFixed(3));

            if (treeAngleSpanPerLevel[level] !== undefined) treeAngleSpanPerLevel[level] = treeAngleSpanPerLevel[level] + levelAngleSpan;
            if (treeAngleSpanPerLevel[level] === undefined) treeAngleSpanPerLevel[level] = levelAngleSpan;
        });
    });
}
