import { getNodesCoordinates, treeHeightFromCoordinates, treeWidthFromCoordinates } from "@/functions/treeCalculateCoordinates";
import { prepareNodesForHomeTreeBuild } from "@/pages/homepage/HomepageTree";
import { useAppSelector } from "@/redux/reduxHooks";
import { selectNodesOfTree } from "@/redux/slices/nodesSlice";
import { TreeData, selectAllTreesEntities } from "@/redux/slices/userTreesSlice";
import { CartesianCoordinate, NodeCoordinate, NormalizedNode } from "@/types";
import analytics from "@react-native-firebase/analytics";
import { Dictionary } from "@reduxjs/toolkit";
import { ImageFormat, SkFont, SkiaDomView, useFont } from "@shopify/react-native-skia";
import { mixpanel } from "app/(app)/_layout";
import { shareAsync } from "expo-sharing";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Dimensions, Modal, Platform, Pressable, StatusBar, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector, gestureHandlerRootHOC } from "react-native-gesture-handler";
import Animated, { Easing, SharedValue, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { Circle, Defs, ForeignObject, LinearGradient, Path, Stop, Svg, Text } from "react-native-svg";
import ViewShot from "react-native-view-shot";
import { CIRCLE_SIZE, HOMEPAGE_TREE_ID, HOMETREE_ROOT_ID, MENU_HIGH_DAMPENING, NODE_ICON_FONT_SIZE, colors } from "../../parameters";
import AppButton from "../AppButton";
import ChevronLeft from "../Icons/ChevronLeft";
import ProgressIndicatorAndName from "../ProgressIndicatorAndName";
import { nodeToCircularPath } from "@/functions/svg/toSvg";
import { completedSkillTreeTable } from "@/functions/extractInformationFromTree";
import { getTextCoordinates } from "../treeRelated/general/useHandleNodeAnimatedCoordinates";
import { getTextWidth } from "../treeRelated/general/StaticNodeList";
import { getLabelTextColor } from "@/functions/misc";
import { Canvas } from "@shopify/react-native-skia";
import AppText from "../AppText";
import { getCurvedPath } from "../treeRelated/radial/RadialCanvasPath";

type Stage = "TAKING_SCREENSHOT" | "EDITING_LAYOUT";

function TakingScreenshotLoadingScreenModal({
    canvasRef,
    takingScreenshotState,
    treeData,
}: {
    canvasRef: SkiaDomView;
    takingScreenshotState: readonly [boolean, { readonly openTakingScreenshotModal: () => void; readonly closeTakingScreenshotModal: () => void }];
    treeData: Omit<TreeData, "nodes">;
}) {
    const { width } = Dimensions.get("screen");

    const [takingScreenshot, { closeTakingScreenshotModal }] = takingScreenshotState;

    const [stage, setStage] = useState<Stage>("TAKING_SCREENSHOT");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            if (takingScreenshot) {
                await mixpanel.track(`takingScreenshot`);

                await analytics().logEvent("takingScreenshot");

                getScreenShots();
            }
        })();
    }, [takingScreenshot]);

    useEffect(() => {
        return () => {
            setSelectedImage(null);
            setStage("TAKING_SCREENSHOT");
        };
    }, []);

    const BAR_WIDHT = width > 600 ? 550 : width - 50;

    const styles = useAnimatedStyle(() => {
        return { width: withTiming(takingScreenshot ? BAR_WIDHT : 0, { duration: 1000, easing: Easing.bezierFn(0.83, 0, 0.17, 1) }) };
    }, [takingScreenshot]);

    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={takingScreenshot}
            onRequestClose={closeTakingScreenshotModal}
            presentationStyle={Platform.OS === "android" ? "overFullScreen" : "formSheet"}>
            <StatusBar backgroundColor={colors.background} barStyle="light-content" />
            <LayoutSelector treeData={treeData} cancelSharing={closeTakingScreenshotModal} />

            {/* <NewThingy cancelSharing={closeTakingScreenshotModal} treeId={treeData.treeId} /> */}
            {/* <>
                {stage === "TAKING_SCREENSHOT" && (
                    <Animated.View style={[centerFlex, { flex: 1, opacity: 1 }]} entering={FadeInDown}>
                        <AppText fontSize={24} style={{ color: "#FFFFFF", fontFamily: "helveticaBold", textAlign: "center", marginBottom: 25 }}>
                            Turning your skill tree into an image
                        </AppText>
                        <View style={{ backgroundColor: `${colors.accent}5D`, height: 8, width: BAR_WIDHT, borderRadius: 5 }}>
                            <Animated.View style={[styles, { backgroundColor: colors.accent, height: 8, borderRadius: 5 }]} />
                        </View>
                    </Animated.View>
                )}

                {stage === "EDITING_LAYOUT" && selectedImage !== null && (
                    <LayoutSelector selectedImage={selectedImage} treeData={treeData} cancelSharing={closeTakingScreenshotModal} />
                )}
            </> */}
        </Modal>
    );

    async function getScreenShots() {
        setStage("TAKING_SCREENSHOT");

        try {
            await new Promise((resolve) =>
                setTimeout(async () => {
                    const image = canvasRef.makeImageSnapshot();

                    const encodedImage = image.encodeToBase64(ImageFormat.PNG, 99);

                    const formattedImage = `data:image/png;base64,${encodedImage}`;

                    setSelectedImage(formattedImage);
                    setStage("EDITING_LAYOUT");
                }, 1000)
            );
        } catch (error) {
            Alert.alert("Could not generate image, please try again");
            closeTakingScreenshotModal();
        }
    }
}

