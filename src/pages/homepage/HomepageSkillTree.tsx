import { StaticRadialPathList } from "@/components/treeRelated/radial/StaticRadialCanvasPath";
import { SkFont } from "@shopify/react-native-skia";
import { Fragment, memo } from "react";
import { SharedValue } from "react-native-reanimated";
import StaticNodeList from "../../components/treeRelated/general/StaticNodeList";
import RadialLabel from "../../components/treeRelated/radial/RadialLabel";
import { CanvasDimensions, NodeCoordinate } from "../../types";

type TreeProps = {
    reactiveNodes: NodeCoordinate[];
    staticNodes: NodeCoordinate[];
    allNodes: NodeCoordinate[];
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

const LabelList = memo(function LabelList({ nodeCoordinates, font }: { nodeCoordinates: NodeCoordinate[]; font: SkFont }) {
    const rootNode = nodeCoordinates.find((n) => n.level === 0);
    if (!rootNode) throw new Error("undefined rootNode at ReactiveNodeList");

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

function HomepageSkillTree({ allNodes, reactiveNodes, staticNodes, selectedNode, settings, drag, fonts, canvasDimensions }: TreeProps) {
    const { emojiFont, labelFont, nodeLetterFont } = fonts;

    const rootNode = allNodes.find((n) => n.level === 0);

    if (!rootNode) return <></>;

    return (
        <>
            <StaticRadialPathList allNodes={allNodes} staticNodes={allNodes} canvasDimensions={canvasDimensions} />

            {settings.showLabel && <LabelList font={labelFont} nodeCoordinates={allNodes} />}

            <StaticNodeList
                fonts={{ emojiFont, nodeLetterFont }}
                allNodes={allNodes}
                staticNodes={staticNodes}
                settings={{ oneColorPerTree: settings.oneColorPerTree, showIcons: settings.showIcons }}
                canvasDimensions={canvasDimensions}
            />
        </>
    );
}

export default HomepageSkillTree;
