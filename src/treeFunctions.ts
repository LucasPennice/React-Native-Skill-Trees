import { Book, mockSkillTreeArray, TreeNode } from "./types";

export function findTreeHeight(rootNode: TreeNode<Book> | undefined) {
    if (!rootNode) return undefined;

    if (!rootNode.node) return 0;

    let maxHeight = 0;

    if (!rootNode.children) return maxHeight + 1;

    for (let child of rootNode.children) {
        let childHeight = findTreeHeight(child);
        if (childHeight > maxHeight) {
            maxHeight = childHeight;
        }
    }
    return maxHeight + 1;
}

export function findTreeNodeById(rootNode: TreeNode<Book> | undefined, id: string): Book | undefined {
    if (!rootNode) return undefined;

    if (rootNode.node.id === id) return rootNode.node;
    if (!rootNode.node) return undefined;
    if (!rootNode.children) return undefined;

    let arr = rootNode.children.map((item) => {
        return findTreeNodeById(item, id);
    });

    return arr.find((c) => c !== undefined);
}

export function findDistanceBetweenNodesById(rootNode: TreeNode<Book> | undefined, id: string): number {
    if (!rootNode) return undefined;

    //Base case 👇

    if (rootNode.node.id === id) return 1;
    if (!rootNode.children) return 0;

    //Recursive case 👇

    let result = rootNode.children.map((element) => {
        if (Boolean(findTreeNodeById(element, id))) return 1 + findDistanceBetweenNodesById(element, id);

        return 0;
    });

    return Math.max(...result);
}

export function quantityOfCompletedNodes(rootNode: TreeNode<Book> | undefined) {
    if (!rootNode) return undefined;

    //Base case 👇

    if (!rootNode.children && rootNode.node.isCompleted) return 1;
    if (!rootNode.children && !rootNode.node.isCompleted) return 0;

    //Recursive case 👇

    let result = rootNode.node.isCompleted ? 1 : 0;

    for (let i = 0; i < rootNode.children.length; i++) {
        result = result + quantityOfCompletedNodes(rootNode.children[i]);
    }

    return result;
}

export function quantiyOfNodes(rootNode: TreeNode<Book> | undefined) {
    if (!rootNode) return undefined;

    //Base case 👇

    if (!rootNode.children) return 1;

    //Recursive case 👇

    let result = 1;

    for (let i = 0; i < rootNode.children.length; i++) {
        result = result + quantiyOfNodes(rootNode.children[i]);
    }

    return result;
}

export function findParentOfNode(rootNode: TreeNode<Book> | undefined, id: string): Book | undefined {
    const node = findTreeNodeById(rootNode, id);

    if (!node || !node.parentId) return undefined;

    const parentNode = findTreeNodeById(rootNode, node.parentId);

    if (!parentNode) return undefined;

    return parentNode;
}

console.log(findParentOfNode(mockSkillTreeArray[0], "Lead Gen"));
