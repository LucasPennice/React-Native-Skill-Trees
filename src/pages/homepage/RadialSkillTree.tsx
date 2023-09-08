import { SkFont } from "@shopify/react-native-skia";
import { Fragment, memo, useMemo } from "react";
import { SharedValue } from "react-native-reanimated";
import NodeList from "../../components/treeRelated/general/NodeList";
import RadialCanvasPath from "../../components/treeRelated/radial/RadialCanvasPath";
import RadialLabel from "../../components/treeRelated/radial/RadialLabel";
import { completedSkillPercentageFromCoords } from "../../functions/extractInformationFromTree";
import { CartesianCoordinate, NodeCoordinate } from "../../types";

type TreeProps = {
    nodeCoordinatesCentered: NodeCoordinate[];
    selectedNode: string | null;
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

const PathList = memo(function PathList({ nodeCoordinates }: { nodeCoordinates: NodeCoordinate[] }) {
    return nodeCoordinates.map((node, idx) => {
        const parentNode = nodeCoordinates.find((n) => n.nodeId === node.parentId);

        if (!parentNode) return <Fragment key={idx}></Fragment>;

        let parentCoord: CartesianCoordinate = { x: parentNode.x, y: parentNode.y };

        return (
            <RadialCanvasPath
                key={`${node.nodeId}_path`}
                coordinates={{ cx: node.x, cy: node.y, pathInitialPoint: parentCoord }}
                isRoot={node.isRoot}
                nodeCoordinates={nodeCoordinates}
            />
        );
    });
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
                //text={node.nodeId.slice(0, 5)}
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

function RadialSkillTree({ nodeCoordinatesCentered, selectedNode, settings, drag, fonts }: TreeProps) {
    const { emojiFont, labelFont, nodeLetterFont } = fonts;

    const rootNode = nodeCoordinatesCentered.find((n) => n.level === 0);

    const treeCompletedPercentage = useGetTreeCompletePercetage(nodeCoordinatesCentered, rootNode?.nodeId);

    if (!rootNode) return <></>;

    return (
        <>
            <PathList nodeCoordinates={nodeCoordinatesCentered} />

            {settings.showLabel && <LabelList font={labelFont} nodeCoordinates={nodeCoordinatesCentered} rootNode={rootNode} />}

            <NodeList
                fonts={{ emojiFont, nodeLetterFont }}
                nodeCoordinates={nodeCoordinatesCentered}
                settings={{ oneColorPerTree: settings.oneColorPerTree, showIcons: settings.showIcons }}
                selectedNodeId={selectedNode}
                treeCompletedPercentage={treeCompletedPercentage}
                rootNode={rootNode}
            />
        </>
    );
}

export default RadialSkillTree;
