import { CIRCLE_SIZE, colors } from "@/parameters";
import { Picture, SkCanvas, SkFont, Skia, createPicture } from "@shopify/react-native-skia";
import { useMemo } from "react";
import { CanvasDimensions, CartesianCoordinate, ColorGradient, NodeCoordinate, SelectedNodeId } from "../../../types";
import { getTextCoordinates } from "./useHandleNodeAnimatedCoordinates";

const strokeWidth = 2;
const outerPathRadius = CIRCLE_SIZE + strokeWidth;

function NodeList({
    nodeCoordinates,
    settings,
    rootNode,
    treeCompletedPercentage,
    selectedNodeId,
    fonts,
    canvasDimensions,
}: {
    nodeCoordinates: NodeCoordinate[];
    rootNode: NodeCoordinate;
    settings: { oneColorPerTree: boolean; showIcons: boolean };
    treeCompletedPercentage: number;
    selectedNodeId: SelectedNodeId;
    canvasDimensions: CanvasDimensions;
    fonts: { nodeLetterFont: SkFont; emojiFont: SkFont };
}) {
    const { emojiFont, nodeLetterFont } = fonts;

    const { oneColorPerTree, showIcons } = settings;

    const picture = useMemo(
        () =>
            createPicture({ x: 0, y: 0, width: canvasDimensions.canvasWidth, height: canvasDimensions.canvasHeight }, (canvas) => {
                const backgroundPaint = Skia.Paint();
                backgroundPaint.setColor(Skia.Color(colors.background));

                const userNodeColor = Skia.Paint();
                userNodeColor.setColor(Skia.Color(colors.green));

                const grayColor = Skia.Paint();
                grayColor.setColor(Skia.Color(colors.line));

                for (const nodeCoordinate of nodeCoordinates) {
                    if (nodeCoordinate.category === "SKILL") plotSkillNode(canvas, nodeCoordinate, canvasDimensions, fonts);
                    // if (nodeCoordinate.category === "SKILL_TREE") plotSkillNode(canvas, nodeCoordinate, canvasDimensions);
                    // if (nodeCoordinate.category === "USER") plotSkillNode(canvas, nodeCoordinate, canvasDimensions);
                }
            }),
        [nodeCoordinates, canvasDimensions]
    );

    return <Picture picture={picture} />;
}

function plotSkillNode(
    canvas: SkCanvas,
    node: NodeCoordinate,
    canvasDimensions: CanvasDimensions,
    fonts: { nodeLetterFont: SkFont; emojiFont: SkFont }
) {
    const backgroundPaint = Skia.Paint();
    backgroundPaint.setColor(Skia.Color(colors.background));
    const outerEdge = Skia.Path.Make();

    const grayColor = Skia.Paint();
    grayColor.setColor(Skia.Color(colors.line));

    outerEdge.addCircle(node.x, node.y, CIRCLE_SIZE);

    outerEdge.stroke({ width: strokeWidth });

    canvas.drawPath(outerEdge, grayColor);

    const gradient: ColorGradient = node.data.isCompleted ? node.accentColor : { color1: "#515053", color2: "#2C2C2D", label: "" };
    //Completed indicator outer edge
    const svg = getCircularPathSvgWithGradient(
        { center: { x: node.x, y: node.y }, gradient, radius: CIRCLE_SIZE, strokeWidth: strokeWidth },
        canvasDimensions
    );

    canvas.drawSvg(svg);

    const textColor = Skia.Paint();
    textColor.setColor(Skia.Color("#515053"));

    const text = node.data.icon.isEmoji ? node.data.icon.text : node.data.name[0];

    const font = node.data.icon.isEmoji ? fonts.emojiFont : fonts.nodeLetterFont;

    const { x: textX, y: textY } = getTextCoordinates({ x: node.x, y: node.y }, getTextWidth(text, node.data.icon.isEmoji, font));

    canvas.drawText(text, textX, textY, textColor, font);
}

export default NodeList;

function getCircularPathSvgWithGradient(
    props: { gradient: ColorGradient; center: CartesianCoordinate; strokeWidth: number; radius: number },
    canvasDimensions: CanvasDimensions
) {
    const { center, gradient, radius, strokeWidth } = props;
    const svg = Skia.SVG.MakeFromString(
        `<svg viewBox='0 0 ${canvasDimensions.canvasWidth} ${canvasDimensions.canvasHeight}' xmlns='http://www.w3.org/2000/svg'>
                <defs>
                    <linearGradient id='grad1' x1='0%' y1='0%' x2='100%' y2='100%'>
                        <stop offset='0%' style='stop-color:${gradient.color1};stop-opacity:1' />
                        <stop offset='100%' style='stop-color:${gradient.color2};stop-opacity:1' />
                    </linearGradient>
                </defs>
                <circle cx='${center.x}px' cy='${center.y}px' r='${radius + strokeWidth}px' stroke='url(#grad1)' stroke-width='${strokeWidth}'/>
            </svg>`
    )!;

    return svg;
}

function getTextWidth(text: string, isEmoji: boolean, font: SkFont) {
    if (isEmoji) return font.getTextWidth(text);
    if (!isEmoji) return font.getTextWidth(text.toUpperCase());

    return 0;
}
