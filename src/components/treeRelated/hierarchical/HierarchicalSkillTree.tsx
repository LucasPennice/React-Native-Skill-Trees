import { CIRCLE_SIZE } from "@/parameters";
import { Picture, SkFont, Skia, createPicture } from "@shopify/react-native-skia";
import { SkiaAppFonts } from "app/_layout";
import { Fragment, memo, useMemo } from "react";
import { SharedValue } from "react-native-reanimated";
import { CanvasDimensions, CartesianCoordinate, InitialAndFinalCoord, NodeCoordinate, ReactiveNodeCoordinate } from "../../../types";
import ReactiveNodeList from "../general/ReactiveNodeList";
import StaticNodeList from "../general/StaticNodeList";
import useHandleReactiveAndStaticNodeList from "../hooks/useHandleReactiveAndStaticNodeList";
import HierarchicalCanvasPath from "./HierarchicalCanvasPath";
import HierarchicalLabel from "./HierarchicalLabel";

type TreeProps = {
    nodeCoordinatesCentered: NodeCoordinate[];
    canvasDimensions: CanvasDimensions;
    settings: {
        showLabel: boolean;
        showIcons: boolean;
    };
    drag: {
        x: SharedValue<number>;
        y: SharedValue<number>;
        nodesToDragId: string[];
    };
    fonts: SkiaAppFonts;
};

const ReactiveHierarchicalPathList = memo(function ReactiveHierarchicalPathList({
    nodeCoordinates,
    reactiveNodes,
}: {
    nodeCoordinates: NodeCoordinate[];
    reactiveNodes: ReactiveNodeCoordinate[];
}) {
    return reactiveNodes.map((node, idx) => {
        let parentNode: ReactiveNodeCoordinate | NodeCoordinate | undefined = undefined;

        parentNode = reactiveNodes.find((n) => n.nodeId === node.parentId);

        if (!parentNode) parentNode = nodeCoordinates.find((n) => n.nodeId === node.parentId);

        if (!parentNode) return <Fragment key={idx}></Fragment>;

        let pathInitialPoint: InitialAndFinalCoord = {
            finalCoordinates: { x: parentNode.x, y: parentNode.y },
            //@ts-ignore
            initialCoordinates: { x: parentNode.initialCoordinates?.x ?? parentNode.x, y: parentNode.initialCoordinates?.y ?? parentNode.y },
        };

        let pathFinalPoint: InitialAndFinalCoord = {
            finalCoordinates: { x: node.x, y: node.y },
            //@ts-ignore
            initialCoordinates: { x: node.initialCoordinates?.x ?? node.x, y: node.initialCoordinates?.y ?? node.y },
        };

        return (
            <HierarchicalCanvasPath
                key={`${node.nodeId}_path`}
                color={node.data.isCompleted ? node.accentColor.color1 : "#1C1C1D"}
                pathFinalPoint={pathFinalPoint}
                pathInitialPoint={pathInitialPoint}
                isRoot={node.isRoot}
            />
        );
    });
});

const StaticHierarchicalPathList = memo(function StaticHierarchicalPathList({
    nodeCoordinates,
    staticNodes,
    canvasDimensions,
}: {
    nodeCoordinates: NodeCoordinate[];
    staticNodes: NodeCoordinate[];
    canvasDimensions: CanvasDimensions;
}) {
    const picture = useMemo(
        () =>
            createPicture((canvas) => {
                const paint = Skia.Paint();
                paint.setColor(Skia.Color("#1C1C1D"));

                const complete = Skia.Paint();
                complete.setColor(Skia.Color(`${nodeCoordinates[0].accentColor.color1}`));

                for (const nodeCoordinate of staticNodes) {
                    if (nodeCoordinate.isRoot) continue;

                    const parentOfNode = nodeCoordinates.find((node) => node.nodeId === nodeCoordinate.parentId);

                    if (!parentOfNode) continue;

                    const { c, m } = getHierarchicalPath(nodeCoordinate, parentOfNode);

                    const path = Skia.Path.Make();

                    path.moveTo(m.x, m.y);

                    path.cubicTo(c.x1, c.y1, c.x2, c.y2, c.x, c.y);

                    path.stroke({ width: 2 });

                    canvas.drawPath(path, nodeCoordinate.data.isCompleted ? complete : paint);
                }
            }),
        [nodeCoordinates, staticNodes, canvasDimensions]
    );

    return <Picture picture={picture} />;
});

