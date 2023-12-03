import { Fragment, useEffect, useState } from "react";
import { Platform, StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
    FadeIn,
    FadeInDown,
    FadeInLeft,
    FadeInRight,
    FadeInUp,
    FadeOutDown,
    FadeOutLeft,
    FadeOutRight,
    FadeOutUp,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { exitOpacityScale } from "../../../constants/reanimatedAnimations";
import { renderScaleForNodeActionMenu } from "../../../functions/misc";
import { colors } from "../../../parameters";
import { NodeCoordinate } from "../../../types";
import AppText from "../../AppText";
import DirectionMenu, { Config } from "../../DirectionMenu";
import useWrapNodeMenuFunctions from "./useWrapNodeMenuFunctions";
import { mixpanel } from "app/(app)/_layout";

export const NODE_MENU_SIZE = 150;

const nodeMenuConfig: Config = {
    horizontalSize: NODE_MENU_SIZE,
    verticalSize: NODE_MENU_SIZE,
    circular: true,
    allowTap: true,
};

export type NodeMenuFunctions = {
    idle: {
        horizontalLeft?: () => void;
        horizontalRight?: () => void;
        verticalUp?: () => void;
        verticalDown?: () => void;
    };
    selectingPosition: {
        horizontalLeft?: () => void;
        horizontalRight?: () => void;
        verticalUp?: () => void;
        verticalDown?: () => void;
    };
};

const OS_CompatibleBorderStyle: ViewStyle["borderStyle"] = Platform.OS === "ios" ? "solid" : "dashed";

function useTrackOpenNodeMenu() {
    useEffect(() => {
        (async () => {
            await mixpanel.track("openNodeMenu");
        })();
    }, []);
}

function NodeMenu({
    data,
    scale,
    closeNodeMenu,
    functions,
}: {
    data: NodeCoordinate;
    scale: number;
    closeNodeMenu: () => void;
    functions: NodeMenuFunctions;
}) {
    const { idle, selectingPosition } = functions;

    const position = { x: data.x - NODE_MENU_SIZE / 2, y: data.y - NODE_MENU_SIZE / 2 };

    const [menuMode, setMenuMode] = useState<"NORMAL" | "SELECTING_NODE_POSITION">("NORMAL");

    const { idleActions, selectNodePositionAction } = useWrapNodeMenuFunctions(functions, closeNodeMenu, setMenuMode);

    const progress = useSharedValue(0);

    useTrackOpenNodeMenu();

    useEffect(() => {
        if (menuMode === "SELECTING_NODE_POSITION") progress.value = withTiming(1, { duration: 500 });
    }, [menuMode]);

    const styles = useAnimatedStyle(() => {
        return {
            backgroundColor: interpolateColor(progress.value, [0, 1], ["#181A1C", "#515053"]),
        };
    }, [menuMode]);

    //🚨 El problema esta abajo de esto

    return (
        <Animated.View
            entering={FadeIn.duration(250)}
            // exiting={exitOpacityScale(renderScaleForNodeActionMenu(scale))}
            style={{ position: "absolute", top: position.y, left: position.x, transform: [{ scale: renderScaleForNodeActionMenu(scale) }] }}>
            <Animated.View
                style={[
                    styles,
                    {
                        height: NODE_MENU_SIZE,
                        width: NODE_MENU_SIZE,
                        borderColor: "#B1B2B220",
                        borderWidth: 1,
                        borderRadius: NODE_MENU_SIZE,
                        position: "relative",
                        overflow: "hidden",
                    },
                ]}>
                <OuterArrows menuMode={menuMode} />
                <InnerCircle menuMode={menuMode} />
                {menuMode === "NORMAL" && <InnerArrows />}
                {menuMode === "NORMAL" && <ActionLabel actions={idle} />}
                {menuMode === "SELECTING_NODE_POSITION" && <PositionLabel actions={selectingPosition} />}

                <DirectionMenu action={menuMode === "NORMAL" ? idleActions : selectNodePositionAction} config={nodeMenuConfig}>
                    <Fragment />
                </DirectionMenu>
            </Animated.View>
        </Animated.View>
    );
}

function OuterArrows({ menuMode }: { menuMode: "NORMAL" | "SELECTING_NODE_POSITION" }) {
    const borderStyle: ViewStyle["borderStyle"] = menuMode === "NORMAL" ? undefined : OS_CompatibleBorderStyle;

    return (
        <>
            <ArrowTopLeftDownRight borderStyle={borderStyle} menuMode={menuMode} />
            <ArrowDownLeftTopRight borderStyle={borderStyle} menuMode={menuMode} />
        </>
    );
}

function InnerArrows() {
    return (
        <>
            <ArrowTopLeftDownRight borderStyle={OS_CompatibleBorderStyle} />
            <ArrowDownLeftTopRight borderStyle={OS_CompatibleBorderStyle} />
        </>
    );
}

function ArrowTopLeftDownRight({
    borderStyle,
    menuMode = "NORMAL",
}: {
    borderStyle: ViewStyle["borderStyle"];
    menuMode?: "NORMAL" | "SELECTING_NODE_POSITION";
}) {
    const style = StyleSheet.create({
        s: {
            borderTopWidth: 2,
            position: "absolute",
            borderStyle,
            top: 0,
            left: 0,
            borderTopColor: menuMode === "NORMAL" ? "#2C2D2F" : "#5E5D5F",
            width: NODE_MENU_SIZE,
            transform: [{ rotate: "45deg" }, { translateX: 52 }, { translateY: 52 }],
        },
    });

    return <View style={[style.s]} />;
}

function ArrowDownLeftTopRight({
    borderStyle,
    menuMode = "NORMAL",
}: {
    borderStyle: ViewStyle["borderStyle"];
    menuMode?: "NORMAL" | "SELECTING_NODE_POSITION";
}) {
    const style = StyleSheet.create({
        s: {
            borderTopWidth: 2,
            borderStyle,
            position: "absolute",
            borderTopColor: menuMode === "NORMAL" ? "#2C2D2F" : "#5E5D5F",
            width: NODE_MENU_SIZE,
            top: 0,
            left: 0,
            transform: [{ rotate: "-45deg" }, { translateX: -53 }, { translateY: 52 }],
        },
    });

    return <View style={[style.s]} />;
}

function InnerCircle({ menuMode }: { menuMode: "NORMAL" | "SELECTING_NODE_POSITION" }) {
    const scale = useSharedValue(0);

    useEffect(() => {
        if (menuMode === "NORMAL") {
            scale.value = withSpring(1, { stiffness: 70 });
            return;
        }

        if (menuMode === "SELECTING_NODE_POSITION") {
            scale.value = withSpring(0, { overshootClamping: true });
            return;
        }
    }, [menuMode]);

    const styles = useAnimatedStyle(() => {
        return { transform: [{ scale: scale.value }] };
    });

    return (
        <Animated.View
            style={[
                styles,
                {
                    height: 118,
                    width: 118,
                    borderColor: "#2C2D2F",
                    backgroundColor: "#181A1C",
                    borderWidth: 2,
                    position: "absolute",
                    top: (NODE_MENU_SIZE - 118) / 2,
                    left: (NODE_MENU_SIZE - 118) / 2,
                    borderRadius: 118,
                },
            ]}
        />
    );
}

function ActionLabel({ actions }: { actions: NodeMenuFunctions["idle"] }) {
    return (
        <>
            <Animated.View style={{ position: "absolute", left: 51, top: 15 }} entering={FadeInDown} exiting={FadeOutDown.duration(150)}>
                <AppText fontSize={12} style={{ color: colors.accent, opacity: actions.verticalUp ? 1 : 0.5 }}>
                    CHECK
                </AppText>
            </Animated.View>
            <Animated.View style={{ position: "absolute", left: 5, top: 70 }} entering={FadeInRight} exiting={FadeOutRight.duration(150)}>
                <AppText fontSize={12} style={{ color: colors.accent, opacity: actions.horizontalLeft ? 1 : 0.5 }}>
                    EDIT
                </AppText>
            </Animated.View>
            <Animated.View style={{ position: "absolute", left: 114, top: 70 }} entering={FadeInLeft} exiting={FadeOutLeft.duration(150)}>
                <AppText fontSize={12} style={{ color: colors.accent }}>
                    ADD
                </AppText>
            </Animated.View>
            <Animated.View style={{ position: "absolute", left: 51, top: 125 }} entering={FadeInUp} exiting={FadeOutUp.duration(150)}>
                <AppText fontSize={12} style={{ color: colors.accent, opacity: actions.verticalDown ? 1 : 0.5 }}>
                    DELETE
                </AppText>
            </Animated.View>
        </>
    );
}

function PositionLabel({ actions }: { actions: NodeMenuFunctions["selectingPosition"] }) {
    return (
        <>
            <Animated.View
                style={{ position: "absolute", left: 52, top: 25 }}
                entering={FadeInDown.duration(250)}
                exiting={FadeOutDown.duration(150)}>
                <AppText fontSize={12} style={{ color: "#FFFFFF", opacity: actions.verticalUp ? 1 : 0.5 }}>
                    PARENT
                </AppText>
            </Animated.View>
            <Animated.View
                style={{ position: "absolute", left: 18, top: 70 }}
                entering={FadeInRight.duration(250)}
                exiting={FadeOutRight.duration(150)}>
                <AppText fontSize={12} style={{ color: "#FFFFFF", opacity: actions.horizontalLeft ? 1 : 0.5 }}>
                    LEFT
                </AppText>
            </Animated.View>
            <Animated.View
                style={{ position: "absolute", left: 97, top: 70 }}
                entering={FadeInLeft.duration(250)}
                exiting={FadeOutLeft.duration(150)}>
                <AppText fontSize={12} style={{ color: "#FFFFFF", opacity: actions.horizontalRight ? 1 : 0.5 }}>
                    RIGHT
                </AppText>
            </Animated.View>
            <Animated.View style={{ position: "absolute", left: 58, top: 115 }} entering={FadeInUp.duration(250)} exiting={FadeOutUp.duration(150)}>
                <AppText fontSize={12} style={{ color: "#FFFFFF", opacity: actions.verticalDown ? 1 : 0.5 }}>
                    CHILD
                </AppText>
            </Animated.View>
        </>
    );
}

export default NodeMenu;
