import { TreeData } from "@/redux/slices/userTreesSlice";
import { Dictionary } from "@reduxjs/toolkit";
import { HOMETREE_ROOT_ID, UNCENTERED_ROOT_COORDINATES } from "../parameters";
import {
    NodeCoordinate,
    NodeQtyPerLevel,
    NormalizedNode,
    OuterPolarContour,
    PolarContour,
    PolarContourByLevel,
    Skill,
    SubTreeIdAndSubTreeRootId,
    Tree,
} from "../types";
import { cartesianToPositivePolarCoordinates } from "./coordinateSystem";

export function findTreeHeight(rootNode?: Tree<Skill>) {
    if (!rootNode) return 0;

    let maxHeight = 0;

    if (!rootNode.children.length) return maxHeight + 1;

    for (let child of rootNode.children) {
        let childHeight = findTreeHeight(child);
        if (childHeight && childHeight > maxHeight) {
            maxHeight = childHeight;
        }
    }
    return maxHeight + 1;
}

export function findNodeById(rootNode: Tree<Skill> | undefined, id: string | null): Tree<Skill> | undefined {
    if (!rootNode) return undefined;
    if (!id) return undefined;

    if (rootNode.nodeId === id) return rootNode;

    if (!rootNode.children.length) return undefined;

    let result = undefined;

    for (let idx = 0; idx < rootNode.children.length; idx++) {
        const element = rootNode.children[idx];

        const foundNode = findNodeById(element, id);

        if (foundNode !== undefined) result = foundNode;
    }

    return result;
}

export function findNodeByIdInHomeTree<T extends { nodeId: string; treeId: string }>(homeTree: Tree<Skill>, node: T | null): Tree<Skill> | undefined {
    if (node === null) return undefined;

    if (node.nodeId === HOMETREE_ROOT_ID) return homeTree;

    const subTreeOfNode = homeTree.children.find((subTree) => subTree.treeId === node.treeId);

    if (!subTreeOfNode) return undefined;

    const result = findNodeById(subTreeOfNode, node.nodeId);

    return result;
}

export function findDistanceBetweenNodesById(rootNode: Tree<Skill> | undefined, id: string): number | undefined {
    if (!rootNode) return undefined;

    //Base case 👇

    if (rootNode.nodeId === id) return 1;
    if (!rootNode.children.length) return 0;

    //Recursive case 👇

    let result = rootNode.children.map((element) => {
        if (Boolean(findNodeById(element, id))) return 1 + (findDistanceBetweenNodesById(element, id) ?? 0);

        return 0;
    });

    return Math.max(...result);
}

export function findParentOfNode(rootNode: Tree<Skill> | undefined, id: string): Tree<Skill> | undefined {
    if (!rootNode) return undefined;

    const foundNode = findNodeById(rootNode, id);

    if (!foundNode) return undefined;

    const { data, parentId } = foundNode;

    if (!data || !parentId) return undefined;

    const parentNode = findNodeById(rootNode, parentId);

    if (!parentNode || !parentNode.data) return undefined;

    return parentNode;
}

export function findLowestCommonAncestorIdOfNodes(nodes: Dictionary<NormalizedNode>, rootId: string, nodeId1: string, nodeId2: string) {
    const path1 = returnPathFromRootToNode(nodes, rootId, nodeId1);
    const path2 = returnPathFromRootToNode(nodes, rootId, nodeId2);

    return findLCABetweenToPaths(path1, path2);

    function findLCABetweenToPaths(path1: string[], path2: string[]) {
        const shortestPath = path1.length > path2.length ? [...path2] : [...path1];
        const longestPath = path1.length > path2.length ? [...path1] : [...path2];

        let tentativeLCA = null;

        for (let i = 0; i < shortestPath.length; i++) {
            const id1 = shortestPath[i];
            const id2 = longestPath[i];

            if (id1 === id2) tentativeLCA = id1;

            if (id1 !== id2) return tentativeLCA;
        }

        return tentativeLCA;
    }
}

