import { Canvas } from "@shopify/react-native-skia";
import { useEffect, useState } from "react";
import { Dimensions, ScrollView } from "react-native";
import { treeMock } from "../types";
import { DISTANCE_BETWEEN_GENERATIONS, getDeltaX } from "./functions";
import useCanvasTouchHandler from "./useCanvasTouchHandler";
import PopUpMenu from "./PopUpMenu";
import Tree, { CIRCLE_SIZE_SELECTED } from "./Tree";
import { findTreeHeight } from "../treeFunctions";

export type CirclePositionInCanvas = { x: number; y: number; id: string };

function CanvasTest() {
    const { height, width } = Dimensions.get("window");

    const [selectedNode, setSelectedNode] = useState<null | string>(null);
    const [selectedNodeHistory, setSelectedNodeHistory] = useState<(null | string)[]>([null]);
    const [circlePositionsInCanvas, setCirclePositionsInCanvas] = useState<CirclePositionInCanvas[]>([]);

    const popCoordinateToArray = (coordinate: CirclePositionInCanvas) => setCirclePositionsInCanvas((p) => [...p, coordinate]);

    let deltaX = getDeltaX();

    const { touchHandler, horizontalScrollViewRef, verticalScrollViewRef } = useCanvasTouchHandler({
        selectedNodeState: [selectedNode, setSelectedNode],
        setSelectedNodeHistory,
        circlePositionsInCanvas,
    });

    const canvasDimentions = calculateDimentionsAndRootCoordinates();
    const { rootX, rootY } = canvasDimentions;

    useEffect(() => {
        if (!verticalScrollViewRef.current) return;
        if (!horizontalScrollViewRef.current) return;

        const x = 200;

        const y = 0.5 * (canvasDimentions.height - height);

        let timerId = setTimeout(() => {
            horizontalScrollViewRef.current.scrollTo({ x, y, animated: true });
            verticalScrollViewRef.current.scrollTo({ x, y, animated: true });
        }, 200);

        return () => {
            clearTimeout(timerId);
        };
    }, [verticalScrollViewRef, horizontalScrollViewRef]);

    const foundNodeCoordinates = circlePositionsInCanvas.find((c) => c.id === selectedNode);

    return (
        <ScrollView showsVerticalScrollIndicator={false} ref={verticalScrollViewRef}>
            <ScrollView ref={horizontalScrollViewRef} horizontal showsHorizontalScrollIndicator={false} style={{ position: "relative" }}>
                <Canvas onTouch={touchHandler} style={{ width: canvasDimentions.width, height: canvasDimentions.height, backgroundColor: "#F2F3F8" }}>
                    <Tree stateProps={{ selectedNode, popCoordinateToArray }} tree={treeMock} rootCoordinates={{ width: rootX, height: rootY }} />
                </Canvas>
                <PopUpMenu foundNodeCoordinates={foundNodeCoordinates} selectedNode={selectedNode} selectedNodeHistory={selectedNodeHistory} />
            </ScrollView>
        </ScrollView>
    );
}

function calculateDimentionsAndRootCoordinates() {
    const { height, width } = Dimensions.get("window");

    const treeHeight = (findTreeHeight(treeMock) - 1) * DISTANCE_BETWEEN_GENERATIONS;

    const canvasHorizontalPadding = 2 * (width - 10 - (CIRCLE_SIZE_SELECTED * 3) / 4);
    const canvasVerticalPadding = height;

    return {
        width: width * 2 + canvasHorizontalPadding,
        height: treeHeight + canvasVerticalPadding,
        rootY: height / 2 - DISTANCE_BETWEEN_GENERATIONS,
        rootX: width,
    };
}

export default CanvasTest;
