import { SkiaFontContext } from "app/_layout";
import { memo, useContext } from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";
import { Circle, Defs, LinearGradient, Stop, Svg } from "react-native-svg";
import { getWheelParams } from "../functions/misc";
import { PURPLE_GRADIENT, centerFlex, colors } from "../parameters";
import { ColorGradient, NodeCategory, Skill } from "../types";
import AppText from "./AppText";
import useShowHideStylesWithoutTransitionView from "./treeRelated/hooks/useShowHideStylesWithoutTransitionView";

function NodeView<T extends { data: Skill; accentColor: ColorGradient; category: NodeCategory }>({
    node,
    params,
}: {
    node: T;
    params: { oneColorPerTree: boolean; showIcons: boolean; size: number; fontSize?: number; completePercentage: number; rootColor?: ColorGradient };
}) {
    const { completePercentage = 100, oneColorPerTree, showIcons, size, fontSize = 25, rootColor = PURPLE_GRADIENT } = params;

    const gradient = oneColorPerTree ? rootColor : node.accentColor;
    const progressWheelProps = getWheelParams(gradient.color1, `${gradient.color1}3D`, size, (8 * size) / 150);

    const skill = node.data;
    const category = node.category;
    const isEmojiIcon = skill.icon.isEmoji;

    const result = progressWheelProps.circumference - (progressWheelProps.circumference * completePercentage) / 100;

    const showIcon = useShowHideStylesWithoutTransitionView(showIcons);

    const fonts = useContext(SkiaFontContext);

    if (!fonts) return <></>;

    // return <StaticNodeList allNodes={[node]} />;
    if (category === "SKILL") return <Skill />;

    if (category === "USER") return <User />;

    return <SkillTree />;

    function User() {
        return (
            <View>
                <Svg width={progressWheelProps.size} height={progressWheelProps.size}>
                    <Defs>
                        <LinearGradient id="progressColor" x1="0%" y1="0%" x2="100%" y2="100%">
                            <Stop offset="0%" stopColor={gradient.color1} stopOpacity="1" />
                            <Stop offset="100%" stopColor={gradient.color2} stopOpacity="1" />
                        </LinearGradient>
                    </Defs>
                    <Circle
                        strokeWidth={progressWheelProps.strokeWidth}
                        cx={progressWheelProps.centerCoordinate}
                        cy={progressWheelProps.centerCoordinate}
                        r={progressWheelProps.radius}
                        fill={"url(#progressColor)"}
                    />
                </Svg>
                {showIcons && (
                    <Animated.View
                        style={[centerFlex, showIcon, { width: size - 1, height: size + 1, position: "absolute", right: 0, overflow: "hidden" }]}>
                        <AppText
                            fontSize={fontSize}
                            style={{
                                position: "absolute",
                                color: colors.background,
                                width: size,
                                textAlign: "center",
                                lineHeight: isEmojiIcon ? size : undefined,
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
                    <Defs>
                        <LinearGradient id="outerEdge" x1="0%" y1="0%" x2="100%" y2="100%">
                            <Stop offset="0%" stopColor={"#515053"} stopOpacity="1" />
                            <Stop offset="100%" stopColor={"#2C2C2D"} stopOpacity="1" />
                        </LinearGradient>
                    </Defs>
                    {/* Background circle */}
                    <Circle
                        cx={progressWheelProps.centerCoordinate}
                        cy={progressWheelProps.centerCoordinate}
                        r={progressWheelProps.radius}
                        fillOpacity={1}
                    />
                    {/* Outer edge */}
                    <Circle
                        strokeWidth={progressWheelProps.strokeWidth}
                        cx={progressWheelProps.centerCoordinate}
                        cy={progressWheelProps.centerCoordinate}
                        fillOpacity={0}
                        r={progressWheelProps.radius}
                        stroke={"url(#outerEdge)"}
                    />
                    {completePercentage !== 0 && (
                        <Circle
                            strokeWidth={progressWheelProps.strokeWidth}
                            cx={progressWheelProps.centerCoordinate}
                            cy={progressWheelProps.centerCoordinate}
                            r={progressWheelProps.radius}
                            fillOpacity={0}
                            stroke={"url(#progressColor)"}
                            strokeDasharray={progressWheelProps.circumference}
                            strokeLinecap="round"
                            strokeDashoffset={1 - result}
                        />
                    )}
                </Svg>
                {showIcons && (
                    <View style={[centerFlex, { width: size - 1, height: size + 1, position: "absolute", right: 0, overflow: "hidden" }]}>
                        <AppText
                            fontSize={fontSize}
                            style={{
                                position: "absolute",
                                color: category === "SKILL" ? colors.unmarkedText : gradient.color1,
                                lineHeight: isEmojiIcon ? size : undefined,
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
                        fill={colors.background}
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
                {showIcons && (
                    <Animated.View
                        style={[centerFlex, showIcon, { width: size - 1, height: size + 1, position: "absolute", right: 0, overflow: "hidden" }]}>
                        <AppText
                            fontSize={fontSize}
                            style={{
                                position: "absolute",
                                color: category === "SKILL" ? "#515053" : gradient.color1,
                                width: size,
                                textAlign: "center",
                                lineHeight: isEmojiIcon ? size : undefined,
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
