import { SkFont } from "@shopify/react-native-skia";
import { completedSkillTreeTable } from "../../../functions/extractInformationFromTree";
import { getLabelTextColor } from "../../../functions/misc";
import { NodeCoordinate, ReactiveNodeCoordinate } from "../../../types";
import ReactiveNode, { CanvasNodeData } from "./ReactiveNode";

function ReactiveNodeList({
    allNodes,
    settings,
    reactiveNodes,
    fonts,
}: {
    allNodes: NodeCoordinate[];
    reactiveNodes: ReactiveNodeCoordinate[] | NodeCoordinate[];
    settings: { oneColorPerTree: boolean; showIcons: boolean };
    fonts: { nodeLetterFont: SkFont; emojiFont: SkFont };
}) {
    const rootNode = allNodes.find((n) => n.level === 0);
    if (!rootNode) throw new Error("undefined rootNode at ReactiveNodeList");

    const treeCompletionTable = completedSkillTreeTable(allNodes);

    const { emojiFont, nodeLetterFont } = fonts;

    const { oneColorPerTree, showIcons } = settings;

    return reactiveNodes.map((node) => {
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
            //@ts-ignore
            initialCoordinates: { x: node.initialCoordinates.x ?? node.x, y: node.initialCoordinates.y ?? node.y },
            finalCoordinates: { x: node.x, y: node.y },
            treeAccentColor: accentColor,
            text,
            category: node.category,
        };

        let currentTreeCompletedPercentage = 0;

        switch (node.category) {
            case "SKILL":
                currentTreeCompletedPercentage = node.data.isCompleted ? 100 : 0;
                break;
            case "SKILL_TREE":
                if (!treeCompletionTable[node.treeId]) throw new Error("undefined treeCompletionTable[node.treeId] at ReactiveNodeList");
                currentTreeCompletedPercentage = treeCompletionTable[node.treeId]!.percentage;
                break;
            case "USER":
                currentTreeCompletedPercentage = 100;
                break;
            default:
                break;
        }

        const state = { font, treeCompletedPercentage: currentTreeCompletedPercentage, showIcons: showIcons };

        return <ReactiveNode state={state} key={`${node.nodeId}_node`} nodeData={nodeData} nodeDrag={undefined} />;
    });
}

export default ReactiveNodeList;
