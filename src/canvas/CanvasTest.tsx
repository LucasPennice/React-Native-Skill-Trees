import { Canvas, Circle, mix, Path, TouchInfo, useSharedValueEffect, useTouchHandler, useValue } from "@shopify/react-native-skia";
import { useEffect, useRef, useState } from "react";
import { Dimensions, ScrollView, Text, View } from "react-native";
import { findTreeNodeById } from "../treeFunctions";
import { treeMock, TreeNode, Book } from "../types";
import { CIRCLE_SIZE } from "./parameters";
import { createBezierPathBetweenPoints, didTapCircle, getChildCoordinatesFromParentInfo, getDeltaX } from "./functions";
import useCanvasTouchHandler, { DISTANCE_FROM_LEFT_MARGIN_ON_SCROLL } from "./useCanvasTouchHandler";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSpring, withTiming } from "react-native-reanimated";
import Tree, { CIRCLE_SIZE_SELECTED } from "./Tree";

export const circlePositionsInCanvas: { x: number; y: number; id: string }[] = [];

function CanvasTest() {
    const { height, width } = Dimensions.get("window");

    const [selectedNode, setSelectedNode] = useState<null | string>(null);

    const CANVAS_SIZE = { width: width * 2, height: height * 1 };
    // const CANVAS_SIZE = { width: width * 3, height: height * 3 };
    const TREE_ROOT_COORDINATES = { width: CANVAS_SIZE.width / 2, height: CANVAS_SIZE.height / 2 };
    // const TREE_ROOT_COORDINATES = { width: CANVAS_SIZE.width / 2, height: CANVAS_SIZE.height / 2 };

    let deltaX = getDeltaX();

    const { touchHandler, horizontalScrollViewRef, verticalScrollViewRef, scrollToCoordinates } = useCanvasTouchHandler({
        selectedNodeState: [selectedNode, setSelectedNode],
    });

    const foundNodeCoordinates = circlePositionsInCanvas.find((c) => c.id === selectedNode);

    const isOpen = useSharedValue(false);

    useEffect(() => {
        isOpen.value = selectedNode != null;
    }, [selectedNode]);

    const animatedStyles = useAnimatedStyle(() => {
        return {
            opacity: withTiming(isOpen.value ? 1 : 0),
            transform: [{ scale: withSpring(isOpen.value ? 1 : 0.9) }],
        };
    });

    const animatedCoordinates = useAnimatedStyle(() => {
        if (!foundNodeCoordinates) return { left: 0, top: 0 };

        return {
            left: withSpring(foundNodeCoordinates.x + CIRCLE_SIZE_SELECTED + 20, { damping: 20, stiffness: 300 }),
            top: withSpring(foundNodeCoordinates.y - height / 4, { damping: 20, stiffness: 300 }),
        };
    }, [foundNodeCoordinates, selectedNode]);

    const triangleAnimatedStyles = useAnimatedStyle(() => {
        return {
            opacity: withDelay(200, withTiming(isOpen.value ? 1 : 0)),
            transform: [{ scale: withDelay(200, withSpring(isOpen.value ? 1 : 0.9)) }, { rotate: "-90deg" }],
        };
    });

    return (
        <ScrollView showsVerticalScrollIndicator={false} ref={verticalScrollViewRef}>
            <ScrollView ref={horizontalScrollViewRef} horizontal showsHorizontalScrollIndicator={false} style={{ position: "relative" }}>
                <Canvas onTouch={touchHandler} style={{ width: CANVAS_SIZE.width, height: CANVAS_SIZE.height, backgroundColor: "rgba(0,0,0,1)" }}>
                    <Tree selectedNode={selectedNode} tree={treeMock} rootCoordinates={TREE_ROOT_COORDINATES} />
                </Canvas>
                {selectedNode && foundNodeCoordinates && (
                    <>
                        <Animated.View
                            style={[
                                animatedStyles,
                                animatedCoordinates,
                                {
                                    position: "absolute",
                                    height: height / 2,
                                    width: width - DISTANCE_FROM_LEFT_MARGIN_ON_SCROLL - CIRCLE_SIZE_SELECTED - 30,
                                    backgroundColor: "gray",
                                    borderRadius: 20,
                                },
                            ]}>
                            <Text style={{ color: "white", fontSize: 23 }}>Soy el menu</Text>
                        </Animated.View>
                        {/* This is the triangle of the menu */}
                        <Animated.View
                            style={[
                                triangleAnimatedStyles,
                                {
                                    position: "absolute",
                                    left: foundNodeCoordinates.x + CIRCLE_SIZE_SELECTED + 10,
                                    top: foundNodeCoordinates.y,
                                    width: 0,
                                    height: 0,
                                    backgroundColor: "transparent",
                                    borderStyle: "solid",
                                    borderLeftWidth: 10,
                                    borderRightWidth: 10,
                                    borderBottomWidth: 10,
                                    borderLeftColor: "transparent",
                                    borderRightColor: "transparent",
                                    borderBottomColor: "gray",
                                },
                            ]}
                        />
                    </>
                )}
            </ScrollView>
        </ScrollView>
    );
}

export default CanvasTest;
