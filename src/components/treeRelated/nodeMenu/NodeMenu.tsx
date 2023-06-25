import * as Haptics from "expo-haptics";
import { useMemo, useState } from "react";
import { View } from "react-native";
import Animated, {
    FadeIn,
    FadeInDown,
    FadeInLeft,
    FadeInRight,
    FadeInUp,
    FadeOut,
    FadeOutDown,
    FadeOutLeft,
    FadeOutRight,
    FadeOutUp,
    ZoomOut,
    useAnimatedStyle,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { Defs, LinearGradient, Path, Stop, Svg } from "react-native-svg";
import { ScreenDimentions } from "../../../redux/screenDimentionsSlice";
import { CanvasDimensions, CoordinatesWithTreeData } from "../../../types";
import AppText from "../../AppText";
import DirectionMenu, { Config } from "../../DirectionMenu";
import { distanceFromLeftCanvasEdge } from "../coordinateFunctions";
import { CIRCLE_SIZE } from "../../../parameters";

const nodeMenuConfig: Config = {
    horizontalSize: 150,
    verticalSize: 150,
    circular: true,
    directions: ["horizontal", "vertical"],
    triggerZoneSize: 0.7,
    allowFling: true,
    allowTap: true,
    runActionOnTouchUp: true,
    showBounds: false,
};

const MENU_WIDTH = 300;
const JOYSTICK_WIDTH = 50;

function NodeMenu({
    data,
    offset,
    canvasDimentions,
    screenDimensions,
    closeNodeMenu,
}: {
    data: CoordinatesWithTreeData;
    offset: { x: number; y: number };
    canvasDimentions: CanvasDimensions;
    screenDimensions: ScreenDimentions;
    closeNodeMenu: () => void;
}) {
    const { canvasWidth } = canvasDimentions;

    const leftCanvasEdgeOffset = distanceFromLeftCanvasEdge(canvasWidth, screenDimensions.width, offset.x);

    const position = { x: data.x - leftCanvasEdgeOffset - MENU_WIDTH / 4, y: data.y + offset.y - MENU_WIDTH / 4 };

    const [hovering, setHovering] = useState<"LEFT" | "UP" | "RIGHT" | "DOWN" | undefined>(undefined);

    const menuActions = {
        horizontalLeft: () => {
            console.log("hL");
            closeNodeMenu();
            setHovering(undefined);
        },
        horizontalRight: () => {
            console.log("hR");
            closeNodeMenu();
            setHovering(undefined);
        },
        verticalDown: () => {
            console.log("vD");
            closeNodeMenu();
            setHovering(undefined);
        },
        verticalUp: () => {
            console.log("vU");
            closeNodeMenu();
            setHovering(undefined);
        },
    };

    const onHoverActions = {
        horizontalLeft: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setHovering("LEFT");
            console.log("hovering over hL");
        },
        horizontalRight: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setHovering("RIGHT");
            console.log("hovering over hR");
        },
        verticalDown: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setHovering("DOWN");
            console.log("hovering over vD");
        },
        verticalUp: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setHovering("UP");
            console.log("hovering over vU");
        },
        clearHover: () => setHovering(undefined),
    };

    //Avoids "enter" animation triggering twice when hovering state changes
    const MemoedJoystick = useMemo(() => {
        return <Joystick />;
    }, []);

    return (
        <Animated.View
            entering={FadeIn.duration(150)}
            exiting={FadeOut.duration(150)}
            style={{ position: "absolute", top: position.y, left: position.x }}>
            <View
                style={{
                    height: MENU_WIDTH / 2,
                    width: MENU_WIDTH / 2,
                    backgroundColor: "#181A1C",
                    borderColor: "#B1B2B220",
                    borderWidth: 1,
                    borderRadius: MENU_WIDTH / 2,
                    position: "relative",
                }}>
                <ArrowTopLeftDownRight />
                <ArrowDownLeftTopRight />
                <InnerCircle />
                <HoveringEffect hovering={hovering} />
                <ActionLabel />

                <DirectionMenu action={menuActions} onHoverActions={onHoverActions} config={nodeMenuConfig}>
                    {MemoedJoystick}
                </DirectionMenu>
            </View>
        </Animated.View>
    );
}

function ArrowTopLeftDownRight() {
    return (
        <View
            style={{
                borderTopWidth: 1,
                borderTopColor: "#B1B2B220",
                position: "absolute",
                top: 0,
                left: 0,
                width: MENU_WIDTH / 2,
                transform: [{ rotate: "45deg" }, { translateX: 53 }, { translateY: 52 }],
            }}
        />
    );
}

