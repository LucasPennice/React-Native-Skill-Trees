import NodeView from "@/components/NodeView";
import { exitSelectedNode } from "@/constants/reanimatedAnimations";
import { completedSkillTreeTable } from "@/functions/extractInformationFromTree";
import { renderScaleForNodeActionMenu } from "@/functions/misc";
import { CIRCLE_SIZE_SELECTED, NODE_ICON_FONT_SIZE } from "@/parameters";
import { ColorGradient, NodeCoordinate } from "@/types";
import Animated, { ZoomIn } from "react-native-reanimated";

function SelectedNodeView({
    scale,
    allNodes,
    selectedNodeCoordinates,
    settings,
    rootColor,
}: {
    scale: number;
    settings: { oneColorPerTree: boolean; showIcons: boolean };
    allNodes: NodeCoordinate[];
    selectedNodeCoordinates: NodeCoordinate;
    rootColor: ColorGradient;
}) {
    const size = 2.1 * CIRCLE_SIZE_SELECTED;

    const treeCompletionTable = completedSkillTreeTable(allNodes);

    const completePercentage =
        selectedNodeCoordinates.category === "SKILL_TREE"
            ? treeCompletionTable[selectedNodeCoordinates.treeId]!.percentage
            : selectedNodeCoordinates.data.isCompleted
            ? 100
            : 0;

    return (
        <Animated.View
            entering={ZoomIn.duration(350).springify().overshootClamping(1)}
            exiting={exitSelectedNode}
            style={{
                position: "absolute",
                opacity: 1,
                top: selectedNodeCoordinates.y - size / 2,
                left: selectedNodeCoordinates.x - size / 2,
                transform: [{ scale: renderScaleForNodeActionMenu(scale) }],
            }}>
            <NodeView
                params={{
                    completePercentage,
                    oneColorPerTree: settings.oneColorPerTree,
                    rootColor,
                    showIcons: settings.showIcons,
                    size,
                    fontSize: 3 * NODE_ICON_FONT_SIZE,
                }}
                node={{
                    data: selectedNodeCoordinates.data,
                    accentColor: selectedNodeCoordinates.accentColor,
                    category: selectedNodeCoordinates.category,
                }}
            />
        </Animated.View>
    );
}

export default SelectedNodeView;
