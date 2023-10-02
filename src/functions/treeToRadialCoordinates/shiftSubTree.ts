import { Dictionary } from "@reduxjs/toolkit";
import { DistanceToCenterPerLevel, NormalizedNode, OuterPolarContour, PolarContour, PolarOverlapCheck, Skill, Tree } from "../../types";
import { extractTreeIds, getSubTreesOuterContour } from "../extractInformationFromTree";
import { getLevelBiggestOverlap, getSubTreeIdsAndSubTreeRootIds, getSubTreesDictionary, shiftNodesCounterClockWise } from "./overlapWithinSubTree";

export function shiftSubTreeToFinalAngle(nodes: Dictionary<NormalizedNode>, rootId: string, radiusPerLevelTable: DistanceToCenterPerLevel) {
    const rootNode = nodes[rootId];
    if (!rootNode) throw new Error("rootNode undefined at shiftSubTreeToFinalAngle");

    const subTreeRootIds = rootNode.childrenIds;
    const subTreeIdsAndSubTreeRootIds = getSubTreeIdsAndSubTreeRootIds(nodes, subTreeRootIds);

    if (!subTreeRootIds.length) return nodes;

    let result: Dictionary<NormalizedNode> = { rootId: rootNode };

    const subTreesDictionary = getSubTreesDictionary(nodes, subTreeIdsAndSubTreeRootIds, rootId);

    // const subTrees = tree.children;

    // if (!subTrees.length) return tree;

    // let result: Tree<Skill> = { ...tree };

    const firstSubTree = subTreesDictionary[subTreeIdsAndSubTreeRootIds[0].subTreeId]!;
    const firstSubTreeContour = getSubTreesOuterContour(firstSubTree, rootId)[0];

    //This contour contains the last node positioned at that level for every level drawn
    //so most likely it holds nodes from several trees at the same time
    //it also holds the left nodes but I dont intend on using them
    let rightContourOfTreeGraph: OuterPolarContour = extendContourToSubtree(undefined, firstSubTreeContour);

    subTrees.forEach((_, idx) => {
        const isLastSubTree = idx === subTrees.length - 1;

        if (!isLastSubTree) {
            const updatesSubTrees = getSubTreesOuterContour(result.children);

            rightContourOfTreeGraph = extendContourToSubtree(rightContourOfTreeGraph, updatesSubTrees[idx]);

            const nextSubTreeContour = updatesSubTrees[idx + 1];

            const overlap = checkForOverlapBetweenContours(rightContourOfTreeGraph, nextSubTreeContour, radiusPerLevelTable);

            if (overlap) {
                const treesToShift = getIdsFromNextToLastSubTrees(subTrees, idx + 1);

                result = shiftNodesCounterClockWise(
                    result,
                    { byBiggestOverlap: treesToShift, byHalfOfBiggestOverlap: [] },
                    overlap.biggestOverlapAngle
                );
            }
        }
    });

    return result;

    function extendContourToSubtree(contour: OuterPolarContour | undefined, subTreeContour: OuterPolarContour) {
        if (contour === undefined) return subTreeContour;

        let result: OuterPolarContour = { ...contour };

        for (let level = 1; level < subTreeContour.maxLevel + 1; level++) {
            const notNodesOnCurrentLevel = result.levelContours[level] === undefined;

            if (notNodesOnCurrentLevel) {
                result.levelContours[level] = subTreeContour.levelContours[level];
                continue;
            }

            const contourLeftNode = result.levelContours[level].leftNode;

            const subTreeLevelContour = subTreeContour.levelContours[level];
            const levelRightmostNode = subTreeLevelContour.rightNode;

            const updatedLevelContour: PolarContour = { leftNode: contourLeftNode, rightNode: levelRightmostNode };

            result.levelContours[level] = updatedLevelContour;
        }
        if (subTreeContour.maxLevel > result.maxLevel) result.maxLevel = subTreeContour.maxLevel;

        return result;
    }

    function getIdsFromNextToLastSubTrees(subTrees: Tree<Skill>[], nextSubTreeIdx: number) {
        const result: string[] = [];

        const subTreesToExtactIds = subTrees.slice(nextSubTreeIdx);

        subTreesToExtactIds.forEach((subTree) => {
            extractTreeIds(subTree, result);
        });

        return result;
    }

    function checkForOverlapBetweenContours(
        currentSubTreeContour: OuterPolarContour,
        nextSubTreeContour: OuterPolarContour,
        radiusPerLevelTable: DistanceToCenterPerLevel
    ): PolarOverlapCheck {
        let result: PolarOverlapCheck = undefined;

        const maxLevel = getLevelsOfShallowerTree();

        for (let level = 1; level < maxLevel + 1; level++) {
            const currentSubTreeLevelContour = currentSubTreeContour.levelContours[level];
            const currentSubTreeLevelOuterContour: PolarContour[] = [
                { leftNode: currentSubTreeLevelContour.leftNode, rightNode: currentSubTreeLevelContour.rightNode },
            ];

            const nextSubTreeLevelContour = nextSubTreeContour.levelContours[level];
            const nextSubTreeLevelOuterContour: PolarContour[] = [
                { leftNode: nextSubTreeLevelContour.leftNode, rightNode: nextSubTreeLevelContour.rightNode },
            ];

            const levelContour = [...currentSubTreeLevelOuterContour, ...nextSubTreeLevelOuterContour];

            const levelBiggestOverlap = getLevelBiggestOverlap(levelContour, radiusPerLevelTable[level]);

            const updateBiggestTreeOverlap =
                levelBiggestOverlap !== undefined && (result === undefined || levelBiggestOverlap.biggestOverlapAngle >= result.biggestOverlapAngle);

            if (updateBiggestTreeOverlap) result = { ...levelBiggestOverlap };
        }

        return result;

        function getLevelsOfShallowerTree() {
            if (currentSubTreeContour.maxLevel < nextSubTreeContour.maxLevel) return currentSubTreeContour.maxLevel;

            return nextSubTreeContour.maxLevel;
        }
    }
}