export function returnPathFromRootToNode(nodes: Dictionary<NormalizedNode>, rootId: string, targetNodeId: string) {
    const result: string[] = [];

    getPathFromRootToNode(rootId, result);

    return result;

    //VER SI PUEDO SACAR ARR DE PARAMETRO

    function getPathFromRootToNode(currentNodeId: string, arr: string[]) {
        //Note: currentNodeId will be root id when we first call the function
        const currentNode = nodes[currentNodeId];

        if (!currentNode) throw new Error("currentNode undefined at getPathFromRootToNode");

        arr.push(currentNode.nodeId);

        //Base Case 👇
        if (currentNode.nodeId === targetNodeId) return true;

        if (!currentNode.childrenIds.length) {
            arr.pop();
            return false;
        }

        //Recursive Case 👇

        for (let i = 0; i < currentNode.childrenIds.length; i++) {
            const childId = currentNode.childrenIds[i];

            const childHasPath = getPathFromRootToNode(childId, arr);

            if (childHasPath) return true;
        }

        arr.pop();

        return false;
    }
}

export function countCompletedNodesInTree(rootNode: Tree<Skill> | undefined) {
    if (!rootNode) return undefined;

    //Base case 👇

    if (!rootNode.children.length && rootNode.data.isCompleted) return 1;
    if (!rootNode.children.length && !rootNode.data.isCompleted) return 0;
    if (!rootNode.children.length) return 0;

    //Recursive case 👇

    let result = rootNode.data.isCompleted ? 1 : 0;

    for (let i = 0; i < rootNode.children.length; i++) {
        result = result + (countCompletedNodesInTree(rootNode.children[i]) ?? 0);
    }

    return result;
}

export function countNodesInTree(rootNode: Tree<Skill> | undefined) {
    if (!rootNode) return undefined;

    //Base case 👇

    if (!rootNode.children.length) return 1;

    //Recursive case 👇

    let result = 1;

    for (let i = 0; i < rootNode.children.length; i++) {
        result = result + (countNodesInTree(rootNode.children[i]) ?? 0);
    }

    return result;
}

//extraer todos los node id de un arbol -> pasarle los subarboles, rotar los subarboles

export function extractTreeIds(rootNode: Tree<Skill>, idArr: string[]) {
    //Base case 👇

    if (!rootNode.children.length) return idArr.push(rootNode.nodeId);

    //Recursive case 👇

    for (let i = 0; i < rootNode.children.length; i++) {
        extractTreeIds(rootNode.children[i], idArr);
    }
    return idArr.push(rootNode.nodeId);
}

export function getDescendantsId(nodes: Dictionary<NormalizedNode>, startingNodeId: string) {
    const result: string[] = [];

    recursive(startingNodeId);

    return result;

    function recursive(currentNodeId: string) {
        //Note: currentNodeId will be the initial node, that node will not be added in this function. Only their children (and theirs, and so on)
        const currentNode = nodes[currentNodeId];

        if (!currentNode) throw new Error("currentNode undefined at addEveryChildFromTreeToArray");

        if (!currentNode.childrenIds.length) return;

        for (let i = 0; i < currentNode.childrenIds.length; i++) {
            const childId = currentNode.childrenIds[i];

            result.push(childId);

            recursive(childId);
        }
    }
}

