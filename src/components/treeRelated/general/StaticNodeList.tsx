import { completedSkillTreeTable } from "@/functions/extractInformationFromTree";
import { getLabelTextColor } from "@/functions/misc";
import { CIRCLE_SIZE, colors } from "@/parameters";
import { Dictionary } from "@reduxjs/toolkit";
import { Picture, SkCanvas, SkFont, Skia, createPicture } from "@shopify/react-native-skia";
import { useMemo } from "react";
import { CanvasDimensions, CartesianCoordinate, ColorGradient, NodeCoordinate } from "../../../types";
import { getTextCoordinates } from "./useHandleNodeAnimatedCoordinates";

const strokeWidth = 2;

type Props = {
    allNodes: NodeCoordinate[];
    staticNodes: NodeCoordinate[];
    settings: { oneColorPerTree: boolean; showIcons: boolean };
    canvasDimensions: CanvasDimensions;
    fonts: { nodeLetterFont: SkFont; emojiFont: SkFont };
};

type PaintProps = {
    canvasDimensions: Props["canvasDimensions"];
    fonts: Props["fonts"];
    settings: Props["settings"];
    rootColor: ColorGradient;
};

function StaticNodeList({ allNodes, staticNodes, settings, fonts, canvasDimensions }: Props) {
    const { oneColorPerTree, showIcons } = settings;

    const rootNode = allNodes.find((node) => node.isRoot);

    if (!rootNode) throw new Error("rootNode undefined at StaticNodeList");

    const rootColor = rootNode.accentColor;

    const picture = useMemo(() => {
        const treeCompletionTable = completedSkillTreeTable(allNodes);

        const paintProps: PaintProps = { canvasDimensions, fonts, rootColor, settings };

        return createPicture({ x: 0, y: 0, width: canvasDimensions.canvasWidth, height: canvasDimensions.canvasHeight }, (canvas) => {
            for (const nodeCoordinate of staticNodes) {
                if (nodeCoordinate.category === "SKILL") paintSkillNode(canvas, nodeCoordinate, paintProps);
                if (nodeCoordinate.category === "SKILL_TREE") paintSkillTreeNode(canvas, nodeCoordinate, paintProps, treeCompletionTable);
                if (nodeCoordinate.category === "USER") paintUserNode(canvas, nodeCoordinate, paintProps);
            }
        });
    }, [staticNodes, allNodes, canvasDimensions, oneColorPerTree, showIcons]);

    return <Picture picture={picture} />;
}

function paintSkillNode(canvas: SkCanvas, node: NodeCoordinate, props: PaintProps) {
    const { canvasDimensions, fonts, settings, rootColor } = props;

    const backgroundPaint = Skia.Paint();
    backgroundPaint.setColor(Skia.Color(colors.background));
    const outerEdge = Skia.Path.Make();

    const grayColor = Skia.Paint();
    grayColor.setColor(Skia.Color(colors.line));

    outerEdge.addCircle(node.x, node.y, CIRCLE_SIZE);

    outerEdge.stroke({ width: strokeWidth });

    canvas.drawPath(outerEdge, grayColor);

    const accentColor = settings.oneColorPerTree ? rootColor : node.accentColor;

    const gradient: ColorGradient = node.data.isCompleted ? accentColor : { color1: "#515053", color2: "#2C2C2D", label: "" };
    //Completed indicator outer edge
    const svg = getCircularPathSvgWithGradient(
        { center: { x: node.x, y: node.y }, gradient, radius: CIRCLE_SIZE, strokeWidth: strokeWidth },
        canvasDimensions
    );

    canvas.drawSvg(svg);

    if (settings.showIcons) {
        const textColor = Skia.Paint();
        textColor.setColor(Skia.Color("#515053"));

        const text = node.data.icon.isEmoji ? node.data.icon.text : node.data.name[0];

        const font = node.data.icon.isEmoji ? fonts.emojiFont : fonts.nodeLetterFont;

        const { x: textX, y: textY } = getTextCoordinates({ x: node.x, y: node.y }, getTextWidth(text, node.data.icon.isEmoji, font));

        canvas.drawText(text, textX, textY, textColor, font);
    }
}

