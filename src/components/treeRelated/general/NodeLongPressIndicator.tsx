import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import Animated, { FadeIn, useAnimatedProps, useAnimatedStyle, withDelay, withSequence, withTiming } from "react-native-reanimated";
import { Svg, Circle as SvgCircle } from "react-native-svg";
import { colors } from "../../../parameters";
import { ScreenDimentions } from "../../../redux/screenDimentionsSlice";
import { CanvasDimensions, NodeCoordinate } from "../../../types";
import { ProgressWheelParams } from "../../ProgressIndicatorAndName";
import { distanceFromLeftCanvasEdge } from "../coordinateFunctions";
import { MIN_DURATION_LONG_PRESS_MS } from "../hooks/useCanvasTouchHandler";

const AnimatedCircle = Animated.createAnimatedComponent(SvgCircle);
const progressWheelProps = new ProgressWheelParams("#FFFFFF", `#FFFFFF3D`, 150, 16);

function NodeLongPressIndicator({
    data,
    canvasDimentions,
    offset,
    screenDimensions,
}: {
    data: {
        data: NodeCoordinate | undefined;
        state: "INTERRUPTED" | "SUCCESS" | "PRESSING" | "IDLE";
    };
    offset: { x: number; y: number };
    canvasDimentions: CanvasDimensions;
    screenDimensions: ScreenDimentions;
}) {
    const { canvasWidth } = canvasDimentions;

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

    const leftCanvasEdgeOffset = distanceFromLeftCanvasEdge(canvasWidth, screenDimensions.width, offset.x);

    const animatedProps = useAnimatedProps(() => {
        const emptyCircle = progressWheelProps.circumference - (progressWheelProps.circumference * 0) / 100;

        const fullCircle = progressWheelProps.circumference - (progressWheelProps.circumference * 100) / 100;

        const circleCompletion = data.state === "PRESSING" ? fullCircle : emptyCircle;

        //Will only delay for successfull long press
        const shouldDelay = prevState.current === "PRESSING" && data.state === "IDLE" ? true : false;

        const delay = shouldDelay ? MIN_DURATION_LONG_PRESS_MS : 0;
        const duration = data.state === "INTERRUPTED" ? 0 : MIN_DURATION_LONG_PRESS_MS;

        return {
            strokeDashoffset: withDelay(delay, withTiming(circleCompletion, { duration: duration })),
            strokeWidth: data.data ? withSequence(withTiming(4, { duration: 0 }), withTiming(16, { duration: 250 })) : 16,
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

    const position = { x: lastX - leftCanvasEdgeOffset - 75, y: lastY + offset.y - 75 };

    return (
        <Animated.View
            entering={FadeIn}
            style={[containerStyles, { left: position.x, top: position.y, position: "absolute" }]}
            pointerEvents={"none"}>
            <Svg width={progressWheelProps.size} height={progressWheelProps.size}>
                <AnimatedCircle
                    cx={progressWheelProps.centerCoordinate}
                    cy={progressWheelProps.centerCoordinate}
                    r={progressWheelProps.radius}
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
