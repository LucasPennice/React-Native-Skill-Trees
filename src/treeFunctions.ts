import { selectCanvasDisplaySettings } from "./canvasDisplaySettingsSlice";
import { ModifiableNodeProperties } from "./currentTreeSlice";
import { useAppSelector } from "./reduxHooks";
import { Skill, mockSkillTreeArray, Tree } from "./types";

export function findTreeHeight(rootNode: Tree<Skill> | undefined) {
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

export function findTreeNodeById(rootNode: Tree<Skill> | undefined, id: string): Tree<Skill> | undefined {
    if (!rootNode) return undefined;

    if (rootNode.node.id === id) return rootNode;
    if (!rootNode.node) return undefined;
    if (!rootNode.children) return undefined;

    let arr = rootNode.children.map((item) => {
        return findTreeNodeById(item, id);
    });

    return arr.find((c) => c !== undefined);
}

export function findDistanceBetweenNodesById(rootNode: Tree<Skill> | undefined, id: string): number {
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

export function quantityOfCompletedNodes(rootNode: Tree<Skill> | undefined) {
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

export function quantiyOfNodes(rootNode: Tree<Skill> | undefined) {
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

export function findParentOfNode(rootNode: Tree<Skill> | undefined, id: string): Tree<Skill> | undefined {
    const foundNode = findTreeNodeById(rootNode, id);

    if (!foundNode) return undefined;

    const { node } = foundNode;

    if (!node || !node.parentId) return undefined;

    const parentNode = findTreeNodeById(rootNode, node.parentId);

    if (!parentNode || !parentNode.node) return undefined;

    return parentNode;
}

export function deleteNodeWithNoChildren(rootNode: Tree<Skill> | undefined, nodeToDelete: Tree<Skill>) {
    if (!rootNode) return undefined;

    //Base case 👇

    if (rootNode.node.id === nodeToDelete.node.id) return undefined;
    if (!rootNode.children) return rootNode;

    //Recursive case 👇

    let result: Tree<Skill> = { node: rootNode.node, children: [] };

    if (rootNode.treeId) result.treeId = rootNode.treeId;
    if (rootNode.treeName) result.treeName = rootNode.treeName;

    for (let i = 0; i < rootNode.children.length; i++) {
        const currentChildren = rootNode.children[i];

        if (currentChildren.node.id !== nodeToDelete.node.id) {
            result.children.push(deleteNodeWithNoChildren(currentChildren, nodeToDelete));
        }
    }

    if (result.children.length === 0) delete result["children"];

    return result;
}

export function deleteNodeWithChildren(rootNode: Tree<Skill> | undefined, nodeToDelete: Tree<Skill>, childrenToHoist: Tree<Skill>) {
    if (!rootNode) return undefined;

    // //Base case 👇

    if (!rootNode.children) return rootNode;

    if (rootNode.node.id === nodeToDelete.node.id) return returnHoistedNode(rootNode, childrenToHoist);

    //Recursive case 👇

    let result: Tree<Skill> = { node: rootNode.node, children: [] };

    if (rootNode.treeId) result.treeId = rootNode.treeId;
    if (rootNode.treeName) result.treeName = rootNode.treeName;

    for (let i = 0; i < rootNode.children.length; i++) {
        const currentChildren = rootNode.children[i];

        if (currentChildren.node.id !== nodeToDelete.node.id) {
            result.children.push(deleteNodeWithChildren(currentChildren, nodeToDelete, childrenToHoist));
        } else {
            const newNode = returnHoistedNode(currentChildren, childrenToHoist);

            result.children.push(newNode);
        }
    }

    if (result.children.length === 0) delete result["children"];

    return result;

    function returnHoistedNode(parentNode: Tree<Skill>, childrenToHoist: Tree<Skill>) {
        const result = { ...parentNode };

        result.node = { ...childrenToHoist.node };

        if (nodeToDelete.node.parentId) result.node.parentId = nodeToDelete.node.parentId;

        result.node.isRoot = parentNode.node.isRoot;

        if (childrenToHoist.children) result.children.push(...childrenToHoist.children);

        //Update the parentId of the hoisted nodes' children
        if (result.children) {
            result.children.forEach((e) => (e.node.parentId = result.node.id));
        }

        result.children = result.children.filter((c) => c.node.id !== childrenToHoist.node.id);

        if (result.children.length === 0) delete result["children"];

        return result;
    }
}

export function editNodeProperty(rootNode: Tree<Skill> | undefined, targetNode: Tree<Skill>, newProperties: ModifiableNodeProperties) {
    if (!rootNode) return undefined;

    //Base Case 👇

    if (rootNode.node.id === targetNode.node.id) {
        const result = { ...rootNode };

        const keysToEdit = Object.keys(newProperties);

        keysToEdit.forEach((key) => (result.node[key] = newProperties[key]));

        return result;
    }

    if (!rootNode.children) return rootNode;

    //Recursive Case 👇

    let result: Tree<Skill> = { ...rootNode, children: [] };

    for (let idx = 0; idx < rootNode.children.length; idx++) {
        const element = rootNode.children[idx];

        result.children.push(editNodeProperty(element, targetNode, newProperties));
    }

    if (result.children.length === 0) delete result["children"];

    return result;
}

export const MOCK2: Tree<Skill> = {
    treeId: "HPTREE",
    treeName: "HPTREE",
    node: { id: `Harry Potter 1`, name: "Harry Potter 1", isRoot: true },
    children: [
        {
            node: { id: `Harry Potter 2`, name: "Harry Potter 2" },
            children: [
                {
                    node: { id: `Harry Potter 3`, name: "Harry Potter 3" },
                    children: [
                        { node: { id: `Harry Potter 41`, name: "Harry Potter 41" } },
                        { node: { id: `Harry Potter 42`, name: "Harry Potter 42" } },
                        { node: { id: `Harry Potter 43`, name: "Harry Potter 43" } },
                    ],
                },
            ],
        },
        {
            node: { id: "Harry Potter 2.5", name: "Harry Potter 2.5" },
            children: [
                {
                    node: { id: "Harry Potter 2.5 child", name: "Harry Potter 2.5 child" },
                },
            ],
        },
    ],
};
