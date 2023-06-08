import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { Circle, Defs, LinearGradient, Stop, Svg } from "react-native-svg";
import AppText from "../../components/AppText";
import { ProgressWheelParams } from "../../components/ProgressIndicatorAndName";
import { countCompletedSkillNodes, countSkillNodes, treeCompletedSkillPercentage } from "../../functions/extractInformationFromTree";
import { WHITE_GRADIENT, centerFlex, colors } from "../../parameters";
import { setTree } from "../../redux/editTreeSlice";
import { useAppDispatch, useAppSelector } from "../../redux/reduxHooks";
import { selectSafeScreenDimentions } from "../../redux/screenDimentionsSlice";
import { Skill, Tree } from "../../types";

function TreeCard({ element, changeTreeAndNavigateToViewingTree }: { element: Tree<Skill>; changeTreeAndNavigateToViewingTree: () => void }) {
    //Redux Related
    const dispatch = useAppDispatch();
    const { width } = useAppSelector(selectSafeScreenDimentions);
    const dispatchSetTree = () => dispatch(setTree(element));
    //
    const treeAccentColor = element ? element.accentColor : WHITE_GRADIENT;

    const progressWheelProps = new ProgressWheelParams(treeAccentColor.color1, `${treeAccentColor.color1}3D`, 60, 5);

    const completedSkillsQty = countCompletedSkillNodes(element);
    const skillsQty = countSkillNodes(element);
    const completedPercentage = treeCompletedSkillPercentage(element);

    const result = progressWheelProps.circumference - (progressWheelProps.circumference * completedPercentage) / 100;

    const tapGesture = Gesture.Tap().onEnd((e) => {
        runOnJS(changeTreeAndNavigateToViewingTree)();
    });

    const scale = useSharedValue(1);

    const longPressGesture = Gesture.LongPress()
        .minDuration(500)
        .onBegin(() => {
            scale.value = withTiming(1.05, { duration: 1000, easing: Easing.bezier(0.83, 0, 0.17, 1) });
        })
        .onStart(() => {
            runOnJS(dispatchSetTree)();
        })
        .onFinalize(() => {
            scale.value = withSpring(1);
        });

    const animatedStyles = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    const gestures = Gesture.Exclusive(tapGesture, longPressGesture);

    const isEmojiIcon = element.data.icon.isEmoji;

    return (
        <GestureDetector gesture={gestures}>
            <Animated.View
                style={[
                    centerFlex,
                    animatedStyles,
                    {
                        flexDirection: "row",
                        justifyContent: "space-between",
                        backgroundColor: colors.darkGray,
                        marginBottom: 30,
                        height: 100,
                        borderRadius: 10,
                        paddingHorizontal: 20,
                    },
                ]}>
                <View>
                    <AppText
                        textProps={{ numberOfLines: 1, ellipsizeMode: "tail" }}
                        fontSize={20}
                        style={{ color: "#FFFFFF", fontFamily: "helveticaBold", maxWidth: width - 150 }}>
                        {element.treeName ?? "tree"}
                    </AppText>
                    <AppText fontSize={20} style={{ color: "#FFFFFF5D" }}>
                        {completedPercentage.toFixed(0)}% Complete
                    </AppText>
                    <AppText fontSize={20} style={{ color: "#FFFFFF5D" }}>
                        {completedSkillsQty} skills of {skillsQty}
                    </AppText>
                </View>
                <Svg width={progressWheelProps.size} height={progressWheelProps.size}>
                    <Defs>
                        <LinearGradient id="progressColor" x1="0%" y1="0%" x2="100%" y2="100%">
                            <Stop offset="0%" stopColor={element.accentColor.color1} stopOpacity="1" />
                            <Stop offset="100%" stopColor={element.accentColor.color2} stopOpacity="1" />
                        </LinearGradient>
                    </Defs>
                    <Circle
                        strokeWidth={progressWheelProps.strokeWidth}
                        cx={progressWheelProps.centerCoordinate}
                        cy={progressWheelProps.centerCoordinate}
                        r={progressWheelProps.radius}
                        stroke={progressWheelProps.backgroundStroke}
                    />
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
                <AppText
                    fontSize={25}
                    style={{
                        position: "absolute",
                        right: isEmojiIcon ? 34 : 41,
                        color: element.accentColor.color1,
                        lineHeight: isEmojiIcon ? 28 : undefined,
                        fontFamily: isEmojiIcon ? "emojisMono" : "helvetica",
                    }}>
                    {isEmojiIcon ? element.data.icon.text : element.data.icon.text[0]}
                </AppText>
            </Animated.View>
        </GestureDetector>
    );
}

export default TreeCard;
