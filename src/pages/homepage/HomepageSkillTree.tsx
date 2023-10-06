import { Picture, SkFont, Skia, createPicture } from "@shopify/react-native-skia";
import { Fragment, memo, useMemo } from "react";
import { SharedValue } from "react-native-reanimated";
import StaticNodeList from "../../components/treeRelated/general/StaticNodeList";
import { getCurvedPath } from "../../components/treeRelated/radial/RadialCanvasPath";
import RadialLabel from "../../components/treeRelated/radial/RadialLabel";
import { CanvasDimensions, NodeCoordinate } from "../../types";
import { StaticRadialPathList } from "@/components/treeRelated/radial/StaticRadialCanvasPath";

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

// function useGetTreeCompletePercetage(nodeCoordinates: NodeCoordinate[], rootId?: string) {
//     const result = useMemo(() => {
//         if (rootId === undefined) return 0;

//         return completedSkillPercentageFromCoords(nodeCoordinates, rootId);
//     }, [nodeCoordinates, rootId]);

//     return result;
// }

function HomepageSkillTree({ nodeCoordinatesCentered, selectedNode, settings, drag, fonts, canvasDimensions }: TreeProps) {
    const { emojiFont, labelFont, nodeLetterFont } = fonts;

    const rootNode = nodeCoordinatesCentered.find((n) => n.level === 0);

    // const treeCompletedPercentage = useGetTreeCompletePercetage(nodeCoordinatesCentered, rootNode?.nodeId);

    if (!rootNode) return <></>;

    return (
        <>
            <StaticRadialPathList nodeCoordinates={nodeCoordinatesCentered} canvasDimensions={canvasDimensions} />

            {settings.showLabel && <LabelList font={labelFont} nodeCoordinates={nodeCoordinatesCentered} rootNode={rootNode} />}

            <StaticNodeList
                fonts={{ emojiFont, nodeLetterFont }}
                nodeCoordinates={nodeCoordinatesCentered}
                settings={{ oneColorPerTree: settings.oneColorPerTree, showIcons: settings.showIcons }}
                canvasDimensions={canvasDimensions}
            />
        </>
    );
}

export default HomepageSkillTree;
