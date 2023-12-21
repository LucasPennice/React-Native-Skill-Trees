import { rect, rrect } from "@shopify/react-native-skia";
import { useEffect } from "react";
import { useDerivedValue, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import { CIRCLE_SIZE } from "../../../parameters";
import useIsFirstRender from "../../../useIsFirstRender";

export const ANIMATION_CONSTANTS_ON_COMPLETE = {
    overshootDuration: 200,
    delayAfterOvershoot: 300,
    remainingAnimationDuration: 300,
};

function useHandleNodeCompleteAnimation(coord: { cx: number; cy: number }, isComplete: boolean) {
    const { cx, cy } = coord;

    const getCenteredCoordinates = (size: number, cx: number, cy: number) => {
        return {
            x: cx - size / 2,
            y: cy - size / 2,
        };
    };

    const overshootDuration = isComplete ? ANIMATION_CONSTANTS_ON_COMPLETE.overshootDuration : 0;
    const delayAfterOvershoot = isComplete ? ANIMATION_CONSTANTS_ON_COMPLETE.delayAfterOvershoot : 0;
    const remainingAnimationDuration = isComplete ? ANIMATION_CONSTANTS_ON_COMPLETE.remainingAnimationDuration : 0;

    //OUTER RECTANGLE
    const outerRectSizeInitial = 0;
    const outerRectSizeOnComplete = 2 * CIRCLE_SIZE;

    const outerRectXSharedValue = useSharedValue(cx);
    const outerRectYSharedValue = useSharedValue(cy);
    const outerRectSizeSharedValue = useSharedValue(outerRectSizeInitial);

    useEffect(() => {
        outerRectXSharedValue.value = cx;
        outerRectYSharedValue.value = cy;
        innerRectXSharedValue.value = cx;
        innerRectYSharedValue.value = cy;
    }, [cx, cy]);

    const isFirstRender = useIsFirstRender();

    useEffect(() => {
        if (isFirstRender) return;

        const size = isComplete ? outerRectSizeOnComplete : outerRectSizeInitial;
        const coord = getCenteredCoordinates(size, cx, cy);

        const overShootSize = isComplete ? 1.5 * outerRectSizeOnComplete : outerRectSizeInitial;
        const overShootCoord = getCenteredCoordinates(overShootSize, cx, cy);

        //Initial Phase
        outerRectXSharedValue.value = withTiming(overShootCoord.x, { duration: overshootDuration });
        outerRectYSharedValue.value = withTiming(overShootCoord.y, { duration: overshootDuration });
        outerRectSizeSharedValue.value = withTiming(overShootSize, { duration: overshootDuration });

        //After DURATION time has passed
        outerRectXSharedValue.value = withDelay(delayAfterOvershoot, withTiming(coord.x, { duration: remainingAnimationDuration }));
        outerRectYSharedValue.value = withDelay(delayAfterOvershoot, withTiming(coord.y, { duration: remainingAnimationDuration }));
        outerRectSizeSharedValue.value = withDelay(delayAfterOvershoot, withTiming(size, { duration: remainingAnimationDuration }));
    }, [isComplete]);

    const animatedOuterRect = useDerivedValue(() => {
        return rrect(
            rect(outerRectXSharedValue.value, outerRectYSharedValue.value, outerRectSizeSharedValue.value, outerRectSizeSharedValue.value),
            outerRectSizeSharedValue.value,
            outerRectSizeSharedValue.value
        );
    }, [outerRectXSharedValue, outerRectYSharedValue, outerRectSizeSharedValue]);

    //INNER RECTANGLE
    const innerRectSizeInitial = 0;
    const innerRectSizeOnComplete = 2 * CIRCLE_SIZE;

    const innerRectXSharedValue = useSharedValue(cx);
    const innerRectYSharedValue = useSharedValue(cy);
    const innerRectSizeSharedValue = useSharedValue(innerRectSizeInitial);

    useEffect(() => {
        const size = isComplete ? innerRectSizeOnComplete : innerRectSizeInitial;
        const coord = getCenteredCoordinates(size, cx, cy);

        innerRectXSharedValue.value = withDelay(delayAfterOvershoot, withTiming(coord.x, { duration: remainingAnimationDuration }));
        innerRectYSharedValue.value = withDelay(delayAfterOvershoot, withTiming(coord.y, { duration: remainingAnimationDuration }));
        innerRectSizeSharedValue.value = withDelay(delayAfterOvershoot, withTiming(size, { duration: remainingAnimationDuration }));
    }, [isComplete, cx, cy]);

    const animatedinnerRect = useDerivedValue(() => {
        return rrect(
            rect(innerRectXSharedValue.value, innerRectYSharedValue.value, innerRectSizeSharedValue.value, innerRectSizeSharedValue.value),
            innerRectSizeSharedValue.value,
            innerRectSizeSharedValue.value
        );
    }, [innerRectXSharedValue, innerRectYSharedValue, innerRectSizeSharedValue]);

    const timing = { overshootDuration, delayAfterOvershoot, remainingAnimationDuration };
    const animatedRectangles = { inner: animatedinnerRect, outer: animatedOuterRect };

    return { animatedRectangles, timing };
}

export default useHandleNodeCompleteAnimation;
