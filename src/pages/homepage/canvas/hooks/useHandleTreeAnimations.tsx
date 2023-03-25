import { Easing, useSharedValue, withDelay, withSpring, withTiming } from "react-native-reanimated";
import { mix, useSharedValueEffect, useValue, useComputedValue } from "@shopify/react-native-skia";
import { useEffect } from "react";
import { Skill, Tree } from "../../../../types";
import { CIRCLE_INITIAL_ANIMATION_DURATION, PATH_INITIAL_ANIMATION_DURATION } from "../parameters";

const animationFns = {
    initial: {
        pathDelay: (treeLevel: number) => {
            const treeDistance = treeLevel - 1;

            return CIRCLE_INITIAL_ANIMATION_DURATION * (treeDistance + 1) + treeDistance * PATH_INITIAL_ANIMATION_DURATION;
        },
        circleDelay: (treeLevel: number) => {
            return CIRCLE_INITIAL_ANIMATION_DURATION * treeLevel + treeLevel * PATH_INITIAL_ANIMATION_DURATION;
        },
    },
};

const useHandleTreeAnimations = (selectedNode: string | null, showLabel: boolean, tree: Tree<Skill>, treeLevel: number) => {
    const { circleOpacity, connectingPathTrim } = useInitialAnimations(treeLevel);

    const { labelOpacity } = useSettingsAnimations(showLabel);

    const { circleBlurOnInactive, pathBlurOnInactive } = useAnimationsForUnselected(selectedNode, tree.data.id);

    const { pathTrim, groupTransform } = useAnimationsOnSelect(selectedNode, tree);

    return { circleBlurOnInactive, pathBlurOnInactive, pathTrim, groupTransform, connectingPathTrim, circleOpacity, labelOpacity };
};

export default useHandleTreeAnimations;

function useSettingsAnimations(showLabel: boolean) {
    const labelOpacity = useValue(0);

    const isLabel = useSharedValue(0);

    useEffect(() => {
        isLabel.value = withSpring(showLabel ? 1 : 0, { damping: 18, stiffness: 300 });
    }, [showLabel]);

    useSharedValueEffect(() => {
        labelOpacity.current = mix(isLabel.value, 0, 1);
    }, isLabel);

    return { labelOpacity };
}

function useAnimationsOnSelect(selectedNode: string | null, tree: Tree<Skill>) {
    const treeId = tree.data.id;

    const pathTrim = useValue(0);
    const shouldTransform = useValue(0);

    const isBorderTraced = useSharedValue(0);
    const isActive = useSharedValue(0);

    useEffect(() => {
        const shouldActivate = selectedNode === treeId;

        const handleTraceBorder = tree.data.isCompleted === true ? tree.data.isCompleted : shouldActivate;

        isActive.value = withSpring(shouldActivate ? 1 : 0, { damping: 18, stiffness: 300 });

        isBorderTraced.value = withTiming(handleTraceBorder ? 1 : 0, { duration: 300, easing: Easing.sin });
    }, [selectedNode]);

    useSharedValueEffect(() => {
        pathTrim.current = isBorderTraced.value;
    }, isBorderTraced);

    useSharedValueEffect(() => {
        shouldTransform.current = mix(isActive.value, 0, 1);
    }, isActive);

    const groupTransform = useComputedValue(() => [{ scale: mix(shouldTransform.current, 1, 3) }], [shouldTransform]);

    return { pathTrim, groupTransform };
}

//Animations for components that are not selected
function useAnimationsForUnselected(selectedNode: string | null, treeId: string) {
    const circleBlurOnInactive = useValue(0);
    const pathBlurOnInactive = useValue(0);
    //
    const isBlurred = useSharedValue(0);
    const isPathBlurred = useSharedValue(0);

    useEffect(() => {
        const shouldBlur = selectedNode !== treeId && selectedNode !== null;

        isBlurred.value = withTiming(shouldBlur ? 1 : 0, { duration: 0.15 });
    }, [selectedNode]);

    useSharedValueEffect(() => {
        circleBlurOnInactive.current = mix(isBlurred.value, 0, 10);
    }, isBlurred);

    //Handles path blur 👇
    useEffect(() => {
        const shouldBlurPath = selectedNode !== null;

        isPathBlurred.value = withTiming(shouldBlurPath ? 1 : 0, { duration: 150 });
    }, [selectedNode]);

    useSharedValueEffect(() => {
        pathBlurOnInactive.current = mix(isPathBlurred.value, 0, 10);
    }, isPathBlurred);

    return { circleBlurOnInactive, pathBlurOnInactive };
}

function useInitialAnimations(treeLevel: number) {
    const pathAnimationActivator = useSharedValue(0);
    const circleAnimationActivator = useSharedValue(0);

    //Value for the path connecting two circles
    const connectingPathTrim = useValue(0);
    const circleOpacity = useValue(0);

    // Handles initial path animation 👇
    useEffect(() => {
        pathAnimationActivator.value = withDelay(
            animationFns.initial.pathDelay(treeLevel),
            withTiming(1, { duration: PATH_INITIAL_ANIMATION_DURATION, easing: Easing.bezier(0.83, 0, 0.17, 1) })
        );
    });

    useSharedValueEffect(() => {
        connectingPathTrim.current = mix(pathAnimationActivator.value, 0, 1);
    }, pathAnimationActivator);

    // Handles initial circle animation 👇
    useEffect(() => {
        circleAnimationActivator.value = withDelay(
            animationFns.initial.circleDelay(treeLevel),
            withTiming(1, { duration: CIRCLE_INITIAL_ANIMATION_DURATION, easing: Easing.bezier(0.83, 0, 0.17, 1) })
        );
    });

    useSharedValueEffect(() => {
        circleOpacity.current = mix(circleAnimationActivator.value, 0, 1);
    }, circleAnimationActivator);

    return { connectingPathTrim, circleOpacity };
}
