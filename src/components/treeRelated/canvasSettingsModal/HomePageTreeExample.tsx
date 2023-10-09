import { useMemo } from "react";
import { Dimensions, View } from "react-native";
import Animated from "react-native-reanimated";
import { CANVAS_SETTINGS_EXAMPLE_NODE_SIZE, CANVAS_SETTINGS_MOCK_NODE, centerFlex, colors, nodeGradients } from "../../../parameters";
import { ColorGradient, Skill, Tree } from "../../../types";
import AppText from "../../AppText";
import NodeView from "../../NodeView";
import useShowHideStylesWithoutTransitionView from "../hooks/useShowHideStylesWithoutTransitionView";

function MockUserNode({
    state,
}: {
    state: { homepageTreeColor: ColorGradient; showIcons: boolean; homepageTreeName: string; homepageTreeIcon: string };
}) {
    const { homepageTreeColor, showIcons, homepageTreeIcon, homepageTreeName } = state;

    const Node = useMemo(() => {
        const isEmoji = homepageTreeIcon !== "";

        const node: Tree<Skill> = {
            ...CANVAS_SETTINGS_MOCK_NODE,
            accentColor: homepageTreeColor,
            category: "USER",
            data: {
                ...CANVAS_SETTINGS_MOCK_NODE.data,
                icon: { isEmoji, text: isEmoji ? homepageTreeIcon : homepageTreeName[0] },
                name: homepageTreeName,
            },
        };

        return (
            <NodeView params={{ completePercentage: 100, size: CANVAS_SETTINGS_EXAMPLE_NODE_SIZE, showIcons, oneColorPerTree: false }} node={node} />
        );
    }, [homepageTreeIcon, homepageTreeColor, homepageTreeName[0], showIcons]);
    return (
        <View style={{ gap: 7 }}>
            <View style={centerFlex}>{Node}</View>
            <View style={{ height: 16, width: 60, overflow: "hidden" }} />
        </View>
    );
}

function MockSkillTreeNode({
    state,
}: {
    state: {
        showLabel: boolean;
        homepageTreeColor: ColorGradient;
        oneColorPerTree: boolean;
        showIcons: boolean;
    };
}) {
    const { showLabel, homepageTreeColor, oneColorPerTree, showIcons } = state;

    const styles = useShowHideStylesWithoutTransitionView(showLabel);

    const Node = useMemo(() => {
        return (
            <NodeView
                params={{ completePercentage: 100, size: CANVAS_SETTINGS_EXAMPLE_NODE_SIZE, showIcons, oneColorPerTree: false }}
                node={{ ...CANVAS_SETTINGS_MOCK_NODE, accentColor: oneColorPerTree ? homepageTreeColor : nodeGradients[3] }}
            />
        );
    }, [homepageTreeColor, oneColorPerTree, showIcons]);

    return (
        <View style={{ gap: 7 }}>
            <View style={centerFlex}>{Node}</View>
            <View style={{ height: 16, width: 60, overflow: "hidden" }}>
                {showLabel && (
                    <Animated.View style={styles}>
                        <AppText style={{ color: "#FFFFFF" }} fontSize={15}>
                            Example
                        </AppText>
                    </Animated.View>
                )}
            </View>
        </View>
    );
}

function HomePageTreeExample({
    state,
}: {
    state: {
        showCircleGuide: boolean;
        showLabel: boolean;
        homepageTreeIcon: string;
        homepageTreeName: string;
        homepageTreeColor: ColorGradient;
        oneColorPerTree: boolean;
        showIcons: boolean;
    };
}) {
    const { width } = Dimensions.get("window");

    const { homepageTreeIcon, homepageTreeColor, oneColorPerTree, showCircleGuide, showIcons, showLabel, homepageTreeName } = state;

    return (
        <View style={[centerFlex, { marginBottom: 15, height: 100, flexDirection: "row", justifyContent: "space-between", overflow: "hidden" }]}>
            {showCircleGuide && (
                <View
                    style={{
                        position: "absolute",
                        width: width - 20,
                        aspectRatio: 1,
                        borderRadius: width,
                        borderWidth: 1,
                        borderColor: "gray",
                        borderStyle: "dashed",
                        left: -CANVAS_SETTINGS_EXAMPLE_NODE_SIZE / 2,
                    }}
                />
            )}
            <View style={{ position: "absolute", top: 38, width: width - 60, left: 20, height: 2, backgroundColor: colors.line }} />

            <MockUserNode state={{ homepageTreeColor, homepageTreeIcon, homepageTreeName, showIcons }} />
            <MockSkillTreeNode state={{ homepageTreeColor, oneColorPerTree, showIcons, showLabel }} />
        </View>
    );
}

export default HomePageTreeExample;
