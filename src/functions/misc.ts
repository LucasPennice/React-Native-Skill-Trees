import { TreeData } from "@/redux/slices/userTreesSlice";
import { Dictionary } from "@reduxjs/toolkit";
import { colors } from "../parameters";
import {
    CartesianCoordinate,
    ColorGradient,
    DistanceToCenterPerLevel,
    DnDZone,
    NodeCategory,
    NormalizedNode,
    Skill,
    Tree,
    UpdateRadiusPerLevelTable,
    getDefaultSkillValue,
} from "../types";
import { UserFeedback } from "@/redux/slices/userFeedbackSlice";
import { arrayToDictionary, getDescendantsId } from "./extractInformationFromTree";

export function generate24CharHexId() {
    const hexChars = "0123456789abcdef";
    let hexId = "";

    for (let i = 0; i < 24; i++) {
        const randomIndex = Math.floor(Math.random() * 16);
        hexId += hexChars[randomIndex];
    }

    return hexId;
}

export function isHexadecimal(str: string) {
    const hexRegex = /^[0-9a-fA-F]+$/;
    return hexRegex.test(str);
}

export function createTree(treeName: string, gradient: ColorGradient, isRoot: boolean, category: NodeCategory, data: Skill) {
    const result: Tree<Skill> = {
        treeName: treeName.trim(),
        accentColor: gradient,
        isRoot,
        parentId: null,
        treeId: generate24CharHexId(),
        level: 0,
        nodeId: generate24CharHexId(),
        category,
        children: [],
        x: 0,
        y: 0,
        data: getDefaultSkillValue(data.name.trim(), data.isCompleted ?? false, data.icon),
    };

    return result;
}

