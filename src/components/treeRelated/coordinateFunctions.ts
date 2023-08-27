import { PlotTreeReingoldTiltfordAlgorithm } from "../../functions/treeToHierarchical/general";
import { PlotCircularTree } from "../../functions/treeToRadialCoordinates/general";
import {
    BROTHER_DND_ZONE_HEIGHT,
    CHILD_DND_ZONE_DIMENTIONS,
    CIRCLE_SIZE,
    DISTANCE_BETWEEN_CHILDREN,
    DISTANCE_BETWEEN_GENERATIONS,
    NAV_HEGIHT,
    PARENT_DND_ZONE_DIMENTIONS,
} from "../../parameters";
import { ScreenDimentions } from "../../redux/slices/screenDimentionsSlice";
import { CanvasDimensions, CartesianCoordinate, NodeCoordinate, DnDZone, Skill, Tree } from "../../types";

export function getNodesCoordinates(currentTree: Tree<Skill> | undefined, mode: "hierarchy" | "radial"): NodeCoordinate[] {
    if (!currentTree) return [];

    let unscaledCoordinates: NodeCoordinate[] = [];
    let scaledCoordinates: NodeCoordinate[] = [];

    if (mode === "hierarchy") {
        unscaledCoordinates = PlotTreeReingoldTiltfordAlgorithm(currentTree);
        scaledCoordinates = scaleCoordinatesAfterReingoldTiltford(unscaledCoordinates);
    } else {
        unscaledCoordinates = PlotCircularTree(currentTree);
        scaledCoordinates = scaleCoordinatesAfterRadialReingoldTiltford(unscaledCoordinates);
    }

    return scaledCoordinates;

    function scaleCoordinatesAfterReingoldTiltford(coordToScale: NodeCoordinate[]) {
        return coordToScale.map((f) => {
            return { ...f, x: f.x * DISTANCE_BETWEEN_CHILDREN, y: f.y * DISTANCE_BETWEEN_GENERATIONS };
        });
    }

    function scaleCoordinatesAfterRadialReingoldTiltford(coordToScale: NodeCoordinate[]) {
        //We cannot scale by different constants the nodes will not be rendered along the circumferences

        const SCALE = DISTANCE_BETWEEN_GENERATIONS;
        return coordToScale.map((f) => {
            return { ...f, x: f.x * SCALE, y: f.y * SCALE };
        });
    }
}

export function treeWidthFromCoordinates<T extends CartesianCoordinate>(
    coordinates: T[]
): { treeWidth: number; minCoordinate: number; maxCoordinate: number } {
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

    const result = Math.abs(maxCoordinate! - minCoordinate!);

    //@ts-ignore
    return { treeWidth: result, minCoordinate, maxCoordinate };
}

export function treeHeightFromCoordinates<T extends CartesianCoordinate>(
    coordinates: T[]
): { treeHeight: number; minCoordinate: number; maxCoordinate: number } {
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

    const result = Math.abs(maxCoordinate! - minCoordinate!);

    //@ts-ignore
    return { treeHeight: result, minCoordinate, maxCoordinate };
}

