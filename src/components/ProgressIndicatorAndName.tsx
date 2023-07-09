import { memo, useEffect } from "react";
import { View } from "react-native";
import Animated, { useAnimatedProps, useSharedValue, withSpring } from "react-native-reanimated";
import { Circle, Defs, LinearGradient, Stop, Svg, Circle as SvgCircle } from "react-native-svg";
import { treeCompletedSkillPercentage } from "../functions/extractInformationFromTree";
import { centerFlex, colors } from "../parameters";
import { useAppSelector } from "../redux/reduxHooks";
import { selectSafeScreenDimentions } from "../redux/screenDimentionsSlice";
import { Skill, Tree } from "../types";
import AppText from "./AppText";
import { getWheelParams } from "../functions/misc";

const AnimatedCircle = Animated.createAnimatedComponent(SvgCircle);

function ProgressIndicatorAndName({ tree }: { tree: Tree<Skill> }) {
    const { width } = useAppSelector(selectSafeScreenDimentions);

    const treeAccentColor = tree.accentColor;

    const progressWheelProps = getWheelParams(treeAccentColor.color1, `${treeAccentColor.color1}3D`, 30, 4);

    const completedPercentage = useSharedValue(0);

    useEffect(() => {
        if (!tree) {
            completedPercentage.value = 0;
            return;
        }

        completedPercentage.value = treeCompletedSkillPercentage(tree);
    }, [tree, completedPercentage]);

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
                <Defs>
                    <LinearGradient id="progressColor" x1="0%" y1="0%" x2="100%" y2="100%">
                        <Stop offset="0%" stopColor={tree.accentColor.color1} stopOpacity="1" />
                        <Stop offset="100%" stopColor={tree.accentColor.color2} stopOpacity="1" />
                    </LinearGradient>
                </Defs>

                <Circle
                    strokeWidth={progressWheelProps.strokeWidth}
                    cx={progressWheelProps.centerCoordinate}
                    cy={progressWheelProps.centerCoordinate}
                    r={progressWheelProps.radius}
                    fillOpacity={0}
                    stroke={progressWheelProps.backgroundStroke}
                />
                <AnimatedCircle
                    strokeWidth={progressWheelProps.strokeWidth}
                    cx={progressWheelProps.centerCoordinate}
                    cy={progressWheelProps.centerCoordinate}
                    r={progressWheelProps.radius}
                    stroke={"url(#progressColor)"}
                    fillOpacity={0}
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

export default memo(ProgressIndicatorAndName);
