import { Easing, useDerivedValue, useSharedValue, withDelay, withSpring, withTiming } from "react-native-reanimated";
import { mix, useSharedValueEffect, useValue, clamp, useComputedValue } from "@shopify/react-native-skia";
import { CIRCLE_SIZE } from "./parameters";
import { useEffect } from "react";
import { CIRCLE_SIZE_SELECTED } from "./Tree";
import { Book, TreeNode } from "../types";

const useHandleTreeAnimations = (selectedNode: string | null, tree: TreeNode<Book>, currentNodeCoordintes: { x: number; y: number }) => {
    const circleBlur = useValue(0);
    const pathBlur = useValue(0);
    const shouldTransform = useValue(0);
    const pathTrim = useValue(0);
    //
    const isActive = useSharedValue(0);
    const isBorderTraced = useSharedValue(0);
    const isBlurred = useSharedValue(0);
    const isPathBlurred = useSharedValue(0);

    useEffect(() => {
        const shouldActivate = selectedNode === tree.node.id;

        isActive.value = withSpring(shouldActivate ? 1 : 0, { damping: 18, stiffness: 300 });

        isBorderTraced.value = withTiming(shouldActivate ? 1 : 0, { duration: 300, easing: Easing.sin });
    }, [selectedNode]);

    useSharedValueEffect(() => {
        shouldTransform.current = mix(isActive.value, 0, 1);
    }, isActive);

    // Handles circle blur 👇

    useEffect(() => {
        const shouldBlur = selectedNode !== tree.node.id && selectedNode !== null;

        isBlurred.value = withTiming(shouldBlur ? 1 : 0, { duration: 0.15 });
    }, [selectedNode]);

    useSharedValueEffect(() => {
        circleBlur.current = mix(isBlurred.value, 0, 10);
    }, isBlurred);

    //Handles path blur 👇
    useEffect(() => {
        const shouldBlurPath = selectedNode !== null;

        isPathBlurred.value = withTiming(shouldBlurPath ? 1 : 0, { duration: 150 });
    }, [selectedNode]);

    useSharedValueEffect(() => {
        pathBlur.current = mix(isPathBlurred.value, 0, 10);
    }, isPathBlurred);

    //Handles path trim 👇
    useSharedValueEffect(() => {
        pathTrim.current = isBorderTraced.value;
    }, isBorderTraced);

    const groupTransform = useComputedValue(() => [{ scale: mix(shouldTransform.current, 1, 3) }], [shouldTransform]);
    //

    return { circleBlur, pathBlur, pathTrim, groupTransform };
};

export default useHandleTreeAnimations;
