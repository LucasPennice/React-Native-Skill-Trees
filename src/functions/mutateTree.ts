import { DISTANCE_BETWEEN_CHILDREN, DISTANCE_BETWEEN_GENERATIONS } from "../parameters";
import { DnDZone, ModifiableProperties, Skill, Tree } from "../types";
import { findNodeById, findParentOfNode } from "./extractInformationFromTree";

export function deleteNodeWithNoChildren(rootNode: Tree<Skill> | undefined, nodeToDelete: Tree<Skill>) {
    if (!rootNode) return undefined;

    //Base case 👇

    if (rootNode.nodeId === nodeToDelete.nodeId) return undefined;
    if (!rootNode.children.length) return rootNode;

    //Recursive case 👇

    let result: Tree<Skill> = { ...rootNode, children: [] };

    result.treeId = rootNode.treeId;
    result.treeName = rootNode.treeName;

    for (let i = 0; i < rootNode.children.length; i++) {
        const currentChildren = rootNode.children[i];

        if (currentChildren.nodeId !== nodeToDelete.nodeId) {
            const d = deleteNodeWithNoChildren(currentChildren, nodeToDelete);
            if (d) result.children!.push(d);
        }
    }

    return result;
}

export function deleteNodeWithChildren(rootNode: Tree<Skill> | undefined, nodeToDelete: Tree<Skill>, childrenToHoist: Tree<Skill>) {
    if (!rootNode) return undefined;

    // //Base case 👇

    if (!rootNode.children.length) return rootNode;

    if (rootNode.nodeId === nodeToDelete.nodeId) return returnHoistedNode(rootNode, childrenToHoist);

    //Recursive case 👇

    let result: Tree<Skill> = { ...rootNode, children: [] };

    result.treeId = rootNode.treeId;
    result.treeName = rootNode.treeName;

    for (let i = 0; i < rootNode.children.length; i++) {
        const currentChildren = rootNode.children[i];

        if (currentChildren.nodeId !== nodeToDelete.nodeId) {
            const d = deleteNodeWithChildren(currentChildren, nodeToDelete, childrenToHoist);
            if (d) result.children!.push(d);
        } else {
            const newNode = returnHoistedNode(currentChildren, childrenToHoist);

            result.children!.push(newNode);
        }
    }

    return result;

    function returnHoistedNode(parentNode: Tree<Skill>, childrenToHoist: Tree<Skill>) {
        let result: Tree<Skill> = { ...parentNode };

        result.data = { ...childrenToHoist.data };

        if (nodeToDelete.parentId) result.parentId = nodeToDelete.parentId;

        result.isRoot = parentNode.isRoot;

        if (childrenToHoist.children.length && result.children.length) {
            result = { ...result, children: [...result.children, ...childrenToHoist.children] };
        }

        //Update the parentId of the hoisted nodes' children
        if (result.children.length) {
            result.children.forEach((e) => (e.parentId = result.nodeId));
        }

        result.children = result.children!.filter((c) => c.nodeId !== childrenToHoist.nodeId);

        return result;
    }
}

export function editTreeProperties(rootNode: Tree<Skill> | undefined, targetNode: Tree<Skill>, newProperties: ModifiableProperties<Tree<Skill>>) {
    if (!rootNode) return undefined;

    //Base Case 👇

    if (rootNode.nodeId === targetNode.nodeId) {
        const result = { ...rootNode };

        const keysToEdit = Object.keys(newProperties);

        //@ts-ignore
        keysToEdit.forEach((key) => (result[key] = newProperties[key]));

        return result;
    }

    if (!rootNode.children.length) return rootNode;

    //Recursive Case 👇

    let result: Tree<Skill> = { ...rootNode, children: [] };

    for (let idx = 0; idx < rootNode.children.length; idx++) {
        const element = rootNode.children[idx];

        const d = editTreeProperties(element, targetNode, newProperties);

        if (d) result.children.push(d);
    }

    return result;
}

