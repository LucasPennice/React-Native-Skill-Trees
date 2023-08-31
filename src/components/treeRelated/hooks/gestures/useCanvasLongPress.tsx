import { Gesture, GestureStateChangeEvent, LongPressGestureHandlerEventPayload } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { GestureHandlerState, NodeAction, NodeCoordinate } from "../../../../types";
import { NODE_MENU_SIZE } from "../../nodeMenu/NodeMenu";
import { didTapCircle } from "./functions";
import { MAX_TAP_DURATION, MIN_DURATION_LONG_PRESS_MS } from "./params";

type Props = {
    nodeCoordinates: NodeCoordinate[];
    nodeActionState: readonly [
        NodeAction,
        {
            readonly resetNodeAction: () => void;
            readonly beginLongPress: (node: NodeCoordinate) => void;
            readonly openMenuAfterLongPress: () => void;
        }
    ];
    config: {
        blockLongPress?: boolean;
        blockDragAndDrop?: boolean;
    };
    draggingNodeActions: { readonly endDragging: () => void; readonly startDragging: () => void };
};

function useCanvasLongPress({ config, nodeCoordinates, draggingNodeActions, nodeActionState }: Props) {
    const { blockLongPress, blockDragAndDrop } = config;

    const [nodeAction, { beginLongPress, openMenuAfterLongPress, resetNodeAction }] = nodeActionState;

    const { endDragging, startDragging } = draggingNodeActions;

    const runOnScroll = resetNodeAction;

    const longPressGesture = {
        handleOnStart: (e: GestureStateChangeEvent<LongPressGestureHandlerEventPayload>) => {
            if (blockLongPress) return;

            const clickedNode = nodeCoordinates.find(didTapCircle(e));

            if (!clickedNode) return;

            // if (clickedNode !== undefined) startDragging();

            return beginLongPress(clickedNode);
        },
        handleOnEnd: (e: GestureStateChangeEvent<LongPressGestureHandlerEventPayload>) => {
            if (blockLongPress) return;

            const correctDuration = e.duration >= MIN_DURATION_LONG_PRESS_MS;

            if (!correctDuration) return resetNodeAction();
            const stateCode = e.state;

            const gestureSuccessful = GestureHandlerState.END === stateCode && correctDuration && nodeAction.state === "LongPressing";

            // const fingerMovedOutsideAllowedZone = GestureHandlerState.CANCELLED === stateCode;

            // const shouldDragAndDrop = !blockDragAndDrop && nodeAction.state ==="LongPressing" && fingerMovedOutsideAllowedZone && correctDuration;

            // if (shouldDragAndDrop) return resetLongPressIndicator();

            // endDragging();

            // if (!longPressIndicatorPosition.data) return resetLongPressIndicator();
            if (gestureSuccessful) return openMenuAfterLongPress();

            return resetNodeAction();
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

    return { canvasLongPress, runOnScroll };
}

export default useCanvasLongPress;
