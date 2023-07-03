import * as Haptics from "expo-haptics";
import { useState } from "react";
import { NodeMenuFunctions } from "./NodeMenu";

function useWrapNodeMenuFunctions(
    functions: NodeMenuFunctions,
    closeNodeMenu: () => void,
    setMenuMode: (v: "NORMAL" | "SELECTING_NODE_POSITION") => void
) {
    const [hovering, setHovering] = useState<"LEFT" | "UP" | "RIGHT" | "DOWN" | undefined>(undefined);

    const { idle, selectingPosition } = functions;

    const idleActions = {
        horizontalLeft: () => {
            setHovering(undefined);
            if (!idle.horizontalLeft) return;
            closeNodeMenu();
            idle.horizontalLeft();
        },
        horizontalRight: () => {
            setHovering(undefined);

            if (idle.horizontalRight) {
                idle.horizontalRight();
                return closeNodeMenu();
            }

            setMenuMode("SELECTING_NODE_POSITION");
        },
        verticalDown: () => {
            setHovering(undefined);
            if (!idle.verticalDown) return;
            closeNodeMenu();
            idle.verticalDown();
        },
        verticalUp: () => {
            setHovering(undefined);
            if (!idle.verticalUp) return;
            closeNodeMenu();
            idle.verticalUp();
        },
    };

    const selectNodePositionAction = {
        horizontalLeft: () => {
            setHovering(undefined);
            if (!selectingPosition.horizontalLeft) return;
            closeNodeMenu();
            selectingPosition.horizontalLeft();
        },
        horizontalRight: () => {
            setHovering(undefined);
            if (!selectingPosition.horizontalRight) return;
            closeNodeMenu();
            selectingPosition.horizontalRight();
        },
        verticalDown: () => {
            setHovering(undefined);
            if (!selectingPosition.verticalDown) return;
            closeNodeMenu();
            selectingPosition.verticalDown();
        },
        verticalUp: () => {
            setHovering(undefined);
            if (!selectingPosition.verticalUp) return;
            closeNodeMenu();
            selectingPosition.verticalUp();
        },
    };

    const onHoverActions = {
        horizontalLeft: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setHovering("LEFT");
        },
        horizontalRight: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setHovering("RIGHT");
        },
        verticalDown: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setHovering("DOWN");
        },
        verticalUp: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setHovering("UP");
        },
        clearHover: () => setHovering(undefined),
    };
    return { onHoverActions, selectNodePositionAction, idleActions, hovering };
}

export default useWrapNodeMenuFunctions;