function dndZonesFromNodeCoord(nodeCoord: NodeCoordinate, dndType: DnDZone["type"]): DnDZone {
    if (dndType === "PARENT")
        return {
            x: nodeCoord.x - PARENT_DND_ZONE_DIMENTIONS.width / 2,
            y: nodeCoord.y - PARENT_DND_ZONE_DIMENTIONS.height - 1.5 * CIRCLE_SIZE,
            height: PARENT_DND_ZONE_DIMENTIONS.height,
            width: PARENT_DND_ZONE_DIMENTIONS.width,
            type: "PARENT",
            ofNode: nodeCoord.nodeId,
        };

    const brotherDndWidth = DISTANCE_BETWEEN_CHILDREN / 2;

    if (dndType === "LEFT_BROTHER") {
        return {
            x: nodeCoord.x - brotherDndWidth,
            y: nodeCoord.y - BROTHER_DND_ZONE_HEIGHT / 2,
            height: BROTHER_DND_ZONE_HEIGHT,
            width: brotherDndWidth,
            type: "LEFT_BROTHER",
            ofNode: nodeCoord.nodeId,
        };
    }

    if (dndType === "RIGHT_BROTHER")
        return {
            x: nodeCoord.x,
            y: nodeCoord.y - BROTHER_DND_ZONE_HEIGHT / 2,
            height: BROTHER_DND_ZONE_HEIGHT,
            width: brotherDndWidth,
            type: "RIGHT_BROTHER",
            ofNode: nodeCoord.nodeId,
        };

    if (dndType === "CHILDREN")
        return {
            height: CHILD_DND_ZONE_DIMENTIONS.height,
            width: CHILD_DND_ZONE_DIMENTIONS.width,
            x: nodeCoord.x - CHILD_DND_ZONE_DIMENTIONS.width / 2,
            y: nodeCoord.y + 1.5 * CIRCLE_SIZE,
            type: "CHILDREN",
            ofNode: nodeCoord.nodeId,
        };

    throw new Error("dndType not supported in coordOfDnDZoneBasedOnNodeCoord");
}

export function calculateDragAndDropZones(nodeCoordinates: NodeCoordinate[]) {
    const result: DnDZone[] = [];

    for (let idx = 0; idx < nodeCoordinates.length; idx++) {
        const pos = nodeCoordinates[idx];

        const isRoot = pos.level === 0;

        if (!isRoot) {
            const parentNodeDndZone = dndZonesFromNodeCoord(pos, "PARENT");
            result.push(parentNodeDndZone);

            const leftBrotherDndZone = dndZonesFromNodeCoord(pos, "LEFT_BROTHER");
            result.push(leftBrotherDndZone);

            const rightBrotherDndZone = dndZonesFromNodeCoord(pos, "RIGHT_BROTHER");
            result.push(rightBrotherDndZone);
        }

        const onlyChildrenDndZone = dndZonesFromNodeCoord(pos, "CHILDREN");
        result.push(onlyChildrenDndZone);
    }

    return result;
}

export function getCanvasDimensions(coordinates: NodeCoordinate[], screenDimentions: ScreenDimentions, showDepthGuides?: boolean): CanvasDimensions {
    const { height, width } = screenDimentions;

    const HEIGHT_WITHOUT_NAV = height - NAV_HEGIHT;

    if (coordinates.length === 0)
        return {
            canvasWidth: width,
            canvasHeight: height,
            heightData: { maxCoordinate: 0, minCoordinate: 0, treeHeight: 0 },
            widthData: { maxCoordinate: 0, minCoordinate: 0, treeWidth: 0 },
            extendedForDepthGuides: false,
        };

    const heightData = treeHeightFromCoordinates(coordinates);
    const { treeHeight, maxCoordinate: maxYCoordinate, minCoordinate: minYCoordinate } = heightData;
    const biggestYCoordinateAbs = Math.abs(maxYCoordinate) > Math.abs(minYCoordinate) ? Math.abs(maxYCoordinate) : Math.abs(minYCoordinate);

    const widthData = treeWidthFromCoordinates(coordinates);
    const { treeWidth, maxCoordinate: maxXCoordinate, minCoordinate: minXCoordinate } = widthData;
    const biggestXCoordinateAbs = Math.abs(maxXCoordinate) > Math.abs(minXCoordinate) ? Math.abs(maxXCoordinate) : Math.abs(minXCoordinate);

    //We simulate the tree being wider/taller so that getCanvasWidth considers the area with the depth circles as part of the canvas
    const simulatedTreeRadius = biggestXCoordinateAbs > biggestYCoordinateAbs ? 2 * biggestXCoordinateAbs : 2 * biggestYCoordinateAbs;

    const finalTreeWidth = showDepthGuides ? simulatedTreeRadius : treeWidth;
    const finalTreeHeight = showDepthGuides ? simulatedTreeRadius : treeHeight;

    const finalWidthData = { ...widthData, treeWidth: finalTreeWidth };
    const finalHeightData = { ...heightData, treeHeight: finalTreeHeight };

    const canvasHorizontalPadding = screenDimentions.width;
    const canvasVerticalPadding = screenDimentions.width;

    const canvasWidth = getCanvasWidth(finalTreeWidth, width, canvasHorizontalPadding);
    const canvasHeight = getCanvasHeight(finalTreeHeight, HEIGHT_WITHOUT_NAV, canvasVerticalPadding);

    return { canvasWidth, canvasHeight, heightData: finalHeightData, widthData: finalWidthData, extendedForDepthGuides: showDepthGuides ?? false };
}

