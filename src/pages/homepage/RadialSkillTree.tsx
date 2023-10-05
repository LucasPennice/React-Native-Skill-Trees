import { Picture, SkFont, Skia, createPicture } from "@shopify/react-native-skia";
import { Fragment, memo, useMemo } from "react";
import { SharedValue } from "react-native-reanimated";
import NodeList from "../../components/treeRelated/general/NodeList";
import RadialCanvasPath, { getCurvedPath } from "../../components/treeRelated/radial/RadialCanvasPath";
import RadialLabel, { getTextRotationAngle } from "../../components/treeRelated/radial/RadialLabel";
import { completedSkillPercentageFromCoords } from "../../functions/extractInformationFromTree";
import { CanvasDimensions, CartesianCoordinate, NodeCoordinate } from "../../types";

type TreeProps = {
    nodeCoordinatesCentered: NodeCoordinate[];
    selectedNode: string | null;
    canvasDimensions: CanvasDimensions;
    settings: {
        showLabel: boolean;
        oneColorPerTree: boolean;
        showIcons: boolean;
    };
    drag: {
        x: SharedValue<number>;
        y: SharedValue<number>;
        nodesToDragId: string[];
    };
    fonts: {
        labelFont: SkFont;
        nodeLetterFont: SkFont;
        emojiFont: SkFont;
    };
};

const PathList = memo(function PathList({
    nodeCoordinates,
    canvasDimensions,
}: {
    nodeCoordinates: NodeCoordinate[];
    canvasDimensions: CanvasDimensions;
}) {
    // Create picture
    const picture = useMemo(
        () =>
            createPicture({ x: 0, y: 0, width: canvasDimensions.canvasWidth, height: canvasDimensions.canvasHeight }, (canvas) => {
                const rootNodeCoordinates = nodeCoordinates.find((c) => c.level === 0);
                if (!rootNodeCoordinates) throw new Error("rootNodeCoordinates not found at PathList createPicture");

                const paint = Skia.Paint();
                paint.setColor(Skia.Color("#1C1C1D"));

                for (const nodeCoordinate of nodeCoordinates) {
                    if (nodeCoordinate.isRoot) continue;
                    const parentNode = nodeCoordinates.find((n) => n.nodeId === nodeCoordinate.parentId);

                    if (!parentNode) throw new Error("parentNode not found at PathList createPicture");

                    const p1x = nodeCoordinate.x;
                    const p1y = nodeCoordinate.y;

                    const centerOfNode = { x: p1x, y: p1y };

                    if (!rootNodeCoordinates) return <></>;
                    const { p: path } = getCurvedPath(rootNodeCoordinates, parentNode, centerOfNode);
                    path.stroke({ width: 2 });

                    canvas.drawPath(path, paint);
                }
            }),
        [nodeCoordinates, canvasDimensions]
    );

    return <Picture picture={picture} />;
});

const LabelList = memo(function LabelList({
    nodeCoordinates,
    rootNode,
    font,
}: {
    nodeCoordinates: NodeCoordinate[];
    rootNode: NodeCoordinate;
    font: SkFont;
}) {
    const rootCoordinate = { x: rootNode.x, y: rootNode.y };

    return nodeCoordinates.map((node, idx) => {
        if (node.isRoot) return <Fragment key={idx}></Fragment>;

        return (
            <RadialLabel
                key={idx}
                labelFont={font}
                // text={node.nodeId.slice(0, 5)}
                text={node.data.name}
                coord={{ x: node.x, y: node.y }}
                rootCoord={rootCoordinate}
            />
        );
    });
});

function useGetTreeCompletePercetage(nodeCoordinates: NodeCoordinate[], rootId?: string) {
    const result = useMemo(() => {
        if (rootId === undefined) return 0;

        return completedSkillPercentageFromCoords(nodeCoordinates, rootId);
    }, [nodeCoordinates, rootId]);

    return result;
}

function RadialSkillTree({ nodeCoordinatesCentered, selectedNode, settings, drag, fonts, canvasDimensions }: TreeProps) {
    const { emojiFont, labelFont, nodeLetterFont } = fonts;

    const rootNode = nodeCoordinatesCentered.find((n) => n.level === 0);

    const treeCompletedPercentage = useGetTreeCompletePercetage(nodeCoordinatesCentered, rootNode?.nodeId);

    if (!rootNode) return <></>;

    return (
        <>
            <PathList nodeCoordinates={nodeCoordinatesCentered} canvasDimensions={canvasDimensions} />

            {settings.showLabel && <LabelList font={labelFont} nodeCoordinates={nodeCoordinatesCentered} rootNode={rootNode} />}

            <NodeList
                fonts={{ emojiFont, nodeLetterFont }}
                nodeCoordinates={nodeCoordinatesCentered}
                settings={{ oneColorPerTree: settings.oneColorPerTree, showIcons: settings.showIcons }}
                selectedNodeId={selectedNode}
                canvasDimensions={canvasDimensions}
                treeCompletedPercentage={treeCompletedPercentage}
                rootNode={rootNode}
            />
        </>
    );
}

export default RadialSkillTree;
