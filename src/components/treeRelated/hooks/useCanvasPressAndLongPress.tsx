import { TouchHandler } from "@shopify/react-native-skia";
import { useState } from "react";
import { Gesture, GestureStateChangeEvent, LongPressGestureHandlerEventPayload, TapGestureHandlerEventPayload } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { CIRCLE_SIZE, CIRCLE_SIZE_SELECTED, TOUCH_BUFFER } from "../../../parameters";
import { CartesianCoordinate, NodeCoordinate, DnDZone, GestureHandlerState, SelectedNodeId } from "../../../types";
import { NODE_MENU_SIZE } from "../nodeMenu/NodeMenu";

type Props = {
    state: {
        nodeCoordinatesCentered: NodeCoordinate[];
        selectedNodeId: SelectedNodeId;
        dragAndDropZones: DnDZone[];
    };
    config: {
        showDndZones?: boolean;
        blockLongPress?: boolean;
        blockDragAndDrop?: boolean;
    };
    functions: {
        onNodeClick?: (nodeId: string) => void;
        onDndZoneClick?: (clickedZone?: DnDZone) => void;
        setDraggingNode: (v: boolean) => void;
        clearSelectedNodeCoord: () => void;
    };
};

export type NodeLongPressIndicatorData = {
    data: CartesianCoordinate | undefined;
    failed?: { interrupted: boolean; notAllowed: boolean };
    success?: boolean;
};

export const DISTANCE_FROM_LEFT_MARGIN_ON_SCROLL = CIRCLE_SIZE_SELECTED + 20;

const MAX_TAP_DURATION = 80;

export const MIN_DURATION_LONG_PRESS_MS = 300;

export type CanvasTouchHandler = { touchHandler: TouchHandler };

