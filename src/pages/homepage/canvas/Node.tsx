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

    const shouldAnimate = false;

    const textColor = tree.data.isCompleted ? treeAccentColor : tree.data.id === selectedNode ? "white" : colors.unmarkedText;
    const letterToRender = tree.data.name ? tree.data.name[0] : "-";

    if (!nodeLetterFont) return <></>;

    if (shouldAnimate)
        return (
            <AnimatedNode
                circleBlurOnInactive={circleBlurOnInactive}
                coord={coord}
                currentNodeCoordintes={currentNodeCoordintes}
                groupTransform={groupTransform}
                letterToRender={letterToRender}
                nodeLetterFont={nodeLetterFont}
                textColor={textColor}
                treeAccentColor={treeAccentColor}>
                {/* @ts-ignore */}
                <Content />
            </AnimatedNode>
        );

    return (
        <UnanimatedNode
            circleBlurOnInactive={circleBlurOnInactive}
            coord={coord}
            currentNodeCoordintes={currentNodeCoordintes}
            groupTransform={groupTransform}
            letterToRender={letterToRender}
            nodeLetterFont={nodeLetterFont}
            textColor={textColor}
            treeAccentColor={treeAccentColor}>
            {/* @ts-ignore */}
            <Content />
        </UnanimatedNode>
    );
}

export default Node;

const AnimatedNode = ({
    children,
    circleBlurOnInactive,
    coord,
    currentNodeCoordintes,
    groupTransform,
    letterToRender,
    nodeLetterFont,
    textColor,
    treeAccentColor,
}: {
    children: JSX.Element;
    currentNodeCoordintes: { x: number; y: number };
    groupTransform: SkiaValue<{ scale: number }[]>;
    coord: { cx: number; cy: number };
    treeAccentColor: string;
    letterToRender: string;
    nodeLetterFont: SkFont;
    textColor: string;
    circleBlurOnInactive: SkiaValue<number>;
}) => {
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

    const textWidth = nodeLetterFont.getTextWidth(letterToRender);

    const textX = useSpring(cx - textWidth / 2, CANVAS_SPRING);
    const textY = useSpring(cy + getHeightForFont(20) / 4 + 1, CANVAS_SPRING);

    return cloneElement(children, {
        circleBlurOnInactive,
        coord: { cx: x, cy: y },
        currentNodeCoordintes,
        groupTransform,
        letterToRender,
        nodeLetterFont,
        path,
        text: { x: textX, y: textY },
        textColor,
        treeAccentColor,
    } as AnimatedContentProps & UnanimatedContentProps);
};

const UnanimatedNode = ({
    children,
    circleBlurOnInactive,
    coord,
    currentNodeCoordintes,
    groupTransform,
    letterToRender,
    nodeLetterFont,
    textColor,
    treeAccentColor,
}: {
    children: JSX.Element;
    currentNodeCoordintes: { x: number; y: number };
    groupTransform: SkiaValue<{ scale: number }[]>;
    coord: { cx: number; cy: number };
    treeAccentColor: string;
    letterToRender: string;
    nodeLetterFont: SkFont;
    textColor: string;
    circleBlurOnInactive: SkiaValue<number>;
}) => {
    const { cx, cy } = coord;

    const strokeWidth = 2;
    const radius = CIRCLE_SIZE + strokeWidth / 2;
    const path = Skia.Path.Make();

    path.moveTo(cx, cy);
    path.addCircle(cx, cy, radius);

    const textWidth = nodeLetterFont.getTextWidth(letterToRender);

    const textX = cx - textWidth / 2;
    const textY = cy + getHeightForFont(20) / 4 + 1;

    return cloneElement(children, {
        circleBlurOnInactive,
        coord: { cx, cy },
        currentNodeCoordintes,
        groupTransform,
        letterToRender,
        nodeLetterFont,
        path,
        text: { x: textX, y: textY },
        textColor,
        treeAccentColor,
    } as AnimatedContentProps & UnanimatedContentProps);
};

const Content = ({
    currentNodeCoordintes,
    groupTransform,
    path,
    text,
    coord,
    treeAccentColor,
    letterToRender,
    nodeLetterFont,
    circleBlurOnInactive,
    textColor,
}: AnimatedContentProps & UnanimatedContentProps) => {
    const { cx, cy } = coord;

    return (
        <Group origin={{ x: currentNodeCoordintes.x, y: currentNodeCoordintes.y }} transform={groupTransform}>
            <Path path={path} style="stroke" strokeWidth={2} color={colors.line} />
            <Path path={path} style="stroke" strokeCap={"round"} strokeWidth={2} color={treeAccentColor} />
            <Circle cx={cx} cy={cy} r={CIRCLE_SIZE} color={colors.background} />
            {/* Letter inside the node */}
            <Text x={text.x} y={text.y} text={letterToRender} font={nodeLetterFont} color={textColor} />
            <Blur blur={circleBlurOnInactive} />
        </Group>
    );
};

type AnimatedContentProps = {
    currentNodeCoordintes: { x: number; y: number };
    groupTransform: SkiaValue<{ scale: number }[]>;
    path: SkPath;
    text: { x: number; y: number };
    coord: { cx: number; cy: number };
    treeAccentColor: string;
    letterToRender: string;
    nodeLetterFont: SkFont;
    textColor: string;
    circleBlurOnInactive: SkiaValue<number>;
};

type UnanimatedContentProps = {
    currentNodeCoordintes: { x: number; y: number };
    groupTransform: SkiaValue<{ scale: number }[]>;
    path: SkiaValue<SkPath>;
    text: { x: SkiaValue<number>; y: SkiaValue<number> };
    coord: { cx: SkiaValue<number>; cy: SkiaValue<number> };
    treeAccentColor: string;
    letterToRender: string;
    nodeLetterFont: SkFont;
    textColor: string;
    circleBlurOnInactive: SkiaValue<number>;
};
