import { Gesture, GestureStateChangeEvent, TapGestureHandlerEventPayload } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { NodeCoordinate, DnDZone, SelectedNodeId, NormalizedNode } from "../../../../types";
import { didTapCircle } from "./functions";
import { MAX_TAP_DURATION } from "./params";
import { useAppSelector } from "@/redux/reduxHooks";
import { HOMEPAGE_TREE_ID } from "@/parameters";
import { selectAllNodes, selectNodesOfTree } from "@/redux/slices/nodesSlice";

export type CanvasTapProps = {
    state: {
        nodeCoordinates: NodeCoordinate[];
        selectedNodeId: SelectedNodeId;
        dragAndDropZones: DnDZone[];
        showNewNodePositions?: boolean;
    };
    functions: {
        runOnTap: () => void;
        onNodeClick?: (node: NormalizedNode) => void;
        onDndZoneClick?: (clickedZone?: DnDZone) => void;
        clearSelectedNodeCoord: () => void;
    };
};

function useCanvasTap({ functions, state }: CanvasTapProps) {
    const { runOnTap, onDndZoneClick, onNodeClick } = functions;
    const { dragAndDropZones, nodeCoordinates, selectedNodeId, showNewNodePositions } = state;

    const rootNode = nodeCoordinates.find((n) => n.isRoot === true);

    if (!rootNode) throw new Error("rootNode not found at useCanvasTap");

    const nodesOfTree = useAppSelector(rootNode.treeId === HOMEPAGE_TREE_ID ? selectAllNodes : selectNodesOfTree(rootNode.treeId));

    const tapGesture = {
        handleOnStart: (e: GestureStateChangeEvent<TapGestureHandlerEventPayload>) => runOnTap(),
        handleOnEnd: (e: GestureStateChangeEvent<TapGestureHandlerEventPayload>) => {
            const clickedDndZone = dragAndDropZones.find(didTapDndZone(e));

            if (onDndZoneClick && showNewNodePositions) return onDndZoneClick(clickedDndZone);

            if (selectedNodeId) return functions.clearSelectedNodeCoord();

            const clickedNode = nodeCoordinates.find(didTapCircle(e));
            if (clickedNode === undefined) return functions.clearSelectedNodeCoord();

            const clickedNormalizedNode = nodesOfTree.find((n) => n.nodeId === clickedNode.nodeId);

            if (!clickedNormalizedNode) throw new Error("clickedNormalizedNode not found at useCanvasTap");

            if (selectedNodeId !== clickedNode.nodeId && onNodeClick) return onNodeClick(clickedNormalizedNode);
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
