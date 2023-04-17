import { current } from "@reduxjs/toolkit";
import { ScreenDimentions } from "../../../redux/screenDimentionsSlice";
import { CanvasDimentions, CirclePositionInCanvasWithLevel, DnDZone, ModifiableProperties, Skill, Tree } from "../../../types";
import { editTreeProperties, findParentOfNode, findTreeNodeById, getRootNodeDefaultPosition, returnCoordinatesByLevel } from "../treeFunctions";
import { Coordinates, PlotTreeReingoldTiltfordAlgorithm } from "./generateTreeFns";
import {
    BROTHER_DND_ZONE_HEIGHT,
    CIRCLE_SIZE,
    DISTANCE_BETWEEN_CHILDREN,
    DISTANCE_BETWEEN_GENERATIONS,
    NAV_HEGIHT,
    ONLY_CHILDREN_DND_ZONE_DIMENTIONS,
    PARENT_DND_ZONE_DIMENTIONS,
} from "./parameters";

export function getCirclePositions(currentTree?: Tree<Skill>): CirclePositionInCanvasWithLevel[] {
    if (!currentTree) return [];

    const unscaledCoordinates = PlotTreeReingoldTiltfordAlgorithm(currentTree);

    const scaledCoordinates = scaleCoordinatesAfterReingoldTiltford(unscaledCoordinates);

    return scaledCoordinates;
}

export function getTreeWidth(coordinates: CirclePositionInCanvasWithLevel[]) {
    let minCoordinate: number | undefined = undefined,
        maxCoordinate: number | undefined = undefined;

    coordinates.forEach((c) => {
        if (minCoordinate === undefined || c.x < minCoordinate) {
            minCoordinate = c.x;
        }
        if (maxCoordinate === undefined || c.x > maxCoordinate) {
            maxCoordinate = c.x;
        }
    });

    return Math.abs(maxCoordinate! - minCoordinate!) + 2 * CIRCLE_SIZE;
}

export function getTreeHeight(coordinates: CirclePositionInCanvasWithLevel[]) {
    let minCoordinate: number | undefined = undefined,
        maxCoordinate: number | undefined = undefined;

    coordinates.forEach((c) => {
        if (minCoordinate === undefined || c.y < minCoordinate) {
            minCoordinate = c.y;
        }
        if (maxCoordinate === undefined || c.y > maxCoordinate) {
            maxCoordinate = c.y;
        }
    });

    return Math.abs(maxCoordinate! - minCoordinate!) + 4 * CIRCLE_SIZE;
}

function dnDZoneBasedOnNodeCoord(
    nodeCoord: CirclePositionInCanvasWithLevel,
    dndType: DnDZone["type"],
    nodeLevelCoordinates: CirclePositionInCanvasWithLevel[]
): DnDZone {
    if (dndType === "PARENT")
        return {
            x: nodeCoord.x - PARENT_DND_ZONE_DIMENTIONS.width / 2,
            y: nodeCoord.y - PARENT_DND_ZONE_DIMENTIONS.height - 1.5 * CIRCLE_SIZE,
            height: PARENT_DND_ZONE_DIMENTIONS.height,
            width: PARENT_DND_ZONE_DIMENTIONS.width,
            type: "PARENT",
            ofNode: nodeCoord.id,
        };

    const brotherDndWidth = DISTANCE_BETWEEN_CHILDREN / 2;

    if (dndType === "LEFT_BROTHER") {
        return {
            x: nodeCoord.x - brotherDndWidth,
            y: nodeCoord.y - BROTHER_DND_ZONE_HEIGHT / 2,
            height: BROTHER_DND_ZONE_HEIGHT,
            width: brotherDndWidth,
            type: "LEFT_BROTHER",
            ofNode: nodeCoord.id,
        };
    }

    if (dndType === "RIGHT_BROTHER")
        return {
            x: nodeCoord.x,
            y: nodeCoord.y - BROTHER_DND_ZONE_HEIGHT / 2,
            height: BROTHER_DND_ZONE_HEIGHT,
            width: brotherDndWidth,
            type: "RIGHT_BROTHER",
            ofNode: nodeCoord.id,
        };

    if (dndType === "ONLY_CHILDREN")
        return {
            height: ONLY_CHILDREN_DND_ZONE_DIMENTIONS.height,
            width: ONLY_CHILDREN_DND_ZONE_DIMENTIONS.width,
            x: nodeCoord.x - ONLY_CHILDREN_DND_ZONE_DIMENTIONS.width / 2,
            y: nodeCoord.y + 1.5 * CIRCLE_SIZE,
            type: "ONLY_CHILDREN",
            ofNode: nodeCoord.id,
        };

    throw "dndType not supported in coordOfDnDZoneBasedOnNodeCoord";
}

export function calculateDragAndDropZones(circlePositionsInCanvas: CirclePositionInCanvasWithLevel[]) {
    const result: DnDZone[] = [];

    const coordinatesByLevel = returnCoordinatesByLevel(circlePositionsInCanvas);

    for (let idx = 0; idx < circlePositionsInCanvas.length; idx++) {
        const pos = circlePositionsInCanvas[idx];

        const isRoot = pos.level === 0;

        if (!isRoot) {
            const parentNodeDndZone = dnDZoneBasedOnNodeCoord(pos, "PARENT", coordinatesByLevel[pos.level]);
            result.push(parentNodeDndZone);

            const leftBrotherDndZone = dnDZoneBasedOnNodeCoord(pos, "LEFT_BROTHER", coordinatesByLevel[pos.level]);
            result.push(leftBrotherDndZone);

            const rightBrotherDndZone = dnDZoneBasedOnNodeCoord(pos, "RIGHT_BROTHER", coordinatesByLevel[pos.level]);
            result.push(rightBrotherDndZone);
        }

        if (nodeDoesntHaveChildren(circlePositionsInCanvas, pos)) {
            const onlyChildrenDndZone = dnDZoneBasedOnNodeCoord(pos, "ONLY_CHILDREN", coordinatesByLevel[pos.level]);
            result.push(onlyChildrenDndZone);
        }
    }

    return result;
}

