import { memo, useEffect, useMemo, useState } from "react";
import { Dimensions, ScrollView, View } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { centerFlex, colors, nodeGradients } from "../parameters";
import {
    selectCanvasDisplaySettings,
    setHomepageTreeColor,
    setHomepageTreeIcon,
    setHomepageTreeName,
    setOneColorPerTree,
    setShowCircleGuide,
    setShowIcons,
    setShowLabel,
} from "../redux/canvasDisplaySettingsSlice";
import { useAppDispatch, useAppSelector } from "../redux/reduxHooks";
import { ColorGradient, Skill, Tree, getDefaultSkillValue } from "../types";
import AppText from "./AppText";
import AppTextInput from "./AppTextInput";
import ColorGradientSelector from "./ColorGradientSelector";
import FlingToDismissModal from "./FlingToDismissModal";
import NodeView from "./NodeView";
import RadioInput from "./RadioInput";

type Props = {
    closeModal: () => void;
    open: boolean;
};

const MockNode: Tree<Skill> = {
    accentColor: nodeGradients[5],
    category: "SKILL",
    children: [],
    data: getDefaultSkillValue("Example", true, { isEmoji: true, text: "🗿" }),
    isRoot: true,
    level: 0,
    nodeId: "exampleNodeId",
    parentId: null,
    treeId: "exampleTreeId",
    treeName: "exampleTreeName",
    x: 0,
    y: 0,
};

const NODE_SIZE = 57;

function CanvasSettingsModal({ closeModal, open }: Props) {
    const { oneColorPerTree, showCircleGuide, showLabel, homepageTreeColor, showIcons, homepageTreeName } =
        useAppSelector(selectCanvasDisplaySettings);
    const { width } = Dimensions.get("screen");
    const dispatch = useAppDispatch();

    const [homeTreeName, setHomeTreeName] = useState(homepageTreeName);
    const [icon, setIcon] = useState("");

    const updateOneColorPerTree = (v: boolean) => {
        dispatch(setOneColorPerTree(v));
    };
    const updateShowCircleGuide = (v: boolean) => {
        dispatch(setShowCircleGuide(v));
    };
    const updateShowLabel = (v: boolean) => {
        dispatch(setShowLabel(v));
    };
    const updateHomepageTreeColor = (v: ColorGradient) => {
        dispatch(setHomepageTreeColor(v));
    };
    const updateShowIcons = (v: boolean) => {
        dispatch(setShowIcons(v));
    };

    useEffect(() => {
        if (homeTreeName === "") return;
        dispatch(setHomepageTreeName(homeTreeName));
    }, [homeTreeName]);

    useEffect(() => {
        dispatch(setHomepageTreeIcon(icon));
    }, [icon]);

    const state = {
        showCircleGuide,
        showLabel,
        homepageTreeIcon: icon,
        homepageTreeColor,
        oneColorPerTree,
        showIcons,
        homepageTreeName: homeTreeName,
    };

    return (
        <FlingToDismissModal closeModal={closeModal} open={open}>
            <View style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <AppText style={{ color: "#FFFFFF", marginBottom: 10, fontFamily: "helveticaBold" }} fontSize={24}>
                        General Skill Tree Styles
                    </AppText>
                    <AppText style={{ color: colors.unmarkedText, marginBottom: 25 }} fontSize={16}>
                        These settings affect how every skill tree looks
                    </AppText>
                    <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
                        <View style={[centerFlex, { gap: 7 }]}>
                            <NodeView node={MockNode} size={NODE_SIZE} hideIcon={!showIcons} />
                            <View style={{ marginBottom: 10, height: 16, width: 60, overflow: "hidden" }}>
                                {showLabel && (
                                    <Animated.View entering={FadeInDown} exiting={FadeOutDown}>
                                        <AppText style={{ color: "#FFFFFF" }} fontSize={15}>
                                            Example
                                        </AppText>
                                    </Animated.View>
                                )}
                            </View>
                        </View>
                        <View style={{ flex: 1 }}>
                            <RadioInput state={[showLabel, updateShowLabel]} text={"Show labels"} style={{ marginBottom: 15 }} />
                            <RadioInput state={[showIcons, updateShowIcons]} text={"Show Icons"} style={{ marginBottom: 15 }} />
                        </View>
                    </View>
                    <AppText style={{ color: "#FFFFFF", marginBottom: 10, fontFamily: "helveticaBold" }} fontSize={24}>
                        Home Skill Tree Styles
                    </AppText>
                    <AppText style={{ color: colors.unmarkedText, marginBottom: 15 }} fontSize={16}>
                        These settings affect how the home skill tree looks
                    </AppText>

                    <HomePageTreeExample state={state} />

                    <AppTextInput
                        placeholder="Home Tree Name"
                        textState={[homeTreeName, setHomeTreeName]}
                        pattern={new RegExp(/^[^ ]/)}
                        containerStyles={{ marginBottom: 15 }}
                    />

                    <View style={{ flexDirection: "row", marginBottom: 15, justifyContent: "space-between", alignItems: "center" }}>
                        <View style={{ width: width - 160 }}>
                            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                                <AppText style={{ color: "#FFFFFF", marginBottom: 5 }} fontSize={20}>
                                    Icon
                                </AppText>
                                <AppText style={{ color: colors.unmarkedText, marginLeft: 5, marginTop: 2 }} fontSize={16}>
                                    (optional)
                                </AppText>
                            </View>
                            <AppText style={{ color: colors.unmarkedText, marginBottom: 10 }} fontSize={14}>
                                Your keyboard can switch to an emoji mode. To access it, look for a button located near the bottom left of your
                                keyboard.
                            </AppText>
                        </View>
                        <AppTextInput
                            placeholder={"🧠"}
                            textStyle={{ fontFamily: "emojisMono", fontSize: 40 }}
                            textState={[icon, setIcon]}
                            pattern={new RegExp(/\p{Extended_Pictographic}/u)}
                            containerStyles={{ width: 130 }}
                        />
                    </View>

                    <RadioInput state={[oneColorPerTree, updateOneColorPerTree]} text={"Monochromatic"} style={{ marginBottom: 15 }} />
                    <RadioInput state={[showCircleGuide, updateShowCircleGuide]} text={"Show depth guides"} />
                    <AppText fontSize={18} style={{ color: "#FFFFFF", marginBottom: 10 }}>
                        Tree Color
                    </AppText>
                    <AppText fontSize={14} style={{ color: colors.unmarkedText, marginBottom: 5 }}>
                        Completed skills and progress bars will show with this color
                    </AppText>
                    <AppText fontSize={14} style={{ color: colors.unmarkedText, marginBottom: 10 }}>
                        Scroll to see more colors
                    </AppText>
                    <ColorGradientSelector colorsArray={nodeGradients} state={[homepageTreeColor, updateHomepageTreeColor]} />
                </ScrollView>
            </View>
        </FlingToDismissModal>
    );
}

