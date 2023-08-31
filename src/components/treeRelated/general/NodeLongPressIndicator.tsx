import { memo } from "react";
import { Platform } from "react-native";
import Animated, { Easing, ZoomIn, ZoomOut, useAnimatedProps, useAnimatedStyle, withDelay, withSequence, withTiming } from "react-native-reanimated";
import { Svg, Circle as SvgCircle } from "react-native-svg";
import { getWheelParams } from "../../../functions/misc";
import { colors } from "../../../parameters";
import { NodeCoordinate } from "../../../types";
import { MIN_DURATION_LONG_PRESS_MS } from "../hooks/useCanvasPressAndLongPress";

const AnimatedCircle = Animated.createAnimatedComponent(SvgCircle);
const indicatorSize = Platform.OS === "android" ? 143 : 150;
const progressWheelProps = getWheelParams("#FFFFFF", `#FFFFFF3D`, indicatorSize, 16);

function NodeLongPressIndicator({ data, scale }: { data: NodeCoordinate; scale: number }) {
    const animatedProps = useAnimatedProps(() => {
        const fullCircle = progressWheelProps.circumference - (progressWheelProps.circumference * 100) / 100;

        return {
            strokeDashoffset: withDelay(
                0,
                withTiming(fullCircle, { duration: MIN_DURATION_LONG_PRESS_MS, easing: Easing.bezierFn(0.76, 0, 0.24, 1) })
            ),
            strokeWidth: data.data ? withSequence(withTiming(0, { duration: 0 }), withTiming(16, { duration: MIN_DURATION_LONG_PRESS_MS })) : 16,
        };
    }, [data]);

    const position = { x: data.x - indicatorSize / 2, y: data.y - indicatorSize / 2 };

    const animatedScale = useAnimatedStyle(() => {
        const newScale = adjustedScale(scale);

        return { transform: [{ scale: newScale }] };
    }, [scale]);

    return (
        <Animated.View
            entering={ZoomIn.springify().damping(15).stiffness(150)}
            exiting={ZoomOut}
            style={[{ left: position.x, top: position.y, position: "absolute" }, animatedScale]}
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

export default memo(NodeLongPressIndicator);

export function adjustedScale(scale: number) {
    "worklet";
    //Just to make sure I notice an invalid value
    if (scale === 0) return 5;

    return 1 / scale;
}
