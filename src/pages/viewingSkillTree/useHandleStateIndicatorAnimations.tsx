import { useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";
import { MENU_HIGH_DAMPENING } from "../../parameters";
import { Dimensions } from "react-native";
import { ModalState } from "app/(tabs)/myTrees/[treeId]";

function useHandleStateIndicatorAnimations(mode: ModalState) {
    const { width } = Dimensions.get("screen");

    const styles = useAnimatedStyle(() => {
        if (mode === "PLACING_NEW_NODE") return { width: withSpring(width - 20, MENU_HIGH_DAMPENING), height: withSpring(80, MENU_HIGH_DAMPENING) };

        return {
            width: withSpring(100, MENU_HIGH_DAMPENING),
            height: withSpring(50, MENU_HIGH_DAMPENING),
        };
    }, [mode]);

    const opacity = useAnimatedStyle(() => {
        return { opacity: withTiming(1, { duration: 150 }) };
    }, [mode]);

    return { opacity, styles };
}

export default useHandleStateIndicatorAnimations;