function Node1({ state }: { state: { homepageTreeColor: ColorGradient; showIcons: boolean; homepageTreeName: string; homepageTreeIcon: string } }) {
    const { homepageTreeColor, showIcons, homepageTreeIcon, homepageTreeName } = state;

    const Node = useMemo(() => {
        const isEmoji = homepageTreeIcon !== "";

        const node: Tree<Skill> = {
            ...MockNode,
            accentColor: homepageTreeColor,
            category: "USER",
            data: { ...MockNode.data, icon: { isEmoji, text: isEmoji ? homepageTreeIcon : homepageTreeName[0] }, name: homepageTreeName },
        };

        return <NodeView node={node} size={NODE_SIZE} hideIcon={!showIcons} />;
    }, [homepageTreeIcon, homepageTreeColor, homepageTreeName[0], showIcons]);
    return (
        <View style={{ gap: 7 }}>
            <View style={centerFlex}>{Node}</View>
            <View style={{ height: 16, width: 60, overflow: "hidden" }} />
        </View>
    );
}

function Node2({
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

    const Node = useMemo(() => {
        return (
            <NodeView
                node={{ ...MockNode, accentColor: oneColorPerTree ? homepageTreeColor : nodeGradients[3] }}
                size={NODE_SIZE}
                hideIcon={!showIcons}
            />
        );
    }, [homepageTreeColor, oneColorPerTree, showIcons]);

    return (
        <View style={{ gap: 7 }}>
            <View style={centerFlex}>{Node}</View>
            <View style={{ height: 16, width: 60, overflow: "hidden" }}>
                {showLabel && (
                    <Animated.View entering={FadeInDown} exiting={FadeOutDown}>
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
                        left: -NODE_SIZE / 2,
                    }}
                />
            )}
            <View style={{ position: "absolute", top: 38, width: width - 60, left: 20, height: 2, backgroundColor: colors.line }} />

            <Node1 state={{ homepageTreeColor, homepageTreeIcon, homepageTreeName, showIcons }} />
            <Node2 state={{ homepageTreeColor, oneColorPerTree, showIcons, showLabel }} />
        </View>
    );
}

export default memo(CanvasSettingsModal);
