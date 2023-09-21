import { TreeData } from "@/redux/slices/userTreesSlice";
import { memo, useEffect } from "react";
import { View } from "react-native";
import Animated, { useAnimatedProps, useSharedValue, withSpring } from "react-native-reanimated";
import { Circle, Defs, LinearGradient, Stop, Svg, Circle as SvgCircle } from "react-native-svg";
import { countCompleteNodes } from "../functions/extractInformationFromTree";
import { getWheelParams } from "../functions/misc";
import { centerFlex, colors } from "../parameters";
import { useAppSelector } from "../redux/reduxHooks";
import { selectSafeScreenDimentions } from "../redux/slices/screenDimentionsSlice";
import { NormalizedNode } from "../types";
import AppText from "./AppText";

const AnimatedCircle = Animated.createAnimatedComponent(SvgCircle);

function ProgressIndicatorAndName({ nodesOfTree, treeData }: { treeData: Omit<TreeData, "nodes">; nodesOfTree: NormalizedNode[] }) {
    const { width } = useAppSelector(selectSafeScreenDimentions);

    const progressWheelProps = getWheelParams(treeData.accentColor.color1, `${treeData.accentColor.color1}3D`, 30, 4);

    const completedPercentage = useSharedValue(0);

    useEffect(() => {
        const completedSkillsQty = countCompleteNodes(nodesOfTree);
        const skillsQty = nodesOfTree.length - 1;
        const completePercentage = skillsQty === 0 ? 0 : (completedSkillsQty / skillsQty) * 100;

        completedPercentage.value = completePercentage;
    }, [nodesOfTree]);

    const animatedProps = useAnimatedProps(() => {
        const result = progressWheelProps.circumference - (progressWheelProps.circumference * completedPercentage.value) / 100;

        return { strokeDashoffset: withSpring(result, { overshootClamping: true, damping: 65 }) };
    }, [completedPercentage.value]);

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
                        <Stop offset="0%" stopColor={treeData.accentColor.color1} stopOpacity="1" />
                        <Stop offset="100%" stopColor={treeData.accentColor.color2} stopOpacity="1" />
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
                {treeData.treeName}
            </AppText>
        </View>
    );
}

export default memo(ProgressIndicatorAndName);
