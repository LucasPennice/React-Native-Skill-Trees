import { returnUpdatedMapArrayValue } from "../../functions/misc";
import { PlotTreeReingoldTiltfordAlgorithm } from "../../functions/treeToHierarchicalCoordinates";
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
import { ScreenDimentions } from "../../redux/screenDimentionsSlice";
import { CanvasDimensions, CoordinatesWithTreeData, DnDZone, NodeCoordinate, ParentId, Skill, Tree } from "../../types";

const brotherDndWidth = DISTANCE_BETWEEN_CHILDREN / 2;

export function getNodesCoordinates(currentTree: Tree<Skill> | undefined, mode: "hierarchy" | "radial"): CoordinatesWithTreeData[] {
    if (!currentTree) return [];

    let unscaledCoordinates: CoordinatesWithTreeData[] = [];
    let scaledCoordinates: CoordinatesWithTreeData[] = [];

    if (mode === "hierarchy") {
        unscaledCoordinates = PlotTreeReingoldTiltfordAlgorithm(currentTree);
        scaledCoordinates = scaleCoordinatesAfterReingoldTiltford(unscaledCoordinates);
    } else {
        unscaledCoordinates = PlotCircularTree(currentTree);
        scaledCoordinates = scaleCoordinatesAfterRadialReingoldTiltford(unscaledCoordinates);
    }

    return scaledCoordinates;

    function scaleCoordinatesAfterReingoldTiltford(coordToScale: CoordinatesWithTreeData[]) {
        return coordToScale.map((f) => {
            return { ...f, x: f.x * DISTANCE_BETWEEN_CHILDREN, y: f.y * DISTANCE_BETWEEN_GENERATIONS };
        });
    }

    function scaleCoordinatesAfterRadialReingoldTiltford(coordToScale: CoordinatesWithTreeData[]) {
        //We cannot scale by different constants the nodes will not be rendered along the circumferences

        const SCALE = DISTANCE_BETWEEN_GENERATIONS;
        return coordToScale.map((f) => {
            return { ...f, x: f.x * SCALE, y: f.y * SCALE };
        });
    }
}

export function treeWidthFromCoordinates(coordinates: NodeCoordinate[]): { treeWidth: number; minCoordinate: number; maxCoordinate: number } {
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

export function treeHeightFromCoordinates(coordinates: NodeCoordinate[]): { treeHeight: number; minCoordinate: number; maxCoordinate: number } {
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
            ofNode: nodeCoord.id,
        };

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

    if (dndType === "CHILDREN")
        return {
            height: CHILD_DND_ZONE_DIMENTIONS.height,
            width: CHILD_DND_ZONE_DIMENTIONS.width,
            x: nodeCoord.x - CHILD_DND_ZONE_DIMENTIONS.width / 2,
            y: nodeCoord.y + 1.5 * CIRCLE_SIZE,
            type: "CHILDREN",
            ofNode: nodeCoord.id,
        };

    throw new Error("dndType not supported in coordOfDnDZoneBasedOnNodeCoord");
}

