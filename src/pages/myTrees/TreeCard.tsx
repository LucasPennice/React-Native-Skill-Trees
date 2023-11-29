import ChevronRight from "@/components/Icons/ChevronRight";
import OnboardingCompletionIcon from "@/components/Icons/OnboardingCompleteIcon";
import { ProgressBar } from "@/components/ProgressBarAndIndicator";
import { TreeData } from "@/redux/slices/userTreesSlice";
import { ColorGradient, NodeCategory, Skill } from "@/types";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { StyleSheet, View, ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { Easing, ZoomIn, ZoomOut, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import AppText from "../../components/AppText";
import NodeView from "../../components/NodeView";
import { colors } from "../../parameters";
import { useAppSelector } from "../../redux/reduxHooks";
import { selectSafeScreenDimentions } from "../../redux/slices/screenDimentionsSlice";

export type TreeCardProps<T> = {
    data: TreeCardData<T>;
    onPress: (treeId: string) => void;
    onLongPress: (treeId: string) => void;
    animationDelay?: number;
    selected?: boolean;
    blockLongPress?: boolean;
    containerStyles?: ViewStyle;
};

type TreeCardData<T> = {
    nodeToDisplay: T;
    tree: TreeData;
    completionPercentage: number;
};

function TreeCard<T extends { data: Skill; accentColor: ColorGradient; category: NodeCategory }>({
    data,
    onPress,
    onLongPress,
    animationDelay,
    selected,
    blockLongPress,
    containerStyles,
}: TreeCardProps<T>) {
    const { completionPercentage, nodeToDisplay, tree } = data;

    const { width } = useAppSelector(selectSafeScreenDimentions);
    // I SUBTRACT ONE BECAUSE I DON'T COUNT THE SKILL_TREE NODE AS A VALID NODE
    const treeSkillNodes = tree.nodes.length - 1;
    const completedSkillsQty = (treeSkillNodes * completionPercentage) / 100;

    const tapGesture = Gesture.Tap().onEnd((e) => {
        runOnJS(onPress)(tree.treeId);
    });

    const scale = useSharedValue(1);

    const longPressGesture = Gesture.LongPress()
        .enabled(Boolean(!blockLongPress))
        .minDuration(500)
        .onBegin(() => {
            scale.value = withTiming(1.05, { duration: 1000, easing: Easing.bezier(0.83, 0, 0.17, 1) });
        })
        .onStart(() => {
            runOnJS(onLongPress)(tree.treeId);
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
                <Animated.View style={[animatedStyles, style.container, containerStyles]}>
                    <NodeView
                        node={nodeToDisplay}
                        params={{ completePercentage: 0, size: NODE_SIZE, oneColorPerTree: false, showIcons: true, fontSize: 22 }}
                    />
                    <View style={{ height: NODE_SIZE, justifyContent: "space-between", flex: 1 }}>
                        <View style={{ flexDirection: "row" }}>
                            {!tree.showOnHomeScreen && (
                                <FontAwesome size={16} style={{ marginBottom: 1, marginRight: 5 }} color={`${colors.white}80`} name="eye-slash" />
                            )}
                            <AppText
                                textProps={{ numberOfLines: 1, ellipsizeMode: "tail" }}
                                fontSize={16}
                                style={{ color: colors.white, maxWidth: width - 150 }}>
                                {tree.treeName}
                            </AppText>
                        </View>

                        <AppText fontSize={14} style={{ color: `${colors.white}80` }}>
                            {completionPercentage.toFixed(0)}% Complete ({Math.ceil(completedSkillsQty)}/{treeSkillNodes})
                        </AppText>

                        <ProgressBar progress={completionPercentage} containerStyle={{ height: 5 }} delay={animationDelay} />
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
