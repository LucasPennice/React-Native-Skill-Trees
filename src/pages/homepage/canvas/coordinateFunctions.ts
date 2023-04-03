import { ScreenDimentions } from "../../../redux/screenDimentionsSlice";
import { CanvasDimentions, CirclePositionInCanvasWithLevel, DnDZone, Skill, Tree } from "../../../types";
import { getRootNodeDefaultPosition, returnCoordinatesByLevel } from "../treeFunctions";
import { CIRCLE_SIZE, DISTANCE_BETWEEN_CHILDREN, DISTANCE_BETWEEN_GENERATIONS, NAV_HEGIHT } from "./parameters";

export function getCirclePositions(currentTree?: Tree<Skill>): CirclePositionInCanvasWithLevel[] {
    if (!currentTree) return [];

    let tentativeCoordinates = getNodesTentativeCoordinates(currentTree);

    if (!Array.isArray(tentativeCoordinates)) tentativeCoordinates = [tentativeCoordinates];

    const result = getNodesFinalCoordinates(tentativeCoordinates);

    return result;
}

export function getNodesFinalCoordinates(tentativeCoordinates: CirclePositionInCanvasWithLevel[]) {
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

export function calculateDragAndDropZones(circlePositionsInCanvas: CirclePositionInCanvasWithLevel[]) {
    const result: DnDZone[] = [];

    const coordinatesByLevel = returnCoordinatesByLevel(circlePositionsInCanvas);

    for (let idx = 0; idx < circlePositionsInCanvas.length; idx++) {
        const pos = circlePositionsInCanvas[idx];

        const isRoot = pos.level === 0;

        const height = DISTANCE_BETWEEN_GENERATIONS - 3 * CIRCLE_SIZE;
        const width = 4 * CIRCLE_SIZE;
        result.push({ height, width, x: pos.x - width / 2, y: pos.y - height - 1.5 * CIRCLE_SIZE, type: "PARENT", ofNode: pos.id });

        if (!isRoot) {
            const minWidth = DISTANCE_BETWEEN_CHILDREN / 2;
            const height = 3 * CIRCLE_SIZE;
            const width = isNotFirstNode(pos) ? getLevelNodeDistance(pos) - 1 * CIRCLE_SIZE + CIRCLE_SIZE : minWidth;
            result.push({ height, width, x: pos.x - width, y: pos.y - height / 2, type: "LEFT_BROTHER", ofNode: pos.id });

            if (isLastNodeOfCluster(pos)) {
                result.push({
                    height,
                    width: minWidth,
                    x: pos.x,
                    y: pos.y - height / 2,
                    type: "RIGHT_BROTHER",
                    ofNode: pos.id,
                });
            }
        }

        if (doesntHaveChildren(pos)) {
            const height = DISTANCE_BETWEEN_GENERATIONS;
            result.push({
                height,
                width: 4 * CIRCLE_SIZE,
                x: pos.x - 2 * CIRCLE_SIZE,
                y: pos.y + 1.5 * CIRCLE_SIZE,
                type: "ONLY_CHILDREN",
                ofNode: pos.id,
            });
        }
    }

    return result;

    function getLevelNodeDistance(pos: CirclePositionInCanvasWithLevel) {
        //@ts-ignore
        const levelCoordinates = coordinatesByLevel[pos.level] as CirclePositionInCanvasWithLevel[];

        if (levelCoordinates.length === 1) return DISTANCE_BETWEEN_CHILDREN;

        return Math.abs(levelCoordinates[1].x - levelCoordinates[0].x);
    }

    function isLastNodeOfCluster(pos: CirclePositionInCanvasWithLevel) {
        //@ts-ignore
        const levelCoordinates = coordinatesByLevel[pos.level] as CirclePositionInCanvasWithLevel[];

        const foo = levelCoordinates.filter((x) => x.parentId === pos.parentId);

        return foo[foo.length - 1].id === pos.id;
    }

    function doesntHaveChildren(pos: CirclePositionInCanvasWithLevel) {
        const foo = circlePositionsInCanvas.find((x) => x.parentId === pos.id);

        return foo === undefined;
    }

    function isNotFirstNode(pos: CirclePositionInCanvasWithLevel) {
        //@ts-ignore
        const levelCoordinates = coordinatesByLevel[pos.level] as CirclePositionInCanvasWithLevel[];

        const foo = levelCoordinates.filter((x) => x.parentId === pos.parentId);

        return foo[0].id !== pos.id && foo.length > 1;
    }
}

export function calculateDimentionsAndRootCoordinates(
    coordinates: CirclePositionInCanvasWithLevel[],
    screenDimentions: ScreenDimentions
): CanvasDimentions {
    const { height, width } = screenDimentions;

    const HEIGHT_WITHOUT_NAV = height - NAV_HEGIHT;

    if (coordinates.length === 0) return { canvasWidth: width, canvasHeight: height, horizontalMargin: 0, verticalMargin: 0 };

    const treeDepth = Math.max(...coordinates.map((t) => t.level));

    const treeHeight = treeDepth * DISTANCE_BETWEEN_GENERATIONS + treeDepth * CIRCLE_SIZE;
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
