import { CIRCLE_SIZE, DISTANCE_BETWEEN_GENERATIONS } from "../../parameters";
import { Skill, Tree } from "../../types";
import {
    angleBetweenPolarCoordinates,
    arcToAngleRadians,
    cartesianToPositivePolarCoordinates,
    polarToCartesianCoordinates,
} from "../coordinateSystem";
import { mutateEveryTree } from "../mutateTree";
import { ALLOWED_NODE_SPACING, PolarContour, PolarCoordinate, UNCENTERED_ROOT_COORDINATES, getSubTreeContour } from "./general";

export function fixLevelOverflow(tree: Tree<Skill>) {
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
