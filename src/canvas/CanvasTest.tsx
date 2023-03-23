import { Canvas } from "@shopify/react-native-skia";
import { useEffect, useState } from "react";
import { Dimensions, ScrollView } from "react-native";
import { DISTANCE_BETWEEN_GENERATIONS, getDeltaX } from "./functions";
import useCanvasTouchHandler from "./useCanvasTouchHandler";
import PopUpMenu from "./PopUpMenu";
import Tree, { CIRCLE_SIZE_SELECTED } from "./Tree";
import { findTreeHeight } from "../treeFunctions";
import { NAV_HEGIHT } from "../pages/HomePage";
import { useAppSelector } from "../reduxHooks";
import { selectCanvasDisplaySettings } from "../canvasDisplaySettingsSlice";
import { selectCurrentTree } from "../currentTreeSlice";
import { selectScreenDimentions } from "../screenDimentionsSlice";
import { Book, TreeNode } from "../types";

export type CirclePositionInCanvas = { x: number; y: number; id: string };

function CanvasTest() {
    const { height, width } = useAppSelector(selectScreenDimentions);

    const { value: currentTree } = useAppSelector(selectCurrentTree);

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

    let deltaX = getDeltaX();

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
            horizontalScrollViewRef.current.scrollTo({ x, y, animated: true });
            verticalScrollViewRef.current.scrollTo({ x, y, animated: true });
        }, 50);

        return () => {
            clearTimeout(timerId);
        };
    }, [verticalScrollViewRef, horizontalScrollViewRef, currentTree]);

    const foundNodeCoordinates = circlePositionsInCanvas.find((c) => c.id === selectedNode);

    return (
        <ScrollView showsVerticalScrollIndicator={false} ref={verticalScrollViewRef} style={{ height: height - NAV_HEGIHT }}>
            {/* onScroll={() => setSelectedNode(null)}
            scrollEventThrottle={100}> */}
            <ScrollView ref={horizontalScrollViewRef} horizontal showsHorizontalScrollIndicator={false} style={{ position: "relative" }}>
                {/* onScroll={() => setSelectedNode(null)}
                scrollEventThrottle={100}> */}
                {currentTree !== undefined && (
                    <Canvas
                        onTouch={touchHandler}
                        style={{ width: canvasDimentions.width, height: canvasDimentions.height, backgroundColor: "#F2F3F8" }}>
                        <Tree
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

function calculateDimentionsAndRootCoordinates(currentTree: TreeNode<Book>) {
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

export default CanvasTest;
