import { completedSkillTreeTable } from "@/functions/extractInformationFromTree";
import { CIRCLE_SIZE, colors } from "@/parameters";
import { Dictionary } from "@reduxjs/toolkit";
import { Picture, SkCanvas, SkFont, Skia, createPicture } from "@shopify/react-native-skia";
import { SkiaAppFonts } from "app/_layout";
import { useMemo } from "react";
import { CanvasDimensions, CartesianCoordinate, ColorGradient, NodeCoordinate } from "../../../types";
import { getTextCoordinates } from "./useHandleNodeAnimatedCoordinates";

const strokeWidth = 2;

type Props = {
    allNodes: NodeCoordinate[];
    staticNodes: NodeCoordinate[];
    settings: { oneColorPerTree: boolean; showIcons: boolean };
    canvasDimensions: CanvasDimensions;
    fonts: SkiaAppFonts;
};

type PaintProps = {
    canvasDimensions: Props["canvasDimensions"];
    fonts: Props["fonts"];
    settings: Props["settings"];
    rootColor: ColorGradient;
};

const skiaBlack = Skia.Paint();
skiaBlack.setColor(Skia.Color(colors.background));

const skiaLine = Skia.Paint();
skiaLine.setColor(Skia.Color(colors.line));

export function StaticNodeList({ allNodes, staticNodes, settings, fonts, canvasDimensions }: Props) {
    const { oneColorPerTree, showIcons } = settings;

    const rootNode = allNodes.find((node) => node.isRoot);

    if (!rootNode) throw new Error("rootNode undefined at StaticNodeList");

    const rootColor = rootNode.accentColor;

    const picture = useMemo(() => {
        const treeCompletionTable = completedSkillTreeTable(allNodes);

        const paintProps: PaintProps = { canvasDimensions, fonts, rootColor, settings };

        return createPicture((canvas) => {
            for (const nodeCoordinate of staticNodes) {
                if (nodeCoordinate.category === "SKILL") paintSkillNode(canvas, nodeCoordinate, paintProps);
                if (nodeCoordinate.category === "SKILL_TREE") paintSkillTreeNode(canvas, nodeCoordinate, paintProps, treeCompletionTable);
                if (nodeCoordinate.category === "USER") paintUserNode(canvas, nodeCoordinate, paintProps);
            }
        });
    }, [staticNodes, allNodes, canvasDimensions, oneColorPerTree, showIcons]);

    return <Picture picture={picture} />;
}

export function paintSkillNode(canvas: SkCanvas, node: NodeCoordinate, props: PaintProps) {
    const { fonts, settings, rootColor } = props;

    const outerEdge = Skia.Path.Make();

    outerEdge.addCircle(node.x, node.y, CIRCLE_SIZE);

    outerEdge.stroke({ width: strokeWidth });

    canvas.drawPath(outerEdge, skiaLine);

    const accentColor = settings.oneColorPerTree ? rootColor.color1 : node.accentColor.color1;

    const color = node.data.isCompleted ? accentColor : "#515053";
    const completedPathPaintColor = Skia.Paint();
    completedPathPaintColor.setColor(Skia.Color(color));

    const svg = getCircularPathSvgWithGradient({ center: { x: node.x, y: node.y }, radius: CIRCLE_SIZE });

    if (svg) {
        svg.stroke({ width: strokeWidth });

        canvas.drawPath(svg, completedPathPaintColor);
    }

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
    const { fonts, settings, rootColor } = props;

    canvas.drawCircle(node.x, node.y, CIRCLE_SIZE, skiaBlack);

    const completionPercentage = treeCompletionTable[node.treeId]!.percentage;

    const path = getCircularPathSvgWithGradient({ center: { x: node.x, y: node.y }, radius: CIRCLE_SIZE });

    if (path) {
        path.stroke({ width: 2 });

        canvas.drawPath(path, skiaLine);
    }

    const accentColor = settings.oneColorPerTree ? rootColor.color1 : node.accentColor.color1;
    const completePathColor = Skia.Paint();
    completePathColor.setColor(Skia.Color(accentColor));
    //Completed indicator outer edge
    const completePath = getCircularPathSvgWithGradient({ center: { x: node.x, y: node.y }, radius: CIRCLE_SIZE });

    if (completePath) {
        completePath.trim(0, completionPercentage / 100, false);
        completePath.stroke({ width: 2 });

        canvas.drawPath(completePath, completePathColor);
    }

    if (settings.showIcons) {
        const textColor = Skia.Paint();
        textColor.setColor(Skia.Color(accentColor));

        const text = node.data.icon.isEmoji ? node.data.icon.text : node.data.name[0];

        const font = node.data.icon.isEmoji ? fonts.emojiFont : fonts.nodeLetterFont;

        const { x: textX, y: textY } = getTextCoordinates({ x: node.x, y: node.y }, getTextWidth(text, node.data.icon.isEmoji, font));

        canvas.drawText(text, textX, textY, textColor, font);
    }
}

function paintUserNode(canvas: SkCanvas, node: NodeCoordinate, props: PaintProps) {
    const { fonts, settings } = props;

    canvas.drawCircle(node.x, node.y, 1.5 * CIRCLE_SIZE, skiaBlack);

    const completeColor = Skia.Paint();
    completeColor.setColor(Skia.Color(node.accentColor.color1));

    const path = getCircularPathSvgWithGradient({ center: { x: node.x, y: node.y }, radius: 1.5 * CIRCLE_SIZE });

    if (path) {
        path.stroke({ width: strokeWidth });
        canvas.drawPath(path, completeColor);
    }

    if (settings.showIcons) {
        const textColor = Skia.Paint();
        textColor.setColor(Skia.Color(node.accentColor.color1));

        const text = node.data.icon.isEmoji ? node.data.icon.text : node.data.name[0];

        const font = node.data.icon.isEmoji ? fonts.userEmojiFont : fonts.nodeLetterFont;

        const { x: textX, y: textY } = getTextCoordinates({ x: node.x, y: node.y }, getTextWidth(text, node.data.icon.isEmoji, font));

        canvas.drawText(text, textX, textY, textColor, font);
    }
}

export default StaticNodeList;

export function getCircularPathSvgWithGradient(props: { center: CartesianCoordinate; radius: number }) {
    const { center, radius } = props;

    const svg = Skia.Path.MakeFromSVGString(
        `M${center.x} ${center.y} m ${radius}, 0
                a ${radius},${radius} 0 1,0 ${-(radius * 2)},0
                a ${radius},${radius} 0 1,0  ${radius * 2},0`
    );

    return svg;
}

export function getTextWidth(text: string, isEmoji: boolean, font: SkFont) {
    if (isEmoji) return font.getTextWidth(text);
    if (!isEmoji) return font.getTextWidth(text);

    return 0;
}
