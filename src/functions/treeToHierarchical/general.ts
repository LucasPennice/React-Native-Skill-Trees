import { TreeData } from "@/redux/slices/userTreesSlice";
import { Dictionary } from "@reduxjs/toolkit";
import { HierarchicalContour, NormalizedNode } from "../../types";
import {
    findLowestCommonAncestorIdOfNodes,
    getDescendantsId,
    normalizedNodeDictionaryToNodeCoordArray,
    returnPathFromRootToNode,
} from "../extractInformationFromTree";

type OverlapCheck = undefined | { biggestOverlap: number; nodesInConflict: [string, string] };
type TreesToShift = { [key: string]: "overlap" | "halfOverlap" };

export function getTreeNodesWithPossibleOverlap(nodes: Dictionary<NormalizedNode>, rootId: string) {
    let treeCoordinates: Dictionary<NormalizedNode> = {};

    plotNodes(nodes, rootId);

    return treeCoordinates;

    function plotNodes(nodes: Dictionary<NormalizedNode>, currentNodeId: string, currentTreeMod?: number, childrenIdx?: number) {
        //Note: For the initial call to this function, currentNodeId has to be the root of the tree
        //Base Case 👇

        let x = (childrenIdx ?? 0) + (currentTreeMod ?? 0);
        let desiredXValueToCenterChildren = 0;
        const isFirstNode = childrenIdx === 0;

        const currentNode = nodes[currentNodeId];

        if (!currentNode) throw new Error("currentNode undefined at plotNodes");

        const result: NormalizedNode = { ...currentNode, x, y: currentNode.level, level: currentNode.level, childrenIds: [] };

        if (!currentNode.childrenIds.length) {
            treeCoordinates[result.nodeId] = result;
            return;
        }

        result.childrenIds = [];

        //Recursive Case 👇

        desiredXValueToCenterChildren = (currentNode.childrenIds.length - 1) / 2;
        const childrenMod = x - desiredXValueToCenterChildren;
        if (isFirstNode === true) x = currentTreeMod ?? 0;

        for (let idx = 0; idx < currentNode.childrenIds.length; idx++) {
            const childId = currentNode.childrenIds[idx];

            plotNodes(nodes, childId, childrenMod, idx);

            result.childrenIds.push(childId);
        }

        treeCoordinates[result.nodeId] = result;
        return;
    }
}

function handleOverlap(nodesWithPossibleOverlap: Dictionary<NormalizedNode>, rootId: string) {
    let overlapInTree = true;

    let result: Dictionary<NormalizedNode> = { ...nodesWithPossibleOverlap };

    let limiter = 0;

    while (overlapInTree && limiter < 1000) {
        const overlap = checkHierarchicalTreeOverlap(result, rootId);

        if (overlap !== undefined) {
            const treesToShift = getTreesToShift(result, rootId, overlap.nodesInConflict);

            result = hierarchicalShiftNodes(result, treesToShift, overlap.biggestOverlap);
        } else {
            overlapInTree = false;
        }

        limiter++;
    }

    return result;
}

export function checkHierarchicalTreeOverlap(nodesWithPossibleOverlap: Dictionary<NormalizedNode>, rootId: string): OverlapCheck {
    const contourByLevel = getHierarchicalTreeContourByLevel(nodesWithPossibleOverlap, rootId);

    let result: OverlapCheck = undefined;

    const treeLevels = Object.keys(contourByLevel);

    treeLevels.forEach((key) => {
        const levelContour = contourByLevel[key];

        const levelBiggestOverlap = getLevelBiggestOverlap(levelContour);

        const updateBiggestTreeOverlap =
            levelBiggestOverlap !== undefined && (result === undefined || levelBiggestOverlap.biggestOverlap >= result.biggestOverlap);

        if (updateBiggestTreeOverlap) result = { ...levelBiggestOverlap };
    });

    return result as OverlapCheck;
}

function getLevelBiggestOverlap(levelContour: HierarchicalContour[]) {
    let result: OverlapCheck;

    for (let idx = 0; idx < levelContour.length; idx++) {
        const isOnLastContour = idx === levelContour.length - 1;

        //We return on the last item because we compare the current contour with the next one, and the next contour doesn't exist on this iteration
        if (isOnLastContour) return result;

        const currentContour = levelContour[idx];
        const nextContour = levelContour[idx + 1];

        //I define two nodes perfectly overlapping as poor spacing and not overlap
        const overlapBetweenThisAndNextContour = currentContour.rightNode.coord > nextContour.leftNode.coord;
        const overlapDistance = Math.abs(currentContour.rightNode.coord - nextContour.leftNode.coord);

        const overlap = overlapBetweenThisAndNextContour && (result === undefined || result.biggestOverlap < overlapDistance);

        const nodeSpacing = nextContour.leftNode.coord - currentContour.rightNode.coord;

        const poorSpacing = !overlap && nodeSpacing < 1 && (result === undefined || result.biggestOverlap < nodeSpacing);

        if (overlap) result = { biggestOverlap: overlapDistance, nodesInConflict: [currentContour.rightNode.id, nextContour.leftNode.id] };

        if (poorSpacing) result = { biggestOverlap: 1 - nodeSpacing, nodesInConflict: [currentContour.rightNode.id, nextContour.leftNode.id] };
    }

    return result;
}

