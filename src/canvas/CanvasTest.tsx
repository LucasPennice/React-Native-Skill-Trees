import { Canvas } from "@shopify/react-native-skia";
import { useState } from "react";
import { Dimensions, ScrollView } from "react-native";
import { treeMock } from "../types";
import { getDeltaX } from "./functions";
import useCanvasTouchHandler from "./useCanvasTouchHandler";
import PopUpMenu from "./PopUpMenu";
import Tree from "./Tree";

export const circlePositionsInCanvas: { x: number; y: number; id: string }[] = [];

function CanvasTest() {
    const { height, width } = Dimensions.get("window");

    const [selectedNode, setSelectedNode] = useState<null | string>(null);
    const [selectedNodeHistory, setSelectedNodeHistory] = useState<(null | string)[]>([null]);

    const CANVAS_SIZE = { width: width * 2, height: height * 1 };
    // const CANVAS_SIZE = { width: width * 3, height: height * 3 };
    const TREE_ROOT_COORDINATES = { width: CANVAS_SIZE.width / 2, height: CANVAS_SIZE.height / 2 };
    // const TREE_ROOT_COORDINATES = { width: CANVAS_SIZE.width / 2, height: CANVAS_SIZE.height / 2 };

    let deltaX = getDeltaX();

    const { touchHandler, horizontalScrollViewRef, verticalScrollViewRef, scrollToCoordinates } = useCanvasTouchHandler({
        selectedNodeState: [selectedNode, setSelectedNode],
        setSelectedNodeHistory,
    });

    const foundNodeCoordinates = circlePositionsInCanvas.find((c) => c.id === selectedNode);

    return (
        <ScrollView showsVerticalScrollIndicator={false} ref={verticalScrollViewRef}>
            <ScrollView ref={horizontalScrollViewRef} horizontal showsHorizontalScrollIndicator={false} style={{ position: "relative" }}>
                <Canvas onTouch={touchHandler} style={{ width: CANVAS_SIZE.width, height: CANVAS_SIZE.height, backgroundColor: "#F2F3F8" }}>
                    <Tree selectedNode={selectedNode} tree={treeMock} rootCoordinates={TREE_ROOT_COORDINATES} />
                </Canvas>
                {selectedNode && foundNodeCoordinates && (
                    <PopUpMenu foundNodeCoordinates={foundNodeCoordinates} selectedNode={selectedNode} selectedNodeHistory={selectedNodeHistory} />
                )}
            </ScrollView>
        </ScrollView>
    );
}

export default CanvasTest;
