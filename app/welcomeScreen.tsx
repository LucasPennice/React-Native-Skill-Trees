import AppButton from "@/components/AppButton";
import AppText from "@/components/AppText";
import Logo from "@/components/Logo";
import { DefineGradients, HierarchicalPath, RadialPath } from "@/components/takingScreenshot/TakingScreenshotLoadingScreenModal";
import { getTextWidth } from "@/components/treeRelated/general/StaticNodeList";
import { getTextCoordinates } from "@/components/treeRelated/general/useHandleNodeAnimatedCoordinates";
import { completedSkillTreeTable } from "@/functions/extractInformationFromTree";
import { getLabelTextColor } from "@/functions/misc";
import { nodeToCircularPath } from "@/functions/svg/toSvg";
import { CIRCLE_SIZE, HOMEPAGE_TREE_ID, HOMETREE_ROOT_ID, NODE_ICON_FONT_SIZE, centerFlex, colors } from "@/parameters";
import { SkiaFontContext } from "app/_layout";
import { router } from "expo-router";
import { Fragment, useContext } from "react";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import Animated, { SharedTransition, withSpring } from "react-native-reanimated";
import { Defs, LinearGradient, Path, Stop, Svg } from "react-native-svg";
import { mockCoordinatesInsideCanvas, mockRootCoordinateInsideCanvas, mockSubtreesData, mockSvgDimensions, mockTreeData } from "../data";

const TEXT_AND_BUTTON_HEIGHT = 230;

export const logoSharedTransitionStyle = SharedTransition.custom((values) => {
    "worklet";
    return {
        originY: withSpring(values.targetOriginY, { dampingRatio: 0.8 }),
        originX: withSpring(values.targetOriginX, { dampingRatio: 0.8 }),
    };
});

function WelcomeScreen() {
    const { width } = Dimensions.get("window");

    const navigateToLogin = () => router.push("/logIn");
    const navigateToSignUp = () => router.push("/signUp");

    return (
        <View style={[centerFlex, { flex: 1, justifyContent: "flex-end", position: "relative" }]}>
            <OnboardingTree />

            <View style={{ height: TEXT_AND_BUTTON_HEIGHT, justifyContent: "center", alignItems: "center" }}>
                <Animated.View sharedTransitionTag="sharedTag" sharedTransitionStyle={logoSharedTransitionStyle}>
                    <Logo />
                </Animated.View>

                <AppText children={"Track your life's progress. All in one place."} fontSize={16} style={{ textAlign: "center", marginTop: 15 }} />

                <AppButton
                    onPress={navigateToSignUp}
                    text={{ idle: "CREATE ACCOUNT" }}
                    color={{ idle: colors.accent }}
                    pressableStyle={{ width, paddingHorizontal: 10 }}
                    style={{ backgroundColor: colors.background, marginTop: 20 }}
                    textStyle={{ fontFamily: "helveticaBold" }}
                />

                <View style={{ flexDirection: "row" }}>
                    <AppText children={"Already have an account?"} fontSize={14} style={{ verticalAlign: "bottom" }} />
                    <Pressable onPressIn={navigateToLogin}>
                        <AppText
                            children={"Log In"}
                            fontSize={14}
                            style={{
                                color: colors.accent,
                                fontFamily: "helveticaBold",
                                paddingLeft: 3,
                                verticalAlign: "bottom",
                                height: 35,
                                width: 45,
                            }}
                        />
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

const OnboardingTree = () => {
    const { width, height } = Dimensions.get("window");

    const fonts = useContext(SkiaFontContext);

    const treeCompletionTable = completedSkillTreeTable(mockCoordinatesInsideCanvas);

    const styles = StyleSheet.create({
        container: {
            width: width,
            height: height - TEXT_AND_BUTTON_HEIGHT,
            top: 0,
            position: "relative",
            overflow: "hidden",
        },
    });

    if (!fonts) return <></>;

    return (
        <View style={styles.container}>
            <View
                style={{
                    transform: [
                        { translateX: -mockRootCoordinateInsideCanvas.x + width / 2 },
                        { translateY: -mockRootCoordinateInsideCanvas.y + (height - TEXT_AND_BUTTON_HEIGHT) / 2 },
                    ],
                }}>
                <Svg width={mockSvgDimensions.width} height={mockSvgDimensions.height}>
                    <Defs>
                        <LinearGradient id="gray" x1="0%" x2="100%" y1="0%" y2="100%">
                            <Stop offset="0%" stopColor={"#515053"} stopOpacity={1} />
                            <Stop offset="100%" stopColor={"#2C2C2D"} stopOpacity={1} />
                        </LinearGradient>
                    </Defs>
                    <Defs>
                        <LinearGradient id={`${HOMEPAGE_TREE_ID}`} x1="0%" x2="100%" y1="0%" y2="100%">
                            <Stop offset="0%" stopColor={mockTreeData.accentColor.color1} stopOpacity={1} />
                            <Stop offset="100%" stopColor={mockTreeData.accentColor.color2} stopOpacity={1} />
                        </LinearGradient>
                    </Defs>

                    <DefineGradients subTreesData={mockSubtreesData} />

                    {mockCoordinatesInsideCanvas.map((node, idx) => {
                        const strokeDashoffset =
                            node.category === "SKILL_TREE"
                                ? 2 * Math.PI * CIRCLE_SIZE - (2 * Math.PI * CIRCLE_SIZE * treeCompletionTable[node.treeId]!.percentage) / 100
                                : undefined;

                        return (
                            <Fragment key={idx}>
                                {!node.isRoot && mockTreeData.treeId === HOMEPAGE_TREE_ID && (
                                    <RadialPath
                                        node={node}
                                        coordinatesInsideCanvas={mockCoordinatesInsideCanvas}
                                        rootNodeInsideCanvas={mockRootCoordinateInsideCanvas}
                                    />
                                )}
                                {!node.isRoot && mockTreeData.treeId !== HOMEPAGE_TREE_ID && (
                                    <HierarchicalPath node={node} coordinatesInsideCanvas={mockCoordinatesInsideCanvas} />
                                )}

                                <Path stroke={`url(#gray)`} strokeLinecap="round" strokeWidth={2} d={nodeToCircularPath(node)} />

                                <Path
                                    stroke={
                                        (node.category === "SKILL" && node.data.isCompleted) || node.category !== "SKILL"
                                            ? `url(#${node.treeId})`
                                            : undefined
                                    }
                                    strokeLinecap="round"
                                    strokeWidth={2}
                                    d={nodeToCircularPath(node)}
                                    strokeDasharray={node.category === "SKILL_TREE" ? 2 * Math.PI * CIRCLE_SIZE : undefined}
                                    strokeDashoffset={strokeDashoffset}
                                    fillOpacity={node.category === "USER" ? 1 : 0}
                                    fill={node.nodeId === HOMETREE_ROOT_ID ? `url(#${node.treeId})` : undefined}
                                />
                            </Fragment>
                        );
                    })}
                </Svg>
                {mockCoordinatesInsideCanvas.map((node) => {
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
                            key={node.nodeId}
                            fontSize={NODE_ICON_FONT_SIZE}
                            children={text}
                            style={{ fontFamily, position: "absolute", left: textX, top: textY - 20, color, lineHeight: 30 }}
                        />
                    );
                })}
            </View>
        </View>
    );
};

export default WelcomeScreen;
