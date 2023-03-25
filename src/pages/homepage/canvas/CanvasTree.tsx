import { createBezierPathBetweenPoints, getChildCoordinatesFromParentInfo, getHeightForFont } from "./functions";
import { Blur, Circle, Group, LinearGradient, Path, vec, Shadow, useFont, Text, RoundedRect } from "@shopify/react-native-skia";
import { Skill, Tree } from "../../../types";
import { CIRCLE_SIZE, colors } from "./parameters";
import { CirclePositionInCanvas } from "./TreeView";
import useHandleTreeAnimations from "./hooks/useHandleTreeAnimations";
import { findDistanceBetweenNodesById, findParentOfNode } from "../treeFunctions";
import { useEffect } from "react";

type TreeProps = {
    tree: Tree<Skill>;
    wholeTree: Tree<Skill>;
    parentNodeInfo?: { coordinates: { x: number; y: number }; numberOfChildren: number; currentChildIndex: number };
    stateProps: {
        selectedNode: string | null;
        popCoordinateToArray: (coordinate: CirclePositionInCanvas) => void;
        showLabel: boolean;
    };
    rootCoordinates?: { width: number; height: number };
};

function CanvasTree({ tree, parentNodeInfo, stateProps, rootCoordinates, wholeTree }: TreeProps) {
    const labelFont = useFont(require("../../../../assets/Poppins-Regular.otf"), 12);
    const nodeLetterFont = useFont(require("../../../../assets/Poppins-Regular.otf"), 20);

    const defaultParentInfo = parentNodeInfo ?? {
        coordinates: { x: rootCoordinates!.width, y: rootCoordinates!.height },
        numberOfChildren: 1,
        currentChildIndex: 0,
    };

    const { popCoordinateToArray, selectedNode, showLabel } = stateProps;

    const currentNodeCoordintes = getChildCoordinatesFromParentInfo(parentNodeInfo ?? defaultParentInfo);

    const cx = currentNodeCoordintes.x;
    const cy = currentNodeCoordintes.y - CIRCLE_SIZE / 2;

    let newParentNodeInfo = { coordinates: currentNodeCoordintes, numberOfChildren: tree.children ? tree.children.length : 0 };

    useEffect(() => {
        popCoordinateToArray({ x: currentNodeCoordintes.x, y: currentNodeCoordintes.y - CIRCLE_SIZE / 2, id: tree.data.id });
    }, [wholeTree]);

    const { circleBlurOnInactive, circleOpacity, connectingPathTrim, groupTransform, pathBlurOnInactive, pathTrim, labelOpacity } =
        useHandleTreeAnimations(selectedNode, showLabel, tree, findDistanceBetweenNodesById(wholeTree, tree.data.id) ?? 0);

    const nodeAndParentCompleted = (() => {
        if (tree.data.isCompleted !== true) return false;

        const parentNode = findParentOfNode(wholeTree, tree.data.id);

        if (!parentNode) return false;

        if (parentNode.data.isCompleted !== true) return false;

        return true;
    })();

    return (
        <>
            {!tree.isRoot && (
                <Path
                    path={createBezierPathBetweenPoints(
                        parentNodeInfo ? parentNodeInfo.coordinates : defaultParentInfo.coordinates,
                        currentNodeCoordintes
                    )}
                    color={nodeAndParentCompleted ? `${colors.accent}3D` : colors.line}
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
                        <CanvasTree
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
                                const text = tree.data.name;
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
                                        <RoundedRect
                                            r={5}
                                            height={rectangleDimentions.height}
                                            width={rectangleDimentions.width}
                                            x={rectX}
                                            y={rectY}
                                            color={tree.data.isCompleted ? colors.accent : colors.unmarkedText}
                                        />
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

                                    const longerWordWidth = labelFont!.getTextWidth(largestLetterWord);

                                    return {
                                        width: longerWordWidth + 2 * horizontalPadding,
                                        height: textHeight + 2 * verticalPadding,
                                    };
                                }
                            })()}
                        <Group origin={{ x: currentNodeCoordintes.x, y: currentNodeCoordintes.y }} transform={groupTransform} opacity={circleOpacity}>
                            <Path path={getPathForCircle(cx, cy, CIRCLE_SIZE, 2)} style="stroke" strokeWidth={2} color={colors.line} />
                            <Path
                                path={getPathForCircle(cx, cy, CIRCLE_SIZE, 2)}
                                style="stroke"
                                strokeCap={"round"}
                                strokeWidth={2}
                                end={pathTrim}
                                color={colors.accent}
                            />
                            <Circle cx={cx} cy={cy} r={CIRCLE_SIZE} color={colors.background}></Circle>
                            {/* Letter inside the node */}
                            {nodeLetterFont &&
                                (() => {
                                    const letterToRender = tree.data.name[0];

                                    const textWidth = nodeLetterFont.getTextWidth(letterToRender);

                                    const textX = cx - textWidth / 2;
                                    const textY = cy + getHeightForFont(20) / 4 + 1;

                                    return (
                                        <Text
                                            x={textX}
                                            y={textY}
                                            text={letterToRender}
                                            font={nodeLetterFont}
                                            color={
                                                tree.data.isCompleted ? colors.accent : tree.data.id === selectedNode ? "white" : colors.unmarkedText
                                            }
                                        />
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
export default CanvasTree;

function getPathForCircle(cx: number, cy: number, r: number, strokeWidth: number) {
    const radius = r + strokeWidth / 2;
    return `M ${cx - strokeWidth / 2} ${cy} m ${-r}, 0 a ${radius},${radius} 0 1,0 ${radius * 2},0 a ${radius},${radius} 0 1,0 ${-(radius * 2)},0`;
}
