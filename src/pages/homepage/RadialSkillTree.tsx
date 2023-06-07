import { mix, useComputedValue, useFont, useSharedValueEffect, useValue } from "@shopify/react-native-skia";
import { Fragment, useEffect } from "react";
import { useSharedValue, withSpring } from "react-native-reanimated";
import { removeTreeDataFromCoordinate } from "../../components/treeRelated/coordinateFunctions";
import Node from "../../components/treeRelated/general/Node";
import RadialCanvasPath from "../../components/treeRelated/radial/RadialCanvasPath";
import RadialLabel from "../../components/treeRelated/radial/RadialLabel";
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
    const nodeCoordinates = removeTreeDataFromCoordinate(nodeCoordinatesCentered);

    const rootNode = nodeCoordinatesCentered.find((n) => n.level === 0);
    const rootCoordinates = { x: rootNode!.x, y: rootNode!.y };

    const labelFont = useFont(require("../../../assets/Helvetica.ttf"), 12);
    const rootNodeCoordinates = nodeCoordinatesCentered.find((c) => c.level === 0);

    if (!rootNodeCoordinates) return <></>;
    if (!labelFont) return <></>;

    return (
        <>
            {nodeCoordinatesCentered.map((node, idx) => {
                const parentNode = nodeCoordinatesCentered.find((n) => n.nodeId === node.parentId);

                if (!parentNode) return <Fragment key={idx}></Fragment>;

                let parentCoord: CartesianCoordinate = { x: parentNode.x, y: parentNode.y };

                const nodeColor = settings.oneColorPerTree ? rootNode!.accentColor : node.accentColor;
                const pathColor = parentNode.data.isCompleted ? nodeColor : colors.line;
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

            {nodeCoordinatesCentered.map((node) => {
                const accentColor = settings.oneColorPerTree ? rootNode!.accentColor : node.accentColor;
                return <RenderNode key={`${node.nodeId}_node`} node={{ ...node, accentColor }} selectedNode={selectedNode} />;
            })}
            {settings.showLabel &&
                nodeCoordinatesCentered.map((node, idx) => {
                    if (node.isRoot) return <Fragment key={idx}></Fragment>;

                    const rectColor = settings.oneColorPerTree ? rootNode!.accentColor : node.accentColor;
                    const labelTextColor = getLabelTextColor(rectColor);

                    return (
                        <RadialLabel
                            key={idx}
                            text={node.data.name}
                            color={{ rect: rectColor, text: labelTextColor }}
                            coord={{ x: node.x, y: node.y }}
                            rootCoord={rootCoordinates}
                        />
                    );
                })}
        </>
    );
}

function useAnimationsOnSelect(selectedNode: string | null, nodeId: string) {
    const shouldTransform = useValue(0);

    const isActive = useSharedValue(0);

    useEffect(() => {
        const shouldActivate = selectedNode === nodeId;

        isActive.value = withSpring(shouldActivate ? 1 : 0, { damping: 18, stiffness: 300 });
    }, [selectedNode]);

    useSharedValueEffect(() => {
        shouldTransform.current = mix(isActive.value, 0, 1);
    }, isActive);

    const groupTransform = useComputedValue(() => [{ scale: mix(shouldTransform.current, 1, 3) }], [shouldTransform]);

    return { groupTransform };
}

export default RadialSkillTree;

//Necessary to avoid hooks bug
function RenderNode({ node, selectedNode }: { selectedNode: string | null; node: CoordinatesWithTreeData }) {
    const { groupTransform } = useAnimationsOnSelect(selectedNode, node.nodeId);

    const textColor = node.data.isCompleted ? node.accentColor : colors.unmarkedText;

    return (
        <Node
            groupTransform={groupTransform}
            isComplete={node.data.isCompleted}
            treeAccentColor={node.accentColor}
            coord={{ cx: node.x, cy: node.y }}
            category={node.category}
            text={{ color: textColor, isEmoji: node.data.icon.isEmoji, letter: node.data.icon.isEmoji ? node.data.icon.text : node.data.name[0] }}
        />
    );
}