export function calculateDragAndDropZones(nodeCoordinatesCentered: NodeCoordinate[]) {
    const result: DnDZone[] = [];

    for (let idx = 0; idx < nodeCoordinatesCentered.length; idx++) {
        const pos = nodeCoordinatesCentered[idx];

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

export function minifyDragAndDropZones(dndZones: DnDZone[], nodeCoordCentered: NodeCoordinate[]) {
    let result: DnDZone[] = [];

    let parentIdToChildrenIds = new Map<string, NodeCoordinate[]>();

    //Populates the map from the coordinates
    for (let i = 0; i !== nodeCoordCentered.length; i++) {
        const currentNode = nodeCoordCentered[i];

        const parentId = currentNode.parentId === null ? "null" : currentNode.parentId;

        const childrenIds = parentIdToChildrenIds.get(parentId);

        if (childrenIds !== undefined) {
            let orderedChildrenByAscendingXCoord = [...childrenIds, currentNode].sort((a, b) => a.x - b.x);
            parentIdToChildrenIds.set(parentId, orderedChildrenByAscendingXCoord);
        } else {
            parentIdToChildrenIds.set(parentId, [currentNode]);
        }
    }

    let dndZoneBlacklist = new Map<string, DnDZone["type"][]>();

    for (let i = 0; i !== dndZones.length; i++) {
        const currentZone = dndZones[i];

        const currentNodeBlacklist = dndZoneBlacklist.get(currentZone.ofNode);

        const currentZoneBlacklisted = currentNodeBlacklist && currentNodeBlacklist.includes(currentZone.type);

        if (currentZoneBlacklisted) continue;

        const isRightBrotherDndZone = currentZone.type === "RIGHT_BROTHER";
        const isParentDndZne = currentZone.type === "PARENT";

        const minifiableZoneType = isRightBrotherDndZone || isParentDndZne;

        if (!minifiableZoneType) {
            result.push(currentZone);
            continue;
        }

        if (isRightBrotherDndZone) {
            const {
                result: minifySiblings,
                rightZoneOfLeftSibling,
                leftZoneOfRightSibling,
            } = shoulfMinifySiblings(currentZone, nodeCoordCentered, dndZones);

            if (!minifySiblings) {
                result.push(currentZone);
                continue;
            }

            const leftSiblingBlacklist = dndZoneBlacklist.get(rightZoneOfLeftSibling.ofNode);
            dndZoneBlacklist.set(rightZoneOfLeftSibling.ofNode, returnUpdatedMapArrayValue<DnDZone["type"]>(leftSiblingBlacklist, "RIGHT_BROTHER"));

            const rightSiblingBlacklist = dndZoneBlacklist.get(leftZoneOfRightSibling!.ofNode);
            dndZoneBlacklist.set(leftZoneOfRightSibling!.ofNode, returnUpdatedMapArrayValue<DnDZone["type"]>(rightSiblingBlacklist, "LEFT_BROTHER"));

            const minifiedZones: DnDZone = {
                height: currentZone.height,
                ofNode: currentZone.ofNode,
                type: currentZone.type,
                x: currentZone.x,
                y: currentZone.y,
                width: leftZoneOfRightSibling!.x - rightZoneOfLeftSibling.x + brotherDndWidth,
            };

            result.push(minifiedZones);
            continue;
        }

        const {
            result: minifyChildAndParent,
            parentZoneOfOnlyChild,
            onlyChildZoneOfParent,
        } = shoulfMinifyOnlyChildAndParent(currentZone, nodeCoordCentered, dndZones);

        if (!minifyChildAndParent) {
            result.push(currentZone);
            continue;
        }

        const childNodeId = parentZoneOfOnlyChild.ofNode;
        const childBlacklist = dndZoneBlacklist.get(childNodeId);
        dndZoneBlacklist.set(childNodeId, returnUpdatedMapArrayValue<DnDZone["type"]>(childBlacklist, "PARENT"));

        const parentNodeId = onlyChildZoneOfParent!.ofNode;
        const parentBlacklist = dndZoneBlacklist.get(parentNodeId);
        dndZoneBlacklist.set(parentNodeId, returnUpdatedMapArrayValue<DnDZone["type"]>(parentBlacklist, "CHILDREN"));

        const minifiedZones: DnDZone = {
            width: currentZone.width,
            ofNode: currentZone.ofNode,
            type: currentZone.type,
            x: currentZone.x,
            y: currentZone.y - currentZone.height,
            height: 2 * currentZone.height,
        };

        result.push(minifiedZones);
    }

    return result;

    function shoulfMinifySiblings(rightZoneOfLeftSibling: DnDZone, nodeCoordCentered: NodeCoordinate[], dndZones: DnDZone[]) {
        // [Left Brother] LEFT SIBLING [Right Brother] -- [Left Brother] Right Sibling [Right Brother]

        const nodeOfLeftSibling = nodeCoordCentered.find((n) => n.id === rightZoneOfLeftSibling.ofNode);

        if (!nodeOfLeftSibling) throw new Error("nodeOfSibling not found at shouldMinifySiblings");

        const parentNodeId = nodeOfLeftSibling.parentId ?? "null";

        const siblings = parentIdToChildrenIds.get(parentNodeId);

        if (!siblings) throw new Error("siblings undefined at shoulfMinifySiblings");

        const leftSiblingIdx = siblings.findIndex((s) => s.id === rightZoneOfLeftSibling.ofNode);

        const isLastSibling = leftSiblingIdx === siblings.length - 1;

        if (isLastSibling) return { result: false, rightZoneOfLeftSibling, leftZoneOfRightSibling: undefined };

        const rightSiblingNode = siblings[leftSiblingIdx + 1];
        const leftZoneOfRightSibling = dndZones.find((zone) => zone.ofNode === rightSiblingNode.id && zone.type === "LEFT_BROTHER");

        if (!leftZoneOfRightSibling) throw new Error("no leftZoneOfRightSibling found at shouldMinifySiblings");

        return { result: true, rightZoneOfLeftSibling, leftZoneOfRightSibling };
    }
    function shoulfMinifyOnlyChildAndParent(parentZoneOfOnlyChild: DnDZone, nodeCoordCentered: NodeCoordinate[], dndZones: DnDZone[]) {
        // [Parent Zone]
        // Parent
        // [Children Zone]
        // [Parent Zone]
        // Only Child
        // [Children Zone]

        const onlyChildNodeId = nodeCoordCentered.find((n) => n.id === parentZoneOfOnlyChild.ofNode);

        if (!onlyChildNodeId) throw new Error("onlyChildNodeId not found at shoulfMinifyOnlyChildAndParent");

        const parentNodeId = onlyChildNodeId.parentId ?? "null";

        const siblings = parentIdToChildrenIds.get(parentNodeId);

        if (!siblings) throw new Error("siblings undefined at shoulfMinifyOnlyChildAndParent");

        const isOnlyChild = siblings.length === 1;

        if (!isOnlyChild) return { result: false, parentZoneOfOnlyChild, onlyChildZoneOfParent: undefined };

        const onlyChildZoneOfParent = dndZones.find((zone) => zone.ofNode === parentNodeId && zone.type === "CHILDREN");

        if (!onlyChildZoneOfParent) throw new Error("no onlyChildZoneOfParent found at shoulfMinifyOnlyChildAndParent");

        return { result: true, parentZoneOfOnlyChild, onlyChildZoneOfParent };
    }
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
        };
    });
}

