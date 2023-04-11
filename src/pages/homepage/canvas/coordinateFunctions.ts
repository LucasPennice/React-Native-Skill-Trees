import { ScreenDimentions } from "../../../redux/screenDimentionsSlice";
import { CanvasDimentions, CirclePositionInCanvasWithLevel, DnDZone, Skill, Tree } from "../../../types";
import { getRootNodeDefaultPosition, returnCoordinatesByLevel } from "../treeFunctions";
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

    let tentativeCoordinates = getNodesTentativeCoordinates(currentTree);

    if (!Array.isArray(tentativeCoordinates)) tentativeCoordinates = [tentativeCoordinates];

    let result = getNodesCoodinatesWithNoOverlap(tentativeCoordinates);

    let prevRes = "";

    while (prevRes !== JSON.stringify(result)) {
        prevRes = JSON.stringify(result);
        result = separateNodesToAvoidDnDZoneOverlap(result);
    }

    return result;
}

function separateNodesToAvoidDnDZoneOverlap(coord: CirclePositionInCanvasWithLevel[]) {
    let result = [...coord];

    const maxLevel = Math.max(...result.map((c) => c.level));
    const coordByLevel = returnCoordinatesByLevel(coord);

    //We don't check the last level because there cant be dnd zone overlap there
    for (let idx = 1; idx < maxLevel; idx++) {
        const level = idx;
        const coordOfLevel = coordByLevel[level];
        const coordOfNextLevel = coordByLevel[level + 1];

        //Loops through each of the level coordinates
        for (let coordIdx = 0; coordIdx < coordOfLevel.length; coordIdx++) {
            const currentCoord = coordOfLevel[coordIdx];

            if (nodeDoesntHaveChildren(coord, currentCoord)) {
                //Me fijo si overlapea la zona de este nodo con el nivel de abajo
                const overlapWithNextLevelDndZone = getIsOverlapWithNextLevelDndZone(currentCoord, coordOfLevel, coordOfNextLevel);

                if (overlapWithNextLevelDndZone.isOverlap) {
                    result = spaceNodesOfLevelAndBelow(level, overlapWithNextLevelDndZone.overlap, result);
                }
            }
        }
    }

    return result;

    function getIsOverlapWithNextLevelDndZone(
        coord: CirclePositionInCanvasWithLevel,
        coordOfLevel: CirclePositionInCanvasWithLevel[],
        coordOfNextLevel: CirclePositionInCanvasWithLevel[]
    ) {
        const dndZone = dnDZoneBasedOnNodeCoord(coord, "ONLY_CHILDREN", coordOfLevel);

        const effectZone: DnDZone = { ...dndZone, height: dndZone.height + BROTHER_DND_ZONE_HEIGHT + PARENT_DND_ZONE_DIMENTIONS.height };

        const dndZonesOfNextLevel = coordOfNextLevel.map((n) => dnDZoneBasedOnNodeCoord(n, "PARENT", coordOfNextLevel));

        let maxOverlap = 0;

        dndZonesOfNextLevel.forEach((nextLevelDndZone) => {
            //The "parent" is overlapping the "only_child" and the parent's x is larger than onlychild's x
            let isOverlapOnRight = effectZone.x <= nextLevelDndZone.x && nextLevelDndZone.x <= effectZone.x + effectZone.width;
            //The other option
            let isOverlapOnLeft = nextLevelDndZone.x <= effectZone.x && effectZone.x <= nextLevelDndZone.x + nextLevelDndZone.width;

            let overlapQty = 0;

            if (isOverlapOnRight) overlapQty = effectZone.x + effectZone.width - nextLevelDndZone.x;
            if (isOverlapOnLeft) overlapQty = nextLevelDndZone.x + nextLevelDndZone.width - effectZone.x;

            if (overlapQty > maxOverlap) maxOverlap = overlapQty;
        });

        return { isOverlap: maxOverlap != 0, overlap: maxOverlap };
    }
}