const useHandleScreenshotCapture = (ref: React.MutableRefObject<ViewShot | null>, closeModal: () => void) => {
    const attemptCapture = () => {
        if (ref.current === null) return;
        if (ref.current.capture === undefined) return;

        ref.current.capture();
    };

    const onCapture = useCallback(async (uri: string) => {
        try {
            await shareAsync(`file://${uri}`);
            closeModal();
        } catch (error) {
            Alert.alert("Error onCapture");
        }
    }, []);

    return { attemptCapture, onCapture };
};

const FOOTER_HEIGHT = 55;

type Props = {
    sharedValues: {
        start: SharedValue<CartesianCoordinate>;
        offsetX: SharedValue<number>;
        offsetY: SharedValue<number>;
        scale: SharedValue<number>;
        savedScale: SharedValue<number>;
        rotation: SharedValue<number>;
        savedRotation: SharedValue<number>;
    };
    treeData: Omit<TreeData, "nodes">;
    fonts: { labelFont: SkFont; nodeLetterFont: SkFont; emojiFont: SkFont };
};

const useHandleGestures = (args: Props["sharedValues"], showBorder: SharedValue<boolean>) => {
    const { offsetX, offsetY, rotation, savedRotation, savedScale, scale, start } = args;

    const canvasZoom = Gesture.Pinch()
        .onUpdate((e) => {
            showBorder.value = true;

            scale.value = savedScale.value * e.scale;
        })
        .onEnd(() => {
            savedScale.value = scale.value;
            showBorder.value = false;
        });

    const canvasPan = Gesture.Pan()
        .onUpdate((e) => {
            showBorder.value = true;

            const newXValue = e.translationX + start.value.x;
            const newYValue = e.translationY + start.value.y;

            offsetX.value = newXValue;
            offsetY.value = newYValue;
        })
        .onEnd(() => {
            start.value = { x: offsetX.value, y: offsetY.value };
            showBorder.value = false;
        });

    const canvasRotation = Gesture.Rotation()
        .onUpdate((e) => {
            rotation.value = savedRotation.value + e.rotation;
        })
        .onEnd(() => {
            savedRotation.value = rotation.value;
        });

    const canvasGestures = Gesture.Simultaneous(canvasPan, canvasZoom, canvasRotation);

    return canvasGestures;
};

