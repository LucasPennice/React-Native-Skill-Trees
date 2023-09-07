import { ALLOWED_NODE_SPACING } from "../../parameters";
import { Skill, Tree } from "../../types";
import { arcToAngleRadians } from "../coordinateSystem";
import { DistanceToCenterPerLevel, getDistanceToCenterPerLevel } from "./overlap";

//THIS VALUE OF PI SHOULD BE USE TO CHECK FOR OVERFLOW
export const ROUNDED_2PI = 6.289;

type LevelOverflow = { distanceToDisplace: number; level: number } | undefined;

type NodeQtyPerLevel = { [key: number]: number };

export function radiusPerLevelToAvoidLevelOverflow(treeInFinalPosition: Tree<Skill>) {
    const nodesPerLevel = countNodesPerLevel(treeInFinalPosition);
    let distanceToCenterPerLevel = getDistanceToCenterPerLevel(treeInFinalPosition);

    let levelOverflow: LevelOverflow = undefined;

    do {
        levelOverflow = checkForLevelOverflow(nodesPerLevel, distanceToCenterPerLevel);
        if (levelOverflow) {
            distanceToCenterPerLevel = updateDistanceToCenterTable(distanceToCenterPerLevel, levelOverflow);
        }
    } while (levelOverflow !== undefined);

    return distanceToCenterPerLevel;

    function updateDistanceToCenterTable(distanceToCenterPerLevel: DistanceToCenterPerLevel, levelOverflow: LevelOverflow) {
        if (!levelOverflow) throw new Error("levelOverflow undefined at updatedDistanceToCenterTable");

        const result: DistanceToCenterPerLevel = { ...distanceToCenterPerLevel };

        const levelsString = Object.keys(distanceToCenterPerLevel);

        for (const levelString of levelsString) {
            const level = parseInt(levelString);

            if (level >= levelOverflow.level) {
                const timesToIncrease = level - levelOverflow.level + 1;

                result[level] = result[level] + levelOverflow.distanceToDisplace * timesToIncrease;
            }
        }

        return result;
    }

    function checkForLevelOverflow(nodesPerLevel: NodeQtyPerLevel, distanceToCenterPerLevel: DistanceToCenterPerLevel): LevelOverflow {
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

function countNodesPerLevel(rootNode: Tree<Skill>): NodeQtyPerLevel {
    let nodesPerLevel: { [key: number]: string[] } = {};

    nodeIdsPerLevel(rootNode, nodesPerLevel);

    const levels = Object.keys(nodesPerLevel);

    const result: NodeQtyPerLevel = {};

    levels.forEach((levelString) => {
        const level = parseInt(levelString);

        result[level] = nodesPerLevel[level].length;
    });

    return result;

    function nodeIdsPerLevel(rootNode: Tree<Skill>, table: { [key: number]: string[] }) {
        if (table[rootNode.level]) {
            table[rootNode.level].push(rootNode.nodeId);
        } else {
            table[rootNode.level] = [rootNode.nodeId];
        }

        if (!rootNode.children.length) return undefined;

        for (let i = 0; i < rootNode.children.length; i++) {
            nodeIdsPerLevel(rootNode.children[i], table);
        }

        return undefined;
    }
}
