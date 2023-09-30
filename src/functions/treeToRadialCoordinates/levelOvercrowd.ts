import { Dictionary } from "@reduxjs/toolkit";
import { ALLOWED_NODE_SPACING } from "../../parameters";
import { NodeQtyPerLevel, NormalizedNode, UpdateRadiusPerLevelTable } from "../../types";
import { arcToAngleRadians } from "../coordinateSystem";
import { countNodesPerLevel } from "../extractInformationFromTree";
import { updateRadiusPerLevelTable } from "../misc";
import { DistanceToCenterPerLevel, getDistanceToCenterPerLevel } from "./overlap";

export function radiusPerLevelToAvoidLevelOvercrowd(nodes: Dictionary<NormalizedNode>) {
    const nodesPerLevel = countNodesPerLevel(nodes);

    let distanceToCenterPerLevel = getDistanceToCenterPerLevel(nodes);

    let levelOverflow: UpdateRadiusPerLevelTable = undefined;

    do {
        levelOverflow = checkForLevelOvercrowd(nodesPerLevel, distanceToCenterPerLevel);

        if (levelOverflow) {
            distanceToCenterPerLevel = updateRadiusPerLevelTable(distanceToCenterPerLevel, levelOverflow);
        }
    } while (levelOverflow !== undefined);

    return distanceToCenterPerLevel;

    function checkForLevelOvercrowd(nodesPerLevel: NodeQtyPerLevel, distanceToCenterPerLevel: DistanceToCenterPerLevel): UpdateRadiusPerLevelTable {
        const levels = Object.keys(nodesPerLevel);

        for (const levelString of levels) {
            const level = parseInt(levelString);

            const levelPerimeter = Math.PI * 2 * distanceToCenterPerLevel[level];

            const averageArcLengthBetweenNodes = levelPerimeter / nodesPerLevel[level];

            const averageAngleBetweenNodes = arcToAngleRadians(averageArcLengthBetweenNodes, distanceToCenterPerLevel[level]);

            const minimumAngleBetweenNodes = arcToAngleRadians(ALLOWED_NODE_SPACING, distanceToCenterPerLevel[level]);

            const overflowInLevel = averageAngleBetweenNodes < minimumAngleBetweenNodes;

            if (overflowInLevel) {
                const correctDistance = (ALLOWED_NODE_SPACING * nodesPerLevel[level]) / (2 * Math.PI);

                const distanceToDisplace = correctDistance - distanceToCenterPerLevel[level];

                return { distanceToDisplace, level };
            }
        }

        return undefined;
    }
}