function useSkiaFonts() {
    const labelFont = useFont(require("../../../assets/Helvetica.ttf"), 12);
    const nodeLetterFont = useFont(require("../../../assets/Helvetica.ttf"), NODE_ICON_FONT_SIZE);
    const emojiFont = useFont(require("../../../assets/NotoEmoji-Regular.ttf"), NODE_ICON_FONT_SIZE);

    if (!labelFont || !nodeLetterFont || !emojiFont) return undefined;

    return { labelFont, nodeLetterFont, emojiFont };
}

const MovableSvg = gestureHandlerRootHOC(({ sharedValues, treeData, fonts }: Props) => {
    const { offsetX, offsetY, rotation, scale } = sharedValues;

    const nodes = useAppSelector(selectNodesOfTree(treeData.treeId));
    const subTreesData = useAppSelector(selectAllTreesEntities);

    const { height, width } = Dimensions.get("window");
    const viewShotHeight = height - FOOTER_HEIGHT;

    const showBorder = useSharedValue(false);

    const canvasGestures = useHandleGestures(sharedValues, showBorder);

    const transform = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: offsetX.value },
                { translateY: offsetY.value },
                { scale: scale.value },
                { rotateZ: `${(rotation.value / Math.PI) * 180}deg` },
            ],
            borderColor: showBorder.value ? colors.accent : "#FFFFFF00",
        };
    });

    const PADDING = 2 * CIRCLE_SIZE;

    const { coordinates, heightData, rootNode, widthData } = getNodeCoordinatesWithoutCenteringOrPadding(nodes, subTreesData, treeData);
    const minY = Math.abs(heightData.minCoordinate);

    const rootNodeInsideCanvas = { ...rootNode, x: rootNode.x - widthData.minCoordinate + PADDING / 2, y: rootNode.y + minY + PADDING / 2 };

    const coordinatesInsideCanvas = coordinates.map((coord) => {
        return { ...coord, x: coord.x - widthData.minCoordinate + PADDING / 2, y: coord.y + minY + PADDING / 2 };
    });

    const svgDimensions = { width: widthData.treeWidth + PADDING, height: heightData.treeHeight + PADDING };

    const treeCompletionTable = completedSkillTreeTable(coordinates);

    return (
        <GestureDetector gesture={canvasGestures}>
            <Animated.View style={[transform, { width, height: viewShotHeight, borderStyle: "solid", borderWidth: 1 }]}>
                <View style={{ width: svgDimensions.width, height: svgDimensions.height, position: "relative" }}>
                    <Svg width={svgDimensions.width} height={svgDimensions.height} style={{ backgroundColor: colors.background }}>
                        <Defs>
                            <LinearGradient id="gray" x1="0%" x2="100%" y1="0%" y2="100%">
                                <Stop offset="0%" stopColor={"#515053"} stopOpacity={1} />
                                <Stop offset="100%" stopColor={"#2C2C2D"} stopOpacity={1} />
                            </LinearGradient>
                        </Defs>
                        <Defs>
                            <LinearGradient id={`${HOMEPAGE_TREE_ID}`} x1="0%" x2="100%" y1="0%" y2="100%">
                                <Stop offset="0%" stopColor={treeData.accentColor.color1} stopOpacity={1} />
                                <Stop offset="100%" stopColor={treeData.accentColor.color2} stopOpacity={1} />
                            </LinearGradient>
                        </Defs>

                        <DefineGradients subTreesData={subTreesData} />

                        {coordinatesInsideCanvas.map((node) => {
                            const strokeDashoffset =
                                node.category === "SKILL_TREE"
                                    ? 2 * Math.PI * CIRCLE_SIZE - (2 * Math.PI * CIRCLE_SIZE * treeCompletionTable[node.treeId]!.percentage) / 100
                                    : undefined;

                            return (
                                <>
                                    {!node.isRoot && <CurvedPath node={node} />}

                                    <Path stroke={`url(#gray)`} strokeLinecap="round" strokeWidth={2} d={nodeToCircularPath(node)} />

                                    {node.category !== "SKILL" && (
                                        <Path
                                            stroke={`url(#${node.treeId})`}
                                            strokeLinecap="round"
                                            strokeWidth={2}
                                            d={nodeToCircularPath(node)}
                                            strokeDasharray={node.category === "SKILL_TREE" ? 2 * Math.PI * CIRCLE_SIZE : undefined}
                                            strokeDashoffset={strokeDashoffset}
                                            fillOpacity={node.category === "USER" ? 1 : 0}
                                            fill={node.nodeId === HOMETREE_ROOT_ID ? `url(#${node.treeId})` : undefined}
                                        />
                                    )}
                                </>
                            );
                        })}
                    </Svg>
                    {coordinatesInsideCanvas.map((node) => {
                        const text = node.data.icon.isEmoji ? node.data.icon.text : node.data.name[0];
                        const font = node.data.icon.isEmoji ? fonts.emojiFont : fonts.nodeLetterFont;
                        const fontFamily = node.data.icon.isEmoji ? "emojisMono" : "helvetica";
                        const { x: textX, y: textY } = getTextCoordinates({ x: node.x, y: node.y }, getTextWidth(text, node.data.icon.isEmoji, font));

                        let color: string;

                        switch (node.category) {
                            case "SKILL":
                                color = "#515053";
                                break;
                            case "SKILL_TREE":
                                color = node.accentColor.color1;
                                break;
                            default:
                                color = getLabelTextColor(node.accentColor.color1);
                                break;
                        }

                        return (
                            <AppText
                                fontSize={NODE_ICON_FONT_SIZE}
                                children={text}
                                style={{ fontFamily, position: "absolute", left: textX, top: textY - 20, color, lineHeight: 30 }}
                            />
                        );
                    })}
                </View>
            </Animated.View>
        </GestureDetector>
    );

    function CurvedPath({ node }: { node: NodeCoordinate }) {
        const parentNode = coordinatesInsideCanvas.find((n) => n.nodeId === node.parentId);

        if (!parentNode && !node.isRoot) throw new Error("parentNode not found at MovableSvg");

        const { c, m } = getCurvedPath<CartesianCoordinate>(rootNodeInsideCanvas, parentNode!, { x: node.x, y: node.y });

        return <Path stroke={"#1C1C1D"} strokeWidth={2} d={`M ${m.x} ${m.y} C ${c.x1} ${c.y1}, ${c.x2} ${c.y2}, ${c.x} ${c.y}`} />;
    }
});

