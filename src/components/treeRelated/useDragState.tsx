import { useReducer } from "react";
import { SharedValue, useSharedValue } from "react-native-reanimated";
import { DragState } from "../../types";

const defaultDragState: DragState = { isDragging: false, isOutsideNodeMenuZone: false, nodeId: null, nodesToDrag: [] };

export type DragStateReducers = "START_DRAGGING" | "END_DRAGGING" | "UPDATE_IS_OUTSIDE_NODE_MENU_ZONE" | "UPDATE_NODES_TO_DRAG";
export type DragStatePayload = {
    runOnEndDragging?: () => void;
    nodeId?: null | string;
    nodesToDrag?: string[];
};

export type DragStateDispatch = React.Dispatch<{ type: DragStateReducers; payload: DragStatePayload }>;

export type DragValuesAndSetters = {
    x: SharedValue<number>;
    y: SharedValue<number>;
    update: (newX: number, newY: number) => void;
    resetDragValues: () => void;
};

function useDragState() {
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

            console.log(dragX.value, dragY.value);
        },
    };

    function dragStateReducer(state: DragState, action: { type: DragStateReducers; payload: DragStatePayload }): DragState {
        const { payload, type } = action;
        switch (type) {
            case "START_DRAGGING":
                if (!payload.nodeId) throw new Error("undefined nodeId at dragStateReducer");

                return { ...state, isDragging: true, nodeId: payload.nodeId, nodesToDrag: [payload.nodeId] };
            case "END_DRAGGING":
                if (payload.runOnEndDragging) payload.runOnEndDragging();
                return defaultDragState;
            case "UPDATE_IS_OUTSIDE_NODE_MENU_ZONE":
                return { ...state, isOutsideNodeMenuZone: true };
            case "UPDATE_NODES_TO_DRAG":
                if (!payload.nodesToDrag) throw new Error("undefined nodesToDrag at dragStateReducer");
                return { ...state, nodesToDrag: [...state.nodesToDrag, ...payload.nodesToDrag] };
            default:
                throw new Error("Unknown action at dragStateReducer");
        }
    }

    const [state, dispatch] = useReducer(dragStateReducer, defaultDragState);

    return [state, dispatch, drag] as const;
}

export default useDragState;
