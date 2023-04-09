import { useEffect } from "react";
import { CanvasTouchHandler } from "./useCanvasTouchHandler";
import { useAppSelector } from "../../../../redux/reduxHooks";
import { selectScreenDimentions } from "../../../../redux/screenDimentionsSlice";
import { NAV_HEGIHT } from "../parameters";
import { CanvasDimentions } from "../../../../types";
import { selectCurrentTree } from "../../../../redux/userTreesSlice";

function useCenterCameraOnTreeChange(canvasTouchHandler: CanvasTouchHandler, canvasDimentions: CanvasDimentions, hasTreeChanged: boolean) {
    const { height, width } = useAppSelector(selectScreenDimentions);
    const currentTree = useAppSelector(selectCurrentTree);

    const { horizontalScrollViewRef, verticalScrollViewRef } = canvasTouchHandler;
    const { canvasHeight, horizontalMargin } = canvasDimentions;

    useEffect(() => {
        if (!verticalScrollViewRef.current) return;
        if (!horizontalScrollViewRef.current) return;

        if (!hasTreeChanged) return;

        const x = horizontalMargin / 2;

        const HEIGHT_WITHOUT_NAV = height - NAV_HEGIHT;

        const y = 0.5 * (canvasHeight - HEIGHT_WITHOUT_NAV);

        let timerId = setTimeout(() => {
            horizontalScrollViewRef.current!.scrollTo({ x, y, animated: false });
            verticalScrollViewRef.current!.scrollTo({ x, y, animated: false });
        }, 50);

        return () => {
            clearTimeout(timerId);
        };
    }, [verticalScrollViewRef, horizontalScrollViewRef, currentTree, hasTreeChanged]);
}

export default useCenterCameraOnTreeChange;
