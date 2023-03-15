import { Book, treeMock, TreeNode } from "./types";

export function findTreeHeight(rootNode: TreeNode<Book>) {
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

export function findTreeNodeById(rootNode: TreeNode<Book>, id: string): Book | undefined {
    if (rootNode.node.id === id) return rootNode.node;
    if (!rootNode.node) return undefined;
    if (!rootNode.children) return undefined;

    let arr = rootNode.children.map((item) => {
        return findTreeNodeById(item, id);
    });

    return arr.find((c) => c !== undefined);
}

export function findDistanceBetweenNodesById(rootNode: TreeNode<Book>, id: string): number {
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