function getCanvasWidth(treeWidth: number, screenWidth: number, padding: number) {
    const minCanvasWidth = treeWidth > screenWidth ? treeWidth : screenWidth;

    return minCanvasWidth + padding;
}

function getCanvasHeight(treeHeight: number, screenHeight: number, padding: number) {
    const minCanvasHeight = treeHeight > screenHeight ? treeHeight : screenHeight;
    return minCanvasHeight + padding;
}

export function centerNodesInCanvas(nodeCoordinates: NodeCoordinate[], canvasDimentions: CanvasDimensions) {
    const { widthData, heightData, canvasWidth, canvasHeight } = canvasDimentions;

    const { treeWidth, maxCoordinate: maxX } = widthData;

    const { treeHeight, maxCoordinate: maxY } = heightData;

    const alignTreeRightWithLeftCorner = -maxX - CIRCLE_SIZE;
    const treeWidthWithCircleSizeAccounted = treeWidth + 2 * CIRCLE_SIZE;
    const horizontalPadding = (canvasWidth - treeWidthWithCircleSizeAccounted) / 2;
    const distanceToCenterRootNodeHorizontallyWithoutCirlceGuide =
        alignTreeRightWithLeftCorner + treeWidthWithCircleSizeAccounted + horizontalPadding;
    //
    const alignExtendedTreeRightWithLeftCorner = -treeWidth / 2 - CIRCLE_SIZE;
    const distanceToCenterRootNodeHorizontallyWithCirlceGuide =
        alignExtendedTreeRightWithLeftCorner + treeWidthWithCircleSizeAccounted + horizontalPadding;
    const distanceToCenterRootNode = canvasDimentions.extendedForDepthGuides
        ? distanceToCenterRootNodeHorizontallyWithCirlceGuide
        : distanceToCenterRootNodeHorizontallyWithoutCirlceGuide;

    const alignTreeBottomWithTopCorner = -maxY - CIRCLE_SIZE;
    const treeHeightWithCircleSizeAccounted = treeHeight + 2 * CIRCLE_SIZE;
    const verticalPadding = (canvasHeight - treeHeightWithCircleSizeAccounted) / 2;
    const distanceToCenterRootNodeVerticallyWithoutCirlceGuide = treeHeightWithCircleSizeAccounted + alignTreeBottomWithTopCorner + verticalPadding;
    //
    const alignExtendedTreeBottomWithTopCorner = -treeHeight / 2 - CIRCLE_SIZE;
    const distanceToCenterRootNodeVerticallyWithCirlceGuide =
        treeHeightWithCircleSizeAccounted + alignExtendedTreeBottomWithTopCorner + verticalPadding;

    const distanceToCenterRootNodeVertically = canvasDimentions.extendedForDepthGuides
        ? distanceToCenterRootNodeVerticallyWithCirlceGuide
        : distanceToCenterRootNodeVerticallyWithoutCirlceGuide;

    return nodeCoordinates.map((c) => {
        return {
            ...c,
            x: c.x + distanceToCenterRootNode,
            y: c.y + distanceToCenterRootNodeVertically,
        } as NodeCoordinate;
    });
}
