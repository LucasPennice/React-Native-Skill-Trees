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
} from "@shopify/react-native-skia";
import { CirclePositionInCanvasWithLevel, Skill, Tree } from "../../../types";
import { CANVAS_SPRING, CIRCLE_SIZE, colors } from "./parameters";

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

    const { cx, cy } = coord;

    const x = useSpring(cx, CANVAS_SPRING);
    const y = useSpring(cy, CANVAS_SPRING);

    const path = useComputedValue(() => {
        const strokeWidth = 2;
        const radius = CIRCLE_SIZE + strokeWidth / 2;
        const p = Skia.Path.Make();

        p.moveTo(x.current, y.current);
        p.addCircle(x.current, y.current, radius);

        return p;
    }, [x, y]);

    return (
        <Group origin={{ x: currentNodeCoordintes.x, y: currentNodeCoordintes.y }} transform={groupTransform}>
            <Path path={path} style="stroke" strokeWidth={2} color={colors.line} />
            <Path path={path} style="stroke" strokeCap={"round"} strokeWidth={2} color={treeAccentColor} />
            <Circle cx={x} cy={y} r={CIRCLE_SIZE} color={colors.background} />
            {/* Letter inside the node */}

            {nodeLetterFont && (
                <NodeLetter
                    treeAccentColor={treeAccentColor}
                    tree={tree}
                    coord={{ cx, cy }}
                    nodeLetterFont={nodeLetterFont}
                    selectedNode={selectedNode}
                />
            )}
            <Blur blur={circleBlurOnInactive} />
        </Group>
    );
}

function NodeLetter({
    coord,
    nodeLetterFont,
    tree,
    selectedNode,
    treeAccentColor,
}: {
    nodeLetterFont: SkFont;
    tree: Tree<Skill>;
    coord: { cx: number; cy: number };
    selectedNode: string | null;
    treeAccentColor: string;
}) {
    const { cx, cy } = coord;

    const letterToRender = tree.data.name[0];

    const textWidth = nodeLetterFont.getTextWidth(letterToRender);

    const textX = useSpring(cx - textWidth / 2, CANVAS_SPRING);
    const textY = useSpring(cy + getHeightForFont(20) / 4 + 1, CANVAS_SPRING);

    return (
        <Text
            x={textX}
            y={textY}
            text={letterToRender}
            font={nodeLetterFont}
            color={tree.data.isCompleted ? treeAccentColor : tree.data.id === selectedNode ? "white" : colors.unmarkedText}
        />
    );
}

export default Node;
