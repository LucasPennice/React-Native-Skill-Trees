import { Canvas } from "@shopify/react-native-skia";
import { useEffect, useState } from "react";
import { Dimensions, ScrollView } from "react-native";
import useCanvasTouchHandler from "./hooks/useCanvasTouchHandler";
import PopUpMenu from "../components/PopUpMenu";
import { findTreeHeight, getRootNodeDefaultPosition } from "../treeFunctions";
import { NAV_HEGIHT } from "../HomePage";
import { selectCanvasDisplaySettings } from "../../../redux/canvasDisplaySettingsSlice";
import { selectCurrentTree } from "../../../redux/currentTreeSlice";
import { selectScreenDimentions } from "../../../redux/screenDimentionsSlice";
import { Skill, Tree } from "../../../types";
import CanvasTree from "./CanvasTree";
import { useAppSelector } from "../../../redux/reduxHooks";
import { CIRCLE_SIZE_SELECTED, colors, DISTANCE_BETWEEN_CHILDREN, DISTANCE_BETWEEN_GENERATIONS } from "./parameters";

export type CirclePositionInCanvas = { x: number; y: number; id: string };
export type CirclePositionInCanvasWithLevel = { x: number; y: number; id: string; level: number; parentId: string | null };

function TreeView() {
    const { height, width } = useAppSelector(selectScreenDimentions);

    const { value: currentTree } = useAppSelector(selectCurrentTree);

    const testCirlcePositions = getCirclePositions(currentTree);

    const { showLabel } = useAppSelector(selectCanvasDisplaySettings);

    const [selectedNode, setSelectedNode] = useState<null | string>(null);
    const [selectedNodeHistory, setSelectedNodeHistory] = useState<(null | string)[]>([null]);
    const [circlePositionsInCanvas, setCirclePositionsInCanvas] = useState<CirclePositionInCanvas[]>([]);

    useEffect(() => {
        setCirclePositionsInCanvas([]);
        setSelectedNode(null);
        setSelectedNodeHistory([]);
    }, [currentTree]);

    const popCoordinateToArray = (coordinate: CirclePositionInCanvas) => setCirclePositionsInCanvas((p) => [...p, coordinate]);

    const { touchHandler, horizontalScrollViewRef, verticalScrollViewRef } = useCanvasTouchHandler({
        selectedNodeState: [selectedNode, setSelectedNode],
        setSelectedNodeHistory,
        circlePositionsInCanvas,
        tree: currentTree,
    });

    const canvasDimentions = calculateDimentionsAndRootCoordinates(currentTree);
    const { rootX, rootY } = canvasDimentions;

    useEffect(() => {
        if (!verticalScrollViewRef.current) return;
        if (!horizontalScrollViewRef.current) return;

        const x = 200;

        const HEIGHT_WITHOUT_NAV = height - NAV_HEGIHT;

        const y = 0.5 * (canvasDimentions.height - HEIGHT_WITHOUT_NAV);

        let timerId = setTimeout(() => {
            horizontalScrollViewRef.current!.scrollTo({ x, y, animated: true });
            verticalScrollViewRef.current!.scrollTo({ x, y, animated: true });
        }, 50);

        return () => {
            clearTimeout(timerId);
        };
    }, [verticalScrollViewRef, horizontalScrollViewRef, currentTree]);

    const foundNodeCoordinates = circlePositionsInCanvas.find((c) => c.id === selectedNode);

    return (
        <ScrollView showsVerticalScrollIndicator={false} ref={verticalScrollViewRef} style={{ height: height - NAV_HEGIHT }}>
            <ScrollView ref={horizontalScrollViewRef} horizontal showsHorizontalScrollIndicator={false} style={{ position: "relative" }}>
                {currentTree !== undefined && (
                    <Canvas
                        onTouch={touchHandler}
                        style={{ width: canvasDimentions.width, height: canvasDimentions.height, backgroundColor: colors.background }}>
                        <CanvasTree
                            stateProps={{ selectedNode, popCoordinateToArray, showLabel }}
                            tree={currentTree}
                            wholeTree={currentTree}
                            rootCoordinates={{ width: rootX, height: rootY }}
                        />
                    </Canvas>
                )}
                {selectedNode && foundNodeCoordinates && currentTree && (
                    <PopUpMenu foundNodeCoordinates={foundNodeCoordinates} selectedNode={selectedNode} selectedNodeHistory={selectedNodeHistory} />
                )}
            </ScrollView>
        </ScrollView>
    );
}

function calculateDimentionsAndRootCoordinates(currentTree?: Tree<Skill>) {
    const { height, width } = useAppSelector(selectScreenDimentions);

    const HEIGHT_WITHOUT_NAV = height - NAV_HEGIHT;

    if (currentTree === undefined) return { width, height, rootY: 0, rootX: 0 };

    const treeHeight = (findTreeHeight(currentTree) - 1) * DISTANCE_BETWEEN_GENERATIONS;

    const canvasHorizontalPadding = 2 * (width - 10 - (CIRCLE_SIZE_SELECTED * 3) / 4);
    const canvasVerticalPadding = HEIGHT_WITHOUT_NAV;

    return {
        width: width * 2 + canvasHorizontalPadding,
        height: treeHeight + canvasVerticalPadding,
        rootY: HEIGHT_WITHOUT_NAV / 2 - DISTANCE_BETWEEN_GENERATIONS,
        rootX: width,
    };
}

export default TreeView;

function getCirclePositions(currentTree?: Tree<Skill>): CirclePositionInCanvas[] {
    if (!currentTree) return [];

    let tentativeCoordinates = getNodesTentativeCoordinates(currentTree);

    if (!Array.isArray(tentativeCoordinates)) tentativeCoordinates = [tentativeCoordinates];

    const result = getNodesFinalCoordinates(tentativeCoordinates);

    return result;
}

function getNodesFinalCoordinates(tentativeCoordinates: CirclePositionInCanvasWithLevel[]) {
    let result = [...tentativeCoordinates];

    const maxLevel = Math.max(...result.map((c) => c.level));

    for (let idx = 1; idx < maxLevel; idx++) {
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
            if (distanceBetweenNodes <= 0 && checkingForOverlapOnShallowerLevel) {
                if (Math.abs(distanceBetweenNodes) > maxOverlapDistance) maxOverlapDistance = Math.abs(distanceBetweenNodes);
                overlapLevel = element.level;
            }

            if (overlapLevel !== undefined) result = spaceNodesOfLevelAndBelow(overlapLevel - 1, maxOverlapDistance, result);
        }
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
                        result.push({ ...parent, x: parent.x - ((elementsOnEachHalf + 1 - idx * 2) / 2) * distance - DISTANCE_BETWEEN_CHILDREN });
                    } else {
                        const idxSinceMiddle = idx - elementsOnEachHalf;
                        result.push({ ...parent, x: parent.x + ((idxSinceMiddle * 2 + 1) / 2) * distance + DISTANCE_BETWEEN_CHILDREN });
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
                                x: parent.x - (elementsOnEachHalf - idx) * distance - DISTANCE_BETWEEN_CHILDREN,
                            });
                        } else {
                            const idxSinceMiddle = idx - elementsOnEachHalf - 1;
                            result.push({ ...parent, x: parent.x + (idxSinceMiddle * 2 + 1) * distance + DISTANCE_BETWEEN_CHILDREN });
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
function getNodesTentativeCoordinates(
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

function returnCoordinatesBasedOnParent(
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
