import { Fragment, useEffect, useState } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
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
import { colors } from "../../../parameters";
import { NodeCoordinate } from "../../../types";
import AppText from "../../AppText";
import DirectionMenu, { Config } from "../../DirectionMenu";
import { adjustedScale } from "../general/NodeLongPressIndicator";
import useWrapNodeMenuFunctions from "./useWrapNodeMenuFunctions";

export const NODE_MENU_SIZE = 150;

const nodeMenuConfig: Config = {
    horizontalSize: NODE_MENU_SIZE,
    verticalSize: NODE_MENU_SIZE,
    circular: true,
    directions: ["horizontal", "vertical"],
    triggerZoneSize: 1,
    allowFling: true,
    allowTap: true,
    runActionOnTouchUp: true,
    maxTapDuration: 999,
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

    useEffect(() => {
        if (menuMode === "SELECTING_NODE_POSITION") progress.value = withTiming(1, { duration: 500 });
    }, [menuMode]);

    const styles = useAnimatedStyle(() => {
        return {
            backgroundColor: interpolateColor(progress.value, [0, 1], ["#181A1C", "#515053"]),
        };
    }, [menuMode]);

    return (
        <Animated.View
            entering={FadeIn.duration(250)}
            exiting={exitOpacityScale(adjustedScale(scale))}
            style={{ position: "absolute", top: position.y, left: position.x, transform: [{ scale: adjustedScale(scale) }] }}>
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
    const borderStyle: ViewStyle["borderStyle"] = menuMode === "NORMAL" ? undefined : "dashed";

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
            <ArrowTopLeftDownRight borderStyle={"dashed"} />
            <ArrowDownLeftTopRight borderStyle={"dashed"} />
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

// function HoveringEffect({ hovering }: { hovering: "LEFT" | "UP" | "RIGHT" | "DOWN" | undefined }) {
//     return (
//         <View pointerEvents={"none"} style={{ height: NODE_MENU_SIZE, width: NODE_MENU_SIZE, position: "absolute" }}>
//             {hovering === "UP" && (
//                 <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)} style={{ position: "absolute", top: 0, left: 21 }}>
//                     <Svg width="106" height="48" viewBox="0 0 106 48" fill="none">
//                         <Defs>
//                             <LinearGradient id="paint0_linear_412_13" x1="53" y1="36.632" x2="52.9999" y2="-2.86798" gradientUnits="userSpaceOnUse">
//                                 <Stop stopColor="#BF5AF2" />
//                                 <Stop offset="100%" stopColor="#5A7BF2" />
//                             </LinearGradient>
//                         </Defs>
//                         <Path
//                             d="M1.44722 23.4472C0.666167 22.6662 0.664339 21.3977 1.46594 20.6378C8.12122 14.3283 15.8817 9.28885 24.3648 5.77504C33.4642 2.00594 43.2169 0.0660047 53.066 0.066005C62.9152 0.0660052 72.6678 2.00594 81.7673 5.77504C90.2504 9.28885 98.0108 14.3283 104.666 20.6378C105.468 21.3977 105.466 22.6662 104.685 23.4472L80.9967 47.1353C80.2157 47.9163 78.9528 47.9119 78.1312 47.1736C74.972 44.3346 71.3497 42.0496 67.4166 40.4205C62.8669 38.536 57.9906 37.566 53.066 37.566C48.1414 37.566 43.2651 38.536 38.7154 40.4205C34.7823 42.0496 31.16 44.3346 28.0008 47.1736C27.1792 47.9119 25.9163 47.9163 25.1353 47.1353L1.44722 23.4472Z"
//                             fill="url(#paint0_linear_412_13)"
//                         />
//                     </Svg>
//                 </Animated.View>
//             )}
//             {hovering === "LEFT" && (
//                 <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)} style={{ position: "absolute", top: 21, left: 0 }}>
//                     <Svg width="48" height="106" viewBox="0 0 48 106" fill="none">
//                         <Defs>
//                             <LinearGradient
//                                 id="paint0_linear_412_9"
//                                 x1="36.632"
//                                 y1="53.1321"
//                                 x2="-2.86798"
//                                 y2="53.1321"
//                                 gradientUnits="userSpaceOnUse">
//                                 <Stop stopColor="#BF5AF2" />
//                                 <Stop offset="100%" stopColor="#5A7BF2" />
//                             </LinearGradient>
//                         </Defs>
//                         <Path
//                             d="M23.4472 104.685C22.6662 105.466 21.3977 105.468 20.6378 104.666C14.3283 98.0108 9.28885 90.2504 5.77504 81.7673C2.00594 72.6679 0.0660047 62.9152 0.066005 53.066C0.0660052 43.2169 2.00594 33.4642 5.77504 24.3648C9.28885 15.8817 14.3283 8.12125 20.6378 1.46596C21.3977 0.664367 22.6662 0.666195 23.4472 1.44724L47.1353 25.1353C47.9163 25.9164 47.9119 27.1792 47.1736 28.0008C44.3346 31.16 42.0496 34.7824 40.4205 38.7154C38.536 43.2651 37.566 48.1415 37.566 53.066C37.566 57.9906 38.536 62.867 40.4205 67.4167C42.0496 71.3497 44.3346 74.9721 47.1736 78.1313C47.9119 78.9528 47.9163 80.2157 47.1353 80.9968L23.4472 104.685Z"
//                             fill="url(#paint0_linear_412_9)"
//                         />
//                     </Svg>
//                 </Animated.View>
//             )}
//             {hovering === "RIGHT" && (
//                 <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)} style={{ position: "absolute", top: 20, right: 0 }}>
//                     <Svg width="49" height="106" viewBox="0 0 49 106" fill="none">
//                         <Defs>
//                             <LinearGradient id="paint0_linear_412_14" x1="11.5" y1="53" x2="51" y2="53" gradientUnits="userSpaceOnUse">
//                                 <Stop stopColor="#BF5AF2" />
//                                 <Stop offset="100%" stopColor="#5A7BF2" />
//                             </LinearGradient>
//                         </Defs>
//                         <Path
//                             d="M24.6848 1.44725C25.4659 0.666198 26.7343 0.66437 27.4942 1.46597C33.8037 8.12125 38.8432 15.8817 42.357 24.3648C46.1261 33.4642 48.066 43.2169 48.066 53.066C48.066 62.9152 46.1261 72.6679 42.357 81.7673C38.8432 90.2504 33.8037 98.0108 27.4942 104.666C26.7343 105.468 25.4659 105.466 24.6848 104.685L0.996732 80.9968C0.215683 80.2157 0.220081 78.9528 0.958383 78.1313C3.79738 74.9721 6.08238 71.3497 7.7115 67.4167C9.59605 62.867 10.566 57.9906 10.566 53.066C10.566 48.1415 9.59605 43.2651 7.7115 38.7154C6.08238 34.7824 3.79738 31.16 0.958384 28.0008C0.220082 27.1792 0.215684 25.9164 0.996733 25.1353L24.6848 1.44725Z"
//                             fill="url(#paint0_linear_412_14)"
//                         />
//                     </Svg>
//                 </Animated.View>
//             )}
//             {hovering === "DOWN" && (
//                 <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)} style={{ position: "absolute", top: 100, left: 21 }}>
//                     <Svg width="106" height="49" viewBox="0 0 106 49" fill="none">
//                         <Defs>
//                             <LinearGradient id="paint0_linear_412_15" x1="53.1321" y1="11.5" x2="53.1321" y2="51" gradientUnits="userSpaceOnUse">
//                                 <Stop stopColor="#BF5AF2" />
//                                 <Stop offset="100%" stopColor="#5A7BF2" />
//                             </LinearGradient>
//                         </Defs>
//                         <Path
//                             d="M104.685 24.6848C105.466 25.4659 105.468 26.7343 104.666 27.4942C98.0108 33.8037 90.2504 38.8432 81.7673 42.357C72.6678 46.1261 62.9151 48.066 53.066 48.066C43.2169 48.066 33.4642 46.1261 24.3648 42.357C15.8817 38.8432 8.12122 33.8037 1.46593 27.4942C0.664337 26.7343 0.666165 25.4659 1.44721 24.6848L25.1353 0.996732C25.9163 0.215683 27.1792 0.220081 28.0008 0.958383C31.16 3.79738 34.7823 6.08238 38.7154 7.7115C43.2651 9.59605 48.1414 10.566 53.066 10.566C57.9906 10.566 62.8669 9.59605 67.4166 7.7115C71.3497 6.08238 74.972 3.79738 78.1312 0.958384C78.9528 0.220082 80.2157 0.215684 80.9967 0.996733L104.685 24.6848Z"
//                             fill="url(#paint0_linear_412_15)"
//                         />
//                     </Svg>
//                 </Animated.View>
//             )}
//         </View>
//     );
// }

export default NodeMenu;
