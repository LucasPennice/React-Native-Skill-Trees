import { ScreenDimentions } from "../../../redux/screenDimentionsSlice";
import { CanvasDimensions, CirclePositionInCanvasWithLevel, DnDZone, Skill, Tree } from "../../../types";
import { Coordinates, PlotTreeReingoldTiltfordAlgorithm } from "../../../functions/treeToHierarchicalCoordinates";
import {
    BROTHER_DND_ZONE_HEIGHT,
    CANVAS_HORIZONTAL_PADDING,
    CANVAS_VERTICAL_PADDING,
    CIRCLE_SIZE,
    DISTANCE_BETWEEN_CHILDREN,
    DISTANCE_BETWEEN_GENERATIONS,
    NAV_HEGIHT,
    ONLY_CHILDREN_DND_ZONE_DIMENTIONS,
    PARENT_DND_ZONE_DIMENTIONS,
} from "../../../parameters";
import { PlotCircularTree } from "../../../functions/treeToRadialCoordinates";

export function getNodesCoordinates(currentTree: Tree<Skill> | undefined, mode: "hierarchy" | "radial"): CirclePositionInCanvasWithLevel[] {
    if (!currentTree) return [];

    let unscaledCoordinates: Coordinates[] | undefined = undefined;

    if (mode === "hierarchy") {
        unscaledCoordinates = PlotTreeReingoldTiltfordAlgorithm(currentTree);
    } else {
        unscaledCoordinates = PlotCircularTree(currentTree);
    }

    const scaledCoordinates = scaleCoordinatesAfterReingoldTiltford(unscaledCoordinates);

    return scaledCoordinates;

    function scaleCoordinatesAfterReingoldTiltford(coordToScale: Coordinates[]) {
        return coordToScale.map((f) => {
            return { ...f, x: f.x * DISTANCE_BETWEEN_CHILDREN + 2 * CIRCLE_SIZE, y: f.y * DISTANCE_BETWEEN_GENERATIONS + CIRCLE_SIZE };
        });
    }
}

export function treeWidthFromCoordinates(coordinates: CirclePositionInCanvasWithLevel[]) {
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

export function treeHeightFromCoordinates(coordinates: CirclePositionInCanvasWithLevel[]) {
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

function dndZonesFromNodeCoord(nodeCoord: CirclePositionInCanvasWithLevel, dndType: DnDZone["type"]): DnDZone {
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

    for (let idx = 0; idx < circlePositionsInCanvas.length; idx++) {
        const pos = circlePositionsInCanvas[idx];

        const isRoot = pos.level === 0;

        if (!isRoot) {
            const parentNodeDndZone = dndZonesFromNodeCoord(pos, "PARENT");
            result.push(parentNodeDndZone);

            const leftBrotherDndZone = dndZonesFromNodeCoord(pos, "LEFT_BROTHER");
            result.push(leftBrotherDndZone);

            const rightBrotherDndZone = dndZonesFromNodeCoord(pos, "RIGHT_BROTHER");
            result.push(rightBrotherDndZone);
        }

        if (nodeDoesntHaveChildren(circlePositionsInCanvas, pos)) {
            const onlyChildrenDndZone = dndZonesFromNodeCoord(pos, "ONLY_CHILDREN");
            result.push(onlyChildrenDndZone);
        }
    }

    return result;
}

function nodeDoesntHaveChildren(circlePositionsInCanvas: CirclePositionInCanvasWithLevel[], pos: CirclePositionInCanvasWithLevel) {
    const foo = circlePositionsInCanvas.find((x) => x.parentId === pos.id);

    return foo === undefined;
}

export function getCanvasDimensions(coordinates: CirclePositionInCanvasWithLevel[], screenDimentions: ScreenDimentions): CanvasDimensions {
    const { height, width } = screenDimentions;

    const HEIGHT_WITHOUT_NAV = height - NAV_HEGIHT;

    if (coordinates.length === 0) return { canvasWidth: width, canvasHeight: height };

    const treeHeight = treeHeightFromCoordinates(coordinates);
    const treeWidth = treeWidthFromCoordinates(coordinates);

    const canvasWidth = getCanvasWidth(treeWidth, width);
    const canvasHeight = getCanvasHeight(treeHeight, HEIGHT_WITHOUT_NAV);

    return { canvasWidth, canvasHeight };
}

function getCanvasWidth(treeWidth: number, screenWidth: number) {
    const deltaWidthScreen = screenWidth - treeWidth;

    if (deltaWidthScreen < 0) return treeWidth + CANVAS_HORIZONTAL_PADDING;

    if (deltaWidthScreen >= 200) return screenWidth;

    return treeWidth + CANVAS_HORIZONTAL_PADDING;
}

function getCanvasHeight(treeHeight: number, screenHeight: number) {
    const deltaWidthScreen = screenHeight - treeHeight;

    if (deltaWidthScreen < 0) return treeHeight + CANVAS_VERTICAL_PADDING;

    if (deltaWidthScreen >= 200) return screenHeight;

    return treeHeight + CANVAS_VERTICAL_PADDING;
}

export function centerNodesInCanvas(nodeCoordinates: CirclePositionInCanvasWithLevel[], canvasDimentions: CanvasDimensions) {
    const minXCoord = Math.min(...nodeCoordinates.map((x) => x.x));

    const treeWidth = treeWidthFromCoordinates(nodeCoordinates);
    const treeHeight = treeHeightFromCoordinates(nodeCoordinates);

    const normalizedCoordinates = nodeCoordinates.map((c) => {
        return { ...c, x: c.x - minXCoord };
    });

    const paddingFromLeftBorder = (canvasDimentions.canvasWidth - treeWidth) / 2;
    const paddingFromTopBorder = (canvasDimentions.canvasHeight - treeHeight) / 2;

    return normalizedCoordinates.map((c) => {
        return { ...c, x: c.x + paddingFromLeftBorder, y: c.y + paddingFromTopBorder };
    });
}
