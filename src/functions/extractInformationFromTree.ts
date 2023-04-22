import { CirclePositionInCanvasWithLevel, Skill, Tree } from "../types";

export function findTreeHeight(rootNode?: Tree<Skill>) {
    if (!rootNode) return 0;

    if (!rootNode.data) return 0;

    let maxHeight = 0;

    if (!rootNode.children) return maxHeight + 1;

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

    if (rootNode.data.id === id) return rootNode;

    if (!rootNode.children) return undefined;

    let result = undefined;

    for (let idx = 0; idx < rootNode.children.length; idx++) {
        const element = rootNode.children[idx];

        const foundNode = findNodeById(element, id);

        if (foundNode !== undefined) result = foundNode;
    }

    return result;
}

export function findDistanceBetweenNodesById(rootNode: Tree<Skill> | undefined, id: string): number | undefined {
    if (!rootNode) return undefined;

    //Base case 👇

    if (rootNode.data.id === id) return 1;
    if (!rootNode.children) return 0;

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

export function findLowestCommonAncestorIdOfNodes(tree: Tree<Skill>, nodeId1: string, nodeId2: string) {
    const path1 = returnPathFromRootToNode(tree, nodeId1);
    const path2 = returnPathFromRootToNode(tree, nodeId2);

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

export function returnPathFromRootToNode(tree: Tree<Skill>, nodeId: string) {
    const result: string[] = [];

    getPathFromRootToNode(tree, nodeId, result);

    return result;

    function getPathFromRootToNode(tree: Tree<Skill>, nodeId: string, arr: string[]) {
        arr.push(tree.data.id);

        //Base Case 👇
        if (tree.data.id === nodeId) return true;

        if (!tree.children) {
            arr.pop();
            return false;
        }

        //Recursive Case 👇

        for (let i = 0; i < tree.children.length; i++) {
            const element = tree.children[i];

            const childHasPath = getPathFromRootToNode(element, nodeId, arr);

            if (childHasPath) return true;
        }

        arr.pop();

        return false;
    }
}

export function countCompletedNodesInTree(rootNode: Tree<Skill> | undefined) {
    if (!rootNode) return undefined;

    //Base case 👇

    if (!rootNode.children && rootNode.data.isCompleted) return 1;
    if (!rootNode.children && !rootNode.data.isCompleted) return 0;
    if (!rootNode.children) return 0;

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

    if (!rootNode.children) return 1;

    //Recursive case 👇

    let result = 1;

    for (let i = 0; i < rootNode.children.length; i++) {
        result = result + (countNodesInTree(rootNode.children[i]) ?? 0);
    }

    return result;
}
