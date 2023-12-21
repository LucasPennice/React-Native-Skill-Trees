import { Circle, Group, Path, SkFont, SkPath, Text } from "@shopify/react-native-skia";
import Animated, { SharedValue, useDerivedValue, withDelay, withTiming } from "react-native-reanimated";
import { CIRCLE_SIZE, colors } from "../../../parameters";
import { ColorGradient } from "../../../types";
import useAnimateSkiaValue from "../hooks/useAnimateSkiaValue";
import { ANIMATION_CONSTANTS_ON_COMPLETE } from "./useHandleNodeCompleteAnimation";

// function useGetLinearVectors(x: SharedValue<number>, y: SharedValue<number>) {
//     const linearGradientStart = useDerivedValue(() => {
//         return vec(x.value - CIRCLE_SIZE, y.value);
//     });
//     const linearGradientEnd = useDerivedValue(() => {
//         return vec(x.value + CIRCLE_SIZE, y.value + CIRCLE_SIZE);
//     });
//     return { linearGradientStart, linearGradientEnd };
// }

type NodeProps = {
    animatedCoordinates: { x: SharedValue<number>; y: SharedValue<number> };
    font: SkFont;
    text: string;
    accentColor: ColorGradient;
    textCoordinates: { textX: Readonly<Animated.SharedValue<number>>; textY: Readonly<Animated.SharedValue<number>> };
    showIcons: boolean;
};

type SkillNodeProps = {
    nodeState: NodeProps;
    path: SharedValue<SkPath>;
    isComplete: boolean;
};

function SkillNode({ path, isComplete, nodeState }: SkillNodeProps) {
    const { accentColor, animatedCoordinates, font, text, textCoordinates, showIcons } = nodeState;
    const { x, y } = animatedCoordinates;

    const { textX, textY } = textCoordinates;

    // const { animatedRectangles } = useHandleNodeCompleteAnimation({ cx: x.value, cy: y.value }, isComplete);
    // const { inner, outer } = animatedRectangles;

    const startTrim = isComplete ? 0 : 1;

    const start = useAnimateSkiaValue({
        initialValue: startTrim,
        stateToAnimate: startTrim,
        delay: isComplete ? ANIMATION_CONSTANTS_ON_COMPLETE.delayAfterOvershoot : 0,
        duration: isComplete ? ANIMATION_CONSTANTS_ON_COMPLETE.remainingAnimationDuration : 0,
    });

    // const { linearGradientEnd, linearGradientStart } = useGetLinearVectors(x, y);

    return (
        <Group>
            <Circle cx={x} cy={y} r={CIRCLE_SIZE} color={colors.background} />
            {/* eslint-disable-next-line */}
            <Path path={path} style="stroke" strokeWidth={2} color={"#515053"} />
            {/* <DiffRect inner={inner} outer={outer} color={`${interpolateColors(accentColor.color1, colors.background, 0.49)}`} /> */}
            {/* eslint-disable-next-line */}
            <Path path={path} style="stroke" start={start} strokeCap={"round"} strokeWidth={2} color={accentColor.color1} />

            {showIcons && <Text x={textX} y={textY} text={text} font={font} color={"#515053"} />}
        </Group>
    );
}

type SkillTreeNodeProps = {
    nodeState: NodeProps;
    path: SharedValue<SkPath>;
    isComplete: boolean;
    treeCompletedPercentage: number;
};

function SkillTreeNode({ isComplete, nodeState, path, treeCompletedPercentage }: SkillTreeNodeProps) {
    const { accentColor, animatedCoordinates, font, text, textCoordinates, showIcons } = nodeState;
    const { x, y } = animatedCoordinates;

    const { textX, textY } = textCoordinates;

    const start = useDerivedValue(() => {
        const delay = isComplete ? ANIMATION_CONSTANTS_ON_COMPLETE.delayAfterOvershoot : 0;
        const duration = isComplete ? ANIMATION_CONSTANTS_ON_COMPLETE.remainingAnimationDuration : 0;
        return withDelay(delay, withTiming(1 - treeCompletedPercentage / 100, { duration }));
    });

    // const { linearGradientEnd, linearGradientStart } = useGetLinearVectors(x, y);

    return (
        <Group>
            <Circle cx={x} cy={y} r={CIRCLE_SIZE} color={colors.background} />
            {/* eslint-disable-next-line */}
            <Path path={path} style="stroke" strokeWidth={2} color={"#515053"} />
            {/* eslint-disable-next-line */}
            <Path path={path} start={start} style={"stroke"} strokeCap={"round"} strokeWidth={2} color={accentColor.color1} />
            {showIcons && <Text x={textX} y={textY} text={text} font={font} color={accentColor.color1} />}
        </Group>
    );
}

type UserNodeProps = {
    nodeState: NodeProps;
    textColor: string;
    treeCompletedPercentage: number;
};

function UserNode({ nodeState, textColor }: UserNodeProps) {
    const { accentColor, animatedCoordinates, font, text, textCoordinates, showIcons } = nodeState;
    const { x, y } = animatedCoordinates;

    // const { linearGradientEnd, linearGradientStart } = useGetLinearVectors(x, y);

    const { textX, textY } = textCoordinates;
    return (
        <Group>
            <Circle cx={x} cy={y} r={CIRCLE_SIZE} color={colors.background} />
            {/* eslint-disable-next-line */}
            <Circle cx={x} cy={y} r={CIRCLE_SIZE} color={accentColor.color1} style={"fill"} strokeWidth={2} />
            {showIcons && <Text x={textX} y={textY} text={text} font={font} color={textColor} />}
        </Group>
    );
}

export { NodeProps, SkillNode, SkillTreeNode, UserNode };