export function getHierarchicalPath<T extends CartesianCoordinate>(node: T, parentNode: T) {
    return {
        m: { x: node.x, y: node.y - CIRCLE_SIZE },
        c: {
            x1: node.x,
            y1: node.y - 0.87 * (node.y - parentNode.y),
            x2: parentNode.x,
            y2: parentNode.y - 0.43 * (parentNode.y - node.y),
            x: parentNode.x,
            y: parentNode.y + CIRCLE_SIZE,
        },
    };
}

const LabelList = memo(function LabelList({ nodeCoordinates, font }: { nodeCoordinates: NodeCoordinate[]; font: SkFont }) {
    return nodeCoordinates.map((node, idx) => {
        if (node.isRoot) return <Fragment key={idx}></Fragment>;

        return <HierarchicalLabel key={idx} font={font} text={node.data.name} coord={{ cx: node.x, cy: node.y }} />;
    });
});

function HierarchicalSkillTree({ nodeCoordinatesCentered, settings, drag, fonts, canvasDimensions }: TreeProps) {
    const { emojiFont, labelFont, nodeLetterFont } = fonts;

    const { reactiveNodes, staticNodes } = useHandleReactiveAndStaticNodeList(nodeCoordinatesCentered, undefined);

    const rootNode = nodeCoordinatesCentered.find((n) => n.level === 0);
    if (!rootNode) return <></>;

    const { showIcons, showLabel } = settings;

    return (
        <>
            <ReactiveHierarchicalPathList nodeCoordinates={nodeCoordinatesCentered} reactiveNodes={reactiveNodes} />

            <StaticHierarchicalPathList nodeCoordinates={nodeCoordinatesCentered} staticNodes={staticNodes} canvasDimensions={canvasDimensions} />

            {showLabel && <LabelList font={labelFont} nodeCoordinates={nodeCoordinatesCentered} />}

            <ReactiveNodeList
                fonts={{ emojiFont, nodeLetterFont }}
                allNodes={nodeCoordinatesCentered}
                reactiveNodes={reactiveNodes}
                settings={{ oneColorPerTree: true, showIcons }}
            />

            <StaticNodeList
                fonts={fonts}
                allNodes={nodeCoordinatesCentered}
                staticNodes={staticNodes}
                settings={{ oneColorPerTree: true, showIcons }}
                canvasDimensions={canvasDimensions}
            />
        </>
    );
}

export default memo(HierarchicalSkillTree, arePropsEqual);

function arePropsEqual(prevProps: TreeProps, nextProps: TreeProps): boolean {
    if (JSON.stringify(prevProps.canvasDimensions) !== JSON.stringify(nextProps.canvasDimensions)) return false;
    // if (JSON.stringify(prevProps.drag) !== JSON.stringify(nextProps.drag)) return false;
    if (JSON.stringify(prevProps.settings) !== JSON.stringify(nextProps.settings)) return false;
    if (prevProps.nodeCoordinatesCentered.length !== nextProps.nodeCoordinatesCentered.length) return false;

    for (let i = 0; i < prevProps.nodeCoordinatesCentered.length; i++) {
        const prevPropsNode = prevProps.nodeCoordinatesCentered[i];
        const nextPropsNode = nextProps.nodeCoordinatesCentered[i];
        if (prevPropsNode.nodeId !== nextPropsNode.nodeId) return false;

        if (prevPropsNode.x !== nextPropsNode.x) return false;
        if (prevPropsNode.y !== nextPropsNode.y) return false;
        if (JSON.stringify(prevPropsNode.data) !== JSON.stringify(nextPropsNode.data)) return false;
        if (prevPropsNode.data.isCompleted !== nextPropsNode.data.isCompleted) return false;
        if (prevPropsNode.accentColor !== nextPropsNode.accentColor) return false;
        if (prevPropsNode.treeName !== nextPropsNode.treeName) return false;
        if (prevPropsNode.level !== nextPropsNode.level) return false;
        if (prevPropsNode.parentId !== nextPropsNode.parentId) return false;
    }

    return true;
}
