import { useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { mix, useSharedValueEffect, useValue, useComputedValue } from "@shopify/react-native-skia";
import { useEffect } from "react";
import { Skill, Tree } from "../../../../types";

const useHandleTreeAnimations = (selectedNode: string | null, showLabel: boolean, tree: Tree<Skill>, treeLevel: number) => {
    const { labelOpacity } = useSettingsAnimations(showLabel);

    const { circleBlurOnInactive, pathBlurOnInactive } = useAnimationsForUnselected(selectedNode, tree.data.id);

    const { groupTransform } = useAnimationsOnSelect(selectedNode, tree);

    return { circleBlurOnInactive, pathBlurOnInactive, groupTransform, labelOpacity };
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

    const shouldTransform = useValue(0);

    const isActive = useSharedValue(0);

    useEffect(() => {
        const shouldActivate = selectedNode === treeId;

        isActive.value = withSpring(shouldActivate ? 1 : 0, { damping: 18, stiffness: 300 });
    }, [selectedNode]);

    useSharedValueEffect(() => {
        shouldTransform.current = mix(isActive.value, 0, 1);
    }, isActive);

    const groupTransform = useComputedValue(() => [{ scale: mix(shouldTransform.current, 1, 3) }], [shouldTransform]);

    return { groupTransform };
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

        isBlurred.value = withTiming(shouldBlur ? 1 : 0, { duration: 150 });
    }, [selectedNode]);

    useSharedValueEffect(() => {
        circleBlurOnInactive.current = mix(isBlurred.value, 1, 0);
    }, isBlurred);

    //Handles path blur 👇
    useEffect(() => {
        const shouldBlurPath = selectedNode !== null;

        isPathBlurred.value = withTiming(shouldBlurPath ? 1 : 0, { duration: 150 });
    }, [selectedNode]);

    useSharedValueEffect(() => {
        pathBlurOnInactive.current = mix(isPathBlurred.value, 1, 0);
    }, isPathBlurred);

    return { circleBlurOnInactive, pathBlurOnInactive };
}
