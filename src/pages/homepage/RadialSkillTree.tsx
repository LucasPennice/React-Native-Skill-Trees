import { useFont } from "@shopify/react-native-skia";
import { Fragment } from "react";
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
};

function RadialSkillTree({ nodeCoordinatesCentered, selectedNode, settings, drag }: TreeProps) {
    const labelFont = useFont(require("../../../assets/Helvetica.ttf"), 12);
    const nodeLetterFont = useFont(require("../../../assets/Helvetica.ttf"), 17);
    const emojiFont = useFont(require("../../../assets/NotoEmoji-Regular.ttf"), 17);

    const rootNode = nodeCoordinatesCentered.find((n) => n.level === 0);
    if (!rootNode) return <></>;
    if (!labelFont || !nodeLetterFont || !emojiFont) return <></>;

    const treeCompletedPercentage = completedSkillPercentageFromCoords(nodeCoordinatesCentered, rootNode.treeId);

    return (
        <>
            <PathList nodeCoordinates={nodeCoordinatesCentered} />

            {settings.showLabel && (
                <LabelList nodeCoordinates={nodeCoordinatesCentered} oneColorPerTree={settings.oneColorPerTree} rootNode={rootNode} />
            )}

            <NodeList
                nodeCoordinates={nodeCoordinatesCentered}
                settings={{ oneColorPerTree: settings.oneColorPerTree, showIcons: settings.showIcons }}
                selectedNodeId={selectedNode}
                treeCompletedPercentage={treeCompletedPercentage}
                rootNode={rootNode}
            />
        </>
    );
}

function PathList({ nodeCoordinates }: { nodeCoordinates: CoordinatesWithTreeData[] }) {
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
}

function LabelList({
    nodeCoordinates,
    rootNode,
    oneColorPerTree,
}: {
    nodeCoordinates: CoordinatesWithTreeData[];
    rootNode: CoordinatesWithTreeData;
    oneColorPerTree: boolean;
}) {
    const rootCoordinate = { x: rootNode.x, y: rootNode.y };

    return nodeCoordinates.map((node, idx) => {
        if (node.isRoot) return <Fragment key={idx}></Fragment>;

        const rectColor = oneColorPerTree ? rootNode.accentColor : node.accentColor;
        const labelTextColor = getLabelTextColor(rectColor.color1);

        return (
            <RadialLabel
                key={idx}
                text={node.nodeId.slice(0, 5)}
                // text={node.data.name}
                color={{ rect: rectColor.color1, text: labelTextColor }}
                coord={{ x: node.x, y: node.y }}
                rootCoord={rootCoordinate}
            />
        );
    });
}

function NodeList({
    nodeCoordinates,
    settings,
    rootNode,
    treeCompletedPercentage,
    selectedNodeId,
}: {
    nodeCoordinates: CoordinatesWithTreeData[];
    rootNode: CoordinatesWithTreeData;
    settings: { oneColorPerTree: boolean; showIcons: boolean };
    treeCompletedPercentage: number;
    selectedNodeId: SelectedNodeId;
}) {
    const nodeLetterFont = useFont(require("../../../assets/Helvetica.ttf"), 17);
    const emojiFont = useFont(require("../../../assets/NotoEmoji-Regular.ttf"), 17);

    const { oneColorPerTree, showIcons } = settings;

    if (!nodeLetterFont || !emojiFont) return <></>;

    return nodeCoordinates.map((node) => {
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
            nodeId: node.nodeId,
        };

        const currentTreeCompletedPercentage =
            node.category === "USER"
                ? treeCompletedPercentage
                : node.category === "SKILL"
                ? 0
                : completedSkillPercentageFromCoords(nodeCoordinates, node.treeId);

        const state = { font, treeCompletedPercentage: currentTreeCompletedPercentage, selectedNodeId, showIcons: showIcons };

        // const nodeDrag = drag.nodesToDragId.includes(node.nodeId) ? drag : undefined;

        return <Node state={state} key={`${node.nodeId}_node`} nodeData={nodeData} nodeDrag={undefined} />;
    });
}

export default RadialSkillTree;