export function removeTreeDataFromCoordinate(foo: CoordinatesWithTreeData[]): NodeCoordinate[] {
    return foo.map((bb) => {
        return {
            id: bb.nodeId,
            level: bb.level,
            parentId: bb.parentId,
            x: bb.x,
            y: bb.y,
        };
    });
}

//The animations break for some reason when using CoordinatesWithTreeData
//It seems to be a bug of reanimated 2
export function getCoordinatedWithTreeData(
    coordinatesWithTreeData: CoordinatesWithTreeData[],
    nodeCoordinatesCentered: {
        x: number;
        y: number;
        id: string;
        level: number;
        parentId: ParentId;
    }[]
): CoordinatesWithTreeData[] {
    return nodeCoordinatesCentered.map((centeredCoord, i) => {
        const coordWithTreeData = coordinatesWithTreeData[i];

        return {
            accentColor: coordWithTreeData.accentColor,
            data: coordWithTreeData.data,
            isRoot: coordWithTreeData.isRoot,
            level: coordWithTreeData.level,
            nodeId: coordWithTreeData.nodeId,
            parentId: coordWithTreeData.parentId,
            treeId: coordWithTreeData.treeId,
            category: coordWithTreeData.category,
            treeName: coordWithTreeData.treeName,
            x: centeredCoord.x,
            y: centeredCoord.y,
        };
    });
}
