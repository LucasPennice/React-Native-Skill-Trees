import { DISTANCE_BETWEEN_CHILDREN, DISTANCE_BETWEEN_GENERATIONS } from "../parameters";
import { DnDZone, ModifiableProperties, Skill, Tree } from "../types";
import { findNodeById, findParentOfNode } from "./extractInformationFromTree";

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
        let result: Tree<Skill> = { ...parentNode };

        result.data = { ...childrenToHoist.data };

        if (nodeToDelete.parentId) result.parentId = nodeToDelete.parentId;

        result.isRoot = parentNode.isRoot;

        if (childrenToHoist.children && result.children) {
            result = { ...result, children: [...result.children, ...childrenToHoist.children] };
        }

        //Update the parentId of the hoisted nodes' children
        if (result.children) {
            result.children.forEach((e) => (e.parentId = result.data.id));
        }

        result.children = result.children!.filter((c) => c.data.id !== childrenToHoist.data.id);

        if (result.children.length === 0) delete result["children"];

        return result;
    }
}

export function editTreeProperties(rootNode: Tree<Skill> | undefined, targetNode: Tree<Skill>, newProperties: ModifiableProperties<Tree<Skill>>) {
    if (!rootNode) return undefined;

    //Base Case 👇

    if (rootNode.data.id === targetNode.data.id) {
        const result = { ...rootNode };

        const keysToEdit = Object.keys(newProperties);

        //@ts-ignore
        keysToEdit.forEach((key) => (result[key] = newProperties[key]));

        return result;
    }

    if (!rootNode.children) return rootNode;

    //Recursive Case 👇

    let result: Tree<Skill> = { ...rootNode, children: [] };

    for (let idx = 0; idx < rootNode.children.length; idx++) {
        const element = rootNode.children[idx];

        const d = editTreeProperties(element, targetNode, newProperties);

        if (d) result.children!.push(d);
    }

    if (result.children!.length === 0) delete result["children"];

    return result;
}

export function insertNodeBasedOnDnDZone(selectedDndZone: DnDZone, currentTree: Tree<Skill>, newNode: Skill) {
    //Tengo 3 casos

    const targetNode = findNodeById(currentTree, selectedDndZone.ofNode);

    if (!targetNode) throw "couldnt find targetNode on getTentativeModifiedTree";

    if (selectedDndZone.type === "PARENT") {
        const oldParent: Tree<Skill> = { ...targetNode, isRoot: false, parentId: newNode.id };

        delete oldParent["treeId"];
        delete oldParent["treeName"];
        delete oldParent["accentColor"];

        const newProperties: ModifiableProperties<Tree<Skill>> = { ...targetNode, data: newNode, children: [oldParent] };

        return editTreeProperties(currentTree, targetNode, newProperties);
    }

    const newChild: Tree<Skill> = {
        data: newNode,
        parentId: targetNode.data.id,
        level: targetNode.level + 1,
        x: targetNode.x,
        y: targetNode.y + DISTANCE_BETWEEN_GENERATIONS,
    };

    if (selectedDndZone.type === "ONLY_CHILDREN") {
        const newProperties: ModifiableProperties<Tree<Skill>> = { ...targetNode, children: [newChild] };

        return editTreeProperties(currentTree, targetNode, newProperties);
    }

    //From now on we are in the "BROTHERS" cases

    const parentOfTargetNode = findParentOfNode(currentTree, targetNode.data.id);

    if (!parentOfTargetNode) throw "couldnt find parentOfTargetNode on getTentativeModifiedTree";
    if (!parentOfTargetNode.children) throw "parentOfTargetNode.children is undefined on getTentativeModifiedTree";

    const newChildren: Tree<Skill>[] = [];

    for (let i = 0; i < parentOfTargetNode.children.length; i++) {
        const element = parentOfTargetNode.children[i];

        if (selectedDndZone.type === "LEFT_BROTHER" && element.data.id === targetNode.data.id)
            newChildren.push({
                data: newNode,
                parentId: targetNode.parentId,
                level: targetNode.level,
                x: targetNode.x - DISTANCE_BETWEEN_CHILDREN,
                y: targetNode.y,
            });

        newChildren.push(element);

        if (selectedDndZone.type === "RIGHT_BROTHER" && element.data.id === targetNode.data.id)
            newChildren.push({
                data: newNode,
                parentId: targetNode.parentId,
                level: targetNode.level,
                x: targetNode.x + DISTANCE_BETWEEN_CHILDREN,
                y: targetNode.y,
            });
    }

    const newProperties: ModifiableProperties<Tree<Skill>> = { ...parentOfTargetNode, children: newChildren };

    return editTreeProperties(currentTree, parentOfTargetNode, newProperties);
}

export function mutateEveryTreeNode(rootNode: Tree<Skill> | undefined, mutation: (v: Tree<Skill>) => Tree<Skill>) {
    if (!rootNode) return undefined;

    let result: Tree<Skill> = { ...mutation(rootNode) };

    //Base Case 👇
    if (!rootNode.children || !result.children) return result;

    // //Recursive Case 👇

    const updatedChildren: Tree<Skill>[] = [];

    for (let idx = 0; idx < rootNode.children.length; idx++) {
        const element = rootNode.children[idx];

        const d = mutateEveryTreeNode(element, mutation);

        if (d) updatedChildren.push(d);
    }

    result.children = updatedChildren;

    if (result.children!.length === 0) delete result["children"];

    return result;
}
