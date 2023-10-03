import { Dictionary } from "@reduxjs/toolkit";
import { NormalizedNode, OuterPolarContour, PolarContour, PolarOverlapCheck, SubTreeIdAndSubTreeRootId, TreesToShift } from "../../types";
import { getDescendantsId, getSubTreesOuterContour, getSubTreeIdsAndSubTreeRootIds, getSubTreesDictionary } from "../extractInformationFromTree";
import { getLevelBiggestOverlap, shiftNodesCounterClockWise } from "./overlapWithinSubTree";
import { reverseArray } from "../misc";

export function shiftSubTreeToFinalAngle(nodes: Dictionary<NormalizedNode>, rootId: string) {
    const rootNode = nodes[rootId];

    if (!rootNode) throw new Error("rootNode undefined at shiftSubTreeToFinalAngle");

    let result: Dictionary<NormalizedNode> = { ...nodes, [rootId]: { ...rootNode, childrenIds: reverseArray(rootNode.childrenIds) } };

    const subTreeRootIds = result[rootId]!.childrenIds;
    let subTreeIdsAndSubTreeRootIds = getSubTreeIdsAndSubTreeRootIds(result, subTreeRootIds);

    if (!subTreeRootIds.length) return nodes;

    const subTreesDictionary = getSubTreesDictionary(result, subTreeIdsAndSubTreeRootIds, rootId);

    const leftmostSubTree = subTreesDictionary[subTreeIdsAndSubTreeRootIds[0].subTreeId]!;
    const firstSubTreeContour = getSubTreesOuterContour(leftmostSubTree, rootId)[0];

    //This contour contains the last node positioned at that level for every level drawn
    //so most likely it holds nodes from several trees at the same time
    //it also holds the left nodes but I dont intend on using them
    let rightContourOfTreeGraph: OuterPolarContour = extendContourToSubtree(undefined, firstSubTreeContour);

    // console.log("🧠🧠🧠🧠🧠🧠🧠🧠🧠🧠🧠🧠🧠");

    // console.log(JSON.stringify(rightContourOfTreeGraph));

    for (let idx = 0; idx < subTreeIdsAndSubTreeRootIds.length; idx++) {
        // const _ = subTreeIdsAndSubTreeRootIds[idx];

        const isLastSubTree = idx === subTreeIdsAndSubTreeRootIds.length - 1;

        if (!isLastSubTree) {
            const updatedSubTreesOuterContour = getSubTreesOuterContour(result, rootId);

            rightContourOfTreeGraph = extendContourToSubtree(rightContourOfTreeGraph, updatedSubTreesOuterContour[idx]);

            const nextSubTreeContour = updatedSubTreesOuterContour[idx + 1];

            const overlap = checkForOverlapBetweenContours(rightContourOfTreeGraph, nextSubTreeContour);

            if (overlap) {
                const treesToShift = getIdsFromNextToLastSubTrees(result, subTreeIdsAndSubTreeRootIds.slice(idx + 1));
                // console.log(overlap);
                // console.log(treesToShift);

                result = shiftNodesCounterClockWise(result, rootId, treesToShift, overlap.biggestOverlapAngle);
            }
        }

        // if (idx === 0) return result;
    }

    result[rootId] = rootNode;

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

    function getIdsFromNextToLastSubTrees(nodes: Dictionary<NormalizedNode>, subTreeIdsAndSubTreesRootId: SubTreeIdAndSubTreeRootId[]) {
        const result: TreesToShift = {};

        for (const subTreeIdAndSubTreeRootId of subTreeIdsAndSubTreesRootId) {
            result[subTreeIdAndSubTreeRootId.subTreeRootId] = "overlap";
            const descendantsId = getDescendantsId(nodes, subTreeIdAndSubTreeRootId.subTreeRootId);

            for (const descendantId of descendantsId) {
                result[descendantId] = "overlap";
            }
        }
        return result;
    }

    function checkForOverlapBetweenContours(currentSubTreeContour: OuterPolarContour, nextSubTreeContour: OuterPolarContour): PolarOverlapCheck {
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

            const levelBiggestOverlap = getLevelBiggestOverlap(levelContour, level);

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
