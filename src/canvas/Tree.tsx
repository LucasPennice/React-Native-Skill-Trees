import { createBezierPathBetweenPoints, getChildCoordinatesFromParentInfo } from "./functions";
import { Blur, Box, Circle, Group, LinearGradient, Path, vec, rect, rrect } from "@shopify/react-native-skia";
import { Book, TreeNode } from "../types";
import { CIRCLE_SIZE } from "./parameters";
import { circlePositionsInCanvas } from "./CanvasTest";
import useHandleTreeAnimations from "./useHandleTreeAnimations";
import { current } from "@reduxjs/toolkit";

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

    const { circleBlur, pathBlur, innerCircleRadius, outerCircleRadius, pathTrim, scale } = useHandleTreeAnimations(
        selectedNode,
        tree,
        currentNodeCoordintes
    );

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

                const cx = currentNodeCoordintes.x;
                const cy = currentNodeCoordintes.y - CIRCLE_SIZE / 2;

                return (
                    <Group origin={{ x: currentNodeCoordintes.x, y: currentNodeCoordintes.y }} transform={scale}>
                        <Path path={getPathForCircle(cx, cy, CIRCLE_SIZE)} style="stroke" strokeWidth={8} color="black" />
                        <Path
                            path={getPathForCircle(currentNodeCoordintes.x, currentNodeCoordintes.y, CIRCLE_SIZE * 1.2)}
                            style="stroke"
                            strokeWidth={15}
                            color="black"
                            end={pathTrim}
                        />
                        <Circle cx={cx} cy={cy} r={CIRCLE_SIZE} color="#4070F5"></Circle>
                        <Blur blur={circleBlur} />
                    </Group>
                );
            })()}
        </>
    );
}
export default Tree;

function getPathForCircle(cx: number, cy: number, r: number) {
    return `M ${cx} ${cy} m ${-r}, 0 a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 ${-(r * 2)},0`;
}
