import { useEffect } from "react";
import { useSharedValue, withDelay, withSpring, withTiming } from "react-native-reanimated";
import { CANVAS_SPRING } from "../../../parameters";

type Props<T> = {
    initialValue: T;
    stateToAnimate: T;
    delay?: number;
    duration?: number;
};

function useAnimateSkiaValue<T extends string | number>({ initialValue, stateToAnimate, delay, duration }: Props<T>) {
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

    return sharedValue;
}

export default useAnimateSkiaValue;
