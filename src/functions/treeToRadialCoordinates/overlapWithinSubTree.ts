import { Dictionary } from "@reduxjs/toolkit";
import { ALLOWED_NODE_SPACING, UNCENTERED_ROOT_COORDINATES } from "../../parameters";
import {
    DistanceToCenterPerLevel,
    NodesInConflict,
    NormalizedNode,
    PolarContour,
    PolarCoordinate,
    PolarOverlapCheck,
    TreesToShift,
} from "../../types";
import {
    angleFromLeftToRightCounterClockWise,
    arcToAngleRadians,
    cartesianToPositivePolarCoordinates,
    polarToCartesianCoordinates,
    round8Decimals,
} from "../coordinateSystem";
import {
    findLowestCommonAncestorIdOfNodes,
    getDescendantsId,
    getRadialTreeContourByLevel,
    getSubTreeIdsAndSubTreeRootIds,
    getSubTreesDictionary,
    returnPathFromRootToNode,
} from "../extractInformationFromTree";
import { getNodeDistanceToPoint } from "../misc";

export function fixOverlapWithinSubTreesOfLevel1(firstIterationNodes: Dictionary<NormalizedNode>, rootId: string): Dictionary<NormalizedNode> {
    const rootNode = firstIterationNodes[rootId];
    if (!rootNode) throw new Error("rootNode undefined at fixOverlapWithinSubTreesOfLevel1");

    const subTreeRootIds = rootNode.childrenIds;
    const subTreeIdsAndSubTreeRootIds = getSubTreeIdsAndSubTreeRootIds(firstIterationNodes, subTreeRootIds);

    if (!subTreeRootIds.length) return firstIterationNodes;

    let result: Dictionary<NormalizedNode> = { [rootId]: rootNode };

    const subTreesDictionary = getSubTreesDictionary(firstIterationNodes, subTreeIdsAndSubTreeRootIds, rootId);

    subTreeIdsAndSubTreeRootIds.forEach(({ subTreeId }) => {
        const subTreeNodes = subTreesDictionary[subTreeId];

        if (!subTreeNodes) throw new Error("subTreeNodes undefined at fixOverlapWithinSubTreesOfLevel1");

        const subTreeNodesWithoutOverlap = fixSubTreeOverlapRadial(subTreeNodes, rootId);

        const nodeIds = Object.keys(subTreeNodesWithoutOverlap);

        for (const nodeId of nodeIds) {
            if (nodeId === rootId) continue;

            result[nodeId] = subTreeNodesWithoutOverlap[nodeId];
        }
    });

    return result;
}

export function fixSubTreeOverlapRadial(firstIterationNodesOfSubTree: Dictionary<NormalizedNode>, rootId: string) {
    let modifiedNodesOfSubTree: Dictionary<NormalizedNode> = { ...firstIterationNodesOfSubTree };
    let overlapWithinTree = true;

    let limiter = 0;

    while (overlapWithinTree && limiter < 100) {
        let polarOverlap = checkForRadialOverlap(modifiedNodesOfSubTree, rootId);

        //Tolerance to avoid loops
        if (acceptableToleranceInPoorSpacingOverlap(modifiedNodesOfSubTree, polarOverlap)) polarOverlap = undefined;

        if (polarOverlap === undefined) overlapWithinTree = false;

        if (polarOverlap !== undefined) {
            const treesToShift = getNodesToShiftForInternalOverlapRadial(modifiedNodesOfSubTree, rootId, polarOverlap.nodesInConflict);

            modifiedNodesOfSubTree = shiftNodesCounterClockWise(modifiedNodesOfSubTree, rootId, treesToShift, polarOverlap.biggestOverlapAngle);
        }
        limiter++;
    }

    return modifiedNodesOfSubTree;

    function acceptableToleranceInPoorSpacingOverlap(nodes: Dictionary<NormalizedNode>, polarOverlap: PolarOverlapCheck) {
        const ACCEPTABLE_ERROR_PERCENTAGE = 0.5;
        if (!polarOverlap) return true;

        const node = nodes[polarOverlap.nodesInConflict.lastChildIdOfTree];

        if (!node) throw new Error("Node not found at checkForAcceptableTolerance");

        const overlapNodesDistanceToCenter = cartesianToPositivePolarCoordinates(
            { x: node.x, y: node.y },
            UNCENTERED_ROOT_COORDINATES
        ).distanceToCenter;

        const idealAngleDistance = arcToAngleRadians(ALLOWED_NODE_SPACING, overlapNodesDistanceToCenter);

        const errorPercentage = Math.abs((polarOverlap.biggestOverlapAngle * 100) / idealAngleDistance);

        if (errorPercentage <= ACCEPTABLE_ERROR_PERCENTAGE) return true;

        return false;
    }
}