export function getRadialTreeContourByLevel(nodes: Dictionary<NormalizedNode>, rootId: string) {
    const contourByLevelWithUnorderedContours: { [key: string]: PolarContour[] } = {};

    getTreeContourByLevel(rootId);

    const treeLevels = Object.keys(contourByLevelWithUnorderedContours);

    const contourByLevel = { ...contourByLevelWithUnorderedContours };

    treeLevels.forEach((level) => {
        contourByLevel[level] = contourByLevel[level].reverse();
    });

    return { contourByLevel, treeLevels };

    function getTreeContourByLevel(currentNodeId: string) {
        //NOTE: currentNodeId is rootId for the first function call
        const currentNode = nodes[currentNodeId];
        if (!currentNode) throw new Error("currentNode undefined at getTreeContourByLevel");

        //Base Case 👇
        if (currentNode.level === 0) {
            const leftmostNodePolarCoordinates = {
                ...cartesianToPositivePolarCoordinates({ x: currentNode.x, y: currentNode.y }, UNCENTERED_ROOT_COORDINATES),
                id: currentNode.nodeId,
            };
            const rightmostNodetNodePolarCoordinates = {
                ...cartesianToPositivePolarCoordinates({ x: currentNode.x, y: currentNode.y }, UNCENTERED_ROOT_COORDINATES),
                id: currentNode.nodeId,
            };

            const contourToAppend: PolarContour = { leftNode: leftmostNodePolarCoordinates, rightNode: rightmostNodetNodePolarCoordinates };

            contourByLevelWithUnorderedContours[0] = [contourToAppend];
        }

        if (!currentNode.childrenIds.length) return;

        //Recursive Case 👇

        const leftmostNodeId = currentNode.childrenIds[currentNode.childrenIds.length - 1];
        const rightmostNodeId = currentNode.childrenIds[0];

        const leftmostNode = nodes[leftmostNodeId];
        const rightmostNode = nodes[rightmostNodeId];

        if (!leftmostNode) throw new Error("leftmostNode undefined at getTreeContourByLevel");
        if (!rightmostNode) throw new Error("rightmostNode undefined at getTreeContourByLevel");

        const nextLevel = `${currentNode.level + 1}`;

        const leftmostNodePolarCoordinates = {
            ...cartesianToPositivePolarCoordinates({ x: leftmostNode.x, y: leftmostNode.y }, UNCENTERED_ROOT_COORDINATES),
            id: leftmostNode.nodeId,
        };
        const rightmostNodetNodePolarCoordinates = {
            ...cartesianToPositivePolarCoordinates({ x: rightmostNode.x, y: rightmostNode.y }, UNCENTERED_ROOT_COORDINATES),
            id: rightmostNode.nodeId,
        };

        const contourToAppend: PolarContour = {
            leftNode: leftmostNodePolarCoordinates,
            rightNode: rightmostNodetNodePolarCoordinates,
        };

        if (contourByLevelWithUnorderedContours[nextLevel])
            contourByLevelWithUnorderedContours[nextLevel] = [...contourByLevelWithUnorderedContours[nextLevel], contourToAppend];
        if (!contourByLevelWithUnorderedContours[nextLevel]) contourByLevelWithUnorderedContours[nextLevel] = [contourToAppend];

        for (let i = 0; i < currentNode.childrenIds.length; i++) {
            const childId = currentNode.childrenIds[i];

            getTreeContourByLevel(childId);
        }
    }
}

export function getSubTreesContour(nodes: Dictionary<NormalizedNode>, rootId: string) {
    const rootNode = nodes[rootId];
    if (!rootNode) throw new Error("rootNode undefined at getSubTreesContour");

    const subTreeRootIds = rootNode.childrenIds;
    const subTreeIdsAndSubTreeRootIds = getSubTreeIdsAndSubTreeRootIds(nodes, subTreeRootIds);

    const subTreesDictionary = getSubTreesDictionary(nodes, subTreeIdsAndSubTreeRootIds, rootId);

    const result: PolarContourByLevel[] = [];

    subTreeIdsAndSubTreeRootIds.forEach(({ subTreeId }) => {
        const subTreeNodes = subTreesDictionary[subTreeId];

        if (!subTreeNodes) throw new Error("subTreeNodes undefined at getSubTreesContour");

        const contourByLevel = getRadialTreeContourByLevel(subTreeNodes, rootId);

        result.push(contourByLevel);
    });

    return result;
}

export function getSubTreesOuterContour(nodes: Dictionary<NormalizedNode>, rootId: string) {
    //I specify outer because we could also calculate the contour of each branch for each level
    const result: OuterPolarContour[] = [];

    const subTreeContours = getSubTreesContour(nodes, rootId);

    subTreeContours.forEach((contour) => {
        const outerContour = returnSubTreeOuterContour(contour);

        result.push(outerContour);
    });

    return result;

    function returnSubTreeOuterContour(contour: PolarContourByLevel): OuterPolarContour {
        const maxLevel = parseInt(contour.treeLevels[contour.treeLevels.length - 1]);

        let result: OuterPolarContour = { levelContours: {}, maxLevel };

        for (let level = 0; level !== maxLevel + 1; level++) {
            const currentLevelContour = contour.contourByLevel[level];
            const leftContourNode = currentLevelContour[0].leftNode;
            const rightContourNode = currentLevelContour[currentLevelContour.length - 1].rightNode;

            result.levelContours[level] = { leftNode: leftContourNode, rightNode: rightContourNode };
        }

        return result;
    }
}

export function countCompletedSkillNodes(rootNode: Tree<Skill>) {
    const shouldCountNode = rootNode.data.isCompleted && rootNode.category === "SKILL";

    //Base case 👇
    if (!rootNode.children.length && shouldCountNode) return 1;
    if (!rootNode.children.length && !rootNode.data.isCompleted) return 0;
    if (!rootNode.children.length) return 0;

    //Recursive case 👇

    let result = shouldCountNode ? 1 : 0;

    for (let i = 0; i < rootNode.children.length; i++) {
        result = result + countCompletedSkillNodes(rootNode.children[i]);
    }

    return result;
}
export function countSkillNodes(rootNode: Tree<Skill>) {
    const shouldCountNode = rootNode.category === "SKILL";
    //Base case 👇

    if (!rootNode.children.length && shouldCountNode) return 1;

    //Recursive case 👇

    let result = shouldCountNode ? 1 : 0;

    for (let i = 0; i < rootNode.children.length; i++) {
        result = result + countSkillNodes(rootNode.children[i]);
    }

    return result;
}

