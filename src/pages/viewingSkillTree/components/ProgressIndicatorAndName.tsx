import { Circle, Circle as SvgCircle, Svg } from "react-native-svg";
import Animated, { useAnimatedProps, useSharedValue, withSpring } from "react-native-reanimated";
import { selectCurrentTree } from "../../../redux/userTreesSlice";
import { useAppSelector } from "../../../redux/reduxHooks";
import { useEffect } from "react";
import { Text, View } from "react-native";
import { centerFlex, colors } from "../../../parameters";
import AppText from "../../../components/AppText";
import { selectScreenDimentions } from "../../../redux/screenDimentionsSlice";
import { countCompletedNodesInTree, countNodesInTree } from "../../../functions/extractInformationFromTree";

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

function ProgressIndicatorAndName() {
    const currentTree = useAppSelector(selectCurrentTree);
    const { width } = useAppSelector(selectScreenDimentions);

    const treeAccentColor = currentTree ? currentTree.accentColor : colors.accent;

    const progressWheelProps = new ProgressWheelParams(treeAccentColor, `${treeAccentColor}3D`, 30, 6);

    const completedPercentage = useSharedValue(0);

    useEffect(() => {
        const completedNodesQty = countCompletedNodesInTree(currentTree);
        const nodesQty = countNodesInTree(currentTree);

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

    if (!currentTree) return <></>;

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
                {currentTree.treeName}
            </AppText>
        </View>
    );
}

export default ProgressIndicatorAndName;
