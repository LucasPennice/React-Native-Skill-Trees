import { AnglePerLevelTable, OuterPolarContour, Skill, Tree, UpdateRadiusPerLevelTable } from "@/types";
import { angleFromRightToLeftCounterClockWise, arcToAngleRadians, round8Decimals } from "../coordinateSystem";
import { getSubTreesOuterContour } from "../extractInformationFromTree";
import { DistanceToCenterPerLevel } from "./overlap";
import { ALLOWED_NODE_SPACING } from "../../parameters";

export function checkForLevelOverflow(treeInFinalPosition: Tree<Skill>, radiusPerLevelTable: DistanceToCenterPerLevel): UpdateRadiusPerLevelTable {
    const subTrees = treeInFinalPosition.children;

    let result: UpdateRadiusPerLevelTable = undefined;

    if (!subTrees.length) return result;

    const subTreesContour = getSubTreesOuterContour(subTrees);

    const angleSpanPerLevel = getAngleSpanPerLevel(subTreesContour, radiusPerLevelTable);

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

function getAngleSpanPerLevel(subTreesOuterContours: OuterPolarContour[], radiusPerLevelTable: DistanceToCenterPerLevel) {
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

    function getDistanceToNodeOfSameLevelInNextSubTree(subTreesOuterContours: OuterPolarContour[], currentSubTreeIdx: number, currentLevel: number) {
        const isLastTree = currentSubTreeIdx === subTreesOuterContours.length - 1;

        if (isLastTree) return 0;

        const currentSubTreeContour = subTreesOuterContours[currentSubTreeIdx];
        const currentSubTreeLevelContour = currentSubTreeContour.levelContours[currentLevel];
        const currentContourLeftNodeOfLevel = currentSubTreeLevelContour.rightNode;

        const nextSubTreeLevelContour = getNextPolarContourOfLevel(subTreesOuterContours, currentSubTreeIdx, currentLevel);

        if (!nextSubTreeLevelContour) return 0;

        const nextContourLeftNodeOfLevel = nextSubTreeLevelContour.leftNode;

        const result = angleFromRightToLeftCounterClockWise(currentContourLeftNodeOfLevel, nextContourLeftNodeOfLevel);

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
}