const DefineGradients = ({ subTreesData }: { subTreesData: Dictionary<TreeData> }) => {
    const subTreeDataKeys = Object.keys(subTreesData);

    return subTreeDataKeys.map((subTreeId) => {
        return (
            <Defs key={subTreeId}>
                <LinearGradient id={subTreeId} x1="0%" x2="100%" y1="0%" y2="100%">
                    <Stop offset="0%" stopColor={subTreesData[subTreeId]!.accentColor.color1} stopOpacity={1} />
                    <Stop offset="100%" stopColor={subTreesData[subTreeId]!.accentColor.color2} stopOpacity={1} />
                </LinearGradient>
            </Defs>
        );
    });
};

function LayoutSelector({ treeData, cancelSharing }: { treeData: Omit<TreeData, "nodes">; cancelSharing: () => void }) {
    const nodes = useAppSelector(selectNodesOfTree(treeData.treeId));

    const styles = StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background, position: "relative" },
        closeIcon: { width: 45, height: 45, backgroundColor: colors.darkGray, borderRadius: 30, position: "absolute", left: 10, top: 10, zIndex: 10 },
        footerContainer: { height: FOOTER_HEIGHT, flexDirection: "row", padding: 10 },
        resetButton: { width: 100, marginRight: 10, borderColor: colors.darkGray },
        shareButton: { flex: 1 },
        viewShotContainer: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
            overflow: "hidden",
            backgroundColor: colors.background,
        },
    });

    const START_COORD = { x: 0, y: 0 };

    const fonts = useSkiaFonts();

    const start = useSharedValue<CartesianCoordinate>({ x: START_COORD.x, y: START_COORD.y });
    const offsetX = useSharedValue(START_COORD.x);
    const offsetY = useSharedValue(START_COORD.y);

    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);

    const rotation = useSharedValue(0);
    const savedRotation = useSharedValue(0);

    const sharedValues = { start, offsetX, offsetY, scale, savedScale, rotation, savedRotation };

    const toggleImageSizeReset = () => {
        if (offsetX.value !== 0 || offsetY.value !== 0) {
            start.value = { x: 0, y: START_COORD.y };
            offsetX.value = withSpring(START_COORD.x, MENU_HIGH_DAMPENING);
            offsetY.value = withSpring(START_COORD.y, MENU_HIGH_DAMPENING);
        }
        if (scale.value !== 1) {
            scale.value = withSpring(1, MENU_HIGH_DAMPENING);
            savedScale.value = 1;
        }
        if (rotation.value !== 0) {
            rotation.value = withSpring(0, MENU_HIGH_DAMPENING);
            savedRotation.value = 0;
        }
    };

    const ref = useRef<ViewShot | null>(null);
    const { attemptCapture, onCapture } = useHandleScreenshotCapture(ref, cancelSharing);

    return (
        <View style={styles.container}>
            <Pressable style={styles.closeIcon} onPress={cancelSharing}>
                <ChevronLeft color={colors.line} />
            </Pressable>
            <ViewShot
                ref={ref}
                style={styles.viewShotContainer}
                onCapture={onCapture}
                options={{ fileName: treeData.treeName, result: "tmpfile", format: "png", quality: 1 }}>
                {fonts && <MovableSvg sharedValues={sharedValues} treeData={treeData} fonts={fonts} />}
                <ProgressIndicatorAndName nodesOfTree={nodes} treeData={treeData} containerStyle={{ left: undefined, right: 10 }} />
            </ViewShot>
            <View style={styles.footerContainer}>
                <AppButton
                    onPress={toggleImageSizeReset}
                    text={{ idle: "Reset Image" }}
                    style={styles.resetButton}
                    color={{ idle: colors.darkGray }}
                />
                <AppButton onPress={attemptCapture} text={{ idle: "Share" }} pressableStyle={{ flex: 1, height: 45 }} style={styles.shareButton} />
            </View>
        </View>
    );
}

