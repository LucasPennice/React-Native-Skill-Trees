import { getHeightForFont } from "./functions";
import {
    Blur,
    Circle,
    Group,
    Path,
    useFont,
    Text,
    useSpring,
    SkFont,
    SkiaMutableValue,
    SkiaValue,
    useComputedValue,
    Skia,
    SkPath,
} from "@shopify/react-native-skia";
import { CirclePositionInCanvasWithLevel, Skill, Tree } from "../../../types";
import { CANVAS_SPRING, CIRCLE_SIZE, colors } from "./parameters";
import { cloneElement } from "react";
import useAnimateSkiaValue from "./hooks/useAnimateSkiaValue";

function Node({
    coord,
    tree,
    selectedNode,
    currentNodeCoordintes,
    circleBlurOnInactive,
    groupTransform,
    treeAccentColor,
}: {
    tree: Tree<Skill>;
    coord: { cx: number; cy: number };
    selectedNode: string | null;
    currentNodeCoordintes: CirclePositionInCanvasWithLevel;
    groupTransform: SkiaValue<{ scale: number }[]>;
    circleBlurOnInactive: SkiaMutableValue<number>;
    treeAccentColor: string;
}) {
    const nodeLetterFont = useFont(require("../../../../assets/Helvetica.ttf"), 20);

    const textColor = tree.data.isCompleted ? treeAccentColor : tree.data.id === selectedNode ? "white" : colors.unmarkedText;
    const letterToRender = tree.data.name ? tree.data.name[0] : "-";

    const { cx, cy } = coord;

    const textWidth = nodeLetterFont ? nodeLetterFont.getTextWidth(letterToRender) : 0;

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
        <Group origin={{ x: currentNodeCoordintes.x, y: currentNodeCoordintes.y }} transform={groupTransform}>
            <Path path={path} style="stroke" strokeWidth={2} color={colors.line} />
            {tree.data.isCompleted && <Path path={path} style="stroke" strokeCap={"round"} strokeWidth={2} color={treeAccentColor} />}
            {/* <Circle cx={x} cy={y} r={CIRCLE_SIZE} color={colors.background} /> */}
            <Text x={textX} y={textY} text={letterToRender} font={nodeLetterFont} color={textColor} />
            <Blur blur={circleBlurOnInactive} />
        </Group>
    );
}

export default Node;
