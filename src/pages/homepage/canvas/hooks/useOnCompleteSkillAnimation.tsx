import { rect, rrect, runTiming, useComputedValue, useSharedValueEffect, useValue } from "@shopify/react-native-skia";
import { Skill, Tree, TreeWithCoord } from "../../../../types";
import { CIRCLE_SIZE } from "../parameters";
import { useSharedValue } from "react-native-reanimated";
import { useEffect } from "react";
import { useAppSelector } from "../../../../redux/reduxHooks";
import { selectCurrentTree, selectTreeSlice } from "../../../../redux/userTreesSlice";
import { findTreeNodeById } from "../../treeFunctions";

function useOnCompleteSkillAnimation(node: TreeWithCoord<Skill>) {
    //
    const OVERSHOOT_DURATION = node.data.isCompleted ? 300 : 0;
    const DELAY_AFTER_OVERSHOOT = node.data.isCompleted ? 400 : 0;
    const REMAINING_ANIMATION_DURATION = node.data.isCompleted ? 400 : 0;

    //OUTER RECTANGLE GO HERE 👇
    const outerRectSizeInitial = 0;
    const outerRectSizeOnComplete = 2 * CIRCLE_SIZE;

    const outerRectX = useValue(0);
    const outerRectY = useValue(0);
    const outerRectSize = useValue(outerRectSizeInitial);

    const runCompletionAnimation = () => {
        const size = node.data.isCompleted ? outerRectSizeOnComplete : outerRectSizeInitial;
        const coord = getCenteredCoordinates(size, node.x, node.y);

        const overShootSize = node.data.isCompleted ? 1.5 * outerRectSizeOnComplete : outerRectSizeInitial;
        const overShootCoord = getCenteredCoordinates(overShootSize, node.x, node.y);

        return () => {
            console.log(node.data.name);
            //Initial Phase
            // runTiming(outerRectSize,{from:node.x,to:overShootCoord.x},{duration:OVERSHOOT_DURATION})

            //After DURATION time has passed
            // setTimeout(() => {}, DELAY_AFTER_OVERSHOOT);
        };
    };

    useEffect(() => {
        outerRectX.current = node ? node.x : 0;
        outerRectY.current = node ? node.x : 0;
        outerRectSize.current = node ? node.x : 0;
    }, [node]);

    // useEffect(() => {
    //     const size = isComplete ? outerRectSizeOnComplete : outerRectSizeInitial;
    //     const coord = getCenteredCoordinates(size, cx, cy);

    //     //Initial Phase
    //     outerRectXSharedValue.value = withTiming(overShootCoord.x, { duration: OVERSHOOT_DURATION });
    //     outerRectYSharedValue.value = withTiming(overShootCoord.y, { duration: OVERSHOOT_DURATION });
    //     outerRectSizeSharedValue.value = withTiming(overShootSize, { duration: OVERSHOOT_DURATION });

    //     //After DURATION time has passed
    //     outerRectXSharedValue.value = withDelay(DELAY_AFTER_OVERSHOOT, withTiming(coord.x, { duration: REMAINING_ANIMATION_DURATION }));
    //     outerRectYSharedValue.value = withDelay(DELAY_AFTER_OVERSHOOT, withTiming(coord.y, { duration: REMAINING_ANIMATION_DURATION }));
    //     outerRectSizeSharedValue.value = withDelay(DELAY_AFTER_OVERSHOOT, withTiming(size, { duration: REMAINING_ANIMATION_DURATION }));
    // }, [isComplete]);

    const animatedOuterRect = useComputedValue(() => {
        return rrect(
            rect(outerRectX.current, outerRectY.current, outerRectSize.current, outerRectSize.current),
            outerRectSize.current,
            outerRectSize.current
        );
    }, [outerRectX, outerRectY, outerRectSize]);

    if (!node) return undefined;

    return { runAnimation: runCompletionAnimation, values: { outerRectX, outerRectY, outerRectSize } };
}

export default useOnCompleteSkillAnimation;

function getCenteredCoordinates(size: number, cx: number, cy: number) {
    return {
        x: cx - size / 2,
        y: cy - size / 2,
    };
}
