import { SkFont } from "@shopify/react-native-skia";
import { Fragment, memo, useMemo } from "react";
import { SharedValue } from "react-native-reanimated";
import Node, { CanvasNodeData } from "../../components/treeRelated/general/Node";
import RadialCanvasPath from "../../components/treeRelated/radial/RadialCanvasPath";
import RadialLabel from "../../components/treeRelated/radial/RadialLabel";
import { completedSkillPercentageFromCoords } from "../../functions/extractInformationFromTree";
import { getLabelTextColor } from "../../functions/misc";
import { CartesianCoordinate, CoordinatesWithTreeData, SelectedNodeId } from "../../types";

type TreeProps = {
    nodeCoordinatesCentered: CoordinatesWithTreeData[];
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

const PathList = memo(function PathList({ nodeCoordinates }: { nodeCoordinates: CoordinatesWithTreeData[] }) {
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
    nodeCoordinates: CoordinatesWithTreeData[];
    rootNode: CoordinatesWithTreeData;
    font: SkFont;
}) {
    const rootCoordinate = { x: rootNode.x, y: rootNode.y };

    return nodeCoordinates.map((node, idx) => {
        if (node.isRoot) return <Fragment key={idx}></Fragment>;

        return (
            <RadialLabel
                key={idx}
                labelFont={font}
                text={node.nodeId.slice(0, 5)}
                // text={node.data.name}
                coord={{ x: node.x, y: node.y }}
                rootCoord={rootCoordinate}
            />
        );
    });
});

function useGetTreeCompletePercetage(nodeCoordinates: CoordinatesWithTreeData[], rootId?: string) {
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

    //Passive effects with everything BUT nodes commented out is 57

    return (
        <>
            {/* 24 */}
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

function NodeList({
    nodeCoordinates,
    settings,
    rootNode,
    treeCompletedPercentage,
    selectedNodeId,
    fonts,
}: {
    nodeCoordinates: CoordinatesWithTreeData[];
    rootNode: CoordinatesWithTreeData;
    settings: { oneColorPerTree: boolean; showIcons: boolean };
    treeCompletedPercentage: number;
    selectedNodeId: SelectedNodeId;
    fonts: { nodeLetterFont: SkFont; emojiFont: SkFont };
}) {
    const { emojiFont, nodeLetterFont } = fonts;

    const { oneColorPerTree, showIcons } = settings;

    return nodeCoordinates.map((node) => {
        const isSelected = node.nodeId === selectedNodeId;

        const accentColor = oneColorPerTree ? rootNode.accentColor : node.accentColor;
        const font = node.data.icon.isEmoji ? emojiFont : nodeLetterFont;

        const textColor = getLabelTextColor(accentColor.color1);

        const text = {
            color: textColor,
            isEmoji: node.data.icon.isEmoji,
            letter: node.data.icon.isEmoji ? node.data.icon.text : node.data.name[0],
        };

        const nodeData: CanvasNodeData = {
            isComplete: node.data.isCompleted,
            coord: { cx: node.x, cy: node.y },
            treeAccentColor: accentColor,
            text,
            category: node.category,
        };

        const currentTreeCompletedPercentage =
            node.category === "USER"
                ? treeCompletedPercentage
                : node.category === "SKILL"
                ? 0
                : completedSkillPercentageFromCoords(nodeCoordinates, node.treeId);

        const state = { font, treeCompletedPercentage: currentTreeCompletedPercentage, isSelected, showIcons: showIcons };

        return <Node state={state} key={`${node.nodeId}_node`} nodeData={nodeData} nodeDrag={undefined} />;
    });
}

export default RadialSkillTree;
