import { DESELECT_NODE_ANIMATION_DURATION } from "@/parameters";
import { withDelay, withSpring } from "react-native-reanimated";

const FINAL_SCALE = 1 / 3;

export const exitSelectedNode = () => {
    "worklet";
    const animations = {
        transform: [{ scale: withDelay(100, withSpring(FINAL_SCALE, { duration: DESELECT_NODE_ANIMATION_DURATION, dampingRatio: 0.7 })) }],
    };
    const initialValues = {
        transform: [{ scale: 1 }],
    };
    return {
        initialValues,
        animations,
    };
};