export function interpolateColors(color1: string, color2: string, percent: number) {
    // Convert the hex colors to RGB values
    const r1 = parseInt(color1.substring(1, 3), 16);
    const g1 = parseInt(color1.substring(3, 5), 16);
    const b1 = parseInt(color1.substring(5, 7), 16);

    const r2 = parseInt(color2.substring(1, 3), 16);
    const g2 = parseInt(color2.substring(3, 5), 16);
    const b2 = parseInt(color2.substring(5, 7), 16);

    // Interpolate the RGB values
    const r = Math.round(r1 + (r2 - r1) * percent);
    const g = Math.round(g1 + (g2 - g1) * percent);
    const b = Math.round(b1 + (b2 - b1) * percent);

    // Convert the interpolated RGB values back to a hex color
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export function checkContrastHex(color1: string, color2: string) {
    let [luminance1, luminance2] = [color1, color2].map((color) => {
        color = color.startsWith("#") ? color.slice(1) : color;

        let r = parseInt(color.slice(0, 2), 16);
        let g = parseInt(color.slice(2, 4), 16);
        let b = parseInt(color.slice(4, 6), 16);

        return luminance(r, g, b);
    });

    return contrastRatio(luminance1, luminance2);

    function contrastRatio(luminance1: number, luminance2: number) {
        let lighterLum = Math.max(luminance1, luminance2);
        let darkerLum = Math.min(luminance1, luminance2);

        return (lighterLum + 0.05) / (darkerLum + 0.05);
    }

    function luminance(r: number, g: number, b: number) {
        let [lumR, lumG, lumB] = [r, g, b].map((component) => {
            let proportion = component / 255;

            return proportion <= 0.03928 ? proportion / 12.92 : Math.pow((proportion + 0.055) / 1.055, 2.4);
        });

        return 0.2126 * lumR + 0.7152 * lumG + 0.0722 * lumB;
    }
}

export function getLabelTextColor(treeAccentColor: string) {
    const whiteContrast = checkContrastHex(treeAccentColor, "#FFFFFF");
    const backgroundContrast = checkContrastHex(treeAccentColor, colors.background);

    if (whiteContrast > backgroundContrast) return "#FFFFFF";

    return colors.background;
}

export function getWheelParams(progressColor: string, backgroundColor: string, size?: number, strokeWidth?: number) {
    let result = {
        size: 65,
        strokeWidth: 7,
        centerCoordinate: 0,
        radius: 0,
        circumference: 0,
        strokeDasharray: 0,
        progressStroke: "",
        backgroundStroke: "",
    };

    if (size) result.size = size;
    if (strokeWidth) result.strokeWidth = strokeWidth;

    result.centerCoordinate = result.size / 2;
    result.radius = result.size / 2 - result.strokeWidth / 2;
    result.progressStroke = progressColor;
    result.backgroundStroke = backgroundColor;
    result.circumference = 2 * Math.PI * result.radius;
    result.strokeDasharray = 2 * Math.PI * result.radius;

    return result;
}

export function renderScaleForNodeActionMenu(scale: number) {
    //Just to make sure I notice an invalid value
    if (scale === 0) return 5;

    return 1 / scale;
}

export function updateRadiusPerLevelTable(distanceToCenterPerLevel: DistanceToCenterPerLevel, levelOverflow: UpdateRadiusPerLevelTable) {
    if (!levelOverflow) throw new Error("levelOverflow undefined at updatedDistanceToCenterTable");

    const result: DistanceToCenterPerLevel = { ...distanceToCenterPerLevel };

    const levelsString = Object.keys(distanceToCenterPerLevel);

    for (const levelString of levelsString) {
        const level = parseInt(levelString);

        if (level >= levelOverflow.level) {
            const timesToIncrease = level - levelOverflow.level + 1;

            result[level] = result[level] + levelOverflow.distanceToDisplace * timesToIncrease;
        }
    }

    return result;
}

export function deleteNodeAndHoistChild(nodes: NormalizedNode[], nodeToHoist: NormalizedNode) {
    const nodeToDelete = nodes.find((n) => n.nodeId === nodeToHoist.parentId);

    if (!nodeToDelete) throw new Error("nodeToDelete undefined at deleteNodeAndHoistChildren");

    const parentOfNodeToDelete = nodes.find((n) => n.nodeId === nodeToDelete.parentId);

    if (!parentOfNodeToDelete) throw new Error("nodeToDelete undefined at deleteNodeAndHoistChildren");

    //This array does not include the node to be hoisted
    const childrenOfNodeToDeleteIds = nodeToDelete.childrenIds.filter((id) => id !== nodeToHoist.nodeId);

    const childrenOfNodeToDelete = childrenOfNodeToDeleteIds.map((childId) => {
        const child = nodes.find((n) => n.nodeId === childId);

        if (!child) throw new Error("child not found at childrenOfNodeToDelete");

        return child;
    });

    //Replacing the nodeId of the node to delete for the id of the node to hoist
    const updatedParentOfNodeToDelete: NormalizedNode = {
        ...parentOfNodeToDelete,
        childrenIds: parentOfNodeToDelete.childrenIds.map((childId) => {
            if (childId === nodeToDelete.nodeId) return nodeToHoist.nodeId;
            return childId;
        }),
    };

    //Updating the parent id value of node to hoist
    //Adding the nodeToDelete children to nodeToHoist's array of children (Except for itself)
    const updatedNodeToHoist: NormalizedNode = {
        ...nodeToHoist,
        level: nodeToHoist.level - 1,
        parentId: parentOfNodeToDelete.nodeId,
        childrenIds: [...nodeToHoist.childrenIds, ...nodeToDelete.childrenIds.filter((childId) => childId !== nodeToHoist.nodeId)],
    };

    const nodeToHoistChildren = nodes.filter((node) => nodeToHoist.childrenIds.includes(node.nodeId));

    const updateNodeToHoistChildren = nodeToHoistChildren.map((node) => {
        return { ...node, level: node.level - 1 };
    });

    //Updating the parent id value of the children of the node to be deleted
    const updatedChildrenOfNodeToDelete: NormalizedNode[] = childrenOfNodeToDelete.map((node) => {
        return { ...node, parentId: nodeToHoist.nodeId };
    });

    return {
        nodeIdToDelete: nodeToDelete.nodeId,
        updatedNodes: [updatedParentOfNodeToDelete, updatedNodeToHoist, ...updateNodeToHoistChildren, ...updatedChildrenOfNodeToDelete],
    };
}

export function deleteNodeAndChildren(nodes: NormalizedNode[], nodeToDelete: NormalizedNode) {
    const parentOfNodeToDelete = nodes.find((n) => n.nodeId === nodeToDelete.parentId);

    if (!parentOfNodeToDelete) throw new Error("nodeToDelete undefined at deleteNodeAndChildren");

    const updatedParentOfNodeToDelete: NormalizedNode = {
        ...parentOfNodeToDelete,
        childrenIds: parentOfNodeToDelete.childrenIds.filter((childId) => childId !== nodeToDelete.nodeId),
    };

    const nodeDictionary = arrayToDictionary(nodes);

    const descendantsIds = getDescendantsId(nodeDictionary, nodeToDelete.nodeId);

    return { nodesToDelete: [...descendantsIds, nodeToDelete.nodeId], updatedNodes: [updatedParentOfNodeToDelete] };
}

export function insertNodeAsParent(nodesOfTree: NormalizedNode[], nodeToAdd: NormalizedNode, newNodePosition: DnDZone) {
    //By selected node I mean the node from which you select the position to open the add node modal
    const selectedNode = nodesOfTree.find((node) => node.nodeId === newNodePosition.ofNode);

    if (!selectedNode) throw new Error("undefined selectedNode at insertNodeAsParent");

    const parentOfSelectedNode = nodesOfTree.find((node) => node.nodeId === selectedNode.parentId);

    if (!parentOfSelectedNode) throw new Error("undefined parentOfSelectedNode at insertNodeAsParent");

    const updatedParentOfSelectedNode: NormalizedNode = {
        ...parentOfSelectedNode,
        childrenIds: parentOfSelectedNode.childrenIds.map((childId) => {
            if (childId === selectedNode.nodeId) return nodeToAdd.nodeId;
            return childId;
        }),
    };

    const selectedNodeTreeWithLevelUpdated = nodesToUpdateFromTreeMutation(nodesOfTree, selectedNode, (v) => {
        if (v.nodeId === selectedNode.nodeId) return { ...v, level: v.level + 1, parentId: nodeToAdd.nodeId };
        return { ...v, level: v.level + 1 };
    });

    const updatedNewNode: NormalizedNode = {
        ...nodeToAdd,
        parentId: parentOfSelectedNode.nodeId,
        childrenIds: [selectedNode.nodeId],
        level: selectedNode.level,
    };

    return { nodesToUpdate: [updatedParentOfSelectedNode, ...selectedNodeTreeWithLevelUpdated], nodeToAdd: updatedNewNode };
}

export function insertNodeAsSibling(nodesOfTree: NormalizedNode[], nodesToAdd: NormalizedNode[], newNodePosition: DnDZone) {
    const selectedNode = nodesOfTree.find((node) => node.nodeId === newNodePosition.ofNode);

    if (!selectedNode) throw new Error("undefined selectedNode at insertNodeAsLeftSibling");

    const parentOfSelectedNode = nodesOfTree.find((node) => node.nodeId === selectedNode.parentId);

    if (!parentOfSelectedNode) throw new Error("undefined parentOfSelectedNode at insertNodeAsLeftSibling");

    const indexOfSelected = parentOfSelectedNode.childrenIds.findIndex((id) => id === selectedNode.nodeId);
    const leftSiblingsOfTargetNode = parentOfSelectedNode.childrenIds.slice(0, indexOfSelected);
    const rightSiblingsOfTargetNode = parentOfSelectedNode.childrenIds.slice(indexOfSelected + 1, parentOfSelectedNode.childrenIds.length);

    const nodesToAddIds = nodesToAdd.map((node) => node.nodeId);

    const updatedNodesToAdd = nodesToAdd.map((node) => {
        return { ...node, level: selectedNode.level, parentId: selectedNode.parentId, treeId: selectedNode.treeId };
    });

    if (newNodePosition.type === "LEFT_BROTHER") {
        const updatedParentOfSelectedNode: NormalizedNode = {
            ...parentOfSelectedNode,
            childrenIds: [...leftSiblingsOfTargetNode, ...nodesToAddIds, selectedNode.nodeId, ...rightSiblingsOfTargetNode],
        };

        return { nodesToUpdate: [updatedParentOfSelectedNode], nodesToAdd: updatedNodesToAdd };
    }

    const updatedParentOfSelectedNode: NormalizedNode = {
        ...parentOfSelectedNode,
        childrenIds: [...leftSiblingsOfTargetNode, selectedNode.nodeId, ...nodesToAddIds, ...rightSiblingsOfTargetNode],
    };

    return { nodesToUpdate: [updatedParentOfSelectedNode], nodesToAdd: updatedNodesToAdd };
}

export function insertNodeAsChild(nodesOfTree: NormalizedNode[], nodesToAdd: NormalizedNode[], newNodePosition: DnDZone) {
    const selectedNode = nodesOfTree.find((node) => node.nodeId === newNodePosition.ofNode);

    if (!selectedNode) throw new Error("undefined selectedNode at insertNodeAsChild");

    const updatedSelectedNode: NormalizedNode = { ...selectedNode, childrenIds: nodesToAdd.map((n) => n.nodeId) };

    const onlyAddingOneNodeCase = nodesToAdd.length === 1;

    if (onlyAddingOneNodeCase) {
        const selectedNodeTreeWithLevelUpdated = nodesToUpdateFromTreeMutation(nodesOfTree, selectedNode, (v) => {
            if (v.parentId === selectedNode.nodeId) return { ...v, level: v.level + 1, parentId: nodesToAdd[0].nodeId };
            return { ...v, level: v.level + 1 };
        });

        const updatedNodeToAdd: NormalizedNode = {
            ...nodesToAdd[0],
            childrenIds: selectedNode.childrenIds,
            level: selectedNode.level + 1,
            parentId: selectedNode.nodeId,
        };

        const foo = selectedNodeTreeWithLevelUpdated.filter((n) => n.nodeId !== selectedNode.nodeId);

        return {
            nodesToUpdate: [updatedSelectedNode, ...foo],
            nodesToAdd: [updatedNodeToAdd],
        };
    }

    const updatedNodeToAdd: NormalizedNode[] = nodesToAdd.map((node) => {
        return {
            ...node,
            level: selectedNode.level + 1,
            parentId: selectedNode.nodeId,
        };
    });

    return { nodesToUpdate: [updatedSelectedNode], nodesToAdd: updatedNodeToAdd };
}

export function nodesToUpdateFromTreeMutation(
    nodes: NormalizedNode[],
    startingNode: NormalizedNode,
    mutation: (v: NormalizedNode) => NormalizedNode
) {
    let result: NormalizedNode[] = [];

    createTreeFromArray(startingNode.nodeId);

    return result;

    function createTreeFromArray(nodeId: string) {
        const nodeOfTree = nodes.find((n) => n.nodeId === nodeId);

        if (!nodeOfTree) throw new Error(`nodeOfTree undefined at nodesToUpdateFromTreeMutation id of: ${nodeId}`);

        const updatedNode: NormalizedNode = mutation(nodeOfTree);

        result.push(updatedNode);

        if (!nodeOfTree.childrenIds.length) return;

        for (const childId of nodeOfTree.childrenIds) createTreeFromArray(childId);
    }
}

export const treeToNormalizedNodeAndTreeDataAdapter = (tree: Tree<Skill>) => {
    const treeData: TreeData = {
        icon: tree.data.icon,
        accentColor: tree.accentColor,
        nodes: [],
        rootNodeId: tree.nodeId,
        treeId: tree.treeId,
        treeName: tree.treeName,
    };

    const nodes: Dictionary<NormalizedNode> = {};

    runFnOnEveryNode(tree, (node: Tree<Skill>) => createNodeEntity(node));

    return { treeData, nodes };

    function createNodeEntity(node: Tree<Skill>) {
        nodes[node.nodeId] = {
            category: node.category,
            data: node.data,
            isRoot: node.isRoot,
            level: node.level,
            nodeId: node.nodeId,
            parentId: node.parentId,
            treeId: node.treeId,
            x: node.x,
            y: node.y,
            childrenIds: node.children.map((node) => node.nodeId),
        };
    }

    function runFnOnEveryNode(rootNode: Tree<Skill>, fn: (value: Tree<Skill>) => void) {
        //Base case 👇

        if (!rootNode.children.length) return fn(rootNode);

        //Recursive case 👇

        for (let i = 0; i < rootNode.children.length; i++) {
            runFnOnEveryNode(rootNode.children[i], fn);
        }

        return fn(rootNode);
    }
};

export function getNodeDistanceToPoint<T extends CartesianCoordinate>(node: T, center: CartesianCoordinate) {
    const deltaX = node.x - center.x;
    const deltaY = node.y - center.y;

    const squareX = deltaX ** 2;
    const squareY = deltaY ** 2;

    const result = Math.sqrt(squareX + squareY);

    return result;
}

export function reverseArray<T>(arr: T[]) {
    return arr.map((_, idx) => {
        const inversedIdx = arr.length - 1 - idx;

        return arr[inversedIdx];
    });
}

export function getUserFeedbackProgressPercentage(userFeedback: UserFeedback) {
    let acum = 0;

    const keys = Object.keys(userFeedback);

    const QTY_OF_KEYS_THAT_CONTRIBUTE_TO_PERCENTAGE = 3;
    const percentageIncrease = 100 / QTY_OF_KEYS_THAT_CONTRIBUTE_TO_PERCENTAGE;

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i] as keyof UserFeedback;
        const feedbackIssue = userFeedback[key];

        switch (key) {
            case "currentSolution":
                if (feedbackIssue.length !== 0) acum += percentageIncrease;
                break;
            case "mainObstacle":
                if (feedbackIssue.length !== 0) acum += percentageIncrease;
                break;
            case "problems":
                if (feedbackIssue.length !== 0) acum += percentageIncrease;
                break;
            default:
                break;
        }
    }

    return parseInt(`${acum}`);
}
