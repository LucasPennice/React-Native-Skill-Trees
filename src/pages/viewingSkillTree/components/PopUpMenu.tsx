import { useNavigation } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import { Directions, Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { Easing, FadeInDown, FadeOutDown, FadeOutUp, runOnJS, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { StackNavigatorParams } from "../../../../App";
import AppText from "../../../components/AppText";
import { findNodeById, treeCompletedSkillPercentage } from "../../../functions/extractInformationFromTree";
import { editTreeProperties } from "../../../functions/mutateTree";
import { CIRCLE_SIZE_SELECTED, MENU_HIGH_DAMPENING, NAV_HEGIHT, centerFlex, colors } from "../../../parameters";
import { useAppDispatch, useAppSelector } from "../../../redux/reduxHooks";
import { selectSafeScreenDimentions } from "../../../redux/screenDimentionsSlice";
import { selectTreeSlice, setSelectedNode, updateUserTrees } from "../../../redux/userTreesSlice";
import { generalStyles } from "../../../styles";
import { Skill, Tree } from "../../../types";
import EditSkill from "./EditSkill";

type Props = {
    openChildrenHoistSelector: (candidatesToHoist: Tree<Skill>[]) => void;
    selectedTree: Tree<Skill>;
};

export type SkillPropertiesEditableOnPopMenu = {
    icon: Skill["icon"];
    name: Skill["name"];
    isCompleted: Skill["isCompleted"];
};

//☢️ POP MENU SHOULD ONLY BE ABLE TO OPEN SKILL TYPE NODES
//THIS IS BECAUSE IN POPUPMENU WE CAN TOGGLE THE COMPLETION STATE OF NODES, AND THE ONLY COMPLETION STATE THAT THE USER CAN TOGGLE
//IS THE SKILL NODES
//THE OTHER NODE TYPES' COMPLETION STATE IS CALCULATED ☢️

function PopUpMenu({ openChildrenHoistSelector, selectedTree }: Props) {
    //Redux store state
    const { selectedNode: selectedNodeId } = useAppSelector(selectTreeSlice);
    const { height, width } = useAppSelector(selectSafeScreenDimentions);
    const dispatch = useAppDispatch();
    //
    const selectedNode = findNodeById(selectedTree, selectedNodeId);
    if (!selectedNode) throw "selectedNode not found at PopUpMenu";
    //Local State
    const [newSkillProps, setNewSkillProps] = useState<SkillPropertiesEditableOnPopMenu>({
        icon: selectedNode.data.icon,
        isCompleted: selectedNode.data.isCompleted,
        name: selectedNode.data.name,
    });
    const [mode, setMode] = useState<"EDITING" | "VIEWING">("VIEWING");

    const MENU_HEIGHT = height - NAV_HEGIHT - 20;
    const MENU_WIDTH = width - 3 * CIRCLE_SIZE_SELECTED;

    const s = StyleSheet.create({
        interactiveContainer: {
            backgroundColor: colors.darkGray,
            borderRadius: 20,
            paddingHorizontal: 10,
            paddingTop: 30,
            paddingBottom: 10,
            width: MENU_WIDTH,
            overflow: "hidden",
        },
        container: {
            left: 0,
            top: 10,
            zIndex: 2,
            position: "absolute",
            height: MENU_HEIGHT,
            width,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
        },
        dragLine: {
            backgroundColor: `${colors.line}`,
            width: 150,
            height: 6,
            top: 15,
            left: (MENU_WIDTH - 150) / 2,
            borderRadius: 10,
            position: "absolute",
        },
    });

    useEffect(() => {
        setNewSkillProps({
            icon: selectedNode.data.icon,
            isCompleted: selectedNode.data.isCompleted,
            name: selectedNode.data.name,
        });
        setMode("VIEWING");
    }, [selectedNodeId]);

    const transform = useAnimatedStyle(() => {
        return { left: withSpring(mode === "VIEWING" ? 0 : MENU_WIDTH / 2 - 10, MENU_HIGH_DAMPENING) };
    }, [mode]);

    if (!selectedNode) return <></>;

    const showSaveChangesBtn =
        JSON.stringify(newSkillProps) !==
        JSON.stringify({ icon: selectedNode.data.icon, isCompleted: selectedNode.data.isCompleted, name: selectedNode.data.name });

    const saveChanges = () => {
        if (newSkillProps.name === "") return Alert.alert("The skill name cannot be empty");

        const updatedTreeNode: Tree<Skill> = {
            ...selectedNode,
            data: { ...selectedNode.data, name: newSkillProps.name, isCompleted: newSkillProps.isCompleted, icon: newSkillProps.icon },
        };

        let updatedRootNode = editTreeProperties(selectedTree, selectedNode, updatedTreeNode);

        if (!updatedRootNode) throw "Error saving tree in PopUpMenu";

        const treeSkillCompletion = treeCompletedSkillPercentage(updatedRootNode);

        if (treeSkillCompletion === 100) updatedRootNode = { ...updatedRootNode, data: { ...updatedRootNode.data, isCompleted: true } };
        if (treeSkillCompletion !== 100) updatedRootNode = { ...updatedRootNode, data: { ...updatedRootNode.data, isCompleted: false } };

        dispatch(updateUserTrees(updatedRootNode));
    };

    const closePopUpMenu = () => dispatch(setSelectedNode(null));

    const flingGesture = Gesture.Fling()
        .direction(Directions.DOWN)
        .onStart((e) => {
            runOnJS(closePopUpMenu)();
        });

    return (
        <Animated.View
            entering={FadeInDown.easing(Easing.elastic()).duration(300)}
            exiting={FadeOutDown.easing(Easing.elastic()).duration(300)}
            style={[s.container]}>
            <GestureDetector gesture={flingGesture}>
                <Animated.View style={s.interactiveContainer}>
                    <View style={s.dragLine} />
                    <AppText style={{ color: colors.line, marginBottom: 10 }} fontSize={12}>
                        Drag me down or click the cirlcle to close
                    </AppText>

                    <View
                        style={[
                            centerFlex,
                            {
                                flexDirection: "row",
                                backgroundColor: "#282A2C",
                                height: 50,
                                borderRadius: 10,
                                position: "relative",
                                marginBottom: 10,
                            },
                        ]}>
                        <Animated.View
                            style={[
                                {
                                    position: "absolute",
                                    height: 50,
                                    width: MENU_WIDTH / 2 - 10,
                                    borderRadius: 10,
                                    borderWidth: 1,
                                    borderColor: colors.accent,
                                },
                                transform,
                            ]}
                        />
                        <Pressable onPress={() => setMode("VIEWING")} style={[centerFlex, { flex: 1, height: 50 }]}>
                            <AppText fontSize={16} style={{ color: colors.unmarkedText }}>
                                Details
                            </AppText>
                        </Pressable>
                        <Pressable onPress={() => setMode("EDITING")} style={[centerFlex, { height: 50, flex: 1 }]}>
                            <AppText fontSize={16} style={{ color: colors.unmarkedText }}>
                                Edit
                            </AppText>
                        </Pressable>
                    </View>

                    {mode === "EDITING" && (
                        <EditSkill
                            newSkillPropsState={[newSkillProps, setNewSkillProps]}
                            openChildrenHoistSelector={openChildrenHoistSelector}
                            selectedNode={selectedNode}
                            selectedTree={selectedTree}
                        />
                    )}
                    {mode === "VIEWING" && <ViewingView selectedNode={selectedNode} />}
                </Animated.View>
            </GestureDetector>
            <Pressable onPress={closePopUpMenu} style={{ right: 0, width: 134, height, position: "absolute" }}>
                {showSaveChangesBtn && (
                    <Animated.View
                        entering={FadeInDown}
                        exiting={FadeOutUp}
                        style={{ marginBottom: 10, position: "absolute", right: 20, top: height / 2 + 2 * CIRCLE_SIZE_SELECTED }}>
                        <Pressable onPress={saveChanges} style={[generalStyles.btn, { backgroundColor: "#282A2C" }]}>
                            <AppText fontSize={16} style={{ color: colors.accent }}>
                                Save
                            </AppText>
                        </Pressable>
                    </Animated.View>
                )}
            </Pressable>
        </Animated.View>
    );

    function ViewingView({ selectedNode }: { selectedNode: Tree<Skill> }) {
        const navigation = useNavigation<NativeStackScreenProps<StackNavigatorParams>["navigation"]>();
        const goToSkillPage = () => {
            navigation.navigate("SkillPage", selectedNode);
        };
        return (
            <TouchableOpacity style={[generalStyles.btn, { backgroundColor: "#282A2C", marginBottom: 10 }]} onPress={goToSkillPage}>
                <AppText style={{ color: colors.accent }} fontSize={16}>
                    Go To Skill Page
                </AppText>
            </TouchableOpacity>
        );
    }
}

export default PopUpMenu;