function getNodeCoordinatesWithoutCenteringOrPadding(
    nodes: NormalizedNode[],
    subTreesData: Dictionary<TreeData>,
    treeData: Omit<TreeData, "nodes">
): {
    coordinates: NodeCoordinate[];
    rootNode: NodeCoordinate;
    heightData: {
        treeHeight: number;
        minCoordinate: number;
        maxCoordinate: number;
    };
    widthData: {
        treeWidth: number;
        minCoordinate: number;
        maxCoordinate: number;
    };
} {
    const treeNodesDictionary: Dictionary<NormalizedNode> = {};

    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        treeNodesDictionary[node.nodeId] = node;
    }

    let partialResult: { coordinates: NodeCoordinate[]; rootNode: NodeCoordinate };

    if (treeData.treeId === HOMEPAGE_TREE_ID) {
        const homeTreeNodes = prepareNodesForHomeTreeBuild(treeNodesDictionary, treeData.rootNodeId);

        const radialNodeCoordinates = getNodesCoordinates(homeTreeNodes, "radial", treeData, subTreesData);

        const rootNode = radialNodeCoordinates.find((c) => c.nodeId === treeData.rootNodeId);
        if (!rootNode) throw new Error("rootNode not found at UserTreeSvg");

        partialResult = { coordinates: radialNodeCoordinates, rootNode };
    } else {
        const hierarchicalNodeCoordinates = getNodesCoordinates(treeNodesDictionary, "hierarchy", treeData);

        const rootNode = hierarchicalNodeCoordinates.find((c) => c.nodeId === treeData.rootNodeId);
        if (!rootNode) throw new Error("rootNode not found at UserTreeSvg");

        partialResult = { coordinates: hierarchicalNodeCoordinates, rootNode };
    }

    const heightData = treeHeightFromCoordinates(partialResult.coordinates);
    const widthData = treeWidthFromCoordinates(partialResult.coordinates);

    return { ...partialResult, heightData, widthData };
}

export default TakingScreenshotLoadingScreenModal;
