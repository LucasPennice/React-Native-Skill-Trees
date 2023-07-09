import { Blur, Group, SkFont, SkiaMutableValue } from "@shopify/react-native-skia";
import { ColorGradient, NodeCategory } from "../../../types";
import { NodeProps, SkillNode, SkillTreeNode, UserNode } from "./NodeCategories";
import useHandleAnimationOnSelect from "./useHandleAnimationOnSelect";
import useHandleNodeAnimatedCoordinates from "./useHandleNodeAnimatedCoordinates";

export type CanvasNodeData = {
    isComplete: boolean;
    coord: { cx: number; cy: number };
    treeAccentColor: ColorGradient;
    text: { color: string; letter: string; isEmoji: boolean };
    category: NodeCategory;
    nodeId: string;
};

function Node({
    nodeData,
    circleBlurOnInactive,
    state,
}: {
    state: {
        font: SkFont;
        treeCompletedPercentage: number;
        selectedNodeId: string | null;
        showIcons: boolean;
    };
    circleBlurOnInactive?: SkiaMutableValue<number>;
    nodeData: CanvasNodeData;
}) {
    const { category, coord, isComplete, text, treeAccentColor, nodeId } = nodeData;
    const { font, treeCompletedPercentage, selectedNodeId, showIcons } = state;

    const { cx, cy } = coord;

    const { path, textX, textY, x, y } = useHandleNodeAnimatedCoordinates(coord, text, font);

    const { groupTransform, blur } = useHandleAnimationOnSelect(selectedNodeId, nodeId);

    const nodeIcon = text.isEmoji ? text.letter : text.letter.toUpperCase();

    //Node Props
    const textCoordinates = { textX, textY };
    const animatedCoordinates = { x, y };
    const nodeState: NodeProps = { accentColor: treeAccentColor, animatedCoordinates, font, text: nodeIcon, textCoordinates, showIcons };

    return (
        <Group origin={{ x: cx, y: cy }} transform={groupTransform} opacity={circleBlurOnInactive ?? 1}>
            {category === "SKILL" && <SkillNode nodeState={nodeState} isComplete={isComplete} path={path} />}

            {category === "SKILL_TREE" && (
                <SkillTreeNode nodeState={nodeState} isComplete={isComplete} path={path} treeCompletedPercentage={treeCompletedPercentage} />
            )}

            {category === "USER" && <UserNode nodeState={nodeState} textColor={text.color} treeCompletedPercentage={treeCompletedPercentage} />}

            <Blur blur={blur} />
        </Group>
    );
}

export default Node;