function nodeDoesntHaveChildren(circlePositionsInCanvas: CirclePositionInCanvasWithLevel[], pos: CirclePositionInCanvasWithLevel) {
    const foo = circlePositionsInCanvas.find((x) => x.parentId === pos.id);

    return foo === undefined;
}

export function calculateDimentionsAndRootCoordinates(
    coordinates: CirclePositionInCanvasWithLevel[],
    screenDimentions: ScreenDimentions
): CanvasDimentions {
    const { height, width } = screenDimentions;

    const HEIGHT_WITHOUT_NAV = height - NAV_HEGIHT;

    if (coordinates.length === 0) return { canvasWidth: width, canvasHeight: height };

    const treeHeight = getTreeHeight(coordinates);
    const treeWidth = getTreeWidth(coordinates);

    const canvasWidth = getCanvasWidth(treeWidth, width);
    const canvasHeight = getCanvasHeight(treeHeight, HEIGHT_WITHOUT_NAV);

    return { canvasWidth, canvasHeight };
}

export const CANVAS_HORIZONTAL_PADDING = 200;
function getCanvasWidth(treeWidth: number, screenWidth: number) {
    const deltaWidthScreen = screenWidth - treeWidth;

    if (deltaWidthScreen < 0) return treeWidth + CANVAS_HORIZONTAL_PADDING;

    if (deltaWidthScreen >= 200) return screenWidth;

    return treeWidth + CANVAS_HORIZONTAL_PADDING;
}

export const CANVAS_VERTICAL_PADDING = 200;
function getCanvasHeight(treeHeight: number, screenHeight: number) {
    const deltaWidthScreen = screenHeight - treeHeight;

    if (deltaWidthScreen < 0) return treeHeight + CANVAS_VERTICAL_PADDING;

    if (deltaWidthScreen >= 200) return screenHeight;

    return treeHeight + CANVAS_VERTICAL_PADDING;
}

export function centerNodeCoordinatesInCanvas(nodeCoordinates: CirclePositionInCanvasWithLevel[], canvasDimentions: CanvasDimentions) {
    const minXCoord = Math.min(...nodeCoordinates.map((x) => x.x));

    const treeWidth = getTreeWidth(nodeCoordinates);
    const treeHeight = getTreeHeight(nodeCoordinates);

    const normalizedCoordinates = nodeCoordinates.map((c) => {
        return { ...c, x: c.x - minXCoord };
    });

    const paddingFromLeftBorder = (canvasDimentions.canvasWidth - treeWidth) / 2;
    const paddingFromTopBorder = (canvasDimentions.canvasHeight - treeHeight) / 2;

    return normalizedCoordinates.map((c) => {
        return { ...c, x: c.x + paddingFromLeftBorder, y: c.y + paddingFromTopBorder };
    });
}

export function getCoordinatesAfterNodeInsertion(selectedDndZone: DnDZone, currentTree: Tree<Skill>, newNode: Skill) {
    const newTree = insertNodeBasedOnDnDZone(selectedDndZone, currentTree, newNode);

    if (!newTree) return undefined;

    return getCirclePositions(newTree);
}

function scaleCoordinatesAfterReingoldTiltford(coordToScale: Coordinates[]) {
    return coordToScale.map((f) => {
        return { ...f, x: f.x * DISTANCE_BETWEEN_CHILDREN + 2 * CIRCLE_SIZE, y: f.y * DISTANCE_BETWEEN_GENERATIONS + CIRCLE_SIZE };
    });
}

export function insertNodeBasedOnDnDZone(selectedDndZone: DnDZone, currentTree: Tree<Skill>, newNode: Skill) {
    //Tengo 3 casos

    const targetNode = findTreeNodeById(currentTree, selectedDndZone.ofNode);

    if (!targetNode) throw "couldnt find targetNode on getTentativeModifiedTree";

    if (selectedDndZone.type === "PARENT") {
        const oldParent: Tree<Skill> = { ...targetNode, isRoot: false, parentId: newNode.id };

        delete oldParent["treeId"];
        delete oldParent["treeName"];
        delete oldParent["accentColor"];

        const newProperties: ModifiableProperties<Tree<Skill>> = { ...targetNode, data: newNode, children: [oldParent] };

        return editTreeProperties(currentTree, targetNode, newProperties);
    }

    const newChild: Tree<Skill> = { data: newNode, parentId: targetNode.data.id };

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
            newChildren.push({ data: newNode, parentId: targetNode.parentId });

        newChildren.push(element);

        if (selectedDndZone.type === "RIGHT_BROTHER" && element.data.id === targetNode.data.id)
            newChildren.push({ data: newNode, parentId: targetNode.parentId });
    }

    const newProperties: ModifiableProperties<Tree<Skill>> = { ...parentOfTargetNode, children: newChildren };

    return editTreeProperties(currentTree, parentOfTargetNode, newProperties);
}