export const countCompleteNodes = (nodes: NormalizedNode[]) => {
    let completeNodes = 0;

    for (const node of nodes) {
        if (node.data.isCompleted && node.category === "SKILL") {
            completeNodes++;
        }
    }

    return completeNodes;
};

//This function ignores USER and SKILL_TREE nodes when calculating the percentage
export function treeCompletedSkillPercentage(rootNode: Tree<Skill>) {
    const skillNodeQty = countSkillNodes(rootNode);

    if (skillNodeQty === 0) return 0;

    const completedSkillNodeQty = countCompletedSkillNodes(rootNode);

    const result = (completedSkillNodeQty / skillNodeQty) * 100;

    return result;
}

//This function ignores USER and SKILL_TREE nodes when calculating the percentage
export function completedSkillPercentageFromCoords(coord: NodeCoordinate[], treeId: string) {
    let skillNodeQty = coord.reduce((accumulator, currentValue) => {
        if (currentValue.treeId !== treeId) return accumulator;
        if (currentValue.category !== "SKILL") return accumulator;

        return accumulator + 1;
    }, 0);

    if (skillNodeQty === 0) return 0;

    const completedSkillNodeQty = coord.reduce((accumulator, currentValue) => {
        if (currentValue.treeId !== treeId) return accumulator;
        if (currentValue.category !== "SKILL") return accumulator;
        if (!currentValue.data.isCompleted) return accumulator;

        return accumulator + 1;
    }, 0);

    const result = (completedSkillNodeQty / skillNodeQty) * 100;

    return result;
}

export function completedSkillTreeTable(coord: NodeCoordinate[]) {
    let result: Dictionary<{ qty: number; completedQty: number; percentage: number }> = {};

    for (const node of coord) {
        if (!result[node.treeId]) result[node.treeId] = { completedQty: 0, percentage: 0, qty: 0 };

        const shouldCount = node.category === "SKILL";

        if (!shouldCount) continue;

        const newCompletedQty = node.data.isCompleted ? result[node.treeId]!.completedQty + 1 : result[node.treeId]!.completedQty;
        const newQty = result[node.treeId]!.qty + 1;
        const newPercentage = (newCompletedQty / newQty) * 100;

        result[node.treeId] = { completedQty: newCompletedQty, qty: newQty, percentage: newPercentage };
    }

    return result;
}

export function checkIfTreeHasInvalidCompleteDependencies(tree: Tree<Skill>) {
    //Base case 👇

    if (!tree.children) return undefined;

    //Recursive case 👇

    let result = false;

    for (let i = 0; i < tree.children.length; i++) {
        const c = tree.children[i];
        if (!tree.data.isCompleted && c.data.isCompleted) return (result = true);
        checkIfTreeHasInvalidCompleteDependencies(c);
    }

    return result;
}

export function checkIfCompletionIsAllowedForNode<T extends { category: Tree<Skill>["category"]; data: Skill }>(parentOfNode: T | undefined) {
    if (!parentOfNode) return true;
    if (parentOfNode.category !== "SKILL") return true;
    if (parentOfNode.data.isCompleted) return true;

    return false;
}

export function checkIfUncompletionIsAllowedForNode(nodeToCheck: Tree<Skill>) {
    if (nodeToCheck.children.length === 0) return true;

    const immediateChildrenComplete = nodeToCheck.children.find((c) => c.data.isCompleted === true);
    if (immediateChildrenComplete !== undefined) return false;

    return true;
}

export function checkIfCompletionAllowed(node: NormalizedNode, nodesOfTree: NormalizedNode[]) {
    const nodeDoesNotHaveParent = node.parentId === null;

    if (nodeDoesNotHaveParent) return true;

    const parentNode = nodesOfTree.find((n) => n.nodeId === node.parentId);

    if (!parentNode) throw new Error(`parentNode undefined at checkIfCompletionIsAllowed for ${node.nodeId} - ${node.data.name}`);

    if (parentNode.category !== "SKILL") return true;
    if (parentNode.data.isCompleted) return true;

    return false;
}

