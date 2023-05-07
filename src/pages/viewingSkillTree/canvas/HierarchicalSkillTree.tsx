import { Fragment, useEffect } from "react";
import { colors } from "../../../parameters";
import { CoordinatesWithTreeData, CartesianCoordinate, ParentId } from "../../../types";
import HierarchicalCanvasPath from "./HierarchicalCanvasPath";
import Label from "./Label";
import Node from "./Node";
import { useSharedValue, withSpring } from "react-native-reanimated";
import { mix, useComputedValue, useSharedValueEffect, useValue } from "@shopify/react-native-skia";

type TreeProps = {
    nodeCoordinatesCentered: CoordinatesWithTreeData[];
    selectedNode: string | null;
};

function HierarchicalSkillTree({ nodeCoordinatesCentered, selectedNode }: TreeProps) {
    return (
        <>
            {nodeCoordinatesCentered.map((node, idx) => {
                const parentNode = nodeCoordinatesCentered.find((n) => n.nodeId === node.parentId);

                if (!parentNode) return <Fragment key={idx}></Fragment>;

                let parentCoord: CartesianCoordinate = { x: parentNode.x, y: parentNode.y };

                const pathColor = parentNode.data.isCompleted ? node.accentColor : colors.line;

                return (
                    <HierarchicalCanvasPath
                        key={`${node.nodeId}_path`}
                        coordinates={{ cx: node.x, cy: node.y, pathInitialPoint: parentCoord }}
                        isRoot={node.isRoot}
                        pathColor={pathColor}
                    />
                );
            })}

            {nodeCoordinatesCentered.map((node, idx) => {
                return (
                    <Label
                        key={idx}
                        treeAccentColor={node.accentColor}
                        text={node.data.name}
                        color={node.accentColor}
                        coord={{ cx: node.x, cy: node.y }}
                    />
                );
            })}
            {nodeCoordinatesCentered.map((node) => {
                const { groupTransform } = useAnimationsOnSelect(selectedNode, node.nodeId);

                const textColor = node.data.isCompleted ? node.accentColor : colors.unmarkedText;

                return (
                    <Node
                        groupTransform={groupTransform}
                        key={`${node.nodeId}_node`}
                        isComplete={node.data.isCompleted}
                        treeAccentColor={node.accentColor}
                        coord={{ cx: node.x, cy: node.y }}
                        text={{ color: textColor, letter: node.data.name[0] }}
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

export default HierarchicalSkillTree;
