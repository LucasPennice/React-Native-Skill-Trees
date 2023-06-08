import { useFont } from "@shopify/react-native-skia";
import { Fragment } from "react";
import { removeTreeDataFromCoordinate } from "../../components/treeRelated/coordinateFunctions";
import Node, { CanvasNodeData } from "../../components/treeRelated/general/Node";
import RadialCanvasPath from "../../components/treeRelated/radial/RadialCanvasPath";
import RadialLabel from "../../components/treeRelated/radial/RadialLabel";
import { completedSkillPercentageFromCoords } from "../../functions/extractInformationFromTree";
import { getLabelTextColor } from "../../functions/misc";
import { colors } from "../../parameters";
import { CartesianCoordinate, CoordinatesWithTreeData } from "../../types";

type TreeProps = {
    nodeCoordinatesCentered: CoordinatesWithTreeData[];
    selectedNode: string | null;
    settings: {
        showLabel: boolean;
        oneColorPerTree: boolean;
    };
};

function RadialSkillTree({ nodeCoordinatesCentered, selectedNode, settings }: TreeProps) {
    const labelFont = useFont(require("../../../assets/Helvetica.ttf"), 12);
    const nodeLetterFont = useFont(require("../../../assets/Helvetica.ttf"), 17);
    const emojiFont = useFont(require("../../../assets/NotoEmoji-Regular.ttf"), 17);

    const rootNode = nodeCoordinatesCentered.find((n) => n.level === 0);
    if (!rootNode) return <></>;
    if (!labelFont || !nodeLetterFont || !emojiFont) return <></>;

    const nodeCoordinates = removeTreeDataFromCoordinate(nodeCoordinatesCentered);
    const rootCoordinates = { x: rootNode!.x, y: rootNode!.y };
    const treeCompletedPercentage = completedSkillPercentageFromCoords(nodeCoordinatesCentered, rootNode.treeId);

    return (
        <>
            {nodeCoordinatesCentered.map((node, idx) => {
                const parentNode = nodeCoordinatesCentered.find((n) => n.nodeId === node.parentId);

                if (!parentNode) return <Fragment key={idx}></Fragment>;

                let parentCoord: CartesianCoordinate = { x: parentNode.x, y: parentNode.y };

                const nodeColor = settings.oneColorPerTree ? rootNode!.accentColor : node.accentColor;
                const pathColor = parentNode.data.isCompleted ? nodeColor.color1 : colors.line;
                return (
                    <RadialCanvasPath
                        key={`${node.nodeId}_path`}
                        coordinates={{ cx: node.x, cy: node.y, pathInitialPoint: parentCoord }}
                        isRoot={node.isRoot}
                        pathColor={pathColor}
                        nodeCoordinatesCentered={nodeCoordinates}
                    />
                );
            })}

            {settings.showLabel &&
                nodeCoordinatesCentered.map((node, idx) => {
                    if (node.isRoot) return <Fragment key={idx}></Fragment>;

                    const rectColor = settings.oneColorPerTree ? rootNode!.accentColor : node.accentColor;
                    const labelTextColor = getLabelTextColor(rectColor.color1);

                    return (
                        <RadialLabel
                            key={idx}
                            text={node.data.name}
                            color={{ rect: rectColor.color1, text: labelTextColor }}
                            coord={{ x: node.x, y: node.y }}
                            rootCoord={rootCoordinates}
                        />
                    );
                })}
            {nodeCoordinatesCentered.map((node) => {
                const accentColor = settings.oneColorPerTree ? rootNode!.accentColor : node.accentColor;
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
                        : completedSkillPercentageFromCoords(nodeCoordinatesCentered, node.treeId);

                const state = { font, treeCompletedPercentage: currentTreeCompletedPercentage, selectedNodeId: selectedNode };

                return <Node state={state} key={`${node.nodeId}_node`} nodeData={nodeData} />;
            })}
        </>
    );
}

export default RadialSkillTree;
