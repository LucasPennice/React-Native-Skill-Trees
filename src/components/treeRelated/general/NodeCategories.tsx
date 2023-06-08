import { Circle, DiffRect, LinearGradient, Path, SkFont, SkPath, SkiaMutableValue, SkiaValue, Text, vec } from "@shopify/react-native-skia";
import { interpolateColors } from "../../../functions/misc";
import { CIRCLE_SIZE, colors } from "../../../parameters";
import { ColorGradient } from "../../../types";
import useAnimateSkiaValue from "../hooks/useAnimateSkiaValue";
import useHandleNodeCompleteAnimation, { ANIMATION_CONSTANTS_ON_COMPLETE } from "./useHandleNodeCompleteAnimation";

type NodeProps = {
    animatedCoordinates: { x: SkiaMutableValue<number>; y: SkiaMutableValue<number> };
    font: SkFont;
    text: string;
    accentColor: ColorGradient;
    textCoordinates: { textX: SkiaValue<number>; textY: SkiaValue<number> };
    showIcons: boolean;
};

type SkillNodeProps = {
    nodeState: NodeProps;
    path: SkiaValue<SkPath>;
    isComplete: boolean;
};

function SkillNode({ path, isComplete, nodeState }: SkillNodeProps) {
    const { accentColor, animatedCoordinates, font, text, textCoordinates, showIcons } = nodeState;
    const { x, y } = animatedCoordinates;

    const { textX, textY } = textCoordinates;

    const { animatedRectangles } = useHandleNodeCompleteAnimation({ cx: x.current, cy: y.current }, isComplete);
    const { inner, outer } = animatedRectangles;

    const startTrim = isComplete ? 0 : 1;

    const start = useAnimateSkiaValue({
        initialValue: startTrim,
        stateToAnimate: startTrim,
        delay: isComplete ? ANIMATION_CONSTANTS_ON_COMPLETE.delayAfterOvershoot : 0,
        duration: isComplete ? ANIMATION_CONSTANTS_ON_COMPLETE.remainingAnimationDuration : 0,
    });

    return (
        <>
            <Circle cx={x} cy={y} r={CIRCLE_SIZE} color={colors.background} />
            {/* eslint-disable-next-line */}
            <Path path={path} style="stroke" strokeWidth={2}>
                <LinearGradient
                    start={vec(x.current - CIRCLE_SIZE, y.current)}
                    end={vec(x.current + CIRCLE_SIZE, y.current + CIRCLE_SIZE)}
                    colors={["#515053", "#2C2C2D"]}
                />
            </Path>
            <DiffRect inner={inner} outer={outer} color={`${interpolateColors(accentColor.color1, colors.background, 0.49)}`} />
            {/* eslint-disable-next-line */}
            <Path path={path} style="stroke" start={start} strokeCap={"round"} strokeWidth={2}>
                <LinearGradient
                    start={vec(x.current - CIRCLE_SIZE, y.current)}
                    end={vec(x.current + CIRCLE_SIZE, y.current + CIRCLE_SIZE)}
                    colors={[accentColor.color1, accentColor.color2]}
                />
            </Path>
            {showIcons && (
                <Text x={textX} y={textY} text={text} font={font} color={colors.unmarkedText}>
                    {!isComplete && (
                        <LinearGradient
                            start={vec(x.current - CIRCLE_SIZE, y.current)}
                            end={vec(x.current + CIRCLE_SIZE, y.current + CIRCLE_SIZE)}
                            colors={["#515053", "#2C2C2D"]}
                        />
                    )}
                </Text>
            )}
        </>
    );
}

type SkillTreeNodeProps = {
    nodeState: NodeProps;
    path: SkiaValue<SkPath>;
    isComplete: boolean;
    treeCompletedPercentage: number;
};

function SkillTreeNode({ isComplete, nodeState, path, treeCompletedPercentage }: SkillTreeNodeProps) {
    const { accentColor, animatedCoordinates, font, text, textCoordinates, showIcons } = nodeState;
    const { x, y } = animatedCoordinates;

    const { textX, textY } = textCoordinates;

    const end = useAnimateSkiaValue({
        initialValue: treeCompletedPercentage / 100,
        stateToAnimate: treeCompletedPercentage / 100,
        delay: isComplete ? ANIMATION_CONSTANTS_ON_COMPLETE.delayAfterOvershoot : 0,
        duration: isComplete ? ANIMATION_CONSTANTS_ON_COMPLETE.remainingAnimationDuration : 0,
    });

    return (
        <>
            <Circle cx={x} cy={y} r={CIRCLE_SIZE} color={colors.background} />
            {/* eslint-disable-next-line */}
            <Path path={path} style="stroke" strokeWidth={2}>
                <LinearGradient
                    start={vec(x.current - CIRCLE_SIZE, y.current)}
                    end={vec(x.current + CIRCLE_SIZE, y.current + CIRCLE_SIZE)}
                    colors={["#515053", "#2C2C2D"]}
                />
            </Path>
            {/* eslint-disable-next-line */}
            <Path path={path} end={end} style={"stroke"} strokeCap={"round"} strokeWidth={2}>
                <LinearGradient
                    start={vec(x.current - CIRCLE_SIZE, y.current)}
                    end={vec(x.current + CIRCLE_SIZE, y.current + CIRCLE_SIZE)}
                    colors={[accentColor.color1, accentColor.color2]}
                />
            </Path>
            {showIcons && (
                <Text x={textX} y={textY} text={text} font={font}>
                    <LinearGradient
                        start={vec(x.current - CIRCLE_SIZE, y.current)}
                        end={vec(x.current + CIRCLE_SIZE, y.current + CIRCLE_SIZE)}
                        colors={[accentColor.color1, accentColor.color2]}
                    />
                </Text>
            )}
        </>
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

    const { textX, textY } = textCoordinates;
    return (
        <>
            <Circle cx={x} cy={y} r={CIRCLE_SIZE} color={colors.background} />
            {/* eslint-disable-next-line */}
            <Circle cx={x} cy={y} r={CIRCLE_SIZE} color={accentColor.color1} style={"fill"} strokeWidth={2}>
                <LinearGradient
                    start={vec(x.current - CIRCLE_SIZE, y.current)}
                    end={vec(x.current + CIRCLE_SIZE, y.current + CIRCLE_SIZE)}
                    colors={[accentColor.color1, accentColor.color2]}
                />
            </Circle>
            {showIcons && <Text x={textX} y={textY} text={text} font={font} color={textColor} />}
        </>
    );
}

export { UserNode, SkillNode, SkillTreeNode, NodeProps };