export function checkForRadialOverlap(nodes: Dictionary<NormalizedNode>, rootId: string): PolarOverlapCheck {
    //The first contour is from the rightmost tree instead of the leftmost
    const { contourByLevel, treeLevels } = getRadialTreeContourByLevel(nodes, rootId);

    let result: PolarOverlapCheck = undefined;

    treeLevels.forEach((level) => {
        const levelContour = contourByLevel[level];

        const nodeId = levelContour[0].leftNode.id;

        const node = nodes[nodeId];

        if (!node) throw new Error("node undefined at checkForRadialOverlap");

        const distanceToCenter = getNodeDistanceToPoint(node, UNCENTERED_ROOT_COORDINATES);

        const levelBiggestOverlap = getLevelBiggestOverlap(levelContour, distanceToCenter);

        const updateBiggestTreeOverlap =
            levelBiggestOverlap !== undefined && (result === undefined || levelBiggestOverlap.biggestOverlapAngle >= result.biggestOverlapAngle);

        if (updateBiggestTreeOverlap) result = { ...levelBiggestOverlap };
    });

    return result as PolarOverlapCheck;
}

export function getLevelBiggestOverlap(levelContour: PolarContour[], originalDistanceToCenter: number) {
    let result: PolarOverlapCheck = undefined;

    for (let idx = 0; idx < levelContour.length; idx++) {
        const isOnLastContour = idx === levelContour.length - 1;

        //We return on the last item because we compare the current contour with the next one, and the next contour doesn't exist on this iteration
        if (isOnLastContour) return result;

        const currentContour = levelContour[idx];
        const nextContour = levelContour[idx + 1];

        //I define two nodes perfectly overlapping as poor spacing and not overlap
        const overlapBetweenThisAndNextContour = checkForOverlapBetweenNodes(nextContour.leftNode, currentContour.rightNode);
        const poorSpacing = checkForPoorSpacing(nextContour.leftNode, currentContour.rightNode);

        if (overlapBetweenThisAndNextContour && (!result || overlapBetweenThisAndNextContour > result.biggestOverlapAngle)) {
            result = {
                biggestOverlapAngle: overlapBetweenThisAndNextContour,
                nodesInConflict: { lastChildIdOfTree: currentContour.rightNode.id, firstChildIdOfNextTree: nextContour.leftNode.id },
            };
        }

        if (!overlapBetweenThisAndNextContour && poorSpacing !== undefined && (!result || poorSpacing > result.biggestOverlapAngle)) {
            result = {
                biggestOverlapAngle: arcToAngleRadians(ALLOWED_NODE_SPACING, originalDistanceToCenter) - poorSpacing,
                nodesInConflict: { lastChildIdOfTree: currentContour.rightNode.id, firstChildIdOfNextTree: nextContour.leftNode.id },
            };
        }
    }
    return result;

    function checkForOverlapBetweenNodes(nextContourLeftNode: PolarCoordinate, currentContourRightNode: PolarCoordinate): undefined | number {
        //If the rightToLeft angle is larger than leftToRight then we have overlap
        const leftToRightAngle = angleFromLeftToRightCounterClockWise(nextContourLeftNode, currentContourRightNode);
        const rightToLeftAngle = 2 * Math.PI - leftToRightAngle;

        if (rightToLeftAngle > 2 * Math.PI || leftToRightAngle > 2 * Math.PI)
            throw new Error("Angle greater than 2PI in checkForOverlapBetweenNodes");

        const overlap = rightToLeftAngle < leftToRightAngle;

        if (!overlap) return undefined;
        return rightToLeftAngle + arcToAngleRadians(ALLOWED_NODE_SPACING, originalDistanceToCenter);
    }

    function checkForPoorSpacing(nextContourLeftNode: PolarCoordinate, currentContourRightNode: PolarCoordinate): undefined | number {
        const separationAngle = angleFromLeftToRightCounterClockWise(nextContourLeftNode, currentContourRightNode);

        const roundedSeparationAngle = round8Decimals(separationAngle);

        const minimumSeparationAngle = arcToAngleRadians(ALLOWED_NODE_SPACING, originalDistanceToCenter);

        if (roundedSeparationAngle < minimumSeparationAngle) return roundedSeparationAngle;

        return undefined;
    }
}

