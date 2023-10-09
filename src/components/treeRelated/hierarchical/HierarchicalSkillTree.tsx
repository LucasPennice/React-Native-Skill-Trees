import { SkFont } from "@shopify/react-native-skia";
import { Fragment, memo } from "react";
import { SharedValue } from "react-native-reanimated";
import { completedSkillPercentageFromCoords } from "../../../functions/extractInformationFromTree";
import { CanvasDimensions, CartesianCoordinate, NodeCoordinate } from "../../../types";
import ReactiveNodeList from "../general/ReactiveNodeList";
import HierarchicalCanvasPath from "./HierarchicalCanvasPath";
import HierarchicalLabel from "./HierarchicalLabel";

type TreeProps = {
    nodeCoordinatesCentered: NodeCoordinate[];
    selectedNode: string | null;
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

function HierarchicalSkillTree({ nodeCoordinatesCentered, selectedNode, settings, drag, fonts, canvasDimensions }: TreeProps) {
    const { emojiFont, labelFont, nodeLetterFont } = fonts;

    const rootNode = nodeCoordinatesCentered.find((n) => n.level === 0);
    if (!rootNode) return <></>;

    const { showIcons, showLabel } = settings;
    const treeCompletedPercentage = completedSkillPercentageFromCoords(nodeCoordinatesCentered, rootNode.treeId);

    return (
        <>
            <PathList nodeCoordinates={nodeCoordinatesCentered} />

            {showLabel && <LabelList font={labelFont} nodeCoordinates={nodeCoordinatesCentered} />}

            <ReactiveNodeList
                fonts={{ emojiFont, nodeLetterFont }}
                allNodes={nodeCoordinatesCentered}
                reactiveNodes={nodeCoordinatesCentered}
                settings={{ oneColorPerTree: true, showIcons }}
                selectedNodeId={selectedNode}
                treeCompletedPercentage={treeCompletedPercentage}
                rootNode={rootNode}
            />
        </>
    );
}

export default HierarchicalSkillTree;
