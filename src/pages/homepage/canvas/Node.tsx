import { getHeightForFont } from "./functions";
import {
    Blur,
    Group,
    Path,
    useFont,
    Text,
    SkiaMutableValue,
    SkiaValue,
    useComputedValue,
    Skia,
    Circle,
    DiffRect,
    rrect,
    rect,
    useValue,
    useSharedValueEffect,
} from "@shopify/react-native-skia";
import { CIRCLE_SIZE, colors } from "./parameters";
import useAnimateSkiaValue from "./hooks/useAnimateSkiaValue";
import { useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import { useEffect, useState } from "react";

function Node({
    coord,
    isComplete,
    circleBlurOnInactive,
    groupTransform,
    treeAccentColor,
    text,
}: {
    isComplete?: boolean;
    coord: { cx: number; cy: number };
    groupTransform?: SkiaValue<{ scale: number }[]>;
    circleBlurOnInactive?: SkiaMutableValue<number>;
    treeAccentColor: string;
    text: { color: string; letter: string };
}) {
    const nodeLetterFont = useFont(require("../../../../assets/Helvetica.ttf"), 20);

    const { color, letter } = text;

    const { cx, cy } = coord;

    const textWidth = nodeLetterFont ? nodeLetterFont.getTextWidth(letter) : 0;

    const textPositions = { x: cx - textWidth / 2, y: cy + getHeightForFont(20) / 4 + 1 };

    const x = useAnimateSkiaValue({ initialValue: cx, stateToAnimate: cx });
    const y = useAnimateSkiaValue({ initialValue: cy, stateToAnimate: cy });
    const textX = useAnimateSkiaValue({ initialValue: textPositions.x, stateToAnimate: textPositions.x });
    const textY = useAnimateSkiaValue({ initialValue: textPositions.y, stateToAnimate: textPositions.y });

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

    const OVERSHOOT_DURATION = isComplete ? 300 : 0;
    const DELAY_AFTER_OVERSHOOT = isComplete ? 400 : 0;
    const REMAINING_ANIMATION_DURATION = isComplete ? 400 : 0;

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

    //

    if (!nodeLetterFont) return <></>;

    return (
        <Group origin={{ x: cx, y: cy }} transform={groupTransform} opacity={circleBlurOnInactive ?? 1}>
            <DiffRect inner={animatedinnerRect} outer={animatedOuterRect} color={`${treeAccentColor}7D`} />
            {!isComplete && <Path path={path} style="stroke" strokeWidth={2} color={colors.line} />}
            <Path path={path} style="stroke" start={start} strokeCap={"round"} strokeWidth={2} color={treeAccentColor} />
            <Text x={textX} y={textY} text={letter} font={nodeLetterFont} color={color} />
        </Group>
    );
}

export default Node;

function getShouldAnimate(completionHistory: boolean[]) {
    const length = completionHistory.length - 1;

    const currnetElement = completionHistory[length];
    const prevElement = completionHistory[length - 1];

    return currnetElement !== prevElement;
}
