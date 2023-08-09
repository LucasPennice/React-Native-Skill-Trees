import { TouchHandler } from "@shopify/react-native-skia";
import { useState } from "react";
import { Gesture, GestureStateChangeEvent, LongPressGestureHandlerEventPayload, TapGestureHandlerEventPayload } from "react-native-gesture-handler";
import { runOnJS, useSharedValue } from "react-native-reanimated";
import { CIRCLE_SIZE, CIRCLE_SIZE_SELECTED, NODE_MENU_SIZE, TOUCH_BUFFER } from "../../../parameters";
import { useAppDispatch } from "../../../redux/reduxHooks";
import { clearSelectedNode } from "../../../redux/userTreesSlice";
import { CartesianCoordinate, DnDZone, GestureHandlerState, NodeCoordinate, SelectedNodeId } from "../../../types";
import { DragStateDispatch } from "../useDragReducer";
import { LongPressIndicatorDispatch, LongPressIndicatorState } from "../useLongPressReducer";

type Props = {
    state: {
        nodeCoordinatesCentered: NodeCoordinate[];
        selectedNodeId: SelectedNodeId;
        dragAndDropZones: DnDZone[];
        longPressIndicatorReducer: readonly [LongPressIndicatorState, LongPressIndicatorDispatch];
    };
    config: {
        showAddNodeDndZones?: boolean;
        blockLongPress?: boolean;
    };
    functions: {
        onNodeClick?: (nodeId: string) => void;
        onDndZoneClick?: (clickedZone?: DnDZone) => void;
        dispatchDragState: DragStateDispatch;
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
    const { showAddNodeDndZones, blockLongPress } = config;
    const { onDndZoneClick, onNodeClick, dispatchDragState } = functions;
    const { dragAndDropZones, nodeCoordinatesCentered, selectedNodeId, longPressIndicatorReducer } = state;
    const [longPressIndicatorState, longPressIndicatorDispatch] = longPressIndicatorReducer;
    //
    const [openMenuOnNode, setOpenMenuOnNode] = useState<NodeCoordinate | undefined>(undefined);
    const closeNodeMenu = () => setOpenMenuOnNode(undefined);
    //Redux
    const dispatch = useAppDispatch();
    //

    let startDraggingTimeoutID = useSharedValue<NodeJS.Timeout | undefined>(undefined);

    const onScroll = () => {
        closeNodeMenu();

        const prevStateEqualToNewState = !longPressIndicatorState.node && longPressIndicatorState.state === "INTERRUPTED";

        if (prevStateEqualToNewState) {
            longPressIndicatorDispatch({ type: "INTERRUPT", payload: { node: longPressIndicatorState.node } });
        } else {
            longPressIndicatorDispatch({ type: "INTERRUPT", payload: { node: undefined } });
        }

        if (startDraggingTimeoutID.value) clearTimeout(startDraggingTimeoutID.value);
    };

    // TAP GESTURE 🫵🏻

    const tapGesture = {
        handleOnStart: (e: GestureStateChangeEvent<TapGestureHandlerEventPayload>) => {
            closeNodeMenu();
        },
        handleOnEnd: (e: GestureStateChangeEvent<TapGestureHandlerEventPayload>) => {
            const clickedDndZone = dragAndDropZones.find(didTapDndZone(e));
            if (onDndZoneClick && showAddNodeDndZones) return onDndZoneClick(clickedDndZone);
            const clickedNode = nodeCoordinatesCentered.find(didTapCircle(e));
            if (clickedNode === undefined) return dispatch(clearSelectedNode());
            if (selectedNodeId !== clickedNode.id && onNodeClick) return onNodeClick(clickedNode.id);
            return dispatch(clearSelectedNode());
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
            if (!clickedNode) return longPressIndicatorDispatch({ type: "RESET", payload: {} });

            startDraggingTimeoutID.value = setTimeout(() => {
                dispatchDragState({ type: "START_DRAGGING", payload: { node: clickedNode, treeCoordinates: nodeCoordinatesCentered } });
            }, MIN_DURATION_LONG_PRESS_MS);

            return longPressIndicatorDispatch({ type: "BEGIN_LONG_PRESS", payload: { node: clickedNode } });
        },
        handleOnEnd: (e: GestureStateChangeEvent<LongPressGestureHandlerEventPayload>) => {
            if (blockLongPress) return;

            if (startDraggingTimeoutID.value) clearTimeout(startDraggingTimeoutID.value);

            const correctDuration = e.duration >= MIN_DURATION_LONG_PRESS_MS;

            if (!correctDuration) return;

            const stateCode = e.state;

            const gestureSuccessful = GestureHandlerState.END === stateCode && correctDuration;

            if (gestureSuccessful && longPressIndicatorState.node) {
                setOpenMenuOnNode(longPressIndicatorState.node);
                longPressIndicatorDispatch({ type: "RESET", payload: {} });
                dispatchDragState({ type: "END_DRAGGING", payload: {} });
            }
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

    return { canvasPressAndLongPress, openMenuOnNode, closeNodeMenu, onScroll };
};

export default useCanvasPressAndLongPress;

export function didTapCircle(touchInfo: { x: number; y: number }) {
    return (circle: { x: number; y: number; id: string }) => {
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
