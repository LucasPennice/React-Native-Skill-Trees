import { NodeMenuFunctions } from "./NodeMenu";

function useWrapNodeMenuFunctions(
    functions: NodeMenuFunctions,
    closeNodeMenu: () => void,
    setMenuMode: (v: "NORMAL" | "SELECTING_NODE_POSITION") => void
) {
    const { idle, selectingPosition } = functions;

    const idleActions = {
        horizontalLeft: () => {
            if (!idle.horizontalLeft) return;
            closeNodeMenu();
            idle.horizontalLeft();
        },
        horizontalRight: () => {
            if (idle.horizontalRight) {
                idle.horizontalRight();
                return closeNodeMenu();
            }

            setMenuMode("SELECTING_NODE_POSITION");
        },
        verticalDown: () => {
            if (!idle.verticalDown) return;
            closeNodeMenu();
            idle.verticalDown();
        },
        verticalUp: () => {
            if (!idle.verticalUp) return;
            closeNodeMenu();
            idle.verticalUp();
        },
    };

    const selectNodePositionAction = {
        horizontalLeft: () => {
            if (!selectingPosition.horizontalLeft) return;
            closeNodeMenu();
            selectingPosition.horizontalLeft();
        },
        horizontalRight: () => {
            if (!selectingPosition.horizontalRight) return;
            closeNodeMenu();
            selectingPosition.horizontalRight();
        },
        verticalDown: () => {
            if (!selectingPosition.verticalDown) return;
            closeNodeMenu();
            selectingPosition.verticalDown();
        },
        verticalUp: () => {
            if (!selectingPosition.verticalUp) return;
            closeNodeMenu();
            selectingPosition.verticalUp();
        },
    };

    return { selectNodePositionAction, idleActions };
}

export default useWrapNodeMenuFunctions;
