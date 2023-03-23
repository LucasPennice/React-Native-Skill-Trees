import { createBezierPathBetweenPoints, getChildCoordinatesFromParentInfo, getHeightForFont } from "./functions";
import { Blur, Circle, Group, LinearGradient, Path, vec, Shadow, useFont, Text, RoundedRect } from "@shopify/react-native-skia";
import { Book, TreeNode } from "../types";
import { CIRCLE_SIZE } from "./parameters";
import { CirclePositionInCanvas } from "./CanvasTest";
import useHandleTreeAnimations from "./useHandleTreeAnimations";
import { findDistanceBetweenNodesById, findParentOfNode } from "../treeFunctions";
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
    const labelFont = useFont(require("../../assets/Poppins-Regular.otf"), 12);
    const nodeLetterFont = useFont(require("../../assets/Poppins-Regular.otf"), 20);

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

    useEffect(() => {
        popCoordinateToArray({ x: currentNodeCoordintes.x, y: currentNodeCoordintes.y - CIRCLE_SIZE / 2, id: tree.node.id });
    }, [wholeTree]);

    const { circleBlurOnInactive, circleOpacity, connectingPathTrim, groupTransform, pathBlurOnInactive, pathTrim, labelOpacity } =
        useHandleTreeAnimations(selectedNode, showLabel, tree, findDistanceBetweenNodesById(wholeTree, tree.node.id));

    const nodeAndParentCompleted = (() => {
        if (tree.node.isCompleted !== true) return false;

        const parentNode = findParentOfNode(wholeTree, tree.node.id);

        if (!parentNode) return false;

        if (parentNode.node.isCompleted !== true) return false;

        return true;
    })();

    return (
        <>
            {!tree.node.isRoot && (
                <Path
                    path={createBezierPathBetweenPoints(
                        parentNodeInfo ? parentNodeInfo.coordinates : defaultParentInfo.coordinates,
                        currentNodeCoordintes
                    )}
                    color={nodeAndParentCompleted ? "#5DD39E" : "#5356573D"}
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
                const labelMarginTop = 40;

                return (
                    <>
                        {labelFont &&
                            showLabel &&
                            (() => {
                                const text = tree.node.name;
                                const wordArr = text.split(" ");

                                const distanceBetweenWords = 14;
                                const fontSize = 12;
                                const horizontalPadding = 10;
                                const verticalPadding = 5;

                                const textHeight = wordArr.length * fontSize + (wordArr.length - 1) * (distanceBetweenWords - fontSize);

                                const rectangleDimentions = calculateRectangleDimentions(wordArr);

                                const rectX = cx - rectangleDimentions.width / 2 + 2;
                                const rectY = cy + labelMarginTop - fontSize / 4 - verticalPadding;
                                return (
                                    <Group opacity={labelOpacity}>
                                        <RoundedRect r={5} height={rectangleDimentions.height} width={rectangleDimentions.width} x={rectX} y={rectY}>
                                            <LinearGradient
                                                start={vec(rectX - rectangleDimentions.width / 2, rectX + rectangleDimentions.width / 2)}
                                                end={vec(rectY - rectangleDimentions.height / 2, rectY + rectangleDimentions.height / 2)}
                                                colors={tree.node.isCompleted ? ["#5DD39E", "#BCE784"] : ["#A5BDFF", "#4070F5"]}
                                            />
                                        </RoundedRect>
                                        {wordArr.map((word, idx) => {
                                            const wordWidth = labelFont.getTextWidth(word);

                                            const textX = cx - wordWidth / 2;
                                            const textY = cy + fontSize / 2 + idx * distanceBetweenWords + labelMarginTop;

                                            return <Text key={idx} x={textX} y={textY} text={word} color="white" font={labelFont} />;
                                        })}

                                        <Blur blur={pathBlurOnInactive} />
                                    </Group>
                                );

                                function calculateRectangleDimentions(wordArr: string[]) {
                                    let largestLetterWord = "";

                                    wordArr.forEach((w) => {
                                        if (w.length > largestLetterWord.length) largestLetterWord = w;
                                    });

                                    const longerWordWidth = labelFont.getTextWidth(largestLetterWord);

                                    return {
                                        width: longerWordWidth + 2 * horizontalPadding,
                                        height: textHeight + 2 * verticalPadding,
                                    };
                                }
                            })()}
                        <Group origin={{ x: currentNodeCoordintes.x, y: currentNodeCoordintes.y }} transform={groupTransform} opacity={circleOpacity}>
                            <Path path={getPathForCircle(cx, cy, CIRCLE_SIZE, 4)} style="stroke" strokeWidth={4} color="#F2F3F8">
                                <Shadow dx={0} dy={0} blur={3} color="#535657" />
                            </Path>
                            <Path path={getPathForCircle(cx, cy, CIRCLE_SIZE, 4)} style="stroke" strokeCap={"round"} strokeWidth={4} end={pathTrim}>
                                <LinearGradient
                                    start={vec(cx - CIRCLE_SIZE, cy - CIRCLE_SIZE)}
                                    end={vec(cx + CIRCLE_SIZE, cy + CIRCLE_SIZE)}
                                    colors={tree.node.isCompleted ? ["#5DD39E", "#BCE784"] : ["#A5BDFF", "#4070F5"]}
                                />
                            </Path>
                            <Circle cx={cx} cy={cy} r={CIRCLE_SIZE} color="white"></Circle>
                            {/* Letter inside the node */}
                            {nodeLetterFont &&
                                (() => {
                                    const letterToRender = tree.node.name[0];

                                    const textWidth = nodeLetterFont.getTextWidth(letterToRender);

                                    const textX = cx - textWidth / 2;
                                    const textY = cy + getHeightForFont(20) / 4;

                                    return (
                                        <Text x={textX} y={textY} text={letterToRender} font={nodeLetterFont}>
                                            <LinearGradient
                                                start={vec(textX, textX + textWidth)}
                                                end={vec(textY, textY + 20)}
                                                colors={tree.node.isCompleted ? ["#5DD39E", "#BCE784"] : ["#A5BDFF", "#4070F5"]}
                                            />
                                        </Text>
                                    );
                                })()}

                            <Blur blur={circleBlurOnInactive} />
                        </Group>
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
