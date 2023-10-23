import Animated, { useAnimatedProps, useAnimatedStyle, withRepeat, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { Circle, Svg } from "react-native-svg";
import { getWheelParams } from "../functions/misc";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function LoadingIcon({ backgroundColor = "#FFFFFF00", size = 100 }: { size?: number; backgroundColor?: string }) {
    const progressWheelProps = getWheelParams("#FFFFFF", backgroundColor, size, size / 10);

    const animatedProps = useAnimatedProps(() => {
        const result = progressWheelProps.circumference - (progressWheelProps.circumference * 50) / size;

        return { strokeDashoffset: withSpring(result, { overshootClamping: true, damping: 65 }) };
    }, []);

    const styles = useAnimatedStyle(() => {
        return {
            transform: [
                { rotateZ: withRepeat(withSequence(withTiming("0deg", { duration: 0 }), withTiming("360deg", { duration: 1000 })), 9999, false) },
            ],
        };
    }, []);

    return (
        <Animated.View style={[styles, { height: progressWheelProps.size, width: progressWheelProps.size }]}>
            <Svg width={progressWheelProps.size} height={progressWheelProps.size}>
                <Circle
                    strokeWidth={progressWheelProps.strokeWidth}
                    cx={progressWheelProps.centerCoordinate}
                    cy={progressWheelProps.centerCoordinate}
                    r={progressWheelProps.radius}
                    stroke={progressWheelProps.backgroundStroke}
                    fillOpacity={0}
                />
                <AnimatedCircle
                    strokeWidth={progressWheelProps.strokeWidth}
                    cx={progressWheelProps.centerCoordinate}
                    cy={progressWheelProps.centerCoordinate}
                    r={progressWheelProps.radius}
                    stroke={progressWheelProps.progressStroke}
                    strokeDasharray={progressWheelProps.circumference}
                    strokeLinecap="round"
                    animatedProps={animatedProps}
                    fillOpacity={0}
                />
            </Svg>
        </Animated.View>
    );
}

export default LoadingIcon;