function ArrowDownLeftTopRight() {
    return (
        <View
            style={{
                borderTopWidth: 1,
                borderTopColor: "#B1B2B220",
                position: "absolute",
                width: MENU_WIDTH / 2,
                top: 0,
                left: 0,
                transform: [{ rotate: "-45deg" }, { translateX: -53 }, { translateY: 52 }],
            }}
        />
    );
}

function InnerCircle() {
    return (
        <View
            style={{
                height: 118,
                width: 118,
                borderColor: "#B1B2B220",
                backgroundColor: "#181A1C",
                borderWidth: 1,
                position: "absolute",
                top: (MENU_WIDTH / 2 - 118) / 2,
                left: (MENU_WIDTH / 2 - 118) / 2,
                borderRadius: 118,
            }}
        />
    );
}

function Joystick() {
    const initialScale = (CIRCLE_SIZE * 2) / JOYSTICK_WIDTH;
    const onRender = useAnimatedStyle(() => {
        return { transform: [{ scale: withSequence(withTiming(initialScale, { duration: 0 }), withSpring(1, { stiffness: 150 })) }] };
    }, []);

    return (
        <Animated.View
            exiting={ZoomOut.duration(150)}
            style={[
                onRender,
                {
                    backgroundColor: "#B1B2B2",
                    height: JOYSTICK_WIDTH,
                    width: JOYSTICK_WIDTH,
                    borderRadius: 100,
                    shadowColor: "#000",
                    shadowOffset: {
                        width: 0,
                        height: 0,
                    },
                    shadowOpacity: 0.7,
                    shadowRadius: 10.84,

                    elevation: 5,
                },
            ]}
        />
    );
}

function ActionLabel() {
    return (
        <>
            <Animated.View style={{ position: "absolute", left: 51, top: 15 }} entering={FadeInDown} exiting={FadeOutDown.duration(150)}>
                <AppText fontSize={12} style={{ color: "#FFFFFF" }}>
                    CHECK
                </AppText>
            </Animated.View>
            <Animated.View style={{ position: "absolute", left: 5, top: 70 }} entering={FadeInRight} exiting={FadeOutRight.duration(150)}>
                <AppText fontSize={12} style={{ color: "#FFFFFF" }}>
                    EDIT
                </AppText>
            </Animated.View>
            <Animated.View style={{ position: "absolute", left: 114, top: 70 }} entering={FadeInLeft} exiting={FadeOutLeft.duration(150)}>
                <AppText fontSize={12} style={{ color: "#FFFFFF" }}>
                    ADD
                </AppText>
            </Animated.View>
            <Animated.View style={{ position: "absolute", left: 51, top: 125 }} entering={FadeInUp} exiting={FadeOutUp.duration(150)}>
                <AppText fontSize={12} style={{ color: "#FFFFFF" }}>
                    DELETE
                </AppText>
            </Animated.View>
        </>
    );
}

