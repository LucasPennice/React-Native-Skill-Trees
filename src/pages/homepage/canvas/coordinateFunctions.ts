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

    const foo = PlotTreeReingoldTiltfordAlgorithm(currentTree);

    const adaptedFoo = foo.map((f) => {
        return { ...f, x: f.x * DISTANCE_BETWEEN_CHILDREN };
    });

    return adaptedFoo;
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

    if (coordinates.length === 0) return { canvasWidth: width, canvasHeight: height, horizontalMargin: 0, verticalMargin: 0 };

    const treeDepth = Math.max(...coordinates.map((t) => t.level));

    const treeHeight = treeDepth ? treeDepth * DISTANCE_BETWEEN_GENERATIONS + treeDepth * 2 * CIRCLE_SIZE : 2 * CIRCLE_SIZE;
    const treeWidth = getTreeWidth(coordinates);

    return {
        canvasWidth: treeWidth + 2 * width,
        canvasHeight: treeHeight + HEIGHT_WITHOUT_NAV,
        verticalMargin: HEIGHT_WITHOUT_NAV / 2,
        horizontalMargin: width,
    };
}

export function centerNodesInCanvas(circlePositions: CirclePositionInCanvasWithLevel[], canvasDimentions: CanvasDimentions) {
    const { horizontalMargin, verticalMargin } = canvasDimentions;

    const treeWidth = getTreeWidth(circlePositions);

    return circlePositions.map((p) => {
        return { ...p, y: p.y + verticalMargin, x: p.x + treeWidth / 2 + horizontalMargin } as CirclePositionInCanvasWithLevel;
    });
}
