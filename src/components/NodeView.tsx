import { View } from "react-native";
import { Circle, Defs, LinearGradient, Stop, Svg } from "react-native-svg";
import { treeCompletedSkillPercentage } from "../functions/extractInformationFromTree";
import { centerFlex, colors } from "../parameters";
import { Skill, Tree } from "../types";
import AppText from "./AppText";
import { ProgressWheelParams } from "./ProgressIndicatorAndName";

function NodeView({ node, size }: { node: Tree<Skill>; size: number }) {
    const gradient = node.accentColor;
    const progressWheelProps = new ProgressWheelParams(gradient.color1, `${gradient.color1}3D`, size, (8 * size) / 150);

    const skill = node.data;
    const category = node.category;
    const isEmojiIcon = skill.icon.isEmoji;

    const completedPercentage = treeCompletedSkillPercentage(node);
    const result = progressWheelProps.circumference - (progressWheelProps.circumference * completedPercentage) / 100;

    if (category === "SKILL") return <Skill />;

    return <SkillTree />;

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
                            r={progressWheelProps.radius}
                            stroke={progressWheelProps.backgroundStroke}
                        />
                    )}
                    <Circle
                        strokeWidth={progressWheelProps.strokeWidth}
                        cx={progressWheelProps.centerCoordinate}
                        cy={progressWheelProps.centerCoordinate}
                        r={progressWheelProps.radius}
                        stroke={"url(#progressColor)"}
                        strokeDasharray={progressWheelProps.circumference}
                        strokeLinecap="round"
                        strokeDashoffset={result}
                    />
                </Svg>
                <View style={[centerFlex, { width: size, height: size, position: "absolute", right: 0 }]}>
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
                        strokeDasharray={progressWheelProps.circumference}
                        strokeLinecap="round"
                    />
                </Svg>
                <View style={[centerFlex, { width: size, height: size, position: "absolute", right: 0 }]}>
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
                </View>
            </View>
        );
    }
}

export default NodeView;
