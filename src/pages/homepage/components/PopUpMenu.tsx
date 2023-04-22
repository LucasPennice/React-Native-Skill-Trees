import { useEffect, useState } from "react";
import { Alert, Button, Dimensions, Pressable, Text, TextInput, TouchableOpacity, View } from "react-native";
import { DISTANCE_FROM_LEFT_MARGIN_ON_SCROLL } from "../canvas/hooks/useCanvasTouchHandler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from "react-native-reanimated";
import { CirclePositionInCanvas, CirclePositionInCanvasWithLevel, MENU_DAMPENING, centerFlex } from "../../../types";
import { deleteNodeWithNoChildren, editTreeProperties, findTreeNodeById, quantiyOfNodes } from "../treeFunctions";
import { mutateUserTree, removeUserTree, selectCurrentTree, selectTreeSlice, setSelectedNode } from "../../../redux/userTreesSlice";
import { useAppDispatch, useAppSelector } from "../../../redux/reduxHooks";
import { selectScreenDimentions } from "../../../redux/screenDimentionsSlice";
import { openChildrenHoistSelector } from "../../../redux/canvasDisplaySettingsSlice";
import { CIRCLE_SIZE_SELECTED, colors } from "../canvas/parameters";
import AppText from "../../../components/AppText";
import AppTextInput from "../../../components/AppTextInput";
import RadioInput from "../../../components/RadioInput";
import { useNavigation } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StackNavigatorParams } from "../../../../App";
import { CANVAS_HORIZONTAL_PADDING } from "../canvas/coordinateFunctions";
import { Directions, Gesture, GestureDetector } from "react-native-gesture-handler";

type Props = {
    foundNodeCoordinates: CirclePositionInCanvasWithLevel;
    canvasWidth: number;
};

function PopUpMenu({ foundNodeCoordinates, canvasWidth }: Props) {
    //Redux store state
    const currentTree = useAppSelector(selectCurrentTree);
    const { selectedNode } = useAppSelector(selectTreeSlice);
    const { height, width } = useAppSelector(selectScreenDimentions);
    const dispatch = useAppDispatch();
    //
    const currentNode = findTreeNodeById(currentTree, selectedNode);
    //Local State
    const [text, onChangeText] = useState(currentNode ? currentNode.data.name : "Name");
    const [mastered, setMastered] = useState(currentNode && currentNode.data.isCompleted ? currentNode.data.isCompleted : false);

    const MENU_HEIGHT = height / 1.5;
    const MENU_WIDTH = width - DISTANCE_FROM_LEFT_MARGIN_ON_SCROLL - CIRCLE_SIZE_SELECTED - 30;

    const { animatedMenuStyles } = useHandlePopMenuAnimations(foundNodeCoordinates, selectedNode, canvasWidth);

    const navigation = useNavigation<NativeStackScreenProps<StackNavigatorParams>["navigation"]>();

    useEffect(() => {
        if (selectedNode === null) return;

        onChangeText(currentNode ? currentNode.data.name : "Name");
        setMastered(currentNode && currentNode.data.isCompleted ? currentNode.data.isCompleted : false);
    }, [selectedNode]);

    if (!currentNode) return <></>;

    const deleteTree = () => {
        if (!currentTree || !currentTree.treeId) return;

        dispatch(removeUserTree(currentTree.treeId));
        navigation.navigate("MyTrees");
    };

    const confirmDeleteTree = () =>
        Alert.alert(
            `Deleting ${currentNode.data.name} will also delete ${currentTree!.treeName ?? ""}`,
            "Are you sure you want to continue?",
            [
                { text: "No", style: "cancel" },
                { text: "Yes", onPress: deleteTree, style: "destructive" },
            ],
            { cancelable: true }
        );

    const deleteNode = () => {
        if (quantiyOfNodes(currentTree) === 1) return confirmDeleteTree();

        const result = deleteNodeWithNoChildren(currentTree, currentNode);
        dispatch(mutateUserTree(result));
        dispatch(setSelectedNode(null));
    };

    const toggleCompletionInNode = (completionState: boolean) => () => {
        const newProperties = { ...currentNode, data: { ...currentNode.data, isCompleted: !completionState } };

        const result = editTreeProperties(currentTree, currentNode, newProperties);

        dispatch(mutateUserTree(result));
    };

    const updateNodeName = () => {
        if (text === "") return;

        const newProperties = { ...currentNode, data: { ...currentNode.data, name: text } };

        const result = editTreeProperties(currentTree, currentNode, newProperties);

        dispatch(mutateUserTree(result));
    };

    const currentSkill = findTreeNodeById(currentTree, selectedNode)?.data ?? undefined;

    const closePopUpMenu = () => dispatch(setSelectedNode(null));

    const flingGesture = Gesture.Fling()
        .direction(Directions.DOWN)
        .onStart((e) => {
            runOnJS(closePopUpMenu)();
        });

    return (
        <GestureDetector gesture={flingGesture}>
            <Animated.View
                style={[
                    animatedMenuStyles,
                    {
                        position: "absolute",
                        height: MENU_HEIGHT,
                        width: MENU_WIDTH,
                        backgroundColor: colors.darkGray,
                        borderRadius: 20,
                        padding: 20,
                        paddingTop: 40,
                    },
                ]}>
                <View
                    style={{
                        backgroundColor: `${colors.line}`,
                        width: 150,
                        height: 6,
                        top: 15,
                        left: (MENU_WIDTH - 150) / 2,
                        borderRadius: 10,
                        position: "absolute",
                    }}
                />

                <AppTextInput
                    onBlur={updateNodeName}
                    placeholder="Skill Name"
                    textState={[text, onChangeText]}
                    onlyContainsLettersAndNumbers
                    containerStyles={{ marginBottom: 20 }}
                />

                <RadioInput text="Mastered" state={[mastered, setMastered]} onPress={toggleCompletionInNode(mastered)} style={{ marginBottom: 20 }} />

                <TouchableOpacity
                    style={{ backgroundColor: `${colors.line}4D`, borderRadius: 15, padding: 15, width: "100%" }}
                    onPress={() => navigation.navigate("SkillPage", currentSkill)}>
                    <AppText style={{ color: colors.accent }} fontSize={18}>
                        Go To Skill Page
                    </AppText>
                </TouchableOpacity>

                <View style={[centerFlex, { justifyContent: "flex-end", flex: 1 }]}>
                    {!currentNode.children && (
                        <TouchableOpacity
                            style={{ backgroundColor: `${colors.line}4D`, borderRadius: 15, padding: 15, width: "100%" }}
                            onPress={deleteNode}>
                            <AppText style={{ color: colors.red }} fontSize={18}>
                                Delete Node
                            </AppText>
                        </TouchableOpacity>
                    )}

                    {currentNode.children && (
                        <TouchableOpacity
                            style={{ backgroundColor: `${colors.line}4D`, borderRadius: 15, padding: 15, width: "100%" }}
                            onPress={() => dispatch(openChildrenHoistSelector(currentNode.children!))}>
                            <AppText style={{ color: colors.red }} fontSize={18}>
                                Delete Node
                            </AppText>
                        </TouchableOpacity>
                    )}
                </View>
            </Animated.View>
        </GestureDetector>
    );
}

