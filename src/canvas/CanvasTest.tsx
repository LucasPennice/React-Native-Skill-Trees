import { Canvas, Circle, mix, Path, TouchInfo, useSharedValueEffect, useTouchHandler, useValue } from "@shopify/react-native-skia";
import { useEffect, useRef, useState } from "react";
import { Dimensions, ScrollView } from "react-native";
import { findTreeNodeById } from "../treeFunctions";
import { treeMock, TreeNode, Book } from "../types";
import { CIRCLE_SIZE } from "./parameters";
import { createBezierPathBetweenPoints, didTapCircle, getChildCoordinatesFromParentInfo, getDeltaX } from "./functions";
import useCanvasTouchHandler from "./useCanvasTouchHandler";
import { useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import Tree from "./Tree";

export const circlePositionsInCanvas: { x: number; y: number; id: string }[] = [];

function CanvasTest() {
    const { height, width } = Dimensions.get("window");

    const [selectedNode, setSelectedNode] = useState<null | string>(null);

    const CANVAS_SIZE = { width: width * 2, height: height * 2 };
    const TREE_ROOT_COORDINATES = { width: CANVAS_SIZE.width / 2, height: 200 };

    let deltaX = getDeltaX();

    const verticalScrollViewRef = useRef<ScrollView | null>(null);
    const horizontalScrollViewRef = useRef<ScrollView | null>(null);

    const generateScrollToCoordinatesFn =
        (verticalScrollViewRef: React.MutableRefObject<ScrollView>, horizontalScrollViewRef: React.MutableRefObject<ScrollView>) =>
        (x: number, y: number) => {
            if (!verticalScrollViewRef.current || !horizontalScrollViewRef.current) return;

            //This is the functions that handles the scrolling

            verticalScrollViewRef.current.scrollTo({ x, y: y - height / 2, animated: true });
            horizontalScrollViewRef.current.scrollTo({ x: x - 40, y, animated: true });
        };

    const touchHandler = useCanvasTouchHandler({
        selectedNodeState: [selectedNode, setSelectedNode],
        scrollToCoordinates: generateScrollToCoordinatesFn(verticalScrollViewRef, horizontalScrollViewRef),
    });

    return (
        <ScrollView showsVerticalScrollIndicator={false} ref={verticalScrollViewRef}>
            <ScrollView ref={horizontalScrollViewRef} horizontal showsHorizontalScrollIndicator={false}>
                <Canvas onTouch={touchHandler} style={{ width: CANVAS_SIZE.width, height: CANVAS_SIZE.height }}>
                    <Tree selectedNode={selectedNode} tree={treeMock} rootCoordinates={TREE_ROOT_COORDINATES} />
                </Canvas>
            </ScrollView>
        </ScrollView>
    );
}

export default CanvasTest;
