import Color, { Circle, Circle as SvgCircle, Svg } from "react-native-svg";
import Animated, { useAnimatedProps, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { quantityOfCompletedNodes, quantiyOfNodes } from "../treeFunctions";
import { selectCurrentTree } from "../currentTreeSlice";
import { useAppSelector } from "../reduxHooks";
import { useEffect } from "react";
import { View } from "react-native";

export class ProgressWheelParams {
    size = 65;
    strokeWidth = 7;
    centerCoordinate: number;
    radius: number;
    circumference: number;
    strokeDasharray: number;
    progressStroke: string;
    backgroundStroke: string;

    constructor(progressColor: string, backgroundColor: string, size?: number, strokeWidth?: number) {
        if (size) this.size = size;
        if (strokeWidth) this.strokeWidth = strokeWidth;

        this.centerCoordinate = this.size / 2;
        this.radius = this.size / 2 - this.strokeWidth / 2;
        this.progressStroke = progressColor;
        this.backgroundStroke = backgroundColor;
        this.circumference = 2 * Math.PI * this.radius;
        this.strokeDasharray = 2 * Math.PI * this.radius;
    }
}

const AnimatedCircle = Animated.createAnimatedComponent(SvgCircle);
const progressWheelProps = new ProgressWheelParams("#5DD39E", "#5356573D", 30, 6);

function ProgressIndicator() {
    const { value: currentTree } = useAppSelector(selectCurrentTree);

    const completedPercentage = useSharedValue(0);

    useEffect(() => {
        const completedNodesQty = quantityOfCompletedNodes(currentTree);
        const nodesQty = quantiyOfNodes(currentTree);

        if (!completedNodesQty || !nodesQty) {
            completedPercentage.value = 0;
            return;
        }

        completedPercentage.value = (completedNodesQty / nodesQty) * 100;
    }, [currentTree]);

    const animatedProps = useAnimatedProps(() => {
        const result = progressWheelProps.circumference - (progressWheelProps.circumference * completedPercentage.value) / 100;

        return { strokeDashoffset: withSpring(result, { overshootClamping: true, damping: 65 }) };
    }, [completedPercentage.value]);

    return (
        <View
            style={{
                position: "absolute",
                top: 20,
                left: 20,
                backgroundColor: "white",
                padding: 10,
                borderRadius: 10,
                shadowColor: "#000",
                shadowOffset: {
                    width: 0,
                    height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,

                elevation: 5,
            }}>
            <Svg width={progressWheelProps.size} height={progressWheelProps.size}>
                <Circle
                    strokeWidth={progressWheelProps.strokeWidth}
                    cx={progressWheelProps.centerCoordinate}
                    cy={progressWheelProps.centerCoordinate}
                    r={progressWheelProps.radius}
                    stroke={progressWheelProps.backgroundStroke}
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
                />
            </Svg>
        </View>
    );
}

export default ProgressIndicator;