export function mutateEveryTree(rootNode: Tree<Skill> | undefined, mutation: (v: Tree<Skill>) => Tree<Skill>) {
    if (!rootNode) return undefined;

    //Base Case 👇

    const mutatedTree = mutation(rootNode);

    let result: Tree<Skill> = { ...rootNode, ...mutatedTree, children: [] };

    if (!rootNode.children.length) return result;

    //Recursive Case 👇

    for (let idx = 0; idx < rootNode.children.length; idx++) {
        const element = rootNode.children[idx];

        const d = mutateEveryTree(element, mutation);

        if (d) result.children.push(d);
    }

    return result;
}

export function insertNodeBasedOnDnDZone(selectedDndZone: DnDZone, currentTree: Tree<Skill>, newNode: Tree<Skill>) {
    const targetNode = findNodeById(currentTree, selectedDndZone.ofNode);
    if (!targetNode) throw "couldnt find targetNode on getTentativeModifiedTree";

    const treePropertiesToInherit = { accentColor: targetNode.accentColor, treeId: targetNode.treeId, treeName: targetNode.treeName };

    if (selectedDndZone.type === "PARENT") {
        //The old parent now becomes the child of the new node
        const oldParent: Tree<Skill> = { ...targetNode, isRoot: false, parentId: newNode.nodeId };

        const newProperties: ModifiableProperties<Tree<Skill>> = { ...targetNode, ...newNode, ...treePropertiesToInherit, children: [oldParent] };

        return editTreeProperties(currentTree, targetNode, newProperties);
    }

    const newChild: Tree<Skill> = {
        ...newNode,
        parentId: targetNode.nodeId,
        level: targetNode.level + 1,
        x: targetNode.x,
        y: targetNode.y + DISTANCE_BETWEEN_GENERATIONS,
        children: [],
        isRoot: false,
        ...treePropertiesToInherit,
    };

    if (selectedDndZone.type === "ONLY_CHILDREN") {
        const newProperties: ModifiableProperties<Tree<Skill>> = { ...targetNode, children: [newChild] };

        return editTreeProperties(currentTree, targetNode, newProperties);
    }

    //From now on we are in the "BROTHERS" cases

    const parentOfTargetNode = findParentOfNode(currentTree, targetNode.nodeId);

    if (!parentOfTargetNode) throw "couldnt find parentOfTargetNode on getTentativeModifiedTree";
    if (!parentOfTargetNode.children) throw "parentOfTargetNode.children is undefined on getTentativeModifiedTree";

    const newChildren: Tree<Skill>[] = [];

    for (let i = 0; i < parentOfTargetNode.children.length; i++) {
        const element = parentOfTargetNode.children[i];

        if (selectedDndZone.type === "LEFT_BROTHER" && element.nodeId === targetNode.nodeId)
            newChildren.push({
                ...targetNode,
                ...newNode,
                parentId: targetNode.parentId,
                level: targetNode.level,
                x: targetNode.x - DISTANCE_BETWEEN_CHILDREN,
                y: targetNode.y,
                children: [],
                ...treePropertiesToInherit,
            });

        newChildren.push(element);

        if (selectedDndZone.type === "RIGHT_BROTHER" && element.nodeId === targetNode.nodeId)
            newChildren.push({
                ...targetNode,
                ...newNode,
                parentId: targetNode.parentId,
                level: targetNode.level,
                x: targetNode.x + DISTANCE_BETWEEN_CHILDREN,
                y: targetNode.y,
                children: [],
                ...treePropertiesToInherit,
            });
    }

    const newProperties: ModifiableProperties<Tree<Skill>> = { ...parentOfTargetNode, children: newChildren };

    return editTreeProperties(currentTree, parentOfTargetNode, newProperties);
}

export function mutateEveryTreeNode(rootNode: Tree<Skill> | undefined, mutation: (v: Tree<Skill>) => Tree<Skill>) {
    if (!rootNode) return undefined;

    let result: Tree<Skill> = { ...mutation(rootNode) };

    //Base Case 👇
    if (!rootNode.children.length) return result;

    // //Recursive Case 👇

    const updatedChildren: Tree<Skill>[] = [];

    for (let idx = 0; idx < rootNode.children.length; idx++) {
        const element = rootNode.children[idx];

        const d = mutateEveryTreeNode(element, mutation);

        if (d) updatedChildren.push(d);
    }

    result.children = updatedChildren;

    return result;
}
