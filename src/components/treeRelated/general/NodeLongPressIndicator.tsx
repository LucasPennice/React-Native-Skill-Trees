import * as Haptics from "expo-haptics";
import { memo, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import Animated, { Easing, FadeIn, useAnimatedProps, useAnimatedStyle, withDelay, withSequence, withTiming } from "react-native-reanimated";
import { Svg, Circle as SvgCircle } from "react-native-svg";
import { getWheelParams } from "../../../functions/misc";
import { colors } from "../../../parameters";
import { MIN_DURATION_LONG_PRESS_MS } from "../hooks/useCanvasPressAndLongPress";
import { LongPressIndicatorState } from "../useLongPressReducer";
import DraggingInsideMenuZoneIndicator from "./DraggingInsideMenuZoneIndicator";
import { DragObject } from "../../../types";

const AnimatedCircle = Animated.createAnimatedComponent(SvgCircle);
const indicatorSize = Platform.OS === "android" ? 143 : 150;
const progressWheelProps = getWheelParams("#FFFFFF", `#FFFFFF3D`, indicatorSize, 16);

function NodeLongPressIndicator({
    longPressIndicatorState,
    scale,
    dragObject,
}: {
    longPressIndicatorState: LongPressIndicatorState;
    scale: number;
    dragObject: DragObject;
}) {
    const [lastX, setLastX] = useState(0);
    const [lastY, setLastY] = useState(0);

    const prevState = useRef("IDLE");

    useEffect(() => {
        if (longPressIndicatorState.node) {
            setLastX(longPressIndicatorState.node.x);
            setLastY(longPressIndicatorState.node.y);
        }
        prevState.current = longPressIndicatorState.state;
    }, [longPressIndicatorState]);

    const animatedProps = useAnimatedProps(() => {
        const emptyCircle = progressWheelProps.circumference - (progressWheelProps.circumference * 0) / 100;

        const fullCircle = progressWheelProps.circumference - (progressWheelProps.circumference * 100) / 100;

        const circleCompletion = longPressIndicatorState.state === "PRESSING" ? fullCircle : emptyCircle;

        //Will only delay for successfull long press
        const shouldDelay = prevState.current === "PRESSING" && longPressIndicatorState.state === "IDLE" ? true : false;

        const delay = shouldDelay ? MIN_DURATION_LONG_PRESS_MS : 0;
        const duration = longPressIndicatorState.state === "INTERRUPTED" ? 0 : MIN_DURATION_LONG_PRESS_MS;

        return {
            strokeDashoffset: withDelay(delay, withTiming(circleCompletion, { duration: duration, easing: Easing.bezierFn(0.76, 0, 0.24, 1) })),
            strokeWidth: longPressIndicatorState.node
                ? withSequence(withTiming(0, { duration: 0 }), withTiming(16, { duration: MIN_DURATION_LONG_PRESS_MS }))
                : 16,
        };
    }, [longPressIndicatorState]);

    const containerStyles = useAnimatedStyle(() => {
        if (!longPressIndicatorState.node) return { opacity: withTiming(0) };

        return { opacity: 1 };
    }, [longPressIndicatorState]);

    useEffect(() => {
        let timeout: NodeJS.Timeout | undefined;
        if (longPressIndicatorState.node) {
            timeout = setTimeout(() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            }, MIN_DURATION_LONG_PRESS_MS);
        }

        return () => {
            clearTimeout(timeout);
        };
    }, [longPressIndicatorState]);

    const position = { x: lastX - indicatorSize / 2, y: lastY - indicatorSize / 2 };

    const animatedScale = useAnimatedStyle(() => {
        const newScale = adjustedScale(scale);

        return { transform: [{ scale: newScale }] };
    }, [scale]);

    return (
        <Animated.View
            entering={FadeIn}
            style={[containerStyles, { left: position.x - 30, top: position.y - 30, position: "absolute" }, animatedScale]}
            pointerEvents={"none"}>
            <DraggingInsideMenuZoneIndicator drag={{ x: dragObject.sharedValues.x, y: dragObject.sharedValues.y }} />
            {/* <Svg width={progressWheelProps.size} height={progressWheelProps.size}>
                <AnimatedCircle
                    cx={progressWheelProps.centerCoordinate}
                    cy={progressWheelProps.centerCoordinate}
                    r={progressWheelProps.radius}
                    fillOpacity={0}
                    stroke={`${colors.unmarkedText}7D`}
                    strokeDasharray={progressWheelProps.circumference}
                    strokeLinecap="round"
                    animatedProps={animatedProps}
                />
            </Svg> */}
        </Animated.View>
    );
}

export default memo(NodeLongPressIndicator);

export function adjustedScale(scale: number) {
    "worklet";

    //Just to make sure I notice an invalid value
    if (scale === 0) return 5;

    return 1 / scale;
}
