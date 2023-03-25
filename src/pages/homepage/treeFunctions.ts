import { ModifiableNodeProperties } from "../../redux/currentTreeSlice";
import { Skill, Tree } from "../../types";

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

export function findTreeNodeById(rootNode: Tree<Skill> | undefined, id: string | null): Tree<Skill> | undefined {
    if (!rootNode) return undefined;
    if (!id) return undefined;

    if (rootNode.data.id === id) return rootNode;

    if (!rootNode.children) return undefined;

    let result = undefined;

    for (let idx = 0; idx < rootNode.children.length; idx++) {
        const element = rootNode.children[idx];

        const foundNode = findTreeNodeById(element, id);

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
        if (Boolean(findTreeNodeById(element, id))) return 1 + (findDistanceBetweenNodesById(element, id) ?? 0);

        return 0;
    });

    return Math.max(...result);
}

export function quantityOfCompletedNodes(rootNode: Tree<Skill> | undefined) {
    if (!rootNode) return undefined;

    //Base case 👇

    if (!rootNode.children && rootNode.data.isCompleted) return 1;
    if (!rootNode.children && !rootNode.data.isCompleted) return 0;
    if (!rootNode.children) return 0;

    //Recursive case 👇

    let result = rootNode.data.isCompleted ? 1 : 0;

    for (let i = 0; i < rootNode.children.length; i++) {
        result = result + (quantityOfCompletedNodes(rootNode.children[i]) ?? 0);
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
        result = result + (quantiyOfNodes(rootNode.children[i]) ?? 0);
    }

    return result;
}

export function findParentOfNode(rootNode: Tree<Skill> | undefined, id: string): Tree<Skill> | undefined {
    if (!rootNode) return undefined;

    const foundNode = findTreeNodeById(rootNode, id);

    if (!foundNode) return undefined;

    const { data, parentId } = foundNode;

    if (!data || !parentId) return undefined;

    const parentNode = findTreeNodeById(rootNode, parentId);

    if (!parentNode || !parentNode.data) return undefined;

    return parentNode;
}

export function deleteNodeWithNoChildren(rootNode: Tree<Skill> | undefined, nodeToDelete: Tree<Skill>) {
    if (!rootNode) return undefined;

    //Base case 👇

    if (rootNode.data.id === nodeToDelete.data.id) return undefined;
    if (!rootNode.children) return rootNode;

    //Recursive case 👇

    let result: Tree<Skill> = { ...rootNode, children: [] };

    if (rootNode.treeId) result.treeId = rootNode.treeId;
    if (rootNode.treeName) result.treeName = rootNode.treeName;

    for (let i = 0; i < rootNode.children.length; i++) {
        const currentChildren = rootNode.children[i];

        if (currentChildren.data.id !== nodeToDelete.data.id) {
            const d = deleteNodeWithNoChildren(currentChildren, nodeToDelete);
            if (d) result.children!.push(d);
        }
    }

    if (result.children!.length === 0) delete result["children"];

    return result;
}

export function deleteNodeWithChildren(rootNode: Tree<Skill> | undefined, nodeToDelete: Tree<Skill>, childrenToHoist: Tree<Skill>) {
    if (!rootNode) return undefined;

    // //Base case 👇

    if (!rootNode.children) return rootNode;

    if (rootNode.data.id === nodeToDelete.data.id) return returnHoistedNode(rootNode, childrenToHoist);

    //Recursive case 👇

    let result: Tree<Skill> = { ...rootNode, children: [] };

    if (rootNode.treeId) result.treeId = rootNode.treeId;
    if (rootNode.treeName) result.treeName = rootNode.treeName;

    for (let i = 0; i < rootNode.children.length; i++) {
        const currentChildren = rootNode.children[i];

        if (currentChildren.data.id !== nodeToDelete.data.id) {
            const d = deleteNodeWithChildren(currentChildren, nodeToDelete, childrenToHoist);
            if (d) result.children!.push(d);
        } else {
            const newNode = returnHoistedNode(currentChildren, childrenToHoist);

            result.children!.push(newNode);
        }
    }

    if (result.children!.length === 0) delete result["children"];

    return result;

    function returnHoistedNode(parentNode: Tree<Skill>, childrenToHoist: Tree<Skill>) {
        const result = { ...parentNode };

        result.data = { ...childrenToHoist.data };

        if (nodeToDelete.parentId) result.parentId = nodeToDelete.parentId;

        result.isRoot = parentNode.isRoot;

        if (childrenToHoist.children && result.children) result.children.push(...childrenToHoist.children);

        //Update the parentId of the hoisted nodes' children
        if (result.children) {
            result.children.forEach((e) => (e.parentId = result.data.id));
        }

        result.children = result.children!.filter((c) => c.data.id !== childrenToHoist.data.id);

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

        //@ts-ignore
        keysToEdit.forEach((key) => (result.data[key] = newProperties[key]));

        return result;
    }

    if (!rootNode.children) return rootNode;

    //Recursive Case 👇

    let result: Tree<Skill> = { ...rootNode, children: [] };

    for (let idx = 0; idx < rootNode.children.length; idx++) {
        const element = rootNode.children[idx];

        const d = editNodeProperty(element, targetNode, newProperties);

        if (d) result.children!.push(d);
    }

    if (result.children!.length === 0) delete result["children"];

    return result;
}

export function getRootNodeDefaultPosition(id: string) {
    return { x: 0, y: 0, id, level: 0, parentId: null };
}