export function getHierarchicalTreeContourByLevel(nodesWithPossibleOverlap: Dictionary<NormalizedNode>, rootId: string) {
    const result: { [key: string]: HierarchicalContour[] } = {};

    recursive(rootId);

    return result;

    function recursive(currentNodeId: string) {
        //NOTE: currentNodeId will be the root node for the first call to the function
        //Base Case 👇

        const currentNode = nodesWithPossibleOverlap[currentNodeId];

        if (!currentNode) throw new Error("undefined currentNode at getHierarchicalTreeContourByLevel");

        if (currentNode.isRoot) {
            result[0] = [{ leftNode: { coord: currentNode.x, id: currentNode.nodeId }, rightNode: { coord: currentNode.x, id: currentNode.nodeId } }];
        }

        if (!currentNode.childrenIds.length) return;

        //Recursive Case 👇

        const leftmostNode = nodesWithPossibleOverlap[currentNode.childrenIds[0]];
        const rightmostNode = nodesWithPossibleOverlap[currentNode.childrenIds[currentNode.childrenIds.length - 1]];

        if (!leftmostNode || !rightmostNode) throw new Error("undefined leftmostNode or rightmostNode at getHierarchicalTreeContourByLevel");

        const level = `${currentNode.level + 1}`;

        const contourToAppend: HierarchicalContour = {
            leftNode: { coord: leftmostNode.x, id: leftmostNode.nodeId },
            rightNode: { coord: rightmostNode.x, id: rightmostNode.nodeId },
        };

        if (result[level]) result[level] = [...result[level], contourToAppend];
        if (!result[level]) result[level] = [contourToAppend];

        for (let i = 0; i < currentNode.childrenIds.length; i++) {
            const childId = currentNode.childrenIds[i];

            recursive(childId);
        }
    }
}

export function hierarchicalShiftNodes(nodes: Dictionary<NormalizedNode>, treesToShift: TreesToShift, overlapDistance: number) {
    const nodeIds = Object.keys(nodes);

    let result: Dictionary<NormalizedNode> = {};

    for (let i = 0; i < nodeIds.length; i++) {
        const nodeId = nodeIds[i];

        const node = nodes[nodeId];

        if (!node) throw new Error("undefined node at hierarchicalShiftNodes");

        const nodeShiftDistance = getNodeShiftDistance(nodeId);

        const updatedNode: NormalizedNode = { ...node, x: node.x + nodeShiftDistance };

        result[nodeId] = updatedNode;
    }

    return result;

    function getNodeShiftDistance(nodeId: string) {
        if (treesToShift[nodeId] === undefined) return 0;

        if (treesToShift[nodeId] === "overlap") return overlapDistance;

        return overlapDistance / 2;
    }
}

export const plotTreeReingoldTiltfordAlgorithm = (nodes: Dictionary<NormalizedNode>, treeData: Omit<TreeData, "nodes">) => {
    const rootId = treeData.rootNodeId;

    const nodesWithPossibleOverlap = getTreeNodesWithPossibleOverlap(nodes, rootId);

    const nodesWithoutOverlap = handleOverlap(nodesWithPossibleOverlap, rootId);

    const result = normalizedNodeDictionaryToNodeCoordArray(nodesWithoutOverlap, treeData);

    return result;
};

export function getTreesToShift(nodes: Dictionary<NormalizedNode>, rootId: string, nodesInConflict: [string, string]) {
    const lowestCommonAncestorId = findLowestCommonAncestorIdOfNodes(nodes, rootId, ...nodesInConflict);

    if (!lowestCommonAncestorId) throw new Error("lowestCommonAncestorId null at getTreesToShift");

    const LCANode = nodes[lowestCommonAncestorId];

    if (!LCANode) throw new Error("LCANode undefined at getTreesToShift");

    const pathToRightNode = returnPathFromRootToNode(nodes, rootId, nodesInConflict[1]);
    const pathToLeftNode = returnPathFromRootToNode(nodes, rootId, nodesInConflict[0]);
    const lcaIndex: number = pathToRightNode.findIndex((id) => id === lowestCommonAncestorId);

    if (lcaIndex === -1) throw new Error("getTreesToShift lcaIndex error");

    const nodeIdsToShiftByOverlap = treesToShiftByBiggestOverlap(nodes, rootId, lcaIndex, pathToRightNode);

    const nodeIdsToShiftByHalfOverlap = treesToCenterAfterShift(nodes, lcaIndex, LCANode, pathToLeftNode, pathToRightNode);

    let result: TreesToShift = {};

    for (let i = 0; i < nodeIdsToShiftByOverlap.length; i++) {
        const nodeId = nodeIdsToShiftByOverlap[i];

        result[nodeId] = "overlap";
    }

    for (let i = 0; i < nodeIdsToShiftByHalfOverlap.length; i++) {
        const nodeId = nodeIdsToShiftByHalfOverlap[i];

        result[nodeId] = "halfOverlap";
    }
    return result;
}

