import { useDerivedValue, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { mix, useSharedValueEffect, useValue, clamp, useComputedValue } from "@shopify/react-native-skia";
import { CIRCLE_SIZE } from "./parameters";
import { useEffect } from "react";
import { CIRCLE_SIZE_SELECTED } from "./Tree";
import { Book, TreeNode } from "../types";

const useHandleTreeAnimations = (selectedNode: string | null, tree: TreeNode<Book>, currentNodeCoordintes: { x: number; y: number }) => {
    const innerCircleRadius = useValue(CIRCLE_SIZE);
    const outerCircleRadius = useValue(CIRCLE_SIZE * 1.2);
    const circleBlur = useValue(0);
    const pathBlur = useValue(0);
    const pathTrim = useValue(0);
    //
    const isActive = useSharedValue(0);
    const isBlurred = useSharedValue(0);
    const isPathBlurred = useSharedValue(0);

    useEffect(() => {
        const shouldActivate = selectedNode === tree.node.id;
        const shouldBlur = selectedNode !== tree.node.id && selectedNode !== null;
        const shouldBlurPath = selectedNode !== null;

        isActive.value = withSpring(shouldActivate ? 1 : 0, { damping: 18, stiffness: 300 });
        isBlurred.value = withTiming(shouldBlur ? 1 : 0, { duration: 0.15 });
        isPathBlurred.value = withTiming(shouldBlurPath ? 1 : 0, { duration: 150 });
    }, [isActive, isPathBlurred, isBlurred, selectedNode]);

    const scale = useComputedValue(
        //Im using path r
        () => [
            {
                scale: mix(pathTrim.current, 1, 3),
            },
        ],
        [pathTrim]
    );

    useSharedValueEffect(() => {
        innerCircleRadius.current = mix(isActive.value, CIRCLE_SIZE, CIRCLE_SIZE_SELECTED);
        outerCircleRadius.current = mix(isActive.value, CIRCLE_SIZE * 1.2, CIRCLE_SIZE_SELECTED * 1.2);
        pathTrim.current = clamp(mix(isActive.value, 0, 1), 0, 1);
    }, isActive);

    useSharedValueEffect(() => {
        circleBlur.current = mix(isBlurred.value, 0, 10);
    }, isBlurred);

    useSharedValueEffect(() => {
        pathBlur.current = mix(isPathBlurred.value, 0, 10);
    }, isPathBlurred);

    return { innerCircleRadius, outerCircleRadius, circleBlur, pathBlur, pathTrim, scale };
};

export default useHandleTreeAnimations;
