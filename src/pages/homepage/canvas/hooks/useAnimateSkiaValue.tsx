import { useSharedValueEffect, useValue } from "@shopify/react-native-skia";
import { useEffect } from "react";
import { useSharedValue, withSpring } from "react-native-reanimated";
import { CANVAS_SPRING } from "../parameters";

type Props<T> = {
    initialValue: T;
    stateToAnimate: T;
};

function useAnimateSkiaValue<T extends string | number>({ initialValue, stateToAnimate }: Props<T>) {
    const skiaValue = useValue(initialValue);
    const sharedValue = useSharedValue(initialValue);

    useEffect(() => {
        sharedValue.value = withSpring(stateToAnimate, CANVAS_SPRING);
    }, [stateToAnimate]);

    useSharedValueEffect(() => {
        skiaValue.current = sharedValue.value;
    }, sharedValue);

    return skiaValue;
}

export default useAnimateSkiaValue;