const useCanvasPressAndLongPress = ({ config, functions, state }: Props) => {
    const { showDndZones, blockLongPress, blockDragAndDrop } = config;
    const { onDndZoneClick, onNodeClick, setDraggingNode } = functions;
    const { dragAndDropZones, nodeCoordinatesCentered, selectedNodeId } = state;
    //
    const [openMenuOnNode, setOpenMenuOnNode] = useState<NodeCoordinate | undefined>(undefined);
    const [longPressIndicatorPosition, setLongPressIndicatorPosition] = useState<{
        data: NodeCoordinate | undefined;
        state: "INTERRUPTED" | "PRESSING" | "IDLE";
    }>({ data: undefined, state: "IDLE" });
    const closeNodeMenu = () => setOpenMenuOnNode(undefined);
    //

    const resetLongPressIndicator = () => setLongPressIndicatorPosition({ data: undefined, state: "IDLE" });

    function handleSuccessfulLongPress(clickedNode: NodeCoordinate) {
        setOpenMenuOnNode(clickedNode);
        return resetLongPressIndicator();
    }

    const onScroll = () => {
        closeNodeMenu();
        interruptLongPress();

        function interruptLongPress() {
            return setLongPressIndicatorPosition((p) => {
                const prevStateEqualToNewState = !p.data && p.state === "INTERRUPTED";

                if (prevStateEqualToNewState) return p;

                return { data: undefined, state: "INTERRUPTED" };
            });
        }
    };

    // TAP GESTURE 🫵🏻

    const tapGesture = {
        handleOnStart: (e: GestureStateChangeEvent<TapGestureHandlerEventPayload>) => {
            closeNodeMenu();
        },
        handleOnEnd: (e: GestureStateChangeEvent<TapGestureHandlerEventPayload>) => {
            const clickedDndZone = dragAndDropZones.find(didTapDndZone(e));
            if (onDndZoneClick && showDndZones) return onDndZoneClick(clickedDndZone);
            const clickedNode = nodeCoordinatesCentered.find(didTapCircle(e));
            if (clickedNode === undefined) return functions.clearSelectedNodeCoord();
            if (selectedNodeId !== clickedNode.nodeId && onNodeClick) return onNodeClick(clickedNode.nodeId);
            return functions.clearSelectedNodeCoord();
        },
    };

    const canvasTouch = Gesture.Tap()
        .onStart((touchEvent) => {
            runOnJS(tapGesture.handleOnStart)(touchEvent);
        })
        .onEnd((touchEvent) => {
            runOnJS(tapGesture.handleOnEnd)(touchEvent);
        })
        .maxDuration(MAX_TAP_DURATION);

    // LONG PRESS GESTURE ⌚️

    const longPressGesture = {
        handleOnStart: (e: GestureStateChangeEvent<LongPressGestureHandlerEventPayload>) => {
            if (blockLongPress) return;

            const clickedNode = nodeCoordinatesCentered.find(didTapCircle(e));
            if (!clickedNode) return setLongPressIndicatorPosition({ data: undefined, state: "IDLE" });

            if (clickedNode !== undefined) setDraggingNode(true);

            return setLongPressIndicatorPosition({ data: clickedNode, state: "PRESSING" });
        },
        handleOnEnd: (e: GestureStateChangeEvent<LongPressGestureHandlerEventPayload>) => {
            if (blockLongPress) return;

            const correctDuration = e.duration >= MIN_DURATION_LONG_PRESS_MS;

            if (!correctDuration) return;
            const stateCode = e.state;

            const gestureSuccessful = GestureHandlerState.END === stateCode && correctDuration;

            const fingerMovedOutsideAllowedZone = GestureHandlerState.CANCELLED === stateCode;

            const longPressingNode = longPressIndicatorPosition.data !== undefined;

            const shouldDragAndDrop = !blockDragAndDrop && longPressingNode && fingerMovedOutsideAllowedZone && correctDuration;

            if (shouldDragAndDrop) return resetLongPressIndicator();

            setDraggingNode(false);

            if (!longPressIndicatorPosition.data) return resetLongPressIndicator();

            if (gestureSuccessful) return handleSuccessfulLongPress(longPressIndicatorPosition.data);

            return setLongPressIndicatorPosition((p) => {
                return { data: p.data, state: "INTERRUPTED" };
            });
        },
    };

    const canvasLongPress = Gesture.LongPress()
        .onStart((touchEvent) => {
            runOnJS(longPressGesture.handleOnStart)(touchEvent);
        })
        .onEnd((touchEvent) => {
            runOnJS(longPressGesture.handleOnEnd)(touchEvent);
        })
        .minDuration(MAX_TAP_DURATION)
        .maxDistance(NODE_MENU_SIZE / 2);

    const canvasPressAndLongPress = Gesture.Exclusive(canvasLongPress, canvasTouch);

    return { canvasPressAndLongPress, openMenuOnNode, longPressIndicatorPosition, closeNodeMenu, onScroll };
};

export default useCanvasPressAndLongPress;

export function didTapCircle(touchInfo: { x: number; y: number }) {
    return (circle: { x: number; y: number }) => {
        const isTouchInsideCircleXRange =
            touchInfo.x >= circle.x - CIRCLE_SIZE / 2 - TOUCH_BUFFER && touchInfo.x <= circle.x + CIRCLE_SIZE / 2 + TOUCH_BUFFER;

        const isTouchInsideCircleYRange =
            touchInfo.y >= circle.y - CIRCLE_SIZE / 2 - TOUCH_BUFFER && touchInfo.y <= circle.y + CIRCLE_SIZE / 2 + TOUCH_BUFFER;

        const isTouchingCircle = isTouchInsideCircleXRange && isTouchInsideCircleYRange;

        if (!isTouchingCircle) return false;

        return true;
    };
}

function didTapDndZone(touchInfo: GestureStateChangeEvent<TapGestureHandlerEventPayload>) {
    return (zone: DnDZone) => {
        const isTouchInsideCircleXRange = touchInfo.x >= zone.x && touchInfo.x <= zone.x + zone.width;

        const isTouchInsideCircleYRange = touchInfo.y >= zone.y && touchInfo.y <= zone.y + zone.height;

        const isTouchingCircle = isTouchInsideCircleXRange && isTouchInsideCircleYRange;

        if (!isTouchingCircle) return false;

        return true;
    };
}
