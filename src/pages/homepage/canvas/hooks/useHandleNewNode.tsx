import { useState } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import AppText from "../../../../AppText";
import { centerFlex } from "../../../../types";
import { CIRCLE_SIZE, colors } from "../parameters";

function useHandleNewNode() {
    const [foo, setFoo] = useState({ x: 0, y: 0 });

    const startingPosition = { x: 0, y: 0 };

    const position = useSharedValue(startingPosition);

    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            position.value = { x: e.translationX + startingPosition.x, y: e.translationY + startingPosition.y };

            const x = parseInt(`${position.value.x}`);
            const y = parseInt(`${position.value.y}`);

            runOnJS(setFoo)({ x, y });
        })
        .onEnd((e) => {
            position.value = startingPosition;
        })
        .activateAfterLongPress(0);

    const animatedStyle = useAnimatedStyle(() => ({
        left: withSpring(position.value.x, { damping: 27, stiffness: 500 }),
        top: withSpring(position.value.y, { damping: 27, stiffness: 500 }),
    }));

    return {
        panGesture,
        animatedStyle,
        dragAndDropNodeCoord: foo,
    };
}

export default useHandleNewNode;