export function getNodesToShiftForInternalOverlapRadial(nodes: Dictionary<NormalizedNode>, rootId: string, nodesInConflict: NodesInConflict) {
    const treesToShift: TreesToShift = {};

    const lowestCommonAncestorId = findLowestCommonAncestorIdOfNodes(
        nodes,
        rootId,
        nodesInConflict.lastChildIdOfTree,
        nodesInConflict.firstChildIdOfNextTree
    );

    if (!lowestCommonAncestorId) throw new Error("lowestCommonAncestorId undefined at getNodesToShiftForInternalOverlapRadial");
    const lcaNode = nodes[lowestCommonAncestorId];

    if (!lcaNode) throw new Error("lcaNode undefined at getNodesToShiftForInternalOverlapRadial");

    const pathToFirstChildIdOfNextTreeInConflict = returnPathFromRootToNode(nodes, rootId, nodesInConflict.firstChildIdOfNextTree);
    const pathToLastChildIdOfTreeInConflict = returnPathFromRootToNode(nodes, rootId, nodesInConflict.lastChildIdOfTree);
    const lcaIndexInPathToRightNode = pathToFirstChildIdOfNextTreeInConflict.findIndex((id) => id === lowestCommonAncestorId);

    if (lcaIndexInPathToRightNode === -1) throw new Error("getNodesToShiftForInternalOverlapRadial lcaIndexInPathToRightNode error");

    const shiftByOverlap = getNodesToShiftByOverlapRadial(nodes, rootId, lcaIndexInPathToRightNode, pathToFirstChildIdOfNextTreeInConflict);

    for (let i = 0; i < shiftByOverlap.length; i++) {
        const nodeId = shiftByOverlap[i];
        treesToShift[nodeId] = "overlap";
    }

    const shiftByHalfOverlap = getNodesToShiftByHalfOverlapRadial(
        nodes,
        rootId,
        lcaNode,
        lcaIndexInPathToRightNode,
        pathToFirstChildIdOfNextTreeInConflict,
        pathToLastChildIdOfTreeInConflict
    );

    for (let i = 0; i < shiftByHalfOverlap.length; i++) {
        const nodeId = shiftByHalfOverlap[i];
        treesToShift[nodeId] = "halfOverlap";
    }

    return treesToShift;
}

export function getNodesToShiftByHalfOverlapRadial(
    nodes: Dictionary<NormalizedNode>,
    rootId: string,
    lcaNode: NormalizedNode,
    lcaIndexInPathToRightNode: number,
    pathToFirstChildIdOfNextTreeInConflict: string[],
    pathToLastChildIdOfTreeInConflict: string[]
) {
    //Conflict line: the path connecting the root node (not included) with the Lca

    const nodesFromConflictLineAndRightSubTrees = getNodesFromConflictLineAndRightSubTrees();

    const nodesInBetweenConflictingTrees = getNodesInBetweenConflictingTrees();

    const result = [...nodesFromConflictLineAndRightSubTrees, ...nodesInBetweenConflictingTrees];

    return result;

    function getNodesInBetweenConflictingTrees() {
        const result = new Set<string>();

        const leftConflictingChildId = pathToLastChildIdOfTreeInConflict[lcaIndexInPathToRightNode + 1];
        const rightConflictingChildId = pathToFirstChildIdOfNextTreeInConflict[lcaIndexInPathToRightNode + 1];

        const leftConflictingChildIdx = lcaNode.childrenIds.findIndex((childId) => childId === leftConflictingChildId);
        const rightConflictingChildIdx = lcaNode.childrenIds.findIndex((childId) => childId === rightConflictingChildId);

        if (leftConflictingChildIdx === -1 || rightConflictingChildIdx === -1)
            throw new Error("lcaNode children not found at fn getNodesInBetweenConflictingTrees");

        for (let i = rightConflictingChildIdx + 1; i < leftConflictingChildIdx; i++) {
            const childId = lcaNode.childrenIds[i];

            result.add(childId);

            const descendantsId = getDescendantsId(nodes, childId);

            for (const descendantId of descendantsId) result.add(descendantId);
        }

        return Array.from(result);
    }

    function getNodesFromConflictLineAndRightSubTrees() {
        const result = new Set<string>();

        recursive(rootId);

        return Array.from(result);

        function recursive(currentNodeId: string) {
            const currentNode = nodes[currentNodeId];

            const isNodeInConflictPath = pathToFirstChildIdOfNextTreeInConflict.find((nodeIdInPath) => nodeIdInPath === currentNodeId);

            if (!currentNode) throw new Error("currentNode undefined at getNodesFromConflictLineAndRightSubTrees");

            if (!isNodeInConflictPath) return undefined;
            if (currentNode.level > lcaNode.level) return undefined;

            if (currentNode.level !== 0) result.add(currentNode.nodeId);

            if (currentNode.level === lcaNode.level) return undefined;
            if (!currentNode.childrenIds.length) return undefined;

            const childIdInPath = pathToFirstChildIdOfNextTreeInConflict.filter((nodeIdInPath) => currentNode.childrenIds.includes(nodeIdInPath));

            if (childIdInPath.length === 0 || childIdInPath.length > 1)
                throw new Error("childIdInPath has more than one element in getNodesFromConflictLineAndRightSubTrees");

            const childInPathIndex = currentNode.childrenIds.findIndex((childId) => childId === childIdInPath[0]);

            if (childInPathIndex === -1) throw new Error("childInPathIndex not found in getNodesFromConflictLineAndRightSubTrees");

            //Recursive Case 👇
            for (let i = 0; i < currentNode.childrenIds.length; i++) {
                const childId = currentNode.childrenIds[i];

                const isChildRightFromConflictLine = i < childInPathIndex;

                const isNodeInConflictPath = pathToFirstChildIdOfNextTreeInConflict.find((nodeInPathId) => nodeInPathId === childId);

                if (isNodeInConflictPath) {
                    recursive(childId);
                    continue;
                }

                if (isChildRightFromConflictLine) {
                    result.add(childId);
                    const descendantsId = getDescendantsId(nodes, childId);

                    for (const descendantId of descendantsId) result.add(descendantId);
                }
            }
        }
    }
}

