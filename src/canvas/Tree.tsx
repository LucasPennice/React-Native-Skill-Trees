import { createBezierPathBetweenPoints, getChildCoordinatesFromParentInfo } from "./functions";
import { useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { Canvas, Circle, mix, Path, TouchInfo, useSharedValueEffect, useTouchHandler, useValue } from "@shopify/react-native-skia";
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

function Tree({ tree, parentNodeInfo, selectedNode, rootCoordinates }: TreeProps) {
    const defaultParentInfo = parentNodeInfo ?? {
        coordinates: { x: rootCoordinates.width, y: rootCoordinates.height },
        numberOfChildren: 1,
        currentChildIndex: 0,
    };
    const currentNodeCoordintes = getChildCoordinatesFromParentInfo(parentNodeInfo ?? defaultParentInfo);

    let newParentNodeInfo = { coordinates: currentNodeCoordintes, numberOfChildren: tree.children ? tree.children.length : 0 };

    const scale = useValue(1);
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withRepeat(withTiming(1, { duration: 3000 }), -1, true);
    }, [progress]);

    useSharedValueEffect(() => {
        scale.current = mix(progress.value, CIRCLE_SIZE, CIRCLE_SIZE * 1.4);
    }, progress); // you can pass other shared values as extra parameters

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
                    strokeWidth={2}
                />
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

                const isSelected = selectedNode === tree.node.id;

                return (
                    <Circle
                        cx={currentNodeCoordintes.x}
                        cy={currentNodeCoordintes.y - CIRCLE_SIZE / 2}
                        r={isSelected ? scale : CIRCLE_SIZE}
                        color="cyan"
                    />
                );
            })()}
        </>
    );
}
export default Tree;
