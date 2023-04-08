import { useEffect, useState } from "react";
import { Button, Dimensions, Pressable, Text, TextInput, View } from "react-native";
import { DISTANCE_FROM_LEFT_MARGIN_ON_SCROLL } from "../canvas/hooks/useCanvasTouchHandler";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from "react-native-reanimated";
import { CirclePositionInCanvas, MENU_DAMPENING } from "../../../types";
import { findTreeNodeById } from "../treeFunctions";
import { deleteNodeWithNoChildren, editNodeProperty, selectCurrentTree } from "../../../redux/currentTreeSlice";
import { useAppDispatch, useAppSelector } from "../../../redux/reduxHooks";
import { selectScreenDimentions } from "../../../redux/screenDimentionsSlice";
import { openChildrenHoistSelector } from "../../../redux/canvasDisplaySettingsSlice";
import { CIRCLE_SIZE_SELECTED, colors } from "../canvas/parameters";
import AppText from "../../../AppText";

type Props = {
    selectedNode: string | null;
    selectedNodeHistory: (string | null)[];
    foundNodeCoordinates: CirclePositionInCanvas;
};

function PopUpMenu({ selectedNode, foundNodeCoordinates, selectedNodeHistory }: Props) {
    //Redux store state
    const currentTree = useAppSelector(selectCurrentTree);
    const { height, width } = useAppSelector(selectScreenDimentions);
    const dispatch = useAppDispatch();
    //
    const currentNode = findTreeNodeById(currentTree, selectedNode);
    //Local State
    const [text, onChangeText] = useState(currentNode ? currentNode.data.name : "Name");

    const MENU_HEIGHT = height / 2;
    const MENU_WIDTH = width - DISTANCE_FROM_LEFT_MARGIN_ON_SCROLL - CIRCLE_SIZE_SELECTED - 30;

    const { animatedMenuStyles, triangleAnimatedStyles } = useHandlePopMenuAnimations(foundNodeCoordinates, selectedNode, selectedNodeHistory);

    if (!currentNode) return <></>;

    return (
        <>
            <Animated.View
                style={[
                    animatedMenuStyles,
                    {
                        position: "absolute",
                        height: MENU_HEIGHT,
                        width: MENU_WIDTH,
                        backgroundColor: colors.line,
                        borderRadius: 20,
                        padding: 20,
                    },
                ]}>
                <View style={{ display: "flex", flexDirection: "row" }}>
                    <TextInput
                        value={text}
                        onChangeText={onChangeText}
                        style={{ fontSize: 24, width: MENU_WIDTH - 40, fontWeight: "bold", letterSpacing: 1, color: "white", paddingRight: 25 }}
                        multiline
                        blurOnSubmit
                        //@ts-ignore
                        enterKeyHint="done"
                        onBlur={() => {
                            const newProperties = { ...currentNode, data: { ...currentNode.data, name: text } };

                            dispatch(editNodeProperty({ targetNode: currentNode, newProperties }));
                        }}
                    />
                    <AppText style={{ color: "white", fontSize: 28, transform: [{ translateX: -20 }], opacity: 0.6 }}>✎</AppText>
                </View>
                {!currentNode.children && (
                    <Pressable style={{ marginTop: 20, paddingVertical: 15 }} onPress={() => dispatch(deleteNodeWithNoChildren(currentNode))}>
                        <AppText style={{ fontSize: 20, color: "white" }}>Delete Node</AppText>
                    </Pressable>
                )}

                {currentNode.children && (
                    <Pressable
                        style={{ marginTop: 20, paddingVertical: 15 }}
                        onPress={() => dispatch(openChildrenHoistSelector(currentNode.children!))}>
                        <AppText style={{ fontSize: 20, color: "white" }}>Delete Node</AppText>
                    </Pressable>
                )}
                <Pressable
                    style={{ paddingVertical: 15 }}
                    onPress={() => {
                        const newProperties = {
                            ...currentNode,
                            data: { ...currentNode.data, isCompleted: currentNode.data.isCompleted ? false : true },
                        };

                        dispatch(editNodeProperty({ targetNode: currentNode, newProperties }));
                    }}>
                    <AppText style={{ fontSize: 20, color: "white" }}>{`${
                        currentNode.data.isCompleted ? "Mark as Incomplete" : "Mark as Complete"
                    }`}</AppText>
                </Pressable>
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
                        borderBottomColor: colors.line,
                    },
                ]}
            />
        </>
    );
}

export default PopUpMenu;

function useHandlePopMenuAnimations(
    foundNodeCoordinates: CirclePositionInCanvas,
    selectedNode: string | null,
    selectedNodeHistory: (string | null)[]
) {
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
