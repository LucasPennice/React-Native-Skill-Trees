import { SkFont } from "@shopify/react-native-skia";
import { memo } from "react";
import { SharedValue } from "react-native-reanimated";
import { CartesianCoordinate, ColorGradient, NodeCategory } from "../../../types";
import { NodeProps, SkillNode, SkillTreeNode, UserNode } from "./NodeCategories";
import useHandleNodeAnimatedCoordinates from "./useHandleNodeAnimatedCoordinates";
import { SpringConfig } from "react-native-reanimated/lib/typescript/reanimated2/animation/springUtils";

export type CanvasNodeData = {
    isComplete: boolean;
    finalCoordinates: CartesianCoordinate;
    initialCoordinates: CartesianCoordinate;
    treeAccentColor: ColorGradient;
    text: { color: string; letter: string; isEmoji: boolean };
    category: NodeCategory;
};

type Props = {
    state: {
        font: SkFont;
        treeCompletedPercentage: number;
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
    springConfig?: SpringConfig;
};

function ReactiveNode({ nodeData, state, nodeDrag, springConfig }: Props) {
    const { category, finalCoordinates, initialCoordinates, isComplete, text, treeAccentColor } = nodeData;
    const { font, treeCompletedPercentage, showIcons } = state;

    const { path, textX, textY, x, y } = useHandleNodeAnimatedCoordinates(initialCoordinates, finalCoordinates, text, font, springConfig);

    const nodeIcon = text.isEmoji ? text.letter : text.letter;

    //ReactiveNode Props
    const textCoordinates = { textX, textY };
    const animatedCoordinates = { x, y };
    const nodeState: NodeProps = { accentColor: treeAccentColor, animatedCoordinates, font, text: nodeIcon, textCoordinates, showIcons };

    if (category === "SKILL") return <SkillNode nodeState={nodeState} isComplete={isComplete} path={path} />;
    if (category === "SKILL_TREE")
        return <SkillTreeNode nodeState={nodeState} isComplete={isComplete} path={path} treeCompletedPercentage={treeCompletedPercentage} />;
    return <UserNode nodeState={nodeState} textColor={text.color} treeCompletedPercentage={treeCompletedPercentage} />;
}

export default memo(ReactiveNode, arePropsEqual);

function arePropsEqual(prevProps: Props, nextProps: Props): boolean {
    //We compare the nodeData object
    if (prevProps.nodeData.finalCoordinates.x !== nextProps.nodeData.finalCoordinates.x) return false;
    if (prevProps.nodeData.finalCoordinates.y !== nextProps.nodeData.finalCoordinates.y) return false;
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
