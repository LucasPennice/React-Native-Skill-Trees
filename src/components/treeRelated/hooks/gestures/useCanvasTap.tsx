import { Gesture, GestureStateChangeEvent, TapGestureHandlerEventPayload } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { useAppDispatch } from "../../../../redux/reduxHooks";
import { clearSelectedNode } from "../../../../redux/slices/userTreesSlice";
import { CoordinatesWithTreeData, DnDZone, SelectedNodeId } from "../../../../types";
import { didTapCircle } from "./functions";
import { MAX_TAP_DURATION } from "./params";

type Props = {
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
    };
};

function useCanvasTap({ functions, state }: Props) {
    const { runOnTap, onDndZoneClick, onNodeClick } = functions;
    const { dragAndDropZones, nodeCoordinates, selectedNodeId, showDndZones } = state;

    const dispatch = useAppDispatch();

    const tapGesture = {
        handleOnStart: (e: GestureStateChangeEvent<TapGestureHandlerEventPayload>) => runOnTap(),
        handleOnEnd: (e: GestureStateChangeEvent<TapGestureHandlerEventPayload>) => {
            const clickedDndZone = dragAndDropZones.find(didTapDndZone(e));
            if (onDndZoneClick && showDndZones) return onDndZoneClick(clickedDndZone);

            const clickedNode = nodeCoordinates.find(didTapCircle(e));
            if (clickedNode === undefined) return dispatch(clearSelectedNode());

            if (selectedNodeId !== clickedNode.nodeId && onNodeClick) return onNodeClick(clickedNode);
            return dispatch(clearSelectedNode());
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
