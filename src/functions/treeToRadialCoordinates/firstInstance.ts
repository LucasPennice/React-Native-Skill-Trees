import { Dictionary } from "@reduxjs/toolkit";
import { ALLOWED_NODE_SPACING } from "../../parameters";
import { NormalizedNode, PolarCoordinate } from "../../types";
import { arcToAngleRadians, polarToCartesianCoordinates } from "../coordinateSystem";
import { DistanceToCenterPerLevel } from "./overlap";

type RadialTreeMod = PolarCoordinate & { level: number };

const DEFAULT_CURRENT_TREE_MOD: RadialTreeMod = { angleInRadians: 0, distanceToCenter: 0, level: 0 };

export function firstIteration(nodes: Dictionary<NormalizedNode>, rootNodeId: string, distanceToCenterPerLevel: DistanceToCenterPerLevel) {
    const result: Dictionary<NormalizedNode> = {};

    recursive(rootNodeId);

    return result;

    function recursive(currentNodeId: string, currentTreeMod?: RadialTreeMod, childrenIdx?: number) {
        //Note: currentNodeId will be the root node id for the first call

        const currentMod: RadialTreeMod = currentTreeMod !== undefined ? currentTreeMod : DEFAULT_CURRENT_TREE_MOD;

        //Base Case 👇
        const treeCoord = polarToCartesianCoordinates(currentMod);

        const currentNode = nodes[currentNodeId];

        if (!currentNode) throw new Error("currentNode undefined at firstIteration");

        const currentNodeWithCoordinates = { ...currentNode, x: treeCoord.x, y: treeCoord.y, level: currentMod.level };

        result[currentNodeId] = currentNodeWithCoordinates;

        if (!currentNodeWithCoordinates.childrenIds.length) return;

        //Recursive Case 👇

        const isFirstNode = childrenIdx === 0;
        const childrenDistanceToCenter = distanceToCenterPerLevel[currentMod.level + 1];

        const angleBetweenChildren = arcToAngleRadians(ALLOWED_NODE_SPACING, childrenDistanceToCenter);
        const childrenAngleSpan = (currentNode.childrenIds.length - 1) * angleBetweenChildren;

        let desiredAngleToCenterChildren = childrenAngleSpan / 2;

        if (isFirstNode === true) currentNodeWithCoordinates.x = polarToCartesianCoordinates(currentMod).x;

        for (let idx = 0; idx < currentNode.childrenIds.length; idx++) {
            const childrenMod: RadialTreeMod = {
                angleInRadians: currentMod.angleInRadians + idx * angleBetweenChildren - desiredAngleToCenterChildren,
                distanceToCenter: childrenDistanceToCenter,
                level: currentMod.level + 1,
            };

            const childId = currentNode.childrenIds[idx];

            recursive(childId, childrenMod, idx);
        }
    }
}
