import { StaticRadialPathList } from "@/components/treeRelated/radial/StaticRadialCanvasPath";
import { SkFont } from "@shopify/react-native-skia";
import { Fragment, memo } from "react";
import { SharedValue } from "react-native-reanimated";
import StaticNodeList from "../../components/treeRelated/general/StaticNodeList";
import RadialLabel from "../../components/treeRelated/radial/RadialLabel";
import { CanvasDimensions, NodeCoordinate } from "../../types";
import { SkiaAppFonts } from "app/_layout";

type TreeProps = {
    allNodes: NodeCoordinate[];
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
    fonts: SkiaAppFonts;
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

function HomepageSkillTree({ allNodes, settings, drag, fonts, canvasDimensions }: TreeProps) {
    const { labelFont } = fonts;

    const rootNode = allNodes.find((n) => n.level === 0);

    if (!rootNode) return <></>;

    return (
        <>
            <StaticRadialPathList allNodes={allNodes} staticNodes={allNodes} canvasDimensions={canvasDimensions} />

            {settings.showLabel && <LabelList font={labelFont} nodeCoordinates={allNodes} />}

            <StaticNodeList
                fonts={fonts}
                allNodes={allNodes}
                staticNodes={allNodes}
                settings={{ oneColorPerTree: settings.oneColorPerTree, showIcons: settings.showIcons }}
                canvasDimensions={canvasDimensions}
            />
        </>
    );
}

export default HomepageSkillTree;
