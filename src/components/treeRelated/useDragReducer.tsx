import { useReducer } from "react";
import { SharedValue, runOnJS, useAnimatedReaction, useSharedValue } from "react-native-reanimated";
import { addEveryChildFromTreeToArray, findNodeById } from "../../functions/extractInformationFromTree";
import { DragState, NodeCoordinate, Skill, Tree } from "../../types";
import { NODE_MENU_SIZE } from "../../parameters";
import { LongPressIndicatorDispatch } from "./useLongPressReducer";

const defaultDragState: DragState = { isDragging: false, isOutsideNodeMenuZone: false, node: null, draggingNodeIds: [], subtreeIds: [] };

export type DragStateReducers = "START_DRAGGING" | "END_DRAGGING" | "UPDATE_IS_OUTSIDE_NODE_MENU_ZONE" | "UPDATE_NODES_TO_DRAG";
export type DragStatePayload = {
    runOnEndDragging?: () => void;
    treeCoordinates?: NodeCoordinate[];
    node?: null | NodeCoordinate;
    draggingNodeIds?: string[];
};

export type DragStateDispatch = React.Dispatch<{ type: DragStateReducers; payload: DragStatePayload }>;

export type DragValuesAndSetters = {
    x: SharedValue<number>;
    y: SharedValue<number>;
    update: (newX: number, newY: number) => void;
    resetDragValues: () => void;
};

function useDragReducer(currentTree: Tree<Skill>, longPressIndicatorDispatch: LongPressIndicatorDispatch) {
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

    useAnimatedReaction(
        () => {
            return [dragX.value, dragY.value, state.isOutsideNodeMenuZone] as const;
        },
        (arr, _) => {
            const [dragX, dragY, isOutsideNodeMenuZone] = arr;

            if (isOutsideNodeMenuZone) return;

            const dragDistance = parseInt(Math.sqrt(dragX ** 2 + dragY ** 2).toFixed(0));

            const isOutsideMenuSize = dragDistance > NODE_MENU_SIZE / 2;

            const allowDragOutsideMenu = currentTree.treeId !== "HomepageTree";

            if (isOutsideMenuSize) {
                if (allowDragOutsideMenu) {
                    runOnJS(dispatch)({ type: "UPDATE_IS_OUTSIDE_NODE_MENU_ZONE", payload: {} });
                } else {
                    runOnJS(dispatch)({ type: "END_DRAGGING", payload: {} });
                    runOnJS(longPressIndicatorDispatch)({ type: "RESET", payload: {} });
                    drag.resetDragValues();
                }
            }
        },
        [dragX, dragY, state.isOutsideNodeMenuZone]
    );

    function dragStateReducer(state: DragState, action: { type: DragStateReducers; payload: DragStatePayload }): DragState {
        const { payload, type } = action;
        switch (type) {
            case "START_DRAGGING":
                if (!payload.node) throw new Error("undefined node at dragStateReducer");
                if (!payload.treeCoordinates) throw new Error("undefined treeCoordinates at dragStateReducer");

                let subtreeIds: string[] = [payload.node.id];

                if (currentTree.treeId !== "HomepageTree") {
                    const node = findNodeById(currentTree, payload.node.id);

                    if (!node) throw new Error("node not found at dragStateReducer");

                    addEveryChildFromTreeToArray(node, subtreeIds);
                }

                return { ...state, isDragging: true, node: payload.node, draggingNodeIds: [payload.node.id], subtreeIds };
            case "END_DRAGGING":
                if (payload.runOnEndDragging) payload.runOnEndDragging();
                return defaultDragState;
            case "UPDATE_IS_OUTSIDE_NODE_MENU_ZONE":
                longPressIndicatorDispatch({ type: "RESET", payload: {} });

                return { ...state, isOutsideNodeMenuZone: true, draggingNodeIds: state.subtreeIds };
            default:
                throw new Error("Unknown action at dragStateReducer");
        }
    }

    return [state, dispatch, drag] as const;
}

export default useDragReducer;
