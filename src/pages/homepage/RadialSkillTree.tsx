import { Fragment, useEffect } from "react";
import { colors } from "../../parameters";
import { CoordinatesWithTreeData, CartesianCoordinate, ParentId } from "../../types";
import HierarchicalCanvasPath from "../viewingSkillTree/canvas/HierarchicalCanvasPath";
import Label from "../viewingSkillTree/canvas/Label";
import Node from "../viewingSkillTree/canvas/Node";
import { useSharedValue, withSpring } from "react-native-reanimated";
import { mix, useComputedValue, useSharedValueEffect, useValue } from "@shopify/react-native-skia";
import RadialLabel from "../viewingSkillTree/canvas/RadialLabel";
import RadialCanvasPath from "../viewingSkillTree/canvas/RadialCanvasPath";
import { removeTreeDataFromCoordinate } from "../viewingSkillTree/canvas/coordinateFunctions";

type TreeProps = {
    nodeCoordinatesCentered: CoordinatesWithTreeData[];
    selectedNode: string | null;
};

function RadialSkillTree({ nodeCoordinatesCentered, selectedNode }: TreeProps) {
    const nodeCoordinates = removeTreeDataFromCoordinate(nodeCoordinatesCentered);

    return (
        <>
            {nodeCoordinatesCentered.map((node, idx) => {
                return <RadialLabel key={idx} text={node.data.name} color={node.accentColor} coord={{ cx: node.x, cy: node.y }} />;
            })}

            {nodeCoordinatesCentered.map((node, idx) => {
                const parentNode = nodeCoordinatesCentered.find((n) => n.nodeId === node.parentId);

                if (!parentNode) return <Fragment key={idx}></Fragment>;

                let parentCoord: CartesianCoordinate = { x: parentNode.x, y: parentNode.y };

                const pathColor = parentNode.data.isCompleted ? node.accentColor : colors.line;
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

            {nodeCoordinatesCentered.map((node) => (
                <RenderNode key={`${node.nodeId}_node`} node={node} selectedNode={selectedNode} />
            ))}
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
            text={{ color: textColor, letter: node.data.name[0] }}
        />
    );
}
