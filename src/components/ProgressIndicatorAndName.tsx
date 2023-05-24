import { useEffect } from "react";
import { View } from "react-native";
import Animated, { useAnimatedProps, useSharedValue, withSpring } from "react-native-reanimated";
import { Circle, Svg, Circle as SvgCircle } from "react-native-svg";
import { treeCompletedSkillPercentage } from "../functions/extractInformationFromTree";
import { centerFlex, colors } from "../parameters";
import { useAppSelector } from "../redux/reduxHooks";
import { selectSafeScreenDimentions } from "../redux/screenDimentionsSlice";
import { Skill, Tree } from "../types";
import AppText from "./AppText";

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

function ProgressIndicatorAndName({ tree }: { tree: Tree<Skill> }) {
    const { width } = useAppSelector(selectSafeScreenDimentions);

    const treeAccentColor = tree.accentColor;

    const progressWheelProps = new ProgressWheelParams(treeAccentColor, `${treeAccentColor}3D`, 30, 6);

    const completedPercentage = useSharedValue(0);

    useEffect(() => {
        if (!tree) {
            completedPercentage.value = 0;
            return;
        }

        completedPercentage.value = treeCompletedSkillPercentage(tree);
    }, [tree]);

    const animatedProps = useAnimatedProps(() => {
        const result = progressWheelProps.circumference - (progressWheelProps.circumference * completedPercentage.value) / 100;

        return { strokeDashoffset: withSpring(result, { overshootClamping: true, damping: 65 }) };
    }, [completedPercentage.value]);

    if (!tree) return <></>;

    return (
        <View
            style={[
                centerFlex,
                {
                    position: "absolute",
                    top: 10,
                    left: 10,
                    backgroundColor: colors.darkGray,
                    height: 50,
                    paddingHorizontal: 10,
                    borderRadius: 10,
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    maxWidth: width - 130,
                    gap: 15,
                },
            ]}>
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

            <AppText
                textProps={{ ellipsizeMode: "tail", numberOfLines: 1 }}
                style={{ color: colors.unmarkedText, maxWidth: width - 190 }}
                fontSize={20}>
                {tree.treeName}
            </AppText>
        </View>
    );
}

export default ProgressIndicatorAndName;
