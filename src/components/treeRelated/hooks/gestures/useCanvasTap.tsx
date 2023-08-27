import { Gesture, GestureStateChangeEvent, TapGestureHandlerEventPayload } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { CoordinatesWithTreeData, DnDZone, SelectedNodeId } from "../../../../types";
import { didTapCircle } from "./functions";
import { MAX_TAP_DURATION } from "./params";

export type CanvasTapProps = {
    state: {
        nodeCoordinates: CoordinatesWithTreeData[];
        selectedNodeId: SelectedNodeId;
        dragAndDropZones: DnDZone[];
        showDndZones?: boolean;
    };
    functions: {
        runOnTap: () => void;
        onNodeClick?: (node: CoordinatesWithTreeData) => void;
        onDndZoneClick?: (clickedZone?: DnDZone) => void;
        clearSelectedNodeCoord: () => void;
    };
};

function useCanvasTap({ functions, state }: CanvasTapProps) {
    const { runOnTap, onDndZoneClick, onNodeClick } = functions;
    const { dragAndDropZones, nodeCoordinates, selectedNodeId, showDndZones } = state;

    const tapGesture = {
        handleOnStart: (e: GestureStateChangeEvent<TapGestureHandlerEventPayload>) => runOnTap(),
        handleOnEnd: (e: GestureStateChangeEvent<TapGestureHandlerEventPayload>) => {
            const clickedDndZone = dragAndDropZones.find(didTapDndZone(e));
            if (onDndZoneClick && showDndZones) return onDndZoneClick(clickedDndZone);

            const clickedNode = nodeCoordinates.find(didTapCircle(e));
            if (clickedNode === undefined) return functions.clearSelectedNodeCoord();

            if (selectedNodeId !== clickedNode.nodeId && onNodeClick) return onNodeClick(clickedNode);
            return functions.clearSelectedNodeCoord();
        },
    };

    const canvasTap = Gesture.Tap()
        .onStart((touchEvent) => {
            runOnJS(tapGesture.handleOnStart)(touchEvent);
        })
        .onEnd((touchEvent) => {
            runOnJS(tapGesture.handleOnEnd)(touchEvent);
        })
        .maxDuration(MAX_TAP_DURATION);

    return canvasTap;
}

export default useCanvasTap;

function didTapDndZone(touchInfo: GestureStateChangeEvent<TapGestureHandlerEventPayload>) {
    return (zone: DnDZone) => {
        const isTouchInsideCircleXRange = touchInfo.x >= zone.x && touchInfo.x <= zone.x + zone.width;

        const isTouchInsideCircleYRange = touchInfo.y >= zone.y && touchInfo.y <= zone.y + zone.height;

        const isTouchingCircle = isTouchInsideCircleXRange && isTouchInsideCircleYRange;

        if (!isTouchingCircle) return false;

        return true;
    };
}
