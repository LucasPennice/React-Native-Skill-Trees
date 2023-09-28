import { selectNodeById, selectNodesOfTree } from "@/redux/slices/nodesSlice";
import { TreeData } from "@/redux/slices/userTreesSlice";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import AppText from "../../components/AppText";
import NodeView from "../../components/NodeView";
import { countCompleteNodes } from "../../functions/extractInformationFromTree";
import { centerFlex, colors } from "../../parameters";
import { useAppSelector } from "../../redux/reduxHooks";
import { selectSafeScreenDimentions } from "../../redux/slices/screenDimentionsSlice";

function TreeCard({
    element,
    changeTreeAndNavigateToViewingTree,
    openEditTreeModal,
}: {
    element: TreeData;
    changeTreeAndNavigateToViewingTree: () => void;
    openEditTreeModal: (treeId: string) => void;
}) {
    const { width } = useAppSelector(selectSafeScreenDimentions);
    //
    const nodesOfTree = useAppSelector(selectNodesOfTree(element.treeId));
    const rootNodeOfTree = useAppSelector(selectNodeById(element.rootNodeId))!;
    const completedSkillsQty = countCompleteNodes(nodesOfTree);
    const skillsQty = nodesOfTree.length - 1;
    const completePercentage = skillsQty === 0 ? 0 : (completedSkillsQty / skillsQty) * 100;

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
            runOnJS(openEditTreeModal)(element.treeId);
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
                        {completePercentage.toFixed(0)}% Complete
                    </AppText>
                    <AppText fontSize={20} style={{ color: "#FFFFFF5D" }}>
                        {completedSkillsQty} skills of {skillsQty}
                    </AppText>
                </View>
                <NodeView
                    node={{ accentColor: element.accentColor, category: "SKILL_TREE", data: rootNodeOfTree.data }}
                    size={60}
                    completePercentage={completePercentage}
                />
            </Animated.View>
        </GestureDetector>
    );
}

export default TreeCard;
