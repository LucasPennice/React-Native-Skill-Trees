import { mix, useComputedValue, useSharedValueEffect, useValue } from "@shopify/react-native-skia";
import { useEffect } from "react";
import { useSharedValue, withSpring } from "react-native-reanimated";

function useHandleAnimationOnSelect(selectedNodeId: string | null, nodeId: string) {
    const shouldTransform = useValue(0);

    const isActive = useSharedValue(0);

    useEffect(() => {
        const shouldActivate = selectedNodeId === nodeId;

        isActive.value = withSpring(shouldActivate ? 1 : 0, { damping: 18, stiffness: 300 });
    }, [selectedNodeId]);

    useSharedValueEffect(() => {
        shouldTransform.current = mix(isActive.value, 0, 1);
    }, isActive);

    const groupTransform = useComputedValue(() => [{ scale: mix(shouldTransform.current, 1, 3) }], [shouldTransform]);

    return { groupTransform };
}

export default useHandleAnimationOnSelect;
