import { Blur, Group, SkFont } from "@shopify/react-native-skia";
import { memo } from "react";
import { SharedValue } from "react-native-reanimated";
import { ColorGradient, NodeCategory } from "../../../types";
import { NodeProps, SkillNode, SkillTreeNode, UserNode } from "./NodeCategories";
import useHandleGroupTransform from "./useHandleGroupTransform";
import useHandleNodeAnimatedCoordinates from "./useHandleNodeAnimatedCoordinates";

export type CanvasNodeData = {
    isComplete: boolean;
    coord: { cx: number; cy: number };
    treeAccentColor: ColorGradient;
    text: { color: string; letter: string; isEmoji: boolean };
    category: NodeCategory;
};

type Props = {
    state: {
        font: SkFont;
        treeCompletedPercentage: number;
        isSelected: boolean;
        showIcons: boolean;
    };
    nodeData: CanvasNodeData;
    nodeDrag:
        | {
              x: SharedValue<number>;
              y: SharedValue<number>;
              nodesToDragId: string[];
          }
        | undefined;
};

function Node({ nodeData, state, nodeDrag }: Props) {
    const { category, coord, isComplete, text, treeAccentColor } = nodeData;
    const { font, treeCompletedPercentage, isSelected, showIcons } = state;

    const { cx, cy } = coord;

    const { path, textX, textY, x, y } = useHandleNodeAnimatedCoordinates(coord, text, font);

    const { groupTransform, motionBlur } = useHandleGroupTransform(isSelected, nodeDrag);

    const nodeIcon = text.isEmoji ? text.letter : text.letter.toUpperCase();

    //Node Props
    const textCoordinates = { textX, textY };
    const animatedCoordinates = { x, y };
    const nodeState: NodeProps = { accentColor: treeAccentColor, animatedCoordinates, font, text: nodeIcon, textCoordinates, showIcons };

    return (
        <Group origin={{ x: cx, y: cy }} transform={groupTransform}>
            {category === "SKILL" && <SkillNode nodeState={nodeState} isComplete={isComplete} path={path} />}

            {category === "SKILL_TREE" && (
                <SkillTreeNode nodeState={nodeState} isComplete={isComplete} path={path} treeCompletedPercentage={treeCompletedPercentage} />
            )}

            {category === "USER" && <UserNode nodeState={nodeState} textColor={text.color} treeCompletedPercentage={treeCompletedPercentage} />}
            <Blur blur={motionBlur} />
        </Group>
    );
}

export default memo(Node, arePropsEqual);

function arePropsEqual(prevProps: Props, nextProps: Props): boolean {
    //We compare the nodeData object
    if (prevProps.state.isSelected !== nextProps.state.isSelected) return false;
    if (prevProps.nodeData.coord.cx !== nextProps.nodeData.coord.cx) return false;
    if (prevProps.nodeData.coord.cy !== nextProps.nodeData.coord.cy) return false;
    if (prevProps.state.treeCompletedPercentage !== nextProps.state.treeCompletedPercentage) return false;
    if (prevProps.nodeData.isComplete !== nextProps.nodeData.isComplete) return false;
    if (prevProps.nodeData.treeAccentColor !== nextProps.nodeData.treeAccentColor) return false;
    if (prevProps.state.showIcons !== nextProps.state.showIcons) return false;
    if (JSON.stringify(prevProps.nodeData.text) !== JSON.stringify(nextProps.nodeData.text)) return false;
    if (prevProps.nodeData.category !== nextProps.nodeData.category) return false;

    //☢️ I'M NOT COMPARING IF THE PREVPROPS FONT IS EQUAL TO THE NEXT PROPS FONT
    //OR THE DRAG, BECAUSE IT'S NOT IMPLEMENTED YET

    return true;
}
