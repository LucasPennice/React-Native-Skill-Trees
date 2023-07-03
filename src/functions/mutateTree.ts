import { DnDZone, ModifiableProperties, Skill, Tree } from "../types";
import { findNodeById, findParentOfNode, treeCompletedSkillPercentage } from "./extractInformationFromTree";

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

export function editTreeProperties<T extends { nodeId: string }>(
    rootNode: Tree<Skill> | undefined,
    targetNode: T,
    newProperties: ModifiableProperties<Tree<Skill>>
) {
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

export function insertNodesBasedOnDnDZone(selectedDndZone: DnDZone, currentTree: Tree<Skill>, newNodes: Tree<Skill>[]) {
    const targetNode = findNodeById(currentTree, selectedDndZone.ofNode);
    if (!targetNode) throw new Error("couldnt find targetNode on insertNodesBasedOnDnDZone");

    const treePropertiesToInherit = { accentColor: targetNode.accentColor, treeId: targetNode.treeId, treeName: targetNode.treeName };

    if (selectedDndZone.type === "PARENT") return handleInsertNodeAsParent();

    if (selectedDndZone.type === "ONLY_CHILDREN") return handleInsertNodeAsChildren();
    //From now on we are in the "BROTHERS" cases

    const parentOfTargetNode = findParentOfNode(currentTree, targetNode.nodeId);

    if (!parentOfTargetNode) throw new Error("couldnt find parentOfTargetNode on getTentativeModifiedTree");
    if (!parentOfTargetNode.children) throw new Error("parentOfTargetNode.children is undefined on getTentativeModifiedTree");

    //The target node for the LEFT or RIGHT case is their sibling

    const childrenToAdd: Tree<Skill>[] = newNodes.map((n) => {
        return {
            ...treePropertiesToInherit,
            category: "SKILL",
            children: [],
            data: n.data,
            isRoot: false,
            level: targetNode!.level,
            nodeId: n.nodeId,
            parentId: parentOfTargetNode!.nodeId,
            x: 0,
            y: 0,
        };
    });

    if (selectedDndZone.type === "LEFT_BROTHER") return handleInsertNodeAsLeftSibling(childrenToAdd);

    //RIGHT BROTHER CASE
    return handleInsertNodeAsRightSibling(childrenToAdd);

    function handleInsertNodeAsParent() {
        const newParent = newNodes[0];
        //The old parent now becomes the child of the new node
        const oldParent: Tree<Skill> = {
            ...treePropertiesToInherit,
            category: targetNode!.category,
            children: targetNode!.children,
            data: targetNode!.data,
            level: targetNode!.level + 1,
            nodeId: targetNode!.nodeId,
            x: 0,
            y: 0,
            isRoot: false,
            parentId: newParent.nodeId,
        };

        const newProperties: ModifiableProperties<Tree<Skill>> = {
            ...treePropertiesToInherit,
            category: "SKILL",
            data: newParent.data,
            isRoot: false,
            level: targetNode!.level,
            nodeId: newParent.nodeId,
            x: 0,
            y: 0,
            parentId: targetNode!.parentId,
            children: [oldParent],
        };

        return editTreeProperties(currentTree, targetNode!, newProperties);
    }

    function handleInsertNodeAsChildren() {
        const newChildren: Tree<Skill>[] = newNodes.map((n) => {
            return {
                ...treePropertiesToInherit,
                category: "SKILL",
                children: [],
                data: n.data,
                isRoot: false,
                level: targetNode!.level + 1,
                nodeId: n.nodeId,
                parentId: targetNode!.nodeId,
                x: 0,
                y: 0,
            };
        });

        const newProperties: ModifiableProperties<Tree<Skill>> = { ...targetNode!, children: newChildren };

        return editTreeProperties(currentTree, targetNode!, newProperties);
    }

    function handleInsertNodeAsLeftSibling(childrenToAdd: Tree<Skill>[]) {
        const updatedParent: Tree<Skill> = {
            ...treePropertiesToInherit,
            category: parentOfTargetNode!.category,
            children: [...childrenToAdd, ...parentOfTargetNode!.children],
            data: parentOfTargetNode!.data,
            isRoot: parentOfTargetNode!.isRoot,
            level: parentOfTargetNode!.level,
            nodeId: parentOfTargetNode!.nodeId,
            parentId: parentOfTargetNode!.parentId,
            x: 0,
            y: 0,
        };

        return editTreeProperties(currentTree, parentOfTargetNode!, updatedParent);
    }
    function handleInsertNodeAsRightSibling(childrenToAdd: Tree<Skill>[]) {
        const updatedParent: Tree<Skill> = {
            ...treePropertiesToInherit,
            category: parentOfTargetNode!.category,
            children: [...parentOfTargetNode!.children, ...childrenToAdd],
            data: parentOfTargetNode!.data,
            isRoot: parentOfTargetNode!.isRoot,
            level: parentOfTargetNode!.level,
            nodeId: parentOfTargetNode!.nodeId,
            parentId: parentOfTargetNode!.parentId,
            x: 0,
            y: 0,
        };

        return editTreeProperties(currentTree, parentOfTargetNode!, updatedParent);
    }
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

export function updateNodeAndTreeCompletion(tree: Tree<Skill> | undefined, updatedNode: Tree<Skill>) {
    let updatedRootNode = editTreeProperties(tree, { nodeId: updatedNode.nodeId }, updatedNode);

    if (!updatedRootNode) throw new Error("Error saving tree in updateNodeAndTreeCompletion");

    const treeSkillCompletion = treeCompletedSkillPercentage(updatedRootNode);

    if (treeSkillCompletion === 100) updatedRootNode = { ...updatedRootNode, data: { ...updatedRootNode.data, isCompleted: true } };
    if (treeSkillCompletion !== 100) updatedRootNode = { ...updatedRootNode, data: { ...updatedRootNode.data, isCompleted: false } };

    return updatedRootNode;
}
