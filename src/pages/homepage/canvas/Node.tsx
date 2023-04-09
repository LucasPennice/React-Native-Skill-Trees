import { getHeightForFont } from "./functions";
import { Blur, Group, Path, useFont, Text, SkiaMutableValue, SkiaValue, useComputedValue, Skia } from "@shopify/react-native-skia";
import { CirclePositionInCanvasWithLevel, Skill, Tree } from "../../../types";
import { CIRCLE_SIZE, colors } from "./parameters";
import useAnimateSkiaValue from "./hooks/useAnimateSkiaValue";

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

    if (!nodeLetterFont) return <></>;

    return (
        <Group origin={{ x: cx, y: cy }} transform={groupTransform}>
            <Path path={path} style="stroke" strokeWidth={2} color={colors.line} />
            {isComplete && <Path path={path} style="stroke" strokeCap={"round"} strokeWidth={2} color={treeAccentColor} />}
            <Text x={textX} y={textY} text={letter} font={nodeLetterFont} color={color} />
            {circleBlurOnInactive && <Blur blur={circleBlurOnInactive} />}
        </Group>
    );
}

export default Node;
