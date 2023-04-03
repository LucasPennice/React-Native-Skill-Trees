import { getHeightForFont } from "./functions";
import { Blur, Circle, Group, Path, useFont, Text, useSpring, SkFont, SkiaMutableValue, SkiaValue } from "@shopify/react-native-skia";
import { CirclePositionInCanvasWithLevel, Skill, Tree } from "../../../types";
import { CIRCLE_SIZE, colors } from "./parameters";

function Node({
    coord,
    tree,
    selectedNode,
    currentNodeCoordintes,
    circleBlurOnInactive,
    circleOpacity,
    groupTransform,
    pathTrim,
}: {
    tree: Tree<Skill>;
    coord: { cx: number; cy: number };
    selectedNode: string | null;
    currentNodeCoordintes: CirclePositionInCanvasWithLevel;
    groupTransform: SkiaValue<{ scale: number }[]>;
    circleOpacity: SkiaMutableValue<number>;
    pathTrim: SkiaMutableValue<number>;
    circleBlurOnInactive: SkiaMutableValue<number>;
}) {
    const nodeLetterFont = useFont(require("../../../../assets/Helvetica.ttf"), 20);

    const { cx, cy } = coord;

    const x = useSpring(cx);
    const y = useSpring(cy);

    return (
        <Group origin={{ x: currentNodeCoordintes.x, y: currentNodeCoordintes.y }} transform={groupTransform} opacity={circleOpacity}>
            <Path transform={[]} path={getPathForCircle(cx, cy, CIRCLE_SIZE, 2)} style="stroke" strokeWidth={2} color={colors.line} />
            <Path
                path={getPathForCircle(cx, cy, CIRCLE_SIZE, 2)}
                style="stroke"
                strokeCap={"round"}
                strokeWidth={2}
                end={pathTrim}
                color={colors.accent}
            />
            <Circle cx={x} cy={y} r={CIRCLE_SIZE} color={colors.background} />
            {/* Letter inside the node */}

            {nodeLetterFont && <NodeLetter tree={tree} coord={{ cx, cy }} nodeLetterFont={nodeLetterFont} selectedNode={selectedNode} />}
            <Blur blur={circleBlurOnInactive} />
        </Group>
    );
}

function NodeLetter({
    coord,
    nodeLetterFont,
    tree,
    selectedNode,
}: {
    nodeLetterFont: SkFont;
    tree: Tree<Skill>;
    coord: { cx: number; cy: number };
    selectedNode: string | null;
}) {
    const { cx, cy } = coord;

    const letterToRender = tree.data.name[0];

    const textWidth = nodeLetterFont.getTextWidth(letterToRender);

    const textX = useSpring(cx - textWidth / 2);
    const textY = useSpring(cy + getHeightForFont(20) / 4 + 1);

    return (
        <Text
            x={textX}
            y={textY}
            text={letterToRender}
            font={nodeLetterFont}
            color={tree.data.isCompleted ? colors.accent : tree.data.id === selectedNode ? "white" : colors.unmarkedText}
        />
    );
}

export default Node;

function getPathForCircle(cx: number, cy: number, r: number, strokeWidth: number) {
    const radius = r + strokeWidth / 2;
    return `M ${cx - strokeWidth / 2} ${cy} m ${-r}, 0 a ${radius},${radius} 0 1,0 ${radius * 2},0 a ${radius},${radius} 0 1,0 ${-(radius * 2)},0`;
}
