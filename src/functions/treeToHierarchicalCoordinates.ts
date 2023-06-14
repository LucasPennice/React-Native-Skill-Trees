import { CoordinatesWithTreeData, HierarchicalContour, Skill, Tree } from "../types";
import {
    addEveryChildFromTreeToArray,
    findDistanceBetweenNodesById,
    findLowestCommonAncestorIdOfNodes,
    findNodeById,
    returnPathFromRootToNode,
} from "./extractInformationFromTree";

export const PlotTreeReingoldTiltfordAlgorithm = (completeTree: Tree<Skill>) => {
    let result: Tree<Skill>;

    result = firstIteration(completeTree);

    result = handleOverlap(result);

    let treeCoordinates: CoordinatesWithTreeData[] = [];
    hierarchicalTreeToCoordArray(result, treeCoordinates);

    const smallestXCoordinate = Math.min(...treeCoordinates.map((c) => c.x));

    if (smallestXCoordinate < 0)
        treeCoordinates = treeCoordinates.map((c) => {
            return { ...c, x: c.x + Math.abs(smallestXCoordinate) };
        });

    return treeCoordinates;

    function firstIteration(tree: Tree<Skill>, currentTreeMod?: number, childrenIdx?: number) {
        //Base Case 👇

        let x = (childrenIdx ?? 0) + (currentTreeMod ?? 0);
        let desiredXValueToCenterChildren = 0;
        const isFirstNode = childrenIdx === 0;

        const distance = findDistanceBetweenNodesById(completeTree, tree.nodeId);
        const level = distance ? distance - 1 : 0;

        const result: Tree<Skill> = { ...tree, x, y: level, level, children: [] };

        if (!tree.children.length) return result;

        result.children = [];

        //Recursive Case 👇

        desiredXValueToCenterChildren = (tree.children.length - 1) / 2;
        const childrenMod = x - desiredXValueToCenterChildren;
        if (isFirstNode === true) x = currentTreeMod ?? 0;

        for (let idx = 0; idx < tree.children.length; idx++) {
            const element = tree.children[idx];

            const d = firstIteration(element, childrenMod, idx);

            if (d) result.children.push(d);
        }

        return result;
    }

    function handleOverlap(tree: Tree<Skill>) {
        let overlapInTree = true;

        let result: Tree<Skill> = { ...tree };

        let limiter = 0;

        while (overlapInTree && limiter < 1000) {
            const overlap = checkForOverlap(result);

            if (overlap !== undefined) {
                const treesToShift = getTreesToShift(result, overlap.nodesInConflict);

                result = shiftNodes(result, treesToShift, overlap.biggestOverlap);
            } else {
                overlapInTree = false;
            }

            limiter++;
        }

        return result;
    }

    type OverlapCheck = undefined | { biggestOverlap: number; nodesInConflict: [string, string] };

    function checkForOverlap(tree: Tree<Skill>): OverlapCheck {
        const contourByLevel: { [key: string]: HierarchicalContour[] } = {};
        getTreeContourByLevel(tree, contourByLevel);

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

    function getTreeContourByLevel(tree: Tree<Skill>, result: { [key: string]: HierarchicalContour[] }) {
        //Base Case 👇

        if (!tree.children.length) return;

        //Recursive Case 👇

        const leftmostNode = tree.children[0];
        const rightmostNode = tree.children[tree.children.length - 1];

        const key = `${tree.level}`;

        const contourToAppend: HierarchicalContour = {
            leftNode: { coord: leftmostNode.x, id: leftmostNode.nodeId },
            rightNode: { coord: rightmostNode.x, id: rightmostNode.nodeId },
        };

        if (result[key]) result[key] = [...result[key], contourToAppend];
        if (!result[key]) result[key] = [contourToAppend];

        for (let i = 0; i < tree.children.length; i++) {
            const element = tree.children[i];

            getTreeContourByLevel(element, result);
        }
    }

    function shiftNodes(
        result: Tree<Skill>,
        treesToShift: { byBiggestOverlap: string[]; byHalfOfBiggestOverlap: string[] },
        overlapDistance: number
    ) {
        const currentTreeShiftDistance = getCurrentTreeShiftDistance(result.nodeId);

        const updatedTree: Tree<Skill> = { ...result, x: result.x + currentTreeShiftDistance };

        //Base Case 👇

        if (!result.children.length) return updatedTree;

        updatedTree.children = [];

        //Recursive Case 👇

        for (let i = 0; i < result.children.length; i++) {
            const element = result.children[i];

            updatedTree.children.push(shiftNodes(element, treesToShift, overlapDistance));
        }

        return updatedTree;

        function getCurrentTreeShiftDistance(treeId: string) {
            const shiftByBiggestOverlap = Boolean(treesToShift.byBiggestOverlap.find((id) => id === treeId));

            if (shiftByBiggestOverlap) return overlapDistance;

            const shiftByHalfOfBiggestOverlap = Boolean(treesToShift.byHalfOfBiggestOverlap.find((id) => id === treeId));

            if (shiftByHalfOfBiggestOverlap) return overlapDistance / 2;

            return 0;
        }
    }
};

export function getTreesToShift(result: Tree<Skill>, nodesInConflict: [string, string]) {
    const treesToShift: { byBiggestOverlap: string[]; byHalfOfBiggestOverlap: string[] } = { byBiggestOverlap: [], byHalfOfBiggestOverlap: [] };

    const nodesInConflictLCA = findLowestCommonAncestorIdOfNodes(result, ...nodesInConflict);
    const LCANode = findNodeById(result, nodesInConflictLCA);

    if (!nodesInConflictLCA) throw new Error("getTreesToShift nodesInConflictLCA");
    if (!LCANode) throw new Error("getTreesToShift LCANode");

    const pathToRightNode = returnPathFromRootToNode(result, nodesInConflict[1]);
    const pathToLeftNode = returnPathFromRootToNode(result, nodesInConflict[0]);
    const lcaIndex: number = pathToRightNode.findIndex((id) => id === nodesInConflictLCA);

    if (lcaIndex === -1) throw new Error("getTreesToShift lcaIndex error");

    treesToShift.byBiggestOverlap = treesToShiftByBiggestOverlap(result);

    treesToShift.byHalfOfBiggestOverlap = treesToCenterAfterShift(result);

    return treesToShift;

    function treesToCenterAfterShift(tree: Tree<Skill>) {
        const result1 = getAllNodesFromLevel0ToLCALevel();

        const result2 = getAllNodesInBetweenConflictingTrees();

        return [...result1, ...result2];

        function getAllNodesInBetweenConflictingTrees() {
            const result: string[] = [];

            const leftConflictingChildId = pathToLeftNode[lcaIndex + 1];
            const rightConflictingChildId = pathToRightNode[lcaIndex + 1];

            const leftConflictingChildIdx = LCANode!.children.findIndex((t) => t.nodeId === leftConflictingChildId);
            const rightConflictingChildIdx = LCANode!.children.findIndex((t) => t.nodeId === rightConflictingChildId);

            if (leftConflictingChildIdx === -1 || rightConflictingChildIdx === -1)
                throw new Error("LCANode children not found at fn getAllNodesInBetweenConflictingTrees");

            for (let i = leftConflictingChildIdx + 1; i < rightConflictingChildIdx; i++) {
                const treeToShift = LCANode!.children[i];

                result.push(treeToShift.nodeId);
                addEveryChildFromTreeToArray(treeToShift, result);
            }

            return result;
        }

        function getAllNodesFromLevel0ToLCALevel() {
            const result: string[] = [];

            ifNodeLevelLowerOrEqualThanLCALevelAppendIt(tree, result);

            return result;

            function ifNodeLevelLowerOrEqualThanLCALevelAppendIt(tree: Tree<Skill>, arr: string[]) {
                //Base Case 👇
                if (tree.level > LCANode!.level) return undefined;

                arr.push(tree.nodeId);

                if (!tree.children.length) return undefined;

                //Recursive Case 👇
                for (let i = 0; i < tree.children.length; i++) {
                    const child = tree.children[i];
                    ifNodeLevelLowerOrEqualThanLCALevelAppendIt(child, arr);
                }
            }
        }
    }

    function treesToShiftByBiggestOverlap(tree: Tree<Skill>) {
        const result: string[] = [];

        appendTreeInConflictAndRightSiblings(tree);

        return result;

        function appendTreeInConflictAndRightSiblings(tree: Tree<Skill>) {
            //Base Case 👇
            if (!tree.children.length) return undefined;

            //Recursive Case 👇
            const currentLevel = tree.level;
            const lcaLevel = lcaIndex;
            const nodeInPathIndexForChildren = tree.children.findIndex((t) => t.nodeId === pathToRightNode[currentLevel + 1]);
            const areAnyOfChildrenInPath = nodeInPathIndexForChildren === -1 ? false : true;

            if (!areAnyOfChildrenInPath) return undefined;

            for (let i = 0; i < tree.children.length; i++) {
                const child = tree.children[i];

                if (i >= nodeInPathIndexForChildren) {
                    if (currentLevel >= lcaLevel) {
                        result.push(child.nodeId);
                        addEveryChildFromTreeToArray(child, result);
                    }
                    if (child.nodeId === pathToRightNode[pathToRightNode.length - 1]) addEveryChildFromTreeToArray(child, result);

                    appendTreeInConflictAndRightSiblings(child);
                }
            }
        }
    }
}

export function hierarchicalTreeToCoordArray(tree: Tree<Skill>, result: CoordinatesWithTreeData[]) {
    // Recursive Case 👇
    if (tree.children.length) {
        for (let i = 0; i < tree.children.length; i++) {
            const element = tree.children[i];
            hierarchicalTreeToCoordArray(element, result);
        }
    }

    // Non Recursive Case 👇

    result.push({
        accentColor: tree.accentColor,
        data: tree.data,
        isRoot: tree.isRoot,
        category: tree.isRoot ? "SKILL_TREE" : "SKILL",
        nodeId: tree.nodeId,
        treeId: tree.treeId,
        treeName: tree.treeName,
        x: tree.x,
        y: tree.y,
        level: tree.level,
        parentId: tree.parentId,
    });
}
