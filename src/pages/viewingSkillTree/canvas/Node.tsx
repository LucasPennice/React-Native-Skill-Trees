import {
    Circle,
    DiffRect,
    Group,
    Path,
    RoundedRect,
    Skia,
    SkiaMutableValue,
    SkiaValue,
    Text,
    rect,
    rrect,
    useComputedValue,
    useFont,
    useSharedValueEffect,
    useValue,
} from "@shopify/react-native-skia";
import { useEffect } from "react";
import { useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import { interpolateColors } from "../../../functions/misc";
import { CIRCLE_SIZE, colors } from "../../../parameters";
import { NodeCategory } from "../../../types";
import useIsFirstRender from "../../../useIsFirstRender";
import useAnimateSkiaValue from "./hooks/useAnimateSkiaValue";

function Node({
    coord,
    isComplete,
    circleBlurOnInactive,
    groupTransform,
    treeAccentColor,
    text,
    category,
}: {
    isComplete?: boolean;
    coord: { cx: number; cy: number };
    groupTransform?: SkiaValue<{ scale: number }[]>;
    circleBlurOnInactive?: SkiaMutableValue<number>;
    treeAccentColor: string;
    text: { color: string; letter: string; isEmoji: boolean };
    category: NodeCategory;
}) {
    const nodeLetterFont = useFont(require("../../../../assets/Helvetica.ttf"), 20);
    const emojiFont = useFont(require("../../../../assets/NotoEmoji-Regular.ttf"), 17);

    const { color, letter } = text;

    const { cx, cy } = coord;

    const textWidth = getTextWidth();

    const nodeIcon = text.isEmoji ? text.letter : text.letter.toUpperCase();

    function getTextWidth() {
        if (text.isEmoji && emojiFont) return emojiFont.getTextWidth(letter);
        if (!text.isEmoji && nodeLetterFont) return nodeLetterFont.getTextWidth(letter.toUpperCase());

        return 0;
    }

    const x = useAnimateSkiaValue({ initialValue: cx, stateToAnimate: cx });
    const y = useAnimateSkiaValue({ initialValue: cy, stateToAnimate: cy });

    const textX = useComputedValue(() => x.current - textWidth / 2, [x, textWidth]);
    const textY = useComputedValue(() => y.current + getHeightForFont(text.isEmoji ? 17 : 20) / 4 + 1, [y]);

    const path = useComputedValue(() => {
        const strokeWidth = 2;
        const radius = CIRCLE_SIZE + strokeWidth / 2;
        const p = Skia.Path.Make();

        p.moveTo(x.current, y.current);
        p.addCircle(x.current, y.current, radius);
        p.simplify();

        return p;
    }, [x, y]);

    const getCenteredCoordinates = (size: number, cx: number, cy: number) => {
        return {
            x: cx - size / 2,
            y: cy - size / 2,
        };
    };

    const OVERSHOOT_DURATION = isComplete ? 200 : 0;
    const DELAY_AFTER_OVERSHOOT = isComplete ? 300 : 0;
    const REMAINING_ANIMATION_DURATION = isComplete ? 300 : 0;

    //OUTER RECTANGLE
    const outerRectSizeInitial = 0;
    const outerRectSizeOnComplete = 2 * CIRCLE_SIZE;

    const outerRectX = useValue(cx);
    const outerRectY = useValue(cy);
    const outerRectSize = useValue(outerRectSizeInitial);

    const outerRectXSharedValue = useSharedValue(cx);
    const outerRectYSharedValue = useSharedValue(cy);
    const outerRectSizeSharedValue = useSharedValue(outerRectSizeInitial);

    useEffect(() => {
        outerRectXSharedValue.value = coord.cx;
        outerRectYSharedValue.value = coord.cy;
        outerRectX.current = coord.cx;
        outerRectY.current = coord.cy;
        innerRectXSharedValue.value = coord.cx;
        innerRectYSharedValue.value = coord.cy;
        innerRectX.current = coord.cx;
        innerRectY.current = coord.cy;
    }, [coord]);

    const isFirstRender = useIsFirstRender();

    useEffect(() => {
        if (isFirstRender) return;

        const size = isComplete ? outerRectSizeOnComplete : outerRectSizeInitial;
        const coord = getCenteredCoordinates(size, cx, cy);

        const overShootSize = isComplete ? 1.5 * outerRectSizeOnComplete : outerRectSizeInitial;
        const overShootCoord = getCenteredCoordinates(overShootSize, cx, cy);

        //Initial Phase
        outerRectXSharedValue.value = withTiming(overShootCoord.x, { duration: OVERSHOOT_DURATION });
        outerRectYSharedValue.value = withTiming(overShootCoord.y, { duration: OVERSHOOT_DURATION });
        outerRectSizeSharedValue.value = withTiming(overShootSize, { duration: OVERSHOOT_DURATION });

        //After DURATION time has passed
        outerRectXSharedValue.value = withDelay(DELAY_AFTER_OVERSHOOT, withTiming(coord.x, { duration: REMAINING_ANIMATION_DURATION }));
        outerRectYSharedValue.value = withDelay(DELAY_AFTER_OVERSHOOT, withTiming(coord.y, { duration: REMAINING_ANIMATION_DURATION }));
        outerRectSizeSharedValue.value = withDelay(DELAY_AFTER_OVERSHOOT, withTiming(size, { duration: REMAINING_ANIMATION_DURATION }));
    }, [isComplete]);

    useSharedValueEffect(() => {
        outerRectX.current = outerRectXSharedValue.value;
    }, outerRectXSharedValue);

    useSharedValueEffect(() => {
        outerRectY.current = outerRectYSharedValue.value;
    }, outerRectYSharedValue);

    useSharedValueEffect(() => {
        outerRectSize.current = outerRectSizeSharedValue.value;
    }, outerRectSizeSharedValue);

    const animatedOuterRect = useComputedValue(() => {
        return rrect(
            rect(outerRectX.current, outerRectY.current, outerRectSize.current, outerRectSize.current),
            outerRectSize.current,
            outerRectSize.current
        );
    }, [outerRectX, outerRectY, outerRectSize]);

    //INNER RECTANGLE
    const innerRectSizeInitial = 0;
    const innerRectSizeOnComplete = 2 * CIRCLE_SIZE;

    const innerRectX = useValue(cx);
    const innerRectY = useValue(cy);
    const innerRectSize = useValue(innerRectSizeInitial);

    const innerRectXSharedValue = useSharedValue(cx);
    const innerRectYSharedValue = useSharedValue(cy);
    const innerRectSizeSharedValue = useSharedValue(innerRectSizeInitial);

    useEffect(() => {
        const size = isComplete ? innerRectSizeOnComplete : innerRectSizeInitial;
        const coord = getCenteredCoordinates(size, cx, cy);

        innerRectXSharedValue.value = withDelay(DELAY_AFTER_OVERSHOOT, withTiming(coord.x, { duration: REMAINING_ANIMATION_DURATION }));
        innerRectYSharedValue.value = withDelay(DELAY_AFTER_OVERSHOOT, withTiming(coord.y, { duration: REMAINING_ANIMATION_DURATION }));
        innerRectSizeSharedValue.value = withDelay(DELAY_AFTER_OVERSHOOT, withTiming(size, { duration: REMAINING_ANIMATION_DURATION }));
    }, [isComplete]);

    useSharedValueEffect(() => {
        innerRectX.current = innerRectXSharedValue.value;
    }, innerRectXSharedValue);

    useSharedValueEffect(() => {
        innerRectY.current = innerRectYSharedValue.value;
    }, innerRectYSharedValue);

    useSharedValueEffect(() => {
        innerRectSize.current = innerRectSizeSharedValue.value;
    }, innerRectSizeSharedValue);

    const animatedinnerRect = useComputedValue(() => {
        return rrect(
            rect(innerRectX.current, innerRectY.current, innerRectSize.current, innerRectSize.current),
            innerRectSize.current,
            innerRectSize.current
        );
    }, [innerRectX, innerRectY, innerRectSize]);

    const startTrim = isComplete ? 0 : 1;

    const start = useAnimateSkiaValue({
        initialValue: startTrim,
        stateToAnimate: startTrim,
        delay: isComplete ? DELAY_AFTER_OVERSHOOT : 0,
        duration: REMAINING_ANIMATION_DURATION,
    });

    const skillTreeX = useComputedValue(() => {
        return x.current - CIRCLE_SIZE;
    }, [x]);
    const skillTreeY = useComputedValue(() => {
        return y.current - CIRCLE_SIZE;
    }, [y]);

    if (!nodeLetterFont) return <></>;
    if (!emojiFont) return <></>;

    return (
        <Group origin={{ x: cx, y: cy }} transform={groupTransform} opacity={circleBlurOnInactive ?? 1}>
            {category === "SKILL" && (
                <>
                    <Circle cx={x} cy={y} r={CIRCLE_SIZE} color={colors.background} />
                    {/* eslint-disable-next-line */}
                    <Path path={path} style="stroke" strokeWidth={2} color={colors.line} />
                    <DiffRect
                        inner={animatedinnerRect}
                        outer={animatedOuterRect}
                        color={`${interpolateColors(treeAccentColor, colors.background, 0.49)}`}
                    />
                    {/* eslint-disable-next-line */}
                    <Path path={path} style="stroke" start={start} strokeCap={"round"} strokeWidth={2} color={treeAccentColor} />
                    <Text x={textX} y={textY} text={nodeIcon} font={text.isEmoji ? emojiFont : nodeLetterFont} color={color} />
                </>
            )}
            {category === "SKILL_TREE" && (
                <>
                    <RoundedRect
                        height={2 * CIRCLE_SIZE}
                        width={2 * CIRCLE_SIZE}
                        x={skillTreeX}
                        y={skillTreeY}
                        r={5}
                        // eslint-disable-next-line
                        style={"fill"}
                        strokeWidth={2}
                        color={colors.background}
                    />

                    <RoundedRect
                        height={2 * CIRCLE_SIZE}
                        width={2 * CIRCLE_SIZE}
                        x={skillTreeX}
                        y={skillTreeY}
                        r={5}
                        // eslint-disable-next-line
                        style={"stroke"}
                        strokeWidth={2}
                        color={isComplete ? treeAccentColor : colors.line}
                    />
                    <Text
                        x={textX}
                        y={textY}
                        text={nodeIcon}
                        font={text.isEmoji ? emojiFont : nodeLetterFont}
                        color={isComplete ? color : colors.line}
                    />
                </>
            )}
            {category === "USER" && (
                <>
                    <Circle cx={x} cy={y} r={2 * CIRCLE_SIZE} color={colors.background} />
                    {/* eslint-disable-next-line */}
                    <Circle cx={x} cy={y} r={2 * CIRCLE_SIZE} color={treeAccentColor} style={"stroke"} strokeWidth={2} />
                    <Text
                        x={textX}
                        y={textY}
                        text={nodeIcon}
                        font={text.isEmoji ? emojiFont : nodeLetterFont}
                        color={isComplete ? color : treeAccentColor}
                    />
                </>
            )}
        </Group>
    );

    function getHeightForFont(fontSize: number) {
        return (fontSize * 125.5) / 110;
    }
}

export default Node;
