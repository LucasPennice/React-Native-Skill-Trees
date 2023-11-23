import ChevronRight from "@/components/Icons/ChevronRight";
import { ProgressBar } from "@/components/ProgressBarAndIndicator";
import { selectNodeById, selectNodesOfTree } from "@/redux/slices/nodesSlice";
import { TreeData } from "@/redux/slices/userTreesSlice";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { Easing, ZoomIn, ZoomOut, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import AppText from "../../components/AppText";
import NodeView from "../../components/NodeView";
import { countCompleteNodes } from "../../functions/extractInformationFromTree";
import { colors } from "../../parameters";
import { useAppSelector } from "../../redux/reduxHooks";
import { selectSafeScreenDimentions } from "../../redux/slices/screenDimentionsSlice";
import OnboardingCompletionIcon from "@/components/Icons/OnboardingCompleteIcon";

function TreeCard({
    element,
    onPress,
    onLongPress,
    animationDelay,
    selected,
    blockLongPress,
}: {
    element: TreeData;
    onPress: (treeId: string) => void;
    onLongPress: (treeId: string) => void;
    animationDelay?: number;
    selected?: boolean;
    blockLongPress?: boolean;
}) {
    const { width } = useAppSelector(selectSafeScreenDimentions);
    //
    const nodesOfTree = useAppSelector(selectNodesOfTree(element.treeId));
    const rootNodeOfTree = useAppSelector(selectNodeById(element.rootNodeId))!;
    const completedSkillsQty = countCompleteNodes(nodesOfTree);
    const skillsQty = nodesOfTree.length - 1;
    const completePercentage = skillsQty === 0 ? 0 : (completedSkillsQty / skillsQty) * 100;

    const tapGesture = Gesture.Tap().onEnd((e) => {
        runOnJS(onPress)(element.treeId);
    });

    const scale = useSharedValue(1);

    const longPressGesture = Gesture.LongPress()
        .enabled(Boolean(!blockLongPress))
        .minDuration(500)
        .onBegin(() => {
            scale.value = withTiming(1.05, { duration: 1000, easing: Easing.bezier(0.83, 0, 0.17, 1) });
        })
        .onStart(() => {
            runOnJS(onLongPress)(element.treeId);
        })
        .onFinalize(() => {
            scale.value = withSpring(1);
        });

    const animatedStyles = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
            opacity: withTiming(selected ? 0.7 : 1),
        };
    });

    const gestures = Gesture.Exclusive(tapGesture, longPressGesture);

    const style = StyleSheet.create({
        container: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
            backgroundColor: colors.darkGray,
            height: 75,
            borderRadius: 20,
            marginBottom: 15,
            paddingHorizontal: 17,
            gap: 10,
        },
    });

    const NODE_SIZE = 50;

    return (
        <GestureDetector gesture={gestures}>
            <View style={{ position: "relative" }}>
                <Animated.View style={[animatedStyles, style.container]}>
                    <NodeView
                        node={{ accentColor: element.accentColor, category: "SKILL_TREE", data: rootNodeOfTree.data }}
                        params={{ completePercentage: 0, size: NODE_SIZE, oneColorPerTree: false, showIcons: true, fontSize: 22 }}
                    />
                    <View style={{ height: NODE_SIZE, justifyContent: "space-between", width: width - 150 }}>
                        <View style={{ flexDirection: "row" }}>
                            {!element.showOnHomeScreen && (
                                <FontAwesome size={16} style={{ marginBottom: 1, marginRight: 5 }} color={`${colors.white}80`} name="eye-slash" />
                            )}
                            <AppText
                                textProps={{ numberOfLines: 1, ellipsizeMode: "tail" }}
                                fontSize={16}
                                style={{ color: colors.white, maxWidth: width - 170 }}>
                                {element.treeName}
                            </AppText>
                        </View>

                        <AppText fontSize={14} style={{ color: `${colors.white}80` }}>
                            {completePercentage.toFixed(0)}% Complete ({completedSkillsQty}/{skillsQty})
                        </AppText>

                        <ProgressBar progress={completePercentage} containerStyle={{ height: 5 }} delay={animationDelay} />
                    </View>
                    <ChevronRight color={colors.white} />
                </Animated.View>
                {selected && <SelectedIndicator />}
            </View>
        </GestureDetector>
    );
}

const SelectedIndicator = () => {
    const style = StyleSheet.create({
        container: { position: "absolute", right: 15, bottom: 40 },
    });
    return (
        <Animated.View style={style.container} entering={ZoomIn} exiting={ZoomOut}>
            <OnboardingCompletionIcon fill={colors.darkGray} stroke={colors.accent} />
        </Animated.View>
    );
};

export default TreeCard;
