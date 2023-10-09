import { SkFont } from "@shopify/react-native-skia";
import { Fragment, memo } from "react";
import { SharedValue } from "react-native-reanimated";
import { CanvasDimensions, CartesianCoordinate, NodeCoordinate } from "../../../types";
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
    fonts: {
        labelFont: SkFont;
        nodeLetterFont: SkFont;
        emojiFont: SkFont;
    };
};

const PathList = memo(function PathList({ nodeCoordinates }: { nodeCoordinates: NodeCoordinate[] }) {
    return nodeCoordinates.map((node, idx) => {
        const parentNode = nodeCoordinates.find((n) => n.nodeId === node.parentId);

        if (!parentNode) return <Fragment key={idx}></Fragment>;

        let parentCoord: CartesianCoordinate = { x: parentNode.x, y: parentNode.y };

        return (
            <HierarchicalCanvasPath
                key={`${node.nodeId}_path`}
                coordinates={{ cx: node.x, cy: node.y, pathInitialPoint: parentCoord }}
                isRoot={node.isRoot}
            />
        );
    });
});

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
            <PathList nodeCoordinates={nodeCoordinatesCentered} />

            {showLabel && <LabelList font={labelFont} nodeCoordinates={nodeCoordinatesCentered} />}

            <ReactiveNodeList
                fonts={{ emojiFont, nodeLetterFont }}
                allNodes={nodeCoordinatesCentered}
                reactiveNodes={reactiveNodes}
                settings={{ oneColorPerTree: true, showIcons }}
            />

            <StaticNodeList
                fonts={{ emojiFont, nodeLetterFont }}
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
