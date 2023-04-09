import { useSharedValueEffect, useValue } from "@shopify/react-native-skia";
import { useEffect } from "react";
import { useSharedValue, withDelay, withSpring, withTiming } from "react-native-reanimated";
import { CANVAS_SPRING } from "../parameters";

type Props<T> = {
    initialValue: T;
    stateToAnimate: T;
    delay?: number;
    duration?: number;
};

function useAnimateSkiaValue<T extends string | number>({ initialValue, stateToAnimate, delay, duration }: Props<T>) {
    const skiaValue = useValue(initialValue);
    const sharedValue = useSharedValue(initialValue);

    useEffect(() => {
        if (delay) {
            if (duration) {
                sharedValue.value = withDelay(delay, withTiming(stateToAnimate, { duration }));
            } else {
                sharedValue.value = withDelay(delay, withSpring(stateToAnimate, CANVAS_SPRING));
            }
        } else {
            if (duration) {
                sharedValue.value = withTiming(stateToAnimate, { duration });
            } else {
                sharedValue.value = withSpring(stateToAnimate, CANVAS_SPRING);
            }
        }
    }, [stateToAnimate]);

    useSharedValueEffect(() => {
        skiaValue.current = sharedValue.value;
    }, sharedValue);

    return skiaValue;
}

export default useAnimateSkiaValue;
