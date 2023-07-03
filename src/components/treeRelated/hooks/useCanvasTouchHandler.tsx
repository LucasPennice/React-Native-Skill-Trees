import { TouchHandler, TouchInfo, useTouchHandler } from "@shopify/react-native-skia";
import { useState } from "react";
import { GestureStateChangeEvent, LongPressGestureHandlerEventPayload } from "react-native-gesture-handler";
import { CIRCLE_SIZE, CIRCLE_SIZE_SELECTED, TOUCH_BUFFER } from "../../../parameters";
import { useAppDispatch } from "../../../redux/reduxHooks";
import { setSelectedNode, clearSelectedNode } from "../../../redux/userTreesSlice";
import { CartesianCoordinate, DnDZone, NodeCoordinate, SelectedNodeId } from "../../../types";
import { distanceFromLeftCanvasEdge } from "../coordinateFunctions";

type Props = {
    state: {
        nodeCoordinatesCentered: NodeCoordinate[];
        selectedNodeId: SelectedNodeId;
        dragAndDropZones: DnDZone[];
        canvasWidth: number;
        screenWidth: number;
    };
    config: {
        showDndZones?: boolean;
        blockLongPress?: boolean;
    };
    functions: {
        onNodeClick?: (nodeId: string) => void;
        onDndZoneClick?: (clickedZone?: DnDZone) => void;
    };
};

export type NodeLongPressIndicatorData = {
    data: CartesianCoordinate | undefined;
    failed?: { interrupted: boolean; notAllowed: boolean };
    success?: boolean;
};

export const DISTANCE_FROM_LEFT_MARGIN_ON_SCROLL = CIRCLE_SIZE_SELECTED + 20;

export const MIN_DURATION_LONG_PRESS_SEC = 0.25;

export const MIN_DURATION_LONG_PRESS_MS = 300;

export type CanvasTouchHandler = { touchHandler: TouchHandler };

const useCanvasTouchHandler = ({ config, functions, state }: Props) => {
    const { showDndZones, blockLongPress } = config;
    const { onDndZoneClick, onNodeClick } = functions;
    const { dragAndDropZones, nodeCoordinatesCentered, selectedNodeId, canvasWidth, screenWidth } = state;
    //
    const [openMenuOnNode, setOpenMenuOnNode] = useState<NodeCoordinate | undefined>(undefined);
    const [longPressIndicatorPosition, setLongPressIndicatorPosition] = useState<{
        data: NodeCoordinate | undefined;
        state: "INTERRUPTED" | "PRESSING" | "IDLE";
    }>({ data: undefined, state: "IDLE" });
    const closeNodeMenu = () => setOpenMenuOnNode(undefined);
    //Redux
    const dispatch = useAppDispatch();
    //

    const interruptLongPress = () => {
        return setLongPressIndicatorPosition((p) => {
            const prevStateEqualToNewState = !p.data && p.state === "INTERRUPTED";

            if (prevStateEqualToNewState) return p;

            return { data: undefined, state: "INTERRUPTED" };
        });
    };

    const resetLongPressIndicator = () => setLongPressIndicatorPosition({ data: undefined, state: "IDLE" });

    function handleSuccessfulLongPress(clickedNode: NodeCoordinate) {
        setOpenMenuOnNode(clickedNode);
        return resetLongPressIndicator();
    }

    const longPressFn = {
        onStart: (args: { e: GestureStateChangeEvent<LongPressGestureHandlerEventPayload>; offset: [number, number] }) => {
            if (blockLongPress) return;
            const { e, offset } = args;
            const [x, y] = offset;

            const leftCanvasEdgeOffset = distanceFromLeftCanvasEdge(canvasWidth, screenWidth, x);
            const simulatedCanvasTouchCoordX = leftCanvasEdgeOffset + e.x;
            const simulatedCanvasTouchCoordY = e.y - y;

            const touchCoord = { x: simulatedCanvasTouchCoordX, y: simulatedCanvasTouchCoordY };

            const clickedNode = nodeCoordinatesCentered.find(didTapCircle(touchCoord));

            if (!clickedNode) return setLongPressIndicatorPosition({ data: undefined, state: "IDLE" });

            return setLongPressIndicatorPosition({ data: clickedNode, state: "PRESSING" });
        },
        onEnd: (e: GestureStateChangeEvent<LongPressGestureHandlerEventPayload>) => {
            if (blockLongPress) return;
            if (!longPressIndicatorPosition.data) return resetLongPressIndicator();

            if (e.duration >= MIN_DURATION_LONG_PRESS_MS) return handleSuccessfulLongPress(longPressIndicatorPosition.data);

            return setLongPressIndicatorPosition((p) => {
                return { data: p.data, state: "INTERRUPTED" };
            });
        },
        onScroll: () => {
            closeNodeMenu();
            interruptLongPress();
        },
    };

    const touchHandler = useTouchHandler(
        {
            onStart: () => closeNodeMenu(),
            onEnd: (touchInfo) => {
                //Avoids bug on android
                if (touchInfo.type !== 2) return;

                const clickedDndZone = dragAndDropZones.find(didTapDndZone(touchInfo));

                if (onDndZoneClick && showDndZones) return onDndZoneClick(clickedDndZone);

                const clickedNode = nodeCoordinatesCentered.find(didTapCircle(touchInfo));

                if (clickedNode === undefined) return dispatch(clearSelectedNode());

                if (selectedNodeId !== clickedNode.id && onNodeClick) return onNodeClick(clickedNode.id);

                return dispatch(clearSelectedNode());
            },
        },
        [selectedNodeId, nodeCoordinatesCentered, openMenuOnNode]
    );

    return { touchHandler, openMenuOnNode, longPressIndicatorPosition, closeNodeMenu, longPressFn };
};

export default useCanvasTouchHandler;

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

function didTapDndZone(touchInfo: TouchInfo) {
    return (zone: DnDZone) => {
        const isTouchInsideCircleXRange = touchInfo.x >= zone.x && touchInfo.x <= zone.x + zone.width;

        const isTouchInsideCircleYRange = touchInfo.y >= zone.y && touchInfo.y <= zone.y + zone.height;

        const isTouchingCircle = isTouchInsideCircleXRange && isTouchInsideCircleYRange;

        if (!isTouchingCircle) return false;

        return true;
    };
}
