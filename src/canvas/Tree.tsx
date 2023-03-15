import { createBezierPathBetweenPoints, getChildCoordinatesFromParentInfo } from "./functions";
import { Blur, Circle, Group, LinearGradient, Path, vec, Shadow, useFont, Text } from "@shopify/react-native-skia";
import { Book, TreeNode } from "../types";
import { CIRCLE_SIZE } from "./parameters";
import { CirclePositionInCanvas } from "./CanvasTest";
import useHandleTreeAnimations from "./useHandleTreeAnimations";
import { findDistanceBetweenNodesById } from "../treeFunctions";
import { useEffect } from "react";

type TreeProps = {
    tree: TreeNode<Book>;
    wholeTree: TreeNode<Book>;
    parentNodeInfo?: { coordinates: { x: number; y: number }; numberOfChildren: number; currentChildIndex: number };
    stateProps: {
        selectedNode: string | null;
        popCoordinateToArray: (coordinate: CirclePositionInCanvas) => void;
        showLabel: boolean;
    };
    rootCoordinates?: { width: number; height: number };
};

export const CIRCLE_SIZE_SELECTED = CIRCLE_SIZE * 3;

function Tree({ tree, parentNodeInfo, stateProps, rootCoordinates, wholeTree }: TreeProps) {
    const fontSize = 12;
    const font = useFont(require("../../assets/Poppins-Regular.otf"), fontSize);

    const defaultParentInfo = parentNodeInfo ?? {
        coordinates: { x: rootCoordinates.width, y: rootCoordinates.height },
        numberOfChildren: 1,
        currentChildIndex: 0,
    };

    const { popCoordinateToArray, selectedNode, showLabel } = stateProps;

    const currentNodeCoordintes = getChildCoordinatesFromParentInfo(parentNodeInfo ?? defaultParentInfo);

    const cx = currentNodeCoordintes.x;
    const cy = currentNodeCoordintes.y - CIRCLE_SIZE / 2;

    let newParentNodeInfo = { coordinates: currentNodeCoordintes, numberOfChildren: tree.children ? tree.children.length : 0 };

    const { circleBlurOnInactive, circleOpacity, connectingPathTrim, groupTransform, pathBlurOnInactive, pathTrim } = useHandleTreeAnimations(
        selectedNode,
        tree,
        findDistanceBetweenNodesById(wholeTree, tree.node.id)
    );

    return (
        <>
            {!tree.isRoot && (
                <Path
                    path={createBezierPathBetweenPoints(
                        parentNodeInfo ? parentNodeInfo.coordinates : defaultParentInfo.coordinates,
                        currentNodeCoordintes
                    )}
                    color="#5356573D"
                    style="stroke"
                    strokeCap={"round"}
                    strokeWidth={3}
                    end={connectingPathTrim}>
                    <Blur blur={pathBlurOnInactive} />
                </Path>
            )}
            {/* Recursive fucntion that renders the rest of the tree */}
            {tree.children &&
                tree.children.map((element, idx) => {
                    return (
                        <Tree
                            key={idx}
                            tree={element}
                            wholeTree={wholeTree}
                            parentNodeInfo={{ ...newParentNodeInfo, currentChildIndex: idx }}
                            stateProps={{ selectedNode, popCoordinateToArray, showLabel }}
                        />
                    );
                })}
            {(() => {
                useEffect(() => {
                    popCoordinateToArray({ x: currentNodeCoordintes.x, y: currentNodeCoordintes.y - CIRCLE_SIZE / 2, id: tree.node.id });
                }, []);

                return (
                    <>
                        <Group origin={{ x: currentNodeCoordintes.x, y: currentNodeCoordintes.y }} transform={groupTransform} opacity={circleOpacity}>
                            <Path path={getPathForCircle(cx, cy, CIRCLE_SIZE, 4)} style="stroke" strokeWidth={4} color="#F2F3F8">
                                <Shadow dx={0} dy={0} blur={3} color="#535657" />
                            </Path>
                            <Path
                                path={getPathForCircle(cx, cy, CIRCLE_SIZE, 4)}
                                style="stroke"
                                strokeCap={"round"}
                                strokeWidth={4}
                                color="green"
                                end={pathTrim}>
                                <LinearGradient
                                    start={vec(cx - CIRCLE_SIZE, cy - CIRCLE_SIZE)}
                                    end={vec(cx + CIRCLE_SIZE, cy + CIRCLE_SIZE)}
                                    colors={["#A5BDFF", "#4070F5"]}
                                />
                            </Path>
                            <Circle cx={cx} cy={cy} r={CIRCLE_SIZE} color="white"></Circle>
                            <Blur blur={circleBlurOnInactive} />
                        </Group>
                        {font && showLabel && (
                            <Group opacity={circleOpacity}>
                                <Text x={cx} y={cy + CIRCLE_SIZE + 25} text={tree.node.name} font={font} />
                                <Blur blur={pathBlurOnInactive} />
                            </Group>
                        )}
                    </>
                );
            })()}
        </>
    );
}
export default Tree;

function getPathForCircle(cx: number, cy: number, r: number, strokeWidth: number) {
    const radius = r + strokeWidth / 2;
    return `M ${cx - strokeWidth / 2} ${cy} m ${-r}, 0 a ${radius},${radius} 0 1,0 ${radius * 2},0 a ${radius},${radius} 0 1,0 ${-(radius * 2)},0`;
}