function getNodesCoodinatesWithNoOverlap(tentativeCoordinates: CirclePositionInCanvasWithLevel[]) {
    let result = [...tentativeCoordinates];

    const maxLevel = Math.max(...result.map((c) => c.level));

    for (let idx = 1; idx < maxLevel + 1; idx++) {
        const nodesInLevel = result.filter((n) => n.level === idx);

        let maxOverlapDistance = 0;
        //Level where the overlap ocurred
        let overlapLevel: number | undefined = undefined;

        for (let i = 1; i < nodesInLevel.length; i++) {
            const element = nodesInLevel[i];
            const prevElement = nodesInLevel[i - 1];

            const distanceBetweenNodes = element.x - prevElement.x;

            const checkingForOverlapOnShallowerLevel = overlapLevel === undefined || overlapLevel === element.level;

            //This means that there is overlap
            if (distanceBetweenNodes < DISTANCE_BETWEEN_CHILDREN && checkingForOverlapOnShallowerLevel) {
                let tentativeOverlapDistance = 0;

                if (distanceBetweenNodes <= 0) {
                    tentativeOverlapDistance = Math.abs(distanceBetweenNodes) + DISTANCE_BETWEEN_CHILDREN;
                } else {
                    tentativeOverlapDistance = DISTANCE_BETWEEN_CHILDREN;
                }

                if (tentativeOverlapDistance > maxOverlapDistance) maxOverlapDistance = tentativeOverlapDistance;

                overlapLevel = element.level;
            }
        }

        if (overlapLevel !== undefined) result = spaceNodesOfLevelAndBelow(overlapLevel - 1, maxOverlapDistance, result);
    }

    return result;
}
function spaceNodesOfLevelAndBelow(level: number, distance: number, coordinates: CirclePositionInCanvasWithLevel[]) {
    if (level < 0) throw "spaceNodesOfLevelAndBelow level argument < 0";

    const coordinatesOfParents = coordinates.filter((c) => c.level === level);

    const newParentCoodinates = returnSpacedParentCoordinates(coordinatesOfParents);

    const coordinatesSortedByLevel = coordinates.sort((a, b) => a.level - b.level);

    let result: CirclePositionInCanvasWithLevel[] = [];

    for (let idx = 0; idx < coordinatesSortedByLevel.length; idx++) {
        const c = coordinatesSortedByLevel[idx];

        if (c.level < level) result.push(c);

        if (c.level === level) {
            const newParentCoordinate = newParentCoodinates.find((p) => p.id === c.id);

            if (!newParentCoordinate) throw "spaceNodesOfLevelAndBelow couldn't find parent node in newCoordinate array";

            result.push(newParentCoordinate);
        }

        if (c.level > level) {
            if (!c.parentId) throw "coordinate without parent id in spaceNodesOfLevelAndBelow";

            const parentCoordinate = result.find((p) => p.id === c.parentId);
            const parentChildren = coordinatesSortedByLevel.filter((n) => n.parentId === c.parentId);
            const parentChildrenIds = parentChildren.map((r) => r.id);

            if (!parentCoordinate) throw "spaceNodesOfLevelAndBelow Couldn't find parent node in result";

            const newChildCoordinate = returnCoordinatesBasedOnParent(c.id, {
                childrenIds: parentChildrenIds,
                coordinates: parentCoordinate,
                id: c.parentId,
            });

            result.push(newChildCoordinate);
        }
    }

    return result;

    function returnSpacedParentCoordinates(coordinatesOfParents: CirclePositionInCanvasWithLevel[]) {
        let result: CirclePositionInCanvasWithLevel[] = [];

        if (coordinatesOfParents.length % 2 === 0) {
            //Pair number of parents

            coordinatesOfParents.forEach((parent, idx) => {
                //If the current parent belongs to the first half of parents then we subtract to X in order to space it
                //otherwise we add to X
                const isOnfirstHalf = idx < coordinatesOfParents.length / 2 - 1;
                const elementsOnEachHalf = coordinatesOfParents.length / 2;

                if (isOnfirstHalf) {
                    result.push({ ...parent, x: parent.x - ((elementsOnEachHalf + 1 - idx * 2) / 2) * distance });
                } else {
                    const idxSinceMiddle = idx - elementsOnEachHalf;
                    result.push({ ...parent, x: parent.x + ((idxSinceMiddle * 2 + 1) / 2) * distance });
                }
            });
        } else {
            coordinatesOfParents.forEach((parent, idx) => {
                //If the current parent belongs to the first half of parents then we subtract to X in order to space it
                //otherwise we add to X
                const isOnfirstHalf = idx < coordinatesOfParents.length / 2;
                const elementsOnEachHalf = (coordinatesOfParents.length - 1) / 2;

                //The element in the middle stays the same
                if (idx === (coordinatesOfParents.length - 1) / 2) {
                    result.push({ ...parent });
                } else {
                    if (isOnfirstHalf) {
                        result.push({
                            ...parent,
                            x: parent.x - (elementsOnEachHalf - idx) * distance,
                        });
                    } else {
                        const idxSinceMiddle = idx - elementsOnEachHalf - 1;
                        result.push({ ...parent, x: parent.x + (idxSinceMiddle * 2 + 1) * distance });
                    }
                }
            });
        }

        return result;
    }
}

