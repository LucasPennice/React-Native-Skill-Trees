import { AnimatedProp, Transforms2d } from "@shopify/react-native-skia";
import { useEffect } from "react";
import { useDerivedValue, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";
import useIsFirstRender from "../../../useIsFirstRender";

function useHandleAnimationOnSelect(selectedNodeId: string | null, nodeId: string) {
    const scale = useSharedValue(1);
    const blur = useSharedValue(0);

    const shouldActivate = selectedNodeId === nodeId;

    const isFirstRender = useIsFirstRender();

    useEffect(() => {
        if (isFirstRender) return;

        //Scale
        const activeAnimation = withSequence(withTiming(0.8, { duration: 100 }), withSpring(3, { damping: 22, stiffness: 250 }));

        const inactiveAnimation = withSpring(1, { damping: 22, stiffness: 300 });

        scale.value = shouldActivate ? activeAnimation : inactiveAnimation;

        //Blur
        const activeBlur = withSequence(withTiming(2, { duration: 50 }), withSpring(0, { damping: 25, stiffness: 150 }));

        const inactiveBlur = withSequence(withTiming(2, { duration: 50 }), withSpring(0, { damping: 22, stiffness: 300 }));

        blur.value = shouldActivate ? activeBlur : inactiveBlur;
    }, [shouldActivate]);

    const groupTransform: AnimatedProp<Transforms2d | undefined, any> = useDerivedValue(() => {
        return [{ scale: scale.value }];
    }, [scale]);

    return { groupTransform, blur };
}

export default useHandleAnimationOnSelect;