export function getNodesToShiftByOverlapRadial(
    nodes: Dictionary<NormalizedNode>,
    rootId: string,
    lcaIndex: number,
    pathToFirstChildIdOfNextTreeInConflict: string[]
) {
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
        const nodeInPathIndexForChildren = currentNode.childrenIds.findIndex(
            (childId) => childId === pathToFirstChildIdOfNextTreeInConflict[currentLevel + 1]
        );
        const areAnyOfChildrenInPath = nodeInPathIndexForChildren === -1 ? false : true;
        // console.log(currentNode.childrenIds, currentNode.level, pathToFirstChildIdOfNextTreeInConflict);
        if (!areAnyOfChildrenInPath) return undefined;

        for (let i = 0; i < currentNode.childrenIds.length; i++) {
            const childInPath = i <= nodeInPathIndexForChildren;

            const childId = currentNode.childrenIds[i];

            //If the node is at
            const shouldMoveTree = currentLevel >= lcaLevel;

            if (childInPath) {
                if (shouldMoveTree) {
                    result.add(childId);
                    const descendantsId = getDescendantsId(nodes, childId);

                    for (const descendantId of descendantsId) result.add(descendantId);
                }

                appendTreeInConflictAndRightSiblings(childId);
            }
        }
    }
}

export function shiftNodesCounterClockWise(nodes: Dictionary<NormalizedNode>, rootNodeId: string, treesToShift: TreesToShift, overlapAngle: number) {
    let result: Dictionary<NormalizedNode> = {};

    recursive(rootNodeId);

    return result;

    function recursive(currentNodeId: string) {
        //Note: currentNodeId === rootId for first call of the function
        const shiftAngleForTree = getShiftAngleForTree(currentNodeId);
        const currentNode = nodes[currentNodeId];

        if (!currentNode) throw new Error("currentNode undefined at shiftNodesCounterClockWise");

        const treeCoordBeforeShift = cartesianToPositivePolarCoordinates({ x: currentNode.x, y: currentNode.y }, UNCENTERED_ROOT_COORDINATES);

        const shiftedPolarCoord: PolarCoordinate = {
            ...treeCoordBeforeShift,
            angleInRadians: treeCoordBeforeShift.angleInRadians - shiftAngleForTree,
        };

        const shiftedCartesianCoord = polarToCartesianCoordinates(shiftedPolarCoord);

        const updatedCurrentNode: NormalizedNode = { ...currentNode, x: shiftedCartesianCoord.x, y: shiftedCartesianCoord.y };

        //Base Case 👇

        result[currentNodeId] = updatedCurrentNode;

        if (!updatedCurrentNode.childrenIds.length) return;

        //Recursive Case 👇

        for (let i = 0; i < currentNode.childrenIds.length; i++) {
            const childId = currentNode.childrenIds[i];

            recursive(childId);
        }
    }

    function getShiftAngleForTree(nodeId: string) {
        if (treesToShift[nodeId] === undefined) return 0;

        if (treesToShift[nodeId] === "overlap") return overlapAngle;

        return overlapAngle / 2;
    }
}

export function getDistanceToCenterPerLevel(nodes: Dictionary<NormalizedNode>) {
    const nodeIds = Object.keys(nodes);

    let treeDepth = 0;

    for (let i = 0; i < nodeIds.length; i++) {
        const nodeId = nodeIds[i];

        const node = nodes[nodeId];

        if (!node) throw new Error("node undefined at getDistanceToCenterPerLevel");

        if (node.level > treeDepth) treeDepth = node.level;
    }

    const result: DistanceToCenterPerLevel = {};

    const levels = Array.from(Array(treeDepth + 1).keys());

    levels.forEach((level) => {
        result[level] = level;
    });

    return result;
}
