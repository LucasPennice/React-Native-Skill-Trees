import { useEffect } from "react";
import { Button, Dimensions, Text } from "react-native";
import { DISTANCE_FROM_LEFT_MARGIN_ON_SCROLL } from "./useCanvasTouchHandler";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from "react-native-reanimated";
import { CIRCLE_SIZE_SELECTED } from "./Tree";
import { MENU_DAMPENING } from "../types";
import { findTreeNodeById } from "../treeFunctions";
import { CirclePositionInCanvas } from "./CanvasTest";
import { deleteNodeWithNoChildren, selectCurrentTree } from "../currentTreeSlice";
import { useAppDispatch, useAppSelector } from "../reduxHooks";
import { selectScreenDimentions } from "../screenDimentionsSlice";
import { toggleChildrenHoistSelector } from "../canvasDisplaySettingsSlice";

type Props = {
    selectedNode: string | null;
    selectedNodeHistory: (string | null)[];
    foundNodeCoordinates: CirclePositionInCanvas;
};

function PopUpMenu({ selectedNode, foundNodeCoordinates, selectedNodeHistory }: Props) {
    const { value: currentTree } = useAppSelector(selectCurrentTree);
    const { height, width } = useAppSelector(selectScreenDimentions);
    const dispatch = useAppDispatch();

    const MENU_HEIGHT = height / 2;

    const { animatedMenuStyles, triangleAnimatedStyles } = useHandlePopMenuAnimations(foundNodeCoordinates, selectedNode, selectedNodeHistory);

    const currentNode = findTreeNodeById(currentTree, selectedNode);

    if (!currentNode) return;

    return (
        <>
            <Animated.View
                style={[
                    animatedMenuStyles,
                    {
                        position: "absolute",
                        height: MENU_HEIGHT,
                        width: width - DISTANCE_FROM_LEFT_MARGIN_ON_SCROLL - CIRCLE_SIZE_SELECTED - 30,
                        backgroundColor: "gray",
                        borderRadius: 20,
                        padding: 20,
                    },
                ]}>
                {!currentNode.children && <Button title={"Delete Node"} onPress={() => dispatch(deleteNodeWithNoChildren(currentNode))} />}
                {currentNode.children && <Button title={"Delete Node"} onPress={() => dispatch(toggleChildrenHoistSelector(currentNode.children))} />}
            </Animated.View>
            {/* This is the triangle of the menu */}
            <Animated.View
                style={[
                    triangleAnimatedStyles,
                    {
                        position: "absolute",
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
    );
}

export default PopUpMenu;

function useHandlePopMenuAnimations(foundNodeCoordinates: CirclePositionInCanvas, selectedNode: string, selectedNodeHistory: string[]) {
    const isOpen = useSharedValue(false);

    useEffect(() => {
        isOpen.value = selectedNode != null;
    }, [selectedNode]);

    const { height, width } = useAppSelector(selectScreenDimentions);

    const MENU_HEIGHT = height / 2;

    //Derived State 👇
    let prevSelectedNode = selectedNodeHistory[selectedNodeHistory.length - 2] ?? null;

    //This handles the menu animations 👇

    const animatedMenuStyles = useAnimatedStyle(() => {
        const MENU_DISTANCE_FROM_NODE = CIRCLE_SIZE_SELECTED + 20;

        const left = foundNodeCoordinates.x + MENU_DISTANCE_FROM_NODE;

        const top = foundNodeCoordinates.y - MENU_HEIGHT / 2 - CIRCLE_SIZE_SELECTED / 2;

        let standardMenuStyles = { opacity: withTiming(isOpen.value ? 1 : 0), transform: [{ scale: withSpring(isOpen.value ? 1 : 0.9) }] };

        if (!foundNodeCoordinates) return { left: 0, top: 0, ...standardMenuStyles };

        if (prevSelectedNode == null) return { left, top, ...standardMenuStyles };

        return {
            left: withSpring(left, MENU_DAMPENING),
            top: withSpring(top, MENU_DAMPENING),
            ...standardMenuStyles,
        };
    }, [foundNodeCoordinates, selectedNode, selectedNodeHistory]);

    //This handles the menu's triangle animations 👇
    const triangleAnimatedStyles = useAnimatedStyle(() => {
        let standardTriangleStyles = {
            opacity: withDelay(200, withTiming(isOpen.value ? 1 : 0)),
            transform: [{ scale: withDelay(200, withSpring(isOpen.value ? 1 : 0.9)) }, { rotate: "-90deg" }],
        };

        if (prevSelectedNode == null)
            return {
                left: foundNodeCoordinates.x + CIRCLE_SIZE_SELECTED + 10,
                top: foundNodeCoordinates.y - CIRCLE_SIZE_SELECTED / 2,
                ...standardTriangleStyles,
            };

        return {
            left: withSpring(foundNodeCoordinates.x + CIRCLE_SIZE_SELECTED + 10, MENU_DAMPENING),
            top: withSpring(foundNodeCoordinates.y - CIRCLE_SIZE_SELECTED / 2, MENU_DAMPENING),
            ...standardTriangleStyles,
        };
    });

    return { triangleAnimatedStyles, animatedMenuStyles };
}
