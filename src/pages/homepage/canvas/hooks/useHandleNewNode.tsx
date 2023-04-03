import { useEffect, useState } from "react";
import { Gesture } from "react-native-gesture-handler";
import { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { DnDZone, Skill, Tree } from "../../../../types";
import { CIRCLE_SIZE } from "../parameters";

function useHandleNewNode(scrollOffset: { x: number; y: number }, dragAndDropZones: DnDZone[], currentTree: Tree<Skill> | undefined) {
    const [dndZoneHoveringOver, setDndZoneHoveringOver] = useState<DnDZone | undefined>(undefined);

    const startingPosition = { x: 0, y: 0 };

    const position = useSharedValue(startingPosition);

    const tentativeModifiedTree = getTentativeModifiedTree(dndZoneHoveringOver, currentTree);

    const handleHoverCalculations = (hoverCoord: { x: number; y: number }) => {
        //There are no state-sync issues as long as scrollOffset and dragAndDropZones remain as state variables or derived state variables

        const { x, y } = hoverCoord;

        const dragAndDropNodeCanvasCoordinates = getDragAndDropCanvasCoordinates({ x, y }, scrollOffset);
        const rectangleUnderDragAndDropNode = getRectangleUnderDragAndDropNode(dragAndDropZones, dragAndDropNodeCanvasCoordinates);

        setDndZoneHoveringOver((prev) => {
            //All of these comparisions are meant to avoid setting the state and updating the UI when the previous and new state are the same
            //(JS) cannot compare objects so we write that logic manually
            if (rectangleUnderDragAndDropNode == undefined) return undefined;

            if (prev == undefined) return rectangleUnderDragAndDropNode;

            const prevEqualsToNewRectangle =
                prev.x == rectangleUnderDragAndDropNode.x &&
                prev.y == rectangleUnderDragAndDropNode.y &&
                prev.type == rectangleUnderDragAndDropNode.type &&
                prev.width == rectangleUnderDragAndDropNode.width &&
                prev.height == rectangleUnderDragAndDropNode.height;

            if (prevEqualsToNewRectangle) return prev;

            return rectangleUnderDragAndDropNode;
        });
    };

    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            position.value = { x: e.translationX + startingPosition.x, y: e.translationY + startingPosition.y };

            const x = Math.trunc(position.value.x);
            const y = Math.trunc(position.value.y);

            runOnJS(handleHoverCalculations)({ x, y });
        })
        .onEnd((e) => {
            position.value = startingPosition;
        })
        .activateAfterLongPress(0);

    const animatedStyle = useAnimatedStyle(() => ({
        left: withSpring(position.value.x, { damping: 27, stiffness: 500 }),
        top: withSpring(position.value.y, { damping: 27, stiffness: 500 }),
    }));

    return {
        panGesture,
        animatedStyle,
        tentativeModifiedTree,
    };
}

export default useHandleNewNode;

function getTentativeModifiedTree(dndZoneHoveringOver: DnDZone | undefined, currentTree: Tree<Skill> | undefined) {
    if (!currentTree) return undefined;
    if (!dndZoneHoveringOver) return undefined;

    //Tengo 3 casos

    //Parent

    //Children
    //Brother

    console.log(dndZoneHoveringOver);
}

function getDragAndDropCanvasCoordinates(dragAndDropNodeCoord: { x: number; y: number }, scrollOffset: { x: number; y: number }) {
    return { x: dragAndDropNodeCoord.x + scrollOffset.x, y: dragAndDropNodeCoord.y + scrollOffset.y };
}

function getRectangleUnderDragAndDropNode(
    dragAndDropZones: DnDZone[],
    dragAndDropNodeCanvasCoordinates: {
        x: number;
        y: number;
    }
) {
    const x = dragAndDropNodeCanvasCoordinates.x + CIRCLE_SIZE;
    const y = dragAndDropNodeCanvasCoordinates.y + CIRCLE_SIZE;

    const result = dragAndDropZones.find((rec) => {
        const inXBounds = x >= rec.x && x <= rec.x + rec.width;
        const inYBounds = y >= rec.y && y <= rec.y + rec.height;

        return inXBounds && inYBounds;
    });

    return result;
}
