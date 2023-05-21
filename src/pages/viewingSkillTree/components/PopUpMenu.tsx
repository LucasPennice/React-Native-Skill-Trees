import { useNavigation } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { Alert, TouchableOpacity, View } from "react-native";
import { Directions, Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { Easing, FadeInDown, FadeOutDown, runOnJS } from "react-native-reanimated";
import { StackNavigatorParams } from "../../../../App";
import AppText from "../../../components/AppText";
import AppTextInput from "../../../components/AppTextInput";
import RadioInput from "../../../components/RadioInput";
import { countSkillNodes, findNodeById, treeCompletedSkillPercentage } from "../../../functions/extractInformationFromTree";
import { deleteNodeWithNoChildren, editTreeProperties } from "../../../functions/mutateTree";
import { CIRCLE_SIZE_SELECTED, centerFlex, colors } from "../../../parameters";
import { useAppDispatch, useAppSelector } from "../../../redux/reduxHooks";
import { selectScreenDimentions } from "../../../redux/screenDimentionsSlice";
import { removeUserTree, selectCurrentTree, selectTreeSlice, setSelectedNode, updateUserTrees } from "../../../redux/userTreesSlice";
import { Skill, Tree } from "../../../types";

type Props = {
    openChildrenHoistSelector: (candidatesToHoist: Tree<Skill>[]) => void;
};

//☢️ POP MENU SHOULD ONLY BE ABLE TO OPEN SKILL TYPE NODES
//THIS IS BECAUSE IN POPUPMENU WE CAN TOGGLE THE COMPLETION STATE OF NODES, AND THE ONLY COMPLETION STATE THAT THE USER CAN TOGGLE
//IS THE SKILL NODES
//THE OTHER NODE TYPES' COMPLETION STATE IS CALCULATED ☢️

function PopUpMenu({ openChildrenHoistSelector }: Props) {
    //Redux store state
    const currentTree = useAppSelector(selectCurrentTree);
    const { selectedNode } = useAppSelector(selectTreeSlice);
    const { height, width } = useAppSelector(selectScreenDimentions);
    const dispatch = useAppDispatch();
    //
    const currentNode = findNodeById(currentTree, selectedNode);
    //Local State
    const [text, onChangeText] = useState(currentNode ? currentNode.data.name : "Name");
    const [mastered, setMastered] = useState(currentNode && currentNode.data.isCompleted ? currentNode.data.isCompleted : false);

    const MENU_HEIGHT = 340;
    const MENU_WIDTH = width - 3 * CIRCLE_SIZE_SELECTED;

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
        if (!currentTree) return undefined;

        const isLastChildrenRemaining = countSkillNodes(currentTree) === 1;

        if (isLastChildrenRemaining) return confirmDeleteTree();

        const result = deleteNodeWithNoChildren(currentTree, currentNode);
        dispatch(updateUserTrees(result));
        dispatch(setSelectedNode(null));
    };

    const toggleCompletionInNode = (completionState: boolean) => () => {
        const newProperties = { ...currentNode, data: { ...currentNode.data, isCompleted: !completionState } };

        let result = editTreeProperties(currentTree, currentNode, newProperties);

        if (!result) return undefined;

        const treeSkillCompletion = treeCompletedSkillPercentage(result);

        if (treeSkillCompletion === 100) result = { ...result, data: { ...result.data, isCompleted: true } };
        if (treeSkillCompletion !== 100) result = { ...result, data: { ...result.data, isCompleted: false } };

        dispatch(updateUserTrees(result));
    };

    const updateNodeName = () => {
        if (text === "") return;

        const newProperties = { ...currentNode, data: { ...currentNode.data, name: text } };

        const result = editTreeProperties(currentTree, currentNode, newProperties);

        dispatch(updateUserTrees(result));
    };

    const closePopUpMenu = () => dispatch(setSelectedNode(null));

    const flingGesture = Gesture.Fling()
        .direction(Directions.DOWN)
        .onStart((e) => {
            runOnJS(closePopUpMenu)();
        });

    const top = height / 2 - MENU_HEIGHT / 2;

    const goToSkillPage = () => {
        navigation.navigate("SkillPage", currentNode);
    };

    return (
        <GestureDetector gesture={flingGesture}>
            <Animated.View
                entering={FadeInDown.easing(Easing.elastic()).duration(300)}
                exiting={FadeOutDown.easing(Easing.elastic()).duration(300)}
                style={[
                    {
                        left: 0,
                        top,
                        position: "absolute",
                        height: MENU_HEIGHT,
                        width: MENU_WIDTH,
                        backgroundColor: colors.darkGray,
                        borderRadius: 20,
                        paddingHorizontal: 10,
                        paddingTop: 30,
                        paddingBottom: 10,
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
                <AppText style={{ color: colors.line, marginBottom: 10 }} fontSize={12}>
                    Drag me down or click the cirlcle to close
                </AppText>

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
                    onPress={goToSkillPage}>
                    <AppText style={{ color: colors.accent }} fontSize={18}>
                        Go To Skill Page
                    </AppText>
                </TouchableOpacity>

                <View style={[centerFlex, { justifyContent: "flex-end", flex: 1 }]}>
                    {currentNode.children.length === 0 && (
                        <TouchableOpacity
                            style={{ backgroundColor: `${colors.line}4D`, borderRadius: 15, padding: 15, width: "100%" }}
                            onPress={deleteNode}>
                            <AppText style={{ color: colors.red }} fontSize={18}>
                                Delete Node
                            </AppText>
                        </TouchableOpacity>
                    )}

                    {currentNode.children.length != 0 && (
                        <TouchableOpacity
                            style={{ backgroundColor: `${colors.line}4D`, borderRadius: 15, padding: 15, width: "100%" }}
                            onPress={() => openChildrenHoistSelector(currentNode.children)}>
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
