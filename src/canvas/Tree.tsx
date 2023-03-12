import { createBezierPathBetweenPoints, getChildCoordinatesFromParentInfo } from "./functions";
import { useSharedValue, withRepeat, withSpring, withTiming } from "react-native-reanimated";
import { Blur, Canvas, Circle, mix, Path, TouchInfo, useSharedValueEffect, useTouchHandler, useValue } from "@shopify/react-native-skia";
import { Book, TreeNode } from "../types";
import { CIRCLE_SIZE } from "./parameters";
import { useEffect } from "react";
import { circlePositionsInCanvas } from "./CanvasTest";

type TreeProps = {
    tree: TreeNode<Book>;
    parentNodeInfo?: { coordinates: { x: number; y: number }; numberOfChildren: number; currentChildIndex: number };
    selectedNode: string | null;
    rootCoordinates?: { width: number; height: number };
};

export const CIRCLE_SIZE_SELECTED = CIRCLE_SIZE * 3;

function Tree({ tree, parentNodeInfo, selectedNode, rootCoordinates }: TreeProps) {
    const defaultParentInfo = parentNodeInfo ?? {
        coordinates: { x: rootCoordinates.width, y: rootCoordinates.height },
        numberOfChildren: 1,
        currentChildIndex: 0,
    };
    const currentNodeCoordintes = getChildCoordinatesFromParentInfo(parentNodeInfo ?? defaultParentInfo);

    let newParentNodeInfo = { coordinates: currentNodeCoordintes, numberOfChildren: tree.children ? tree.children.length : 0 };

    const scale = useValue(CIRCLE_SIZE);
    const blur = useValue(0);
    const pathBlur = useValue(0);
    const isActive = useSharedValue(0);
    const isBlurred = useSharedValue(0);
    const isPathBlurred = useSharedValue(0);

    useEffect(() => {
        const shouldActivate = selectedNode === tree.node.id;
        const shouldBlur = selectedNode !== tree.node.id && selectedNode !== null;
        const shouldBlurPath = selectedNode !== null;

        isActive.value = withSpring(shouldActivate ? 1 : 0, { damping: 18, stiffness: 300 });
        isBlurred.value = withTiming(shouldBlur ? 1 : 0, { duration: 0.15 });
        isPathBlurred.value = withTiming(shouldBlurPath ? 1 : 0, { duration: 150 });
    }, [isActive, isPathBlurred, isBlurred, selectedNode]);

    useSharedValueEffect(() => {
        scale.current = mix(isActive.value, CIRCLE_SIZE, CIRCLE_SIZE_SELECTED);
    }, isActive);

    useSharedValueEffect(() => {
        blur.current = mix(isBlurred.value, 0, 4);
    }, isBlurred);

    useSharedValueEffect(() => {
        pathBlur.current = mix(isPathBlurred.value, 0, 4);
    }, isPathBlurred);

    return (
        <>
            {!tree.isRoot && (
                <Path
                    path={createBezierPathBetweenPoints(
                        parentNodeInfo ? parentNodeInfo.coordinates : defaultParentInfo.coordinates,
                        currentNodeCoordintes
                    )}
                    color="lightblue"
                    style="stroke"
                    strokeCap={"round"}
                    strokeWidth={2}>
                    <Blur blur={pathBlur} />
                </Path>
            )}
            {/* Recursive fucntion that renders the rest of the tree */}
            {tree.children &&
                tree.children.map((element, idx) => {
                    return (
                        <Tree
                            key={idx}
                            tree={element}
                            parentNodeInfo={{ ...newParentNodeInfo, currentChildIndex: idx }}
                            selectedNode={selectedNode}
                        />
                    );
                })}
            {(() => {
                circlePositionsInCanvas.push({ x: currentNodeCoordintes.x, y: currentNodeCoordintes.y - CIRCLE_SIZE / 2, id: tree.node.id });

                return (
                    <>
                        <Circle cx={currentNodeCoordintes.x} cy={currentNodeCoordintes.y - CIRCLE_SIZE / 2} r={scale} color="cyan">
                            <Blur blur={blur} />
                        </Circle>
                    </>
                );
            })()}
        </>
    );
}
export default Tree;
