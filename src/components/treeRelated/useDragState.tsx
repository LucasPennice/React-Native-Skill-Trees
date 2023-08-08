import { useReducer } from "react";
import { SharedValue, useSharedValue } from "react-native-reanimated";
import { addEveryChildFromTreeToArray, findNodeById } from "../../functions/extractInformationFromTree";
import { DragState, NodeCoordinate, Skill, Tree } from "../../types";

const defaultDragState: DragState = { isDragging: false, isOutsideNodeMenuZone: false, nodeId: null, draggingNodeIds: [], subtreeIds: [] };

export type DragStateReducers = "START_DRAGGING" | "END_DRAGGING" | "UPDATE_IS_OUTSIDE_NODE_MENU_ZONE" | "UPDATE_NODES_TO_DRAG";
export type DragStatePayload = {
    runOnEndDragging?: () => void;
    treeCoordinates?: NodeCoordinate[];
    nodeId?: null | string;
    draggingNodeIds?: string[];
};

export type DragStateDispatch = React.Dispatch<{ type: DragStateReducers; payload: DragStatePayload }>;

export type DragValuesAndSetters = {
    x: SharedValue<number>;
    y: SharedValue<number>;
    update: (newX: number, newY: number) => void;
    resetDragValues: () => void;
};

function useDragState(currentTree: Tree<Skill>) {
    const dragX = useSharedValue(0);
    const dragY = useSharedValue(0);

    const drag = {
        x: dragX,
        y: dragY,
        update: (newX: number, newY: number) => {
            "worklet";
            dragX.value = newX;
            dragY.value = newY;
        },
        resetDragValues: () => {
            "worklet";
            dragX.value = 0;
            dragY.value = 0;
        },
    };

    const [state, dispatch] = useReducer(dragStateReducer, defaultDragState);

    function dragStateReducer(state: DragState, action: { type: DragStateReducers; payload: DragStatePayload }): DragState {
        const { payload, type } = action;
        switch (type) {
            case "START_DRAGGING":
                if (!payload.nodeId) throw new Error("undefined nodeId at dragStateReducer");
                if (!payload.treeCoordinates) throw new Error("undefined treeCoordinates at dragStateReducer");

                let subtreeIds: string[] = [payload.nodeId];

                if (currentTree.treeId !== "HomepageTree") {
                    const node = findNodeById(currentTree, payload.nodeId);

                    if (!node) throw new Error("node not found at dragStateReducer");

                    addEveryChildFromTreeToArray(node, subtreeIds);
                }

                return { ...state, isDragging: true, nodeId: payload.nodeId, draggingNodeIds: [payload.nodeId], subtreeIds };
            case "END_DRAGGING":
                if (payload.runOnEndDragging) payload.runOnEndDragging();
                return defaultDragState;
            case "UPDATE_IS_OUTSIDE_NODE_MENU_ZONE":
                return { ...state, isOutsideNodeMenuZone: true, draggingNodeIds: state.subtreeIds };
            default:
                throw new Error("Unknown action at dragStateReducer");
        }
    }

    return [state, dispatch, drag] as const;
}

export default useDragState;
