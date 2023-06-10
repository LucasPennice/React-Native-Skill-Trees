import { useState } from "react";
import { Dimensions, Pressable } from "react-native";
import Animated, { FadeInDown, FadeInLeft, FadeOutLeft, FadeOutUp, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { MENU_HIGH_DAMPENING, colors } from "../parameters";
import { generalStyles } from "../styles";
import AppText from "./AppText";
import EmojiSelector from "./EmojiSelector";

function ShowHideEmojiSelector({ emojiState, containerWidth }: { emojiState: [null | string, (v: null | string) => void]; containerWidth?: number }) {
    const { width } = Dimensions.get("screen");
    const [showEmojiSelector, setShowEmojiSelector] = useState(false);
    const [icon, setIcon] = emojiState;

    const EDIT_SKILL_ICON_BTN_WIDTH = 160;
    const EDIT_SKILL_ICON_BTN_HEIGHT = 45;

    let cWidth = containerWidth ?? width - 20;

    const containerStyles = useAnimatedStyle(() => {
        return {
            width: withSpring(showEmojiSelector ? cWidth : EDIT_SKILL_ICON_BTN_WIDTH, MENU_HIGH_DAMPENING),
            height: withSpring(showEmojiSelector ? 276 : EDIT_SKILL_ICON_BTN_HEIGHT, MENU_HIGH_DAMPENING),
        };
    }, [showEmojiSelector]);

    return (
        <Animated.View style={[containerStyles, { backgroundColor: "#282A2C", marginVertical: 10, borderRadius: 10, overflow: "hidden" }]}>
            {showEmojiSelector && (
                <Animated.View entering={FadeInDown} exiting={FadeOutUp}>
                    <EmojiSelector
                        displaceScroll
                        containerWidth={containerWidth}
                        selectedEmoji={icon}
                        onEmojiClick={(clickedIcon: string) =>
                            //@ts-ignore
                            setIcon((p) => {
                                if (p === clickedIcon && p !== null) return null;
                                return clickedIcon;
                            })
                        }
                    />
                </Animated.View>
            )}
            {!showEmojiSelector && (
                <Animated.View>
                    <Pressable style={[generalStyles.btn, { backgroundColor: "#282A2C00" }]} onPress={() => setShowEmojiSelector(true)}>
                        <AppText style={{ color: colors.accent }} fontSize={16} textProps={{ ellipsizeMode: "clip", numberOfLines: 1 }}>
                            Edit Skill Icon
                        </AppText>
                    </Pressable>
                </Animated.View>
            )}

            {showEmojiSelector && (
                <Animated.View style={{ position: "absolute", right: 0 }} entering={FadeInLeft} exiting={FadeOutLeft}>
                    <Pressable
                        style={[generalStyles.btn, { backgroundColor: "#282A2C", minHeight: 47, height: 47 }]}
                        onPress={() => {
                            setShowEmojiSelector(false);
                        }}>
                        <AppText style={{ color: colors.red, fontFamily: "emojisMono" }} fontSize={14}>
                            Close
                        </AppText>
                    </Pressable>
                </Animated.View>
            )}
        </Animated.View>
    );
}

export default ShowHideEmojiSelector;
