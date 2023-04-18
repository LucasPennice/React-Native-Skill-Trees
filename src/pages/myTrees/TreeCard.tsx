import { Platform, Pressable, View } from "react-native";
import { Skill, Tree, centerFlex } from "../../types";
import { colors } from "../homepage/canvas/parameters";
import { ProgressWheelParams } from "../homepage/components/ProgressIndicatorAndName";
import { quantityOfCompletedNodes, quantiyOfNodes } from "../homepage/treeFunctions";
import AppText from "../../components/AppText";
import { Circle, Svg } from "react-native-svg";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { useAppDispatch, useAppSelector } from "../../redux/reduxHooks";
import { setTree } from "../../redux/editTreeSlice";
import { selectScreenDimentions } from "../../redux/screenDimentionsSlice";

function TreeCard({ element, changeTreeAndNavigateHome }: { element: Tree<Skill>; changeTreeAndNavigateHome: () => void }) {
    //Redux Related
    const dispatch = useAppDispatch();
    const { width } = useAppSelector(selectScreenDimentions);
    const dispatchSetTree = () => dispatch(setTree(element));
    //
    const treeAccentColor = element && element.accentColor ? element.accentColor : colors.accent;

    const progressWheelProps = new ProgressWheelParams(treeAccentColor, `${treeAccentColor}3D`, 50, 8);

    const completedNodesQty = quantityOfCompletedNodes(element);
    const nodesQty = quantiyOfNodes(element);

    let completedPercentage = 0;

    if (!completedNodesQty || !nodesQty) completedPercentage = 0;

    completedPercentage = ((completedNodesQty ?? 0) / (nodesQty ?? 1)) * 100;

    const result = progressWheelProps.circumference - (progressWheelProps.circumference * completedPercentage) / 100;

    const tapGesture = Gesture.Tap().onEnd((e) => {
        runOnJS(changeTreeAndNavigateHome)();
    });

    const scale = useSharedValue(1);

    const longPressGesture = Gesture.LongPress()
        .minDuration(500)
        .onBegin(() => {
            scale.value = withTiming(1.05, { duration: 500, easing: Easing.bezier(0.33, 1, 0.68, 1) });
        })
        .onStart(() => {
            runOnJS(dispatchSetTree)();
            scale.value = withSpring(1);
        });

    const animatedStyles = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    const gestures = Gesture.Exclusive(tapGesture, longPressGesture);

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
                        style={{ color: "white", fontFamily: "helveticaBold", maxWidth: width - 150 }}>
                        {element.treeName ?? "tree"}
                    </AppText>
                    <AppText fontSize={20} style={{ color: "#FFFFFF5D" }}>
                        {completedPercentage.toFixed(0)}% Complete
                    </AppText>
                    <AppText fontSize={20} style={{ color: "#FFFFFF5D" }}>
                        {completedNodesQty} skills of {nodesQty}
                    </AppText>
                </View>
                <Svg width={progressWheelProps.size} height={progressWheelProps.size}>
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
                        stroke={progressWheelProps.progressStroke}
                        strokeDasharray={progressWheelProps.circumference}
                        strokeLinecap="round"
                        strokeDashoffset={result}
                    />
                </Svg>
            </Animated.View>
        </GestureDetector>
    );
}

export default TreeCard;
