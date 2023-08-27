import { SkFont } from "@shopify/react-native-skia";
import { NodeCoordinate, SelectedNodeId } from "../../../types";
import { getLabelTextColor } from "../../../functions/misc";
import Node, { CanvasNodeData } from "./Node";
import { completedSkillPercentageFromCoords } from "../../../functions/extractInformationFromTree";

function NodeList({
    nodeCoordinates,
    settings,
    rootNode,
    treeCompletedPercentage,
    selectedNodeId,
    fonts,
}: {
    nodeCoordinates: NodeCoordinate[];
    rootNode: NodeCoordinate;
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

export default NodeList;