export function checkIfReverseCompletionAllowed(node: NormalizedNode, nodesOfTree: NormalizedNode[]) {
    if (node.childrenIds.length === 0) return true;

    const childrenOfNode = nodesOfTree.filter((n) => node.childrenIds.includes(n.nodeId));

    const immediateChildrenComplete = childrenOfNode.find((c) => c.data.isCompleted === true);
    if (immediateChildrenComplete !== undefined) return false;

    return true;
}

export function treeNodeToCoordinate(node: Tree<Skill>): NodeCoordinate {
    const result: NodeCoordinate = {
        accentColor: node.accentColor,
        category: node.category,
        data: node.data,
        isRoot: node.isRoot,
        level: node.level,
        nodeId: node.nodeId,
        parentId: node.parentId,
        treeId: node.treeId,
        treeName: node.treeName,
        x: node.x,
        y: node.y,
    };

    return result;
}

export function countNodesPerLevel(nodes: Dictionary<NormalizedNode>): NodeQtyPerLevel {
    let result: NodeQtyPerLevel = {};

    const nodeIds = Object.keys(nodes);

    for (let i = 0; i < nodeIds.length; i++) {
        const nodeId = nodeIds[i];
        const node = nodes[nodeId];

        if (!node) throw new Error("node undefined at countNodesPerLevel");

        if (result[node.level] === undefined) {
            result[node.level] = 1;
        } else {
            result[node.level] += 1;
        }
    }

    return result;
}

export function normalizedNodeDictionaryToNodeCoordArray(
    nodes: Dictionary<NormalizedNode>,
    treeData: Omit<TreeData, "nodes">,
    subTreesData?: Dictionary<TreeData>
) {
    const nodeIds = Object.keys(nodes);

    const result: NodeCoordinate[] = nodeIds.map((nodeId) => {
        const node = nodes[nodeId];

        if (!node) throw new Error("node undefined at plotTreeReingoldTiltfordAlgorithm");

        const nodeTreeData = (subTreesData && subTreesData[node.treeId]) ?? treeData;

        return {
            accentColor: nodeTreeData.accentColor,
            category: node.category,
            data: node.data,
            isRoot: node.isRoot,
            level: node.level,
            nodeId: node.nodeId,
            parentId: node.parentId,
            treeId: node.treeId,
            treeName: nodeTreeData.treeName,
            x: node.x,
            y: node.y,
        };
    });

    return result;
}

export function getSubTreesDictionary(nodes: Dictionary<NormalizedNode>, subTreeIdsAndSubTreeRootIds: SubTreeIdAndSubTreeRootId[], rootId: string) {
    //I consider a sub tree containing the root node of the tree, BUT that root should only contain one child
    //The root node of the subTree
    const result: Dictionary<Dictionary<NormalizedNode>> = {};

    const rootNode = nodes[rootId];

    if (!rootNode) throw new Error("rootNode undefined at getSubTreesDictionary");

    //Initialize result and append modified root node
    for (const subTreeIdAndSubTreeRootId of subTreeIdsAndSubTreeRootIds) {
        const { subTreeId, subTreeRootId } = subTreeIdAndSubTreeRootId;

        const rootNodeWithOnlySubTreeRootAsChild: NormalizedNode = { ...rootNode, childrenIds: [subTreeRootId] };
        result[subTreeId] = { [rootId]: rootNodeWithOnlySubTreeRootAsChild };
    }

    const nodeIds = Object.keys(nodes);

    for (const nodeId of nodeIds) {
        if (nodeId === rootId) continue;

        const node = nodes[nodeId];
        if (!node) throw new Error("node undefined at getSubTreesDictionary");

        result[node.treeId]![nodeId] = node;
    }

    return result;
}
export function getSubTreeIdsAndSubTreeRootIds(nodes: Dictionary<NormalizedNode>, subTreeRootIds: string[]): SubTreeIdAndSubTreeRootId[] {
    const result: SubTreeIdAndSubTreeRootId[] = [];

    for (const subTreeRootId of subTreeRootIds) {
        const subTreeRoot = nodes[subTreeRootId];

        if (!subTreeRoot) throw new Error("subTreeRoot undefined at getSubTreeIds");

        result.push({ subTreeId: subTreeRoot.treeId, subTreeRootId: subTreeRootId });
    }

    return result;
}