function HoveringEffect({ hovering }: { hovering: "LEFT" | "UP" | "RIGHT" | "DOWN" | undefined }) {
    if (hovering === "UP")
        return (
            <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)} style={{ position: "absolute", top: 0, left: 21 }}>
                <Svg width="106" height="48" viewBox="0 0 106 48" fill="none">
                    <Defs>
                        <LinearGradient id="paint0_linear_412_13" x1="53" y1="36.632" x2="52.9999" y2="-2.86798" gradientUnits="userSpaceOnUse">
                            <Stop stopColor="#BF5AF2" />
                            <Stop offset="100%" stopColor="#5A7BF2" />
                        </LinearGradient>
                    </Defs>
                    <Path
                        d="M1.44722 23.4472C0.666167 22.6662 0.664339 21.3977 1.46594 20.6378C8.12122 14.3283 15.8817 9.28885 24.3648 5.77504C33.4642 2.00594 43.2169 0.0660047 53.066 0.066005C62.9152 0.0660052 72.6678 2.00594 81.7673 5.77504C90.2504 9.28885 98.0108 14.3283 104.666 20.6378C105.468 21.3977 105.466 22.6662 104.685 23.4472L80.9967 47.1353C80.2157 47.9163 78.9528 47.9119 78.1312 47.1736C74.972 44.3346 71.3497 42.0496 67.4166 40.4205C62.8669 38.536 57.9906 37.566 53.066 37.566C48.1414 37.566 43.2651 38.536 38.7154 40.4205C34.7823 42.0496 31.16 44.3346 28.0008 47.1736C27.1792 47.9119 25.9163 47.9163 25.1353 47.1353L1.44722 23.4472Z"
                        fill="url(#paint0_linear_412_13)"
                    />
                </Svg>
            </Animated.View>
        );
    if (hovering === "LEFT")
        return (
            <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)} style={{ position: "absolute", top: 21, left: 0 }}>
                <Svg width="48" height="106" viewBox="0 0 48 106" fill="none">
                    <Defs>
                        <LinearGradient id="paint0_linear_412_9" x1="36.632" y1="53.1321" x2="-2.86798" y2="53.1321" gradientUnits="userSpaceOnUse">
                            <Stop stopColor="#BF5AF2" />
                            <Stop offset="100%" stopColor="#5A7BF2" />
                        </LinearGradient>
                    </Defs>
                    <Path
                        d="M23.4472 104.685C22.6662 105.466 21.3977 105.468 20.6378 104.666C14.3283 98.0108 9.28885 90.2504 5.77504 81.7673C2.00594 72.6679 0.0660047 62.9152 0.066005 53.066C0.0660052 43.2169 2.00594 33.4642 5.77504 24.3648C9.28885 15.8817 14.3283 8.12125 20.6378 1.46596C21.3977 0.664367 22.6662 0.666195 23.4472 1.44724L47.1353 25.1353C47.9163 25.9164 47.9119 27.1792 47.1736 28.0008C44.3346 31.16 42.0496 34.7824 40.4205 38.7154C38.536 43.2651 37.566 48.1415 37.566 53.066C37.566 57.9906 38.536 62.867 40.4205 67.4167C42.0496 71.3497 44.3346 74.9721 47.1736 78.1313C47.9119 78.9528 47.9163 80.2157 47.1353 80.9968L23.4472 104.685Z"
                        fill="url(#paint0_linear_412_9)"
                    />
                </Svg>
            </Animated.View>
        );
    if (hovering === "RIGHT")
        return (
            <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)} style={{ position: "absolute", top: 20, right: 0 }}>
                <Svg width="49" height="106" viewBox="0 0 49 106" fill="none">
                    <Defs>
                        <LinearGradient id="paint0_linear_412_14" x1="11.5" y1="53" x2="51" y2="53" gradientUnits="userSpaceOnUse">
                            <Stop stopColor="#BF5AF2" />
                            <Stop offset="100%" stopColor="#5A7BF2" />
                        </LinearGradient>
                    </Defs>
                    <Path
                        d="M24.6848 1.44725C25.4659 0.666198 26.7343 0.66437 27.4942 1.46597C33.8037 8.12125 38.8432 15.8817 42.357 24.3648C46.1261 33.4642 48.066 43.2169 48.066 53.066C48.066 62.9152 46.1261 72.6679 42.357 81.7673C38.8432 90.2504 33.8037 98.0108 27.4942 104.666C26.7343 105.468 25.4659 105.466 24.6848 104.685L0.996732 80.9968C0.215683 80.2157 0.220081 78.9528 0.958383 78.1313C3.79738 74.9721 6.08238 71.3497 7.7115 67.4167C9.59605 62.867 10.566 57.9906 10.566 53.066C10.566 48.1415 9.59605 43.2651 7.7115 38.7154C6.08238 34.7824 3.79738 31.16 0.958384 28.0008C0.220082 27.1792 0.215684 25.9164 0.996733 25.1353L24.6848 1.44725Z"
                        fill="url(#paint0_linear_412_14)"
                    />
                </Svg>
            </Animated.View>
        );
    if (hovering === "DOWN")
        return (
            <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)} style={{ position: "absolute", top: 100, left: 21 }}>
                <Svg width="106" height="49" viewBox="0 0 106 49" fill="none">
                    <Defs>
                        <LinearGradient id="paint0_linear_412_15" x1="53.1321" y1="11.5" x2="53.1321" y2="51" gradientUnits="userSpaceOnUse">
                            <Stop stopColor="#BF5AF2" />
                            <Stop offset="100%" stopColor="#5A7BF2" />
                        </LinearGradient>
                    </Defs>
                    <Path
                        d="M104.685 24.6848C105.466 25.4659 105.468 26.7343 104.666 27.4942C98.0108 33.8037 90.2504 38.8432 81.7673 42.357C72.6678 46.1261 62.9151 48.066 53.066 48.066C43.2169 48.066 33.4642 46.1261 24.3648 42.357C15.8817 38.8432 8.12122 33.8037 1.46593 27.4942C0.664337 26.7343 0.666165 25.4659 1.44721 24.6848L25.1353 0.996732C25.9163 0.215683 27.1792 0.220081 28.0008 0.958383C31.16 3.79738 34.7823 6.08238 38.7154 7.7115C43.2651 9.59605 48.1414 10.566 53.066 10.566C57.9906 10.566 62.8669 9.59605 67.4166 7.7115C71.3497 6.08238 74.972 3.79738 78.1312 0.958384C78.9528 0.220082 80.2157 0.215684 80.9967 0.996733L104.685 24.6848Z"
                        fill="url(#paint0_linear_412_15)"
                    />
                </Svg>
            </Animated.View>
        );
    return <></>;
}

export default NodeMenu;
