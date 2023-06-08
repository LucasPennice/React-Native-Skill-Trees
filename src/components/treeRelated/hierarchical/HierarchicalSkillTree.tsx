import { useFont } from "@shopify/react-native-skia";
import { Fragment } from "react";
import { getLabelTextColor } from "../../../functions/misc";
import { colors } from "../../../parameters";
import { CartesianCoordinate, CoordinatesWithTreeData } from "../../../types";
import Label from "../general/Label";
import Node, { CanvasNodeData } from "../general/Node";
import HierarchicalCanvasPath from "./HierarchicalCanvasPath";

type TreeProps = {
    nodeCoordinatesCentered: CoordinatesWithTreeData[];
    selectedNode: string | null;
    showLabel: boolean;
};

function HierarchicalSkillTree({ nodeCoordinatesCentered, selectedNode, showLabel }: TreeProps) {
    const rootNode = nodeCoordinatesCentered.find((n) => n.level === 0);
    const labelTextColor = getLabelTextColor(rootNode!.accentColor.color1);

    const nodeLetterFont = useFont(require("../../../../assets/Helvetica.ttf"), 17);
    const emojiFont = useFont(require("../../../../assets/NotoEmoji-Regular.ttf"), 17);

    if (!nodeLetterFont || !emojiFont) return <></>;

    return (
        <>
            {nodeCoordinatesCentered.map((node, idx) => {
                const parentNode = nodeCoordinatesCentered.find((n) => n.nodeId === node.parentId);

                if (!parentNode) return <Fragment key={idx}></Fragment>;

                let parentCoord: CartesianCoordinate = { x: parentNode.x, y: parentNode.y };

                const pathColor = parentNode.data.isCompleted ? node.accentColor.color1 : colors.line;

                return (
                    <HierarchicalCanvasPath
                        key={`${node.nodeId}_path`}
                        coordinates={{ cx: node.x, cy: node.y, pathInitialPoint: parentCoord }}
                        isRoot={node.isRoot}
                        pathColor={pathColor}
                    />
                );
            })}

            {showLabel &&
                nodeCoordinatesCentered.map((node, idx) => {
                    return (
                        <Label
                            key={idx}
                            text={node.data.name}
                            color={{ rect: node.accentColor.color1, text: labelTextColor }}
                            coord={{ cx: node.x, cy: node.y }}
                        />
                    );
                })}
            {nodeCoordinatesCentered.map((node) => {
                const font = node.data.icon.isEmoji ? emojiFont : nodeLetterFont;
                const textColor = node.data.isCompleted ? node.accentColor.color1 : colors.unmarkedText;
                const text = {
                    color: textColor,
                    isEmoji: node.data.icon.isEmoji,
                    letter: node.data.icon.isEmoji ? node.data.icon.text : node.data.name[0],
                };

                const nodeData: CanvasNodeData = {
                    isComplete: node.data.isCompleted,
                    coord: { cx: node.x, cy: node.y },
                    treeAccentColor: node.accentColor,
                    text,
                    category: node.category,
                    nodeId: node.nodeId,
                };

                return <Node key={`${node.nodeId}_node`} font={font} selectedNodeId={selectedNode} nodeData={nodeData} />;
            })}
        </>
    );
}

export default HierarchicalSkillTree;
