import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import Animated, { Easing, FadeIn, useAnimatedProps, useAnimatedStyle, withDelay, withSequence, withTiming } from "react-native-reanimated";
import { Svg, Circle as SvgCircle } from "react-native-svg";
import { getWheelParams } from "../../../functions/misc";
import { colors } from "../../../parameters";
import { NodeCoordinate } from "../../../types";
import { MIN_DURATION_LONG_PRESS_MS } from "../hooks/useCanvasTouchHandler";

const AnimatedCircle = Animated.createAnimatedComponent(SvgCircle);
const progressWheelProps = getWheelParams("#FFFFFF", `#FFFFFF3D`, 150, 16);

function NodeLongPressIndicator({
    data,
    scale,
}: {
    data: {
        data: NodeCoordinate | undefined;
        state: "INTERRUPTED" | "SUCCESS" | "PRESSING" | "IDLE";
    };
    scale: number;
}) {
    const [lastX, setLastX] = useState(0);
    const [lastY, setLastY] = useState(0);

    const prevState = useRef("IDLE");

    useEffect(() => {
        if (data.data) {
            setLastX(data.data.x);
            setLastY(data.data.y);
        }
        prevState.current = data.state;
    }, [data]);

    const animatedProps = useAnimatedProps(() => {
        const emptyCircle = progressWheelProps.circumference - (progressWheelProps.circumference * 0) / 100;

        const fullCircle = progressWheelProps.circumference - (progressWheelProps.circumference * 100) / 100;

        const circleCompletion = data.state === "PRESSING" ? fullCircle : emptyCircle;

        //Will only delay for successfull long press
        const shouldDelay = prevState.current === "PRESSING" && data.state === "IDLE" ? true : false;

        const delay = shouldDelay ? MIN_DURATION_LONG_PRESS_MS : 0;
        const duration = data.state === "INTERRUPTED" ? 0 : MIN_DURATION_LONG_PRESS_MS;

        return {
            strokeDashoffset: withDelay(delay, withTiming(circleCompletion, { duration: duration, easing: Easing.bezierFn(0.76, 0, 0.24, 1) })),
            strokeWidth: data.data ? withSequence(withTiming(0, { duration: 0 }), withTiming(16, { duration: MIN_DURATION_LONG_PRESS_MS })) : 16,
        };
    }, [data]);

    const containerStyles = useAnimatedStyle(() => {
        if (!data.data) return { opacity: withTiming(0) };

        return { opacity: 1 };
    }, [data]);

    useEffect(() => {
        let timeout: NodeJS.Timeout | undefined;
        if (data.data) {
            timeout = setTimeout(() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            }, MIN_DURATION_LONG_PRESS_MS);
        }

        return () => {
            clearTimeout(timeout);
        };
    }, [data]);

    const position = { x: lastX - 75, y: lastY - 75 };

    const animatedScale = useAnimatedStyle(() => {
        const newScale = adjustedScale(scale);

        return { transform: [{ scale: newScale }] };
    }, [scale]);

    return (
        <Animated.View
            entering={FadeIn}
            style={[containerStyles, { left: position.x, top: position.y, position: "absolute" }, animatedScale]}
            pointerEvents={"none"}>
            <Svg width={progressWheelProps.size} height={progressWheelProps.size}>
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
            </Svg>
        </Animated.View>
    );
}

export default NodeLongPressIndicator;

export function adjustedScale(scale: number) {
    "worklet";

    //Just to make sure I notice an invalid value
    if (scale === 0) return 5;

    return 1 / scale;
}
