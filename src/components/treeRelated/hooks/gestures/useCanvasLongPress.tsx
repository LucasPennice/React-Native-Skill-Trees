import { Gesture, GestureStateChangeEvent, LongPressGestureHandlerEventPayload } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { GestureHandlerState, NodeCoordinate } from "../../../../types";
import { NODE_MENU_SIZE } from "../../nodeMenu/NodeMenu";
import { didTapCircle } from "./functions";
import { MAX_TAP_DURATION, MIN_DURATION_LONG_PRESS_MS } from "./params";

type Props = {
    nodeCoordinatesCentered: NodeCoordinate[];
    longPressState: [
        {
            data: NodeCoordinate | undefined;
            state: "INTERRUPTED" | "PRESSING" | "IDLE";
        },
        React.Dispatch<
            React.SetStateAction<{
                data: NodeCoordinate | undefined;
                state: "INTERRUPTED" | "PRESSING" | "IDLE";
            }>
        >
    ];
    nodeMenuState: [NodeCoordinate | undefined, React.Dispatch<React.SetStateAction<NodeCoordinate | undefined>>];
    config: {
        blockLongPress?: boolean;
        blockDragAndDrop?: boolean;
    };
    setDraggingNode: (v: boolean) => void;
};

function useCanvasLongPress({ config, nodeCoordinatesCentered, setDraggingNode, longPressState, nodeMenuState }: Props) {
    const { blockLongPress, blockDragAndDrop } = config;

    const [longPressIndicatorPosition, setLongPressIndicatorPosition] = longPressState;
    const [openMenuOnNode, setOpenMenuOnNode] = nodeMenuState;

    const closeNodeMenu = () => setOpenMenuOnNode(undefined);

    const resetLongPressIndicator = () => setLongPressIndicatorPosition({ data: undefined, state: "IDLE" });

    function handleSuccessfulLongPress(clickedNode: NodeCoordinate) {
        setOpenMenuOnNode(clickedNode);
        return resetLongPressIndicator();
    }

    const runOnScroll = () => {
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

    return { canvasLongPress, runOnScroll, openMenuOnNode, longPressIndicatorPosition, closeNodeMenu };
}

export default useCanvasLongPress;
