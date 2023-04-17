import { current } from "@reduxjs/toolkit";
import { ScreenDimentions } from "../../../redux/screenDimentionsSlice";
import { CanvasDimentions, CirclePositionInCanvasWithLevel, DnDZone, Skill, Tree } from "../../../types";
import { getRootNodeDefaultPosition, returnCoordinatesByLevel } from "../treeFunctions";
import { PlotTreeReingoldTiltfordAlgorithm } from "./generateTreeFns";
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

    const scaledCoordinates = unscaledCoordinates.map((f) => {
        return { ...f, x: f.x * DISTANCE_BETWEEN_CHILDREN + 2 * CIRCLE_SIZE, y: f.y * DISTANCE_BETWEEN_GENERATIONS + CIRCLE_SIZE };
    });

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

    const brotherDndZoneMinWidth = DISTANCE_BETWEEN_CHILDREN / 2;

    if (dndType === "LEFT_BROTHER") {
        const width = isNotFirstNode(nodeCoord) ? getLevelNodeDistance(nodeCoord) - 1 * CIRCLE_SIZE + CIRCLE_SIZE : brotherDndZoneMinWidth;
        return {
            x: nodeCoord.x - width,
            y: nodeCoord.y - BROTHER_DND_ZONE_HEIGHT / 2,
            height: BROTHER_DND_ZONE_HEIGHT,
            width,
            type: "LEFT_BROTHER",
            ofNode: nodeCoord.id,
        };
    }

    if (dndType === "RIGHT_BROTHER")
        return {
            x: nodeCoord.x,
            y: nodeCoord.y - BROTHER_DND_ZONE_HEIGHT / 2,
            height: BROTHER_DND_ZONE_HEIGHT,
            width: brotherDndZoneMinWidth,
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

    function getLevelNodeDistance(pos: CirclePositionInCanvasWithLevel) {
        if (nodeLevelCoordinates.length === 1) return DISTANCE_BETWEEN_CHILDREN;

        return Math.abs(nodeLevelCoordinates[1].x - nodeLevelCoordinates[0].x);
    }

    function isNotFirstNode(pos: CirclePositionInCanvasWithLevel) {
        const foo = nodeLevelCoordinates.filter((x) => x.parentId === pos.parentId);

        return foo[0].id !== pos.id && foo.length > 1;
    }
}

export function calculateDragAndDropZones(circlePositionsInCanvas: CirclePositionInCanvasWithLevel[]) {
    const result: DnDZone[] = [];

    const coordinatesByLevel = returnCoordinatesByLevel(circlePositionsInCanvas);

    for (let idx = 0; idx < circlePositionsInCanvas.length; idx++) {
        const pos = circlePositionsInCanvas[idx];

        const isRoot = pos.level === 0;

        const parentNodeDndZone = dnDZoneBasedOnNodeCoord(pos, "PARENT", coordinatesByLevel[pos.level]);
        result.push(parentNodeDndZone);

        if (!isRoot) {
            const leftBrotherDndZone = dnDZoneBasedOnNodeCoord(pos, "LEFT_BROTHER", coordinatesByLevel[pos.level]);
            result.push(leftBrotherDndZone);

            if (isLastNodeOfCluster(pos)) {
                const rightBrotherDndZone = dnDZoneBasedOnNodeCoord(pos, "RIGHT_BROTHER", coordinatesByLevel[pos.level]);
                result.push(rightBrotherDndZone);
            }
        }

        if (nodeDoesntHaveChildren(circlePositionsInCanvas, pos)) {
            const onlyChildrenDndZone = dnDZoneBasedOnNodeCoord(pos, "ONLY_CHILDREN", coordinatesByLevel[pos.level]);
            result.push(onlyChildrenDndZone);
        }
    }

    return result;

    function isLastNodeOfCluster(pos: CirclePositionInCanvasWithLevel) {
        //@ts-ignore
        const levelCoordinates = coordinatesByLevel[pos.level] as CirclePositionInCanvasWithLevel[];

        const foo = levelCoordinates.filter((x) => x.parentId === pos.parentId);

        return foo[foo.length - 1].id === pos.id;
    }
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