export default PopUpMenu;

function useHandlePopMenuAnimations(foundNodeCoordinates: CirclePositionInCanvasWithLevel, selectedNode: string | null, canvasWidth: number) {
    const isOpen = useSharedValue(false);

    useEffect(() => {
        isOpen.value = selectedNode != null;
    }, [selectedNode]);

    const { height, width } = useAppSelector(selectScreenDimentions);

    const MENU_HEIGHT = height / 1.5;
    const MENU_WIDTH = width - DISTANCE_FROM_LEFT_MARGIN_ON_SCROLL - CIRCLE_SIZE_SELECTED - 30;

    //This handles the menu animations 👇

    const animatedMenuStyles = useAnimatedStyle(() => {
        const menuPosition = whereIsSelectedNode({ canvasWidth, foundNodeCoordinates, screenWidth: width });

        const left = menuPosition === "LEFT_SIDE_OF_SCREEN" ? 0 : width - MENU_WIDTH;

        const top = MENU_HEIGHT / 4.5;

        let standardMenuStyles = { opacity: withTiming(isOpen.value ? 1 : 0), transform: [{ scale: withSpring(isOpen.value ? 1 : 0.9) }] };

        return {
            left: withSpring(left, MENU_DAMPENING),
            top: withSpring(top, MENU_DAMPENING),
            ...standardMenuStyles,
        };

        function whereIsSelectedNode({
            canvasWidth,
            foundNodeCoordinates,
            screenWidth,
        }: {
            foundNodeCoordinates: CirclePositionInCanvasWithLevel;
            canvasWidth: number;
            screenWidth: number;
        }) {
            const distanceFromRightMargin = canvasWidth - foundNodeCoordinates.x;

            if (distanceFromRightMargin <= screenWidth + CANVAS_HORIZONTAL_PADDING / 2) return "LEFT_SIDE_OF_SCREEN";

            return "RIGHT_SIDE_OF_SCREEN";
        }
    }, [foundNodeCoordinates, selectedNode]);

    return { animatedMenuStyles };
}
