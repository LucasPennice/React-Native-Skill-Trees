import { memo } from "react";
import { View } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { Circle, Defs, LinearGradient, Stop, Svg } from "react-native-svg";
import { treeCompletedSkillPercentage } from "../functions/extractInformationFromTree";
import { getWheelParams } from "../functions/misc";
import { centerFlex, colors } from "../parameters";
import { Skill, Tree } from "../types";
import AppText from "./AppText";

function NodeView({ node, size, hideIcon }: { node: Tree<Skill>; size: number; hideIcon?: boolean }) {
    const gradient = node.accentColor;
    const progressWheelProps = getWheelParams(gradient.color1, `${gradient.color1}3D`, size, (8 * size) / 150);

    const skill = node.data;
    const category = node.category;
    const isEmojiIcon = skill.icon.isEmoji;

    const completedPercentage = treeCompletedSkillPercentage(node);
    const result = progressWheelProps.circumference - (progressWheelProps.circumference * completedPercentage) / 100;

    if (category === "SKILL") return <Skill />;

    if (category === "USER") return <User />;

    return <SkillTree />;

    function User() {
        return (
            <View>
                <Svg width={progressWheelProps.size} height={progressWheelProps.size}>
                    <Defs>
                        {skill.isCompleted && (
                            <LinearGradient id="progressColor" x1="0%" y1="0%" x2="100%" y2="100%">
                                <Stop offset="0%" stopColor={gradient.color1} stopOpacity="1" />
                                <Stop offset="100%" stopColor={gradient.color2} stopOpacity="1" />
                            </LinearGradient>
                        )}
                        {!skill.isCompleted && (
                            <LinearGradient id="progressColor" x1="0%" y1="0%" x2="100%" y2="100%">
                                <Stop offset="0%" stopColor={"#515053"} stopOpacity="1" />
                                <Stop offset="100%" stopColor={"#2C2C2D"} stopOpacity="1" />
                            </LinearGradient>
                        )}
                    </Defs>
                    <Circle
                        strokeWidth={progressWheelProps.strokeWidth}
                        cx={progressWheelProps.centerCoordinate}
                        cy={progressWheelProps.centerCoordinate}
                        r={progressWheelProps.radius}
                        fill={"url(#progressColor)"}
                    />
                    <Circle
                        strokeWidth={progressWheelProps.strokeWidth}
                        cx={progressWheelProps.centerCoordinate}
                        cy={progressWheelProps.centerCoordinate}
                        r={progressWheelProps.radius}
                        stroke={"url(#progressColor)"}
                        fillOpacity={0}
                        strokeDasharray={progressWheelProps.circumference}
                        strokeLinecap="round"
                    />
                </Svg>
                {!hideIcon && (
                    <Animated.View
                        entering={FadeInDown}
                        exiting={FadeOutDown}
                        style={[centerFlex, { width: size, height: size, position: "absolute", right: 0, overflow: "hidden" }]}>
                        <AppText
                            fontSize={25}
                            style={{
                                position: "absolute",
                                color: "#000000",
                                width: size,
                                textAlign: "center",
                                lineHeight: isEmojiIcon ? 28 : undefined,
                                fontFamily: isEmojiIcon ? "emojisMono" : "helvetica",
                            }}>
                            {isEmojiIcon ? skill.icon.text : skill.name[0]}
                        </AppText>
                    </Animated.View>
                )}
            </View>
        );
    }
    function SkillTree() {
        return (
            <View>
                <Svg width={progressWheelProps.size} height={progressWheelProps.size}>
                    <Defs>
                        <LinearGradient id="progressColor" x1="0%" y1="0%" x2="100%" y2="100%">
                            <Stop offset="0%" stopColor={gradient.color1} stopOpacity="1" />
                            <Stop offset="100%" stopColor={gradient.color2} stopOpacity="1" />
                        </LinearGradient>
                    </Defs>
                    {category !== "SKILL" && (
                        <Circle
                            strokeWidth={progressWheelProps.strokeWidth}
                            cx={progressWheelProps.centerCoordinate}
                            cy={progressWheelProps.centerCoordinate}
                            fillOpacity={0}
                            r={progressWheelProps.radius}
                            stroke={progressWheelProps.backgroundStroke}
                        />
                    )}
                    <Circle
                        strokeWidth={progressWheelProps.strokeWidth}
                        cx={progressWheelProps.centerCoordinate}
                        cy={progressWheelProps.centerCoordinate}
                        r={progressWheelProps.radius}
                        fillOpacity={0}
                        stroke={"url(#progressColor)"}
                        strokeDasharray={progressWheelProps.circumference}
                        strokeLinecap="round"
                        strokeDashoffset={result}
                    />
                </Svg>
                {!hideIcon && (
                    <View style={[centerFlex, { width: size, height: size, position: "absolute", right: 0, overflow: "hidden" }]}>
                        <AppText
                            fontSize={25}
                            style={{
                                position: "absolute",
                                color: category === "SKILL" ? colors.unmarkedText : gradient.color1,
                                lineHeight: isEmojiIcon ? 28 : undefined,
                                fontFamily: isEmojiIcon ? "emojisMono" : "helvetica",
                            }}>
                            {isEmojiIcon ? skill.icon.text : skill.icon.text[0]}
                        </AppText>
                    </View>
                )}
            </View>
        );
    }
    function Skill() {
        return (
            <View>
                <Svg width={progressWheelProps.size} height={progressWheelProps.size}>
                    <Defs>
                        {skill.isCompleted && (
                            <LinearGradient id="progressColor" x1="0%" y1="0%" x2="100%" y2="100%">
                                <Stop offset="0%" stopColor={gradient.color1} stopOpacity="1" />
                                <Stop offset="100%" stopColor={gradient.color2} stopOpacity="1" />
                            </LinearGradient>
                        )}
                        {!skill.isCompleted && (
                            <LinearGradient id="progressColor" x1="0%" y1="0%" x2="100%" y2="100%">
                                <Stop offset="0%" stopColor={"#515053"} stopOpacity="1" />
                                <Stop offset="100%" stopColor={"#2C2C2D"} stopOpacity="1" />
                            </LinearGradient>
                        )}
                    </Defs>
                    <Circle
                        strokeWidth={progressWheelProps.strokeWidth}
                        cx={progressWheelProps.centerCoordinate}
                        cy={progressWheelProps.centerCoordinate}
                        r={progressWheelProps.radius}
                        fill={"#000000"}
                    />
                    <Circle
                        strokeWidth={progressWheelProps.strokeWidth}
                        cx={progressWheelProps.centerCoordinate}
                        cy={progressWheelProps.centerCoordinate}
                        r={progressWheelProps.radius}
                        stroke={"url(#progressColor)"}
                        fillOpacity={0}
                        strokeDasharray={progressWheelProps.circumference}
                        strokeLinecap="round"
                    />
                </Svg>
                {!hideIcon && (
                    <Animated.View
                        entering={FadeInDown}
                        exiting={FadeOutDown}
                        style={[centerFlex, { width: size, height: size, position: "absolute", right: 0, overflow: "hidden" }]}>
                        <AppText
                            fontSize={25}
                            style={{
                                position: "absolute",
                                color: category === "SKILL" ? colors.unmarkedText : gradient.color1,
                                width: size,
                                textAlign: "center",
                                lineHeight: isEmojiIcon ? 28 : undefined,
                                fontFamily: isEmojiIcon ? "emojisMono" : "helvetica",
                            }}>
                            {isEmojiIcon ? skill.icon.text : skill.name[0]}
                        </AppText>
                    </Animated.View>
                )}
            </View>
        );
    }
}

export default memo(NodeView);