export function treesToCenterAfterShift(
    nodes: Dictionary<NormalizedNode>,
    lcaIndex: number,
    LCANode: NormalizedNode,
    pathToLeftNode: string[],
    pathToRightNode: string[]
) {
    const result1 = getAllNodesFromLevel0ToLCALevelIncluded(nodes, LCANode.level);

    const result2 = getNodesInBetweenConflictingTrees(nodes, lcaIndex, LCANode.childrenIds, pathToLeftNode, pathToRightNode);

    return [...result1, ...result2];
}

export function getNodesInBetweenConflictingTrees(
    nodes: Dictionary<NormalizedNode>,
    lcaIndex: number,
    lcaChildrenIds: string[],
    pathToLeftNode: string[],
    pathToRightNode: string[]
) {
    const result: string[] = [];

    const leftConflictingChildId = pathToLeftNode[lcaIndex + 1];
    const rightConflictingChildId = pathToRightNode[lcaIndex + 1];

    const leftConflictingChildIdx = lcaChildrenIds.findIndex((childId) => childId === leftConflictingChildId);
    const rightConflictingChildIdx = lcaChildrenIds.findIndex((childId) => childId === rightConflictingChildId);

    if (leftConflictingChildIdx === -1 || rightConflictingChildIdx === -1)
        throw new Error("LCANode children not found at fn getNodesInBetweenConflictingTrees");

    for (let i = leftConflictingChildIdx + 1; i < rightConflictingChildIdx; i++) {
        const childId = lcaChildrenIds[i];

        result.push(childId);

        const descendantsId = getDescendantsId(nodes, childId);

        result.push(...descendantsId);
    }

    return result;
}

export function getAllNodesFromLevel0ToLCALevelIncluded(nodes: Dictionary<NormalizedNode>, lcaLevel: number) {
    const ids = Object.keys(nodes);

    const result = ids.filter((id) => {
        const node = nodes[id];

        if (!node) throw new Error("node undefined at getAllNodesFromLevel0ToLCALevelIncluded");

        if (node.level <= lcaLevel) return true;

        return false;
    });

    return result;
}

export function treesToShiftByBiggestOverlap(nodes: Dictionary<NormalizedNode>, rootId: string, lcaIndex: number, pathToRightNode: string[]) {
    //I use a set to avoid duplicated values
    //There are duplicated values because there is a bug in appedTreeIn...

    const result = new Set<string>();

    appendTreeInConflictAndRightSiblings(rootId);

    return Array.from(result);

    function appendTreeInConflictAndRightSiblings(currentNodeId: string) {
        //Base Case 👇
        const currentNode = nodes[currentNodeId];

        if (!currentNode) throw new Error("currentNode undefined at appendTreeInConflictAndRightSiblings");

        if (!currentNode.childrenIds.length) return undefined;

        //Recursive Case 👇
        const currentLevel = currentNode.level;
        const lcaLevel = lcaIndex;
        const nodeInPathIndexForChildren = currentNode.childrenIds.findIndex((childId) => childId === pathToRightNode[currentLevel + 1]);
        const areAnyOfChildrenInPath = nodeInPathIndexForChildren === -1 ? false : true;

        if (!areAnyOfChildrenInPath) return undefined;

        for (let i = 0; i < currentNode.childrenIds.length; i++) {
            const childId = currentNode.childrenIds[i];

            if (i < nodeInPathIndexForChildren) continue;

            if (currentLevel >= lcaLevel) {
                result.add(childId);

                const descendantsId = getDescendantsId(nodes, childId);

                for (const descendantId of descendantsId) result.add(descendantId);
            }

            if (childId === pathToRightNode[pathToRightNode.length - 1]) {
                const descendantsId = getDescendantsId(nodes, childId);
                for (const descendantId of descendantsId) result.add(descendantId);
            }

            appendTreeInConflictAndRightSiblings(childId);
        }
    }
}
