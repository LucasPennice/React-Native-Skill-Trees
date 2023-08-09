import { useReducer } from "react";
import { NodeCoordinate } from "../../types";

export type LongPressIndicatorState = { node: NodeCoordinate | undefined; state: "INTERRUPTED" | "PRESSING" | "IDLE" };
export type LongPressIndicatorReducers = "RESET" | "INTERRUPT" | "BEGIN_LONG_PRESS";
export type LongPressIndicatorPayload = { node?: NodeCoordinate };
export type LongPressIndicatorDispatch = React.Dispatch<{ type: LongPressIndicatorReducers; payload: LongPressIndicatorPayload }>;

const defaultState: LongPressIndicatorState = { node: undefined, state: "IDLE" };

function useLongPressReducer() {
    const [state, dispatch] = useReducer(reducer, defaultState);

    function reducer(
        state: LongPressIndicatorState,
        action: { type: LongPressIndicatorReducers; payload: LongPressIndicatorPayload }
    ): LongPressIndicatorState {
        const { payload, type } = action;
        switch (type) {
            case "RESET":
                return { node: undefined, state: "IDLE" };
            case "BEGIN_LONG_PRESS":
                if (!payload.node) throw new Error("node undefined at BEGIN_LONG_PRESS");
                return { node: payload.node, state: "PRESSING" };
            case "INTERRUPT":
                return { node: payload.node, state: "IDLE" };

            default:
                throw new Error("Unknown action at dragStateReducer");
        }
    }

    return [state, dispatch] as const;
}

export default useLongPressReducer;