//This function returns the first calculation of coordinates for the tree nodes, the nodes in this result may overlap, that's why this function should be run
//next to getNodesFinalCoordinates()
export function getNodesTentativeCoordinates(
    currentTree?: Tree<Skill>,
    parentNodeInfo?: { childrenIds: string[]; coordinates: CirclePositionInCanvasWithLevel; id: string }
) {
    if (!currentTree) return [];

    let result: CirclePositionInCanvasWithLevel[] = [];
    //Base Case 👇

    if (!currentTree.isRoot && !parentNodeInfo) throw "Not parent coordinates in non root node";

    if (!currentTree.children) return returnCoordinatesBasedOnParent(currentTree.data.id, parentNodeInfo);

    //Recursive Case 👇

    if (currentTree.isRoot) result.push(getRootNodeDefaultPosition(currentTree.data.id));

    for (let i = 0; i < currentTree.children.length; i++) {
        const currentChild = currentTree.children[i];

        const currentNodeInfo = {
            childrenIds: currentTree.children.map((c) => c.data.id),
            coordinates: returnCoordinatesBasedOnParent(currentTree.data.id, parentNodeInfo),
            id: currentTree.data.id,
        };

        if (currentChild.children) result.push(returnCoordinatesBasedOnParent(currentChild.data.id, currentNodeInfo));

        const partialResult = getNodesTentativeCoordinates(currentChild, currentNodeInfo);

        if (Array.isArray(partialResult)) {
            result.push(...partialResult);
        } else {
            result.push(partialResult);
        }
    }

    return result;
}

export function returnCoordinatesBasedOnParent(
    nodeId: string,
    parentNodeInfo?: { childrenIds: string[]; coordinates: CirclePositionInCanvasWithLevel; id: string }
): CirclePositionInCanvasWithLevel {
    if (!parentNodeInfo) return getRootNodeDefaultPosition(nodeId);

    const parentNumberOfChildren = parentNodeInfo.childrenIds!.length;
    const currentChildIndex = parentNodeInfo.childrenIds!.findIndex((chId) => chId === nodeId);

    if (currentChildIndex === -1) throw "returnCoordinatesBasedOnParent Children does not exist on parent";

    const distanceLeftShift = getDistanceLeftShift();

    const y = parentNodeInfo.coordinates.y + DISTANCE_BETWEEN_GENERATIONS;

    const x = parentNodeInfo.coordinates.x + DISTANCE_BETWEEN_CHILDREN * currentChildIndex - distanceLeftShift;

    function getDistanceLeftShift() {
        if (parentNumberOfChildren === 1) return 0;

        let result = 0;

        result = ((parentNumberOfChildren - 1) * DISTANCE_BETWEEN_CHILDREN) / 2;

        return result;
    }

    return { x, y, id: nodeId, level: parentNodeInfo.coordinates.level + 1, parentId: parentNodeInfo.id };
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

    // console.log("En iq tree sumar 3 cirlce sizes y en eq 2 circle sizes, adaptar la fn getTreeWidth");

    return Math.abs(maxCoordinate! - minCoordinate!) + 25;
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

    return circlePositions.map((p) => {
        return { ...p, y: p.y + verticalMargin, x: p.x + horizontalMargin } as CirclePositionInCanvasWithLevel;
    });
}
