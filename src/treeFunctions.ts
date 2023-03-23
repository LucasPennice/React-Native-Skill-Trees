import { selectCanvasDisplaySettings } from "./canvasDisplaySettingsSlice";
import { ModifiableNodeProperties } from "./currentTreeSlice";
import { useAppSelector } from "./reduxHooks";
import { Skill, mockSkillTreeArray, Tree } from "./types";

export function findTreeHeight(rootNode: Tree<Skill> | undefined) {
    if (!rootNode) return undefined;

    if (!rootNode.data) return 0;

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

    if (rootNode.data.id === id) return rootNode;
    if (!rootNode.data) return undefined;
    if (!rootNode.children) return undefined;

    let arr = rootNode.children.map((item) => {
        return findTreeNodeById(item, id);
    });

    return arr.find((c) => c !== undefined);
}

export function findDistanceBetweenNodesById(rootNode: Tree<Skill> | undefined, id: string): number {
    if (!rootNode) return undefined;

    //Base case 👇

    if (rootNode.data.id === id) return 1;
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

    if (!rootNode.children && rootNode.data.isCompleted) return 1;
    if (!rootNode.children && !rootNode.data.isCompleted) return 0;

    //Recursive case 👇

    let result = rootNode.data.isCompleted ? 1 : 0;

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

    const { data } = foundNode;

    if (!data || !data.parentId) return undefined;

    const parentNode = findTreeNodeById(rootNode, data.parentId);

    if (!parentNode || !parentNode.data) return undefined;

    return parentNode;
}

export function deleteNodeWithNoChildren(rootNode: Tree<Skill> | undefined, nodeToDelete: Tree<Skill>) {
    if (!rootNode) return undefined;

    //Base case 👇

    if (rootNode.data.id === nodeToDelete.data.id) return undefined;
    if (!rootNode.children) return rootNode;

    //Recursive case 👇

    let result: Tree<Skill> = { data: rootNode.data, children: [] };

    if (rootNode.treeId) result.treeId = rootNode.treeId;
    if (rootNode.treeName) result.treeName = rootNode.treeName;

    for (let i = 0; i < rootNode.children.length; i++) {
        const currentChildren = rootNode.children[i];

        if (currentChildren.data.id !== nodeToDelete.data.id) {
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

    if (rootNode.data.id === nodeToDelete.data.id) return returnHoistedNode(rootNode, childrenToHoist);

    //Recursive case 👇

    let result: Tree<Skill> = { data: rootNode.data, children: [] };

    if (rootNode.treeId) result.treeId = rootNode.treeId;
    if (rootNode.treeName) result.treeName = rootNode.treeName;

    for (let i = 0; i < rootNode.children.length; i++) {
        const currentChildren = rootNode.children[i];

        if (currentChildren.data.id !== nodeToDelete.data.id) {
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

        result.data = { ...childrenToHoist.data };

        if (nodeToDelete.data.parentId) result.data.parentId = nodeToDelete.data.parentId;

        result.data.isRoot = parentNode.data.isRoot;

        if (childrenToHoist.children) result.children.push(...childrenToHoist.children);

        //Update the parentId of the hoisted nodes' children
        if (result.children) {
            result.children.forEach((e) => (e.data.parentId = result.data.id));
        }

        result.children = result.children.filter((c) => c.data.id !== childrenToHoist.data.id);

        if (result.children.length === 0) delete result["children"];

        return result;
    }
}

export function editNodeProperty(rootNode: Tree<Skill> | undefined, targetNode: Tree<Skill>, newProperties: ModifiableNodeProperties) {
    if (!rootNode) return undefined;

    //Base Case 👇

    if (rootNode.data.id === targetNode.data.id) {
        const result = { ...rootNode };

        const keysToEdit = Object.keys(newProperties);

        keysToEdit.forEach((key) => (result.data[key] = newProperties[key]));

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
    data: { id: `Harry Potter 1`, name: "Harry Potter 1", isRoot: true },
    children: [
        {
            data: { id: `Harry Potter 2`, name: "Harry Potter 2" },
            children: [
                {
                    data: { id: `Harry Potter 3`, name: "Harry Potter 3" },
                    children: [
                        { data: { id: `Harry Potter 41`, name: "Harry Potter 41" } },
                        { data: { id: `Harry Potter 42`, name: "Harry Potter 42" } },
                        { data: { id: `Harry Potter 43`, name: "Harry Potter 43" } },
                    ],
                },
            ],
        },
        {
            data: { id: "Harry Potter 2.5", name: "Harry Potter 2.5" },
            children: [
                {
                    data: { id: "Harry Potter 2.5 child", name: "Harry Potter 2.5 child" },
                },
            ],
        },
    ],
};
