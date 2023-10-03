import { AnglePerLevelTable, DistanceToCenterPerLevel, NormalizedNode, OuterPolarContour, UpdateRadiusPerLevelTable } from "@/types";
import { Dictionary } from "@reduxjs/toolkit";
import { ALLOWED_NODE_SPACING } from "../../parameters";
import { angleFromRightToLeftCounterClockWise, arcToAngleRadians, round8Decimals } from "../coordinateSystem";
import { getSubTreesOuterContour } from "../extractInformationFromTree";

export function checkForLevelOverflow(
    nodes: Dictionary<NormalizedNode>,
    rootId: string,
    radiusPerLevelTable: DistanceToCenterPerLevel
): UpdateRadiusPerLevelTable {
    const rootNode = nodes[rootId];
    if (!rootNode) throw new Error("undefined rootNode at checkForLevelOverflow");

    let result: UpdateRadiusPerLevelTable = undefined;

    if (!rootNode.childrenIds.length) return result;

    const subTreesContour = getSubTreesOuterContour(nodes, rootId);

    const angleSpanPerLevel = getAngleSpanPerLevelIncludingPadding(subTreesContour, radiusPerLevelTable);

    const angleSpans = Object.values(angleSpanPerLevel);

    const overflowAngle = angleSpans.find((span) => span > 2 * Math.PI);

    if (overflowAngle) {
        const overflowLevel = angleSpans.findIndex((span) => span > 2 * Math.PI) + 1;

        const distanceToDisplace = getDistanceToDisplace(overflowAngle, radiusPerLevelTable[overflowLevel]);

        return { distanceToDisplace, level: overflowLevel };
    }
    return undefined;

    function getDistanceToDisplace(overflowAngle: number, levelRadius: number) {
        if (overflowAngle < 2 * Math.PI) throw new Error("overflow angle less than 2pi at getDistanceToDisplace");

        const test = overflowAngle + arcToAngleRadians(ALLOWED_NODE_SPACING, levelRadius);

        const excessAngle = test - 2 * Math.PI;

        const percentageToIncrease = excessAngle / (2 * Math.PI);

        const deltaRadius = percentageToIncrease * levelRadius;

        const result = round8Decimals(deltaRadius);

        return result;
    }
}

export function getAngleSpanPerLevelIncludingPadding(subTreesOuterContours: OuterPolarContour[], radiusPerLevelTable: DistanceToCenterPerLevel) {
    const result: AnglePerLevelTable = {};

    let maxLevel = 0;

    for (let subTreeIdx = 0; subTreeIdx !== subTreesOuterContours.length; subTreeIdx++) {
        const subTreeContour = subTreesOuterContours[subTreeIdx];

        const subTreeDepth = subTreeContour.maxLevel;

        if (subTreeDepth > maxLevel) maxLevel = subTreeDepth;

        for (let level = 1; level !== subTreeDepth + 1; level++) {
            const levelContour = subTreeContour.levelContours[level];

            const levelAngleSpan = angleFromRightToLeftCounterClockWise(levelContour.leftNode, levelContour.rightNode);

            const distanceToNextSubTreeNodeOfSameLevel = getDistanceToNodeOfSameLevelInNextSubTree(subTreesOuterContours, subTreeIdx, level);

            if (!result[level]) {
                result[level] = levelAngleSpan + distanceToNextSubTreeNodeOfSameLevel;
            } else {
                result[level] += levelAngleSpan + distanceToNextSubTreeNodeOfSameLevel;
            }
        }
    }

    const onlyOneSubTree = subTreesOuterContours.length === 1;

    if (onlyOneSubTree) return result;

    //Adding padding between the last node of the last subTree and the first node of the first subtree
    //to avoid overlap between them when adjusting the radius per level table
    for (let level = 1; level !== maxLevel + 1; level++) {
        result[level] += arcToAngleRadians(ALLOWED_NODE_SPACING, radiusPerLevelTable[level]);
    }

    return result;
}

function getDistanceToNodeOfSameLevelInNextSubTree(subTreesOuterContours: OuterPolarContour[], currentSubTreeIdx: number, currentLevel: number) {
    const isLastTree = currentSubTreeIdx === subTreesOuterContours.length - 1;

    if (isLastTree) return 0;

    const currentSubTreeContour = subTreesOuterContours[currentSubTreeIdx];
    const currentSubTreeLevelContour = currentSubTreeContour.levelContours[currentLevel];
    const currentContourLeftNodeOfLevel = currentSubTreeLevelContour.leftNode;

    const nextSubTreeLevelContour = getNextPolarContourOfLevel(subTreesOuterContours, currentSubTreeIdx, currentLevel);

    if (!nextSubTreeLevelContour) return 0;

    const nextContourRightNodeOfLevel = nextSubTreeLevelContour.rightNode;

    const result = angleFromRightToLeftCounterClockWise(nextContourRightNodeOfLevel, currentContourLeftNodeOfLevel);

    return result;

    function getNextPolarContourOfLevel(subTreesOuterContours: OuterPolarContour[], currentSubTreeIdx: number, currentLevel: number) {
        const qtyOfSubTrees = subTreesOuterContours.length;

        for (let subTreeIdx = currentSubTreeIdx + 1; subTreeIdx !== qtyOfSubTrees; subTreeIdx++) {
            const subTreeOuterContour = subTreesOuterContours[subTreeIdx];

            if (subTreeOuterContour.maxLevel < currentLevel) continue;

            return subTreeOuterContour.levelContours[currentLevel];
        }
    }
}
