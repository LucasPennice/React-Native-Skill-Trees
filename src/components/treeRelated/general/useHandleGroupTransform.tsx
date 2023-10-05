import { AnimatedProp, Transforms2d } from "@shopify/react-native-skia";
import { useEffect } from "react";
import { SharedValue, useDerivedValue, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";
import useIsFirstRender from "../../../useIsFirstRender";
import { CIRCLE_SIZE, CIRCLE_SIZE_SELECTED } from "@/parameters";

const activeAnimation = withSequence(withTiming(0.8, { duration: 100 }), withSpring(3, { damping: 22, stiffness: 250 }));

const inactiveAnimation = withSpring(1, { damping: 22, stiffness: 300 });

const activeBlur = withSequence(withTiming(2, { duration: 50 }), withSpring(0, { damping: 25, stiffness: 150 }));

const inactiveBlur = withSequence(withTiming(2, { duration: 50 }), withSpring(0, { damping: 22, stiffness: 300 }));

const activeRadius = withSequence(withTiming(CIRCLE_SIZE, { duration: 200 }), withSpring(CIRCLE_SIZE_SELECTED, { damping: 25, stiffness: 150 }));

const inactiveRadius = withSequence(withTiming(CIRCLE_SIZE_SELECTED, { duration: 200 }), withSpring(CIRCLE_SIZE, { damping: 22, stiffness: 300 }));

function useHandleGroupTransform(
    isSelected: boolean,
    nodeDrag:
        | {
              x: SharedValue<number>;
              y: SharedValue<number>;
              nodesToDragId: string[];
          }
        | undefined
) {
    const scale = useSharedValue(1);
    const motionBlur = useSharedValue(0);
    const radius = useSharedValue(0);

    const isFirstRender = useIsFirstRender();

    useEffect(() => {
        if (isFirstRender && !isSelected) return;

        //Scale

        scale.value = isSelected ? activeAnimation : inactiveAnimation;

        motionBlur.value = isSelected ? activeBlur : inactiveBlur;
        radius.value = isSelected ? activeRadius : inactiveRadius;
    }, [isSelected]);

    const groupTransform: AnimatedProp<Transforms2d | undefined, any> = useDerivedValue(() => {
        const dragX = nodeDrag !== undefined ? nodeDrag.x.value : 0;
        const dragY = nodeDrag !== undefined ? nodeDrag.y.value : 0;

        return [{ scale: scale.value }, { translateX: dragX }, { translateY: dragY }];
    }, [scale, nodeDrag]);

    return { groupTransform, motionBlur, radius };
}

export default useHandleGroupTransform;