function paintSkillTreeNode(
    canvas: SkCanvas,
    node: NodeCoordinate,
    props: PaintProps,
    treeCompletionTable: Dictionary<{
        qty: number;
        completedQty: number;
        percentage: number;
    }>
) {
    const { canvasDimensions, fonts, settings, rootColor } = props;

    const backgroundPaint = Skia.Paint();
    backgroundPaint.setColor(Skia.Color(colors.background));

    canvas.drawCircle(node.x, node.y, CIRCLE_SIZE, backgroundPaint);

    const completionPercentage = treeCompletionTable[node.treeId]!.percentage;

    const grayColor = Skia.Paint();
    grayColor.setColor(Skia.Color(colors.line));

    const outerEdge = getCircularPathSvgWithGradient(
        {
            center: { x: node.x, y: node.y },
            gradient: { color1: "#515053", color2: "#2C2C2D", label: "" },
            radius: CIRCLE_SIZE,
            strokeWidth: 2,
            pathString: `fill-opacity='0'`,
        },
        canvasDimensions
    );

    canvas.drawSvg(outerEdge);

    const accentColor = settings.oneColorPerTree ? rootColor : node.accentColor;

    //Completed indicator outer edge
    const completionOuterEdge = getCircularPathSvgWithGradient(
        {
            center: { x: node.x, y: node.y },
            gradient: accentColor,
            radius: CIRCLE_SIZE,
            strokeWidth: strokeWidth,
            pathString: `stroke-dasharray='${2 * Math.PI * CIRCLE_SIZE}' fill-opacity='0' stroke-dashoffset='${
                2 * Math.PI * CIRCLE_SIZE - (2 * Math.PI * CIRCLE_SIZE * completionPercentage) / 100
            }'`,
        },
        canvasDimensions
    );

    canvas.drawSvg(completionOuterEdge);

    if (settings.showIcons) {
        const textColor = Skia.Paint();
        textColor.setColor(Skia.Color(node.accentColor.color1));

        const text = (node.data.icon.isEmoji ? node.data.icon.text : node.data.name[0]).toUpperCase();

        const font = node.data.icon.isEmoji ? fonts.emojiFont : fonts.nodeLetterFont;

        const { x: textX, y: textY } = getTextCoordinates({ x: node.x, y: node.y }, getTextWidth(text, node.data.icon.isEmoji, font));

        canvas.drawText(text, textX, textY, textColor, font);
    }
}

function paintUserNode(canvas: SkCanvas, node: NodeCoordinate, props: PaintProps) {
    const { canvasDimensions, fonts, settings } = props;

    const backgroundPaint = Skia.Paint();
    backgroundPaint.setColor(Skia.Color(colors.background));
    const outerEdge = Skia.Path.Make();

    const grayColor = Skia.Paint();
    grayColor.setColor(Skia.Color(colors.line));

    canvas.drawPath(outerEdge, grayColor);

    //Completed indicator outer edge
    const svg = getCircularPathSvgWithGradient(
        {
            center: { x: node.x, y: node.y },
            gradient: node.accentColor,
            radius: CIRCLE_SIZE,
            strokeWidth: strokeWidth,
            pathString: "fill='url(#grad1)'",
        },
        canvasDimensions
    );

    canvas.drawSvg(svg);

    if (settings.showIcons) {
        const highContrastTextColor = getLabelTextColor(node.accentColor.color1);

        const textColor = Skia.Paint();
        textColor.setColor(Skia.Color(highContrastTextColor));

        const text = node.data.icon.isEmoji ? node.data.icon.text : node.data.name[0];

        const font = node.data.icon.isEmoji ? fonts.emojiFont : fonts.nodeLetterFont;

        const { x: textX, y: textY } = getTextCoordinates({ x: node.x, y: node.y }, getTextWidth(text, node.data.icon.isEmoji, font));

        canvas.drawText(text, textX, textY, textColor, font);
    }
}

export default StaticNodeList;

function getCircularPathSvgWithGradient(
    props: { gradient: ColorGradient; center: CartesianCoordinate; strokeWidth: number; radius: number; pathString?: string },
    canvasDimensions: CanvasDimensions
) {
    const { center, gradient, radius, strokeWidth, pathString = "" } = props;
    const svg = Skia.SVG.MakeFromString(
        `<svg viewBox='0 0 ${canvasDimensions.canvasWidth} ${canvasDimensions.canvasHeight}' xmlns='http://www.w3.org/2000/svg'>
                <defs>
                    <linearGradient id='grad1' x1='0%' y1='0%' x2='100%' y2='100%'>
                        <stop offset='0%' style='stop-color:${gradient.color1};stop-opacity:1' />
                        <stop offset='100%' style='stop-color:${gradient.color2};stop-opacity:1' />
                    </linearGradient>
                </defs>
                <path stroke-linecap='round' d="M${center.x} ${center.y} m ${radius}, 0
                a ${radius},${radius} 0 1,0 ${-(radius * 2)},0
                a ${radius},${radius} 0 1,0  ${radius * 2},0" stroke='url(#grad1)' stroke-width='${strokeWidth}' ${pathString}/>
           
        </svg>`
    )!;

    return svg;
}

function getTextWidth(text: string, isEmoji: boolean, font: SkFont) {
    if (isEmoji) return font.getTextWidth(text);
    if (!isEmoji) return font.getTextWidth(text.toUpperCase());

    return 0;
}
