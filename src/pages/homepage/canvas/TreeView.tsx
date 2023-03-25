import { Canvas } from "@shopify/react-native-skia";
import { useEffect, useState } from "react";
import { Dimensions, ScrollView } from "react-native";
import useCanvasTouchHandler from "./hooks/useCanvasTouchHandler";
import PopUpMenu from "../components/PopUpMenu";
import { findTreeHeight } from "../treeFunctions";
import { NAV_HEGIHT } from "../HomePage";
import { selectCanvasDisplaySettings } from "../../../redux/canvasDisplaySettingsSlice";
import { selectCurrentTree } from "../../../redux/currentTreeSlice";
import { selectScreenDimentions } from "../../../redux/screenDimentionsSlice";
import { Skill, Tree } from "../../../types";
import CanvasTree from "./CanvasTree";
import { useAppSelector } from "../../../redux/reduxHooks";
import { CIRCLE_SIZE_SELECTED, colors, DISTANCE_BETWEEN_CHILDREN, DISTANCE_BETWEEN_GENERATIONS } from "./parameters";

export type CirclePositionInCanvas = { x: number; y: number; id: string };
export type CirclePositionInCanvasWithLevel = { x: number; y: number; id: string; level: number };

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

    const tentativeCoordinates = getNodesTentativeCoordinates(currentTree);

    console.log(tentativeCoordinates);
    //Aca va la funcion para calcular toda la magia

    return [{ id: "Tengo arbol", x: 2, y: 3 }];
}

//This function returns the first calculation of coordinates for the tree nodes, the nodes in this result may overlap, that's why this function should be run
//next to adjustNodesInTree()
function getNodesTentativeCoordinates(
    currentTree?: Tree<Skill>,
    parentNodeInfo?: { tree: Tree<Skill>; coordinates: CirclePositionInCanvasWithLevel }
) {
    if (!currentTree) return [];

    let result: CirclePositionInCanvasWithLevel[] = [];
    //Base Case 👇

    if (!currentTree.isRoot && !parentNodeInfo) throw "Not parent coordinates in non root node";

    if (!currentTree.children) return returnCoordinatesBasedOnParent(currentTree, parentNodeInfo);

    //Recursive Case 👇

    if (currentTree.isRoot) result.push({ x: 0, y: 0, id: currentTree.data.id, level: 0 });

    for (let i = 0; i < currentTree.children.length; i++) {
        const currentChild = currentTree.children[i];

        const currentNodeInfo = { tree: currentTree, coordinates: returnCoordinatesBasedOnParent(currentTree, parentNodeInfo) };

        if (currentChild.children) result.push(returnCoordinatesBasedOnParent(currentChild, currentNodeInfo));

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
    node: Tree<Skill>,
    parentNodeInfo?: { tree: Tree<Skill>; coordinates: CirclePositionInCanvasWithLevel }
): CirclePositionInCanvasWithLevel {
    if (!parentNodeInfo) return { x: 0, y: 0, id: node.data.id, level: 0 };

    const parentNumberOfChildren = parentNodeInfo.tree.children!.length;
    const currentChildIndex = parentNodeInfo.tree.children!.findIndex((tree) => tree.data.id === node.data.id);

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

    return { x, y, id: node.data.id, level: parentNodeInfo.coordinates.level + 1 };
}
