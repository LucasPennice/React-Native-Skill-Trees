import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { Directions, Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { Easing, FadeInDown, FadeOutDown, FadeOutUp, Layout, runOnJS } from "react-native-reanimated";
import { CIRCLE_SIZE_SELECTED, NAV_HEGIHT, colors } from "../../../parameters";
import { ScreenDimentions } from "../../../redux/screenDimentionsSlice";
import { generalStyles } from "../../../styles";
import { Skill, SkillPropertiesEditableOnPopMenu, Tree } from "../../../types";
import AppText from "../../AppText";
import SliderToggler from "../../SliderToggler";
import Editing from "./Editing";
import Viewing from "./Viewing";

export type SelectedNodeMenuState = {
    selectedNode: Tree<Skill>;
    parentOfSelectedNode?: Tree<Skill>;
    screenDimensions: ScreenDimentions;
};

export type SelectedNodeMenuFunctions = {
    editing?: {
        updateNode: (updatedNode: Tree<Skill>) => void;
        handleDeleteNode: (node: Tree<Skill>) => void;
    };
    closeMenu: () => void;
    goToSkillPage: () => void;
    goToTreePage: () => void;
};

type Props = {
    state: SelectedNodeMenuState;
    functions: SelectedNodeMenuFunctions;
    allowEdit?: boolean;
};

//☢️ POP MENU SHOULD ONLY BE ABLE TO EDIT SKILL TYPE NODES
//THIS IS BECAUSE IN POPUPMENU WE CAN TOGGLE THE COMPLETION STATE OF NODES, AND THE ONLY COMPLETION STATE THAT THE USER CAN TOGGLE
//IS THE SKILL NODES
//THE OTHER NODE TYPES' COMPLETION STATE IS CALCULATED ☢️

function SelectedNodeMenu({ functions, state, allowEdit }: Props) {
    const { screenDimensions, selectedNode, parentOfSelectedNode } = state;
    const { height } = screenDimensions;
    const { closeMenu, editing, goToSkillPage, goToTreePage } = functions;
    const { menuWidth, styles } = getNodeMenuStyles(screenDimensions);

    //Local State
    const [newSkillProps, setNewSkillProps] = useState<SkillPropertiesEditableOnPopMenu>({
        icon: selectedNode.data.icon,
        isCompleted: selectedNode.data.isCompleted,
        name: selectedNode.data.name,
    });
    const [mode, setMode] = useState<"EDITING" | "VIEWING">("VIEWING");

    const editingEnabled = Boolean(editing !== undefined) && Boolean(allowEdit) && selectedNode.category === "SKILL";

    useEffect(() => {
        setNewSkillProps({
            icon: selectedNode.data.icon,
            isCompleted: selectedNode.data.isCompleted,
            name: selectedNode.data.name,
        });
    }, [mode]);

    useEffect(() => {
        setMode("VIEWING");
    }, []);

    const showSaveChangesBtn = mode === "EDITING" && checkForSave(newSkillProps, selectedNode);

    const flingGesture = Gesture.Fling()
        .direction(Directions.DOWN)
        .onStart((e) => {
            runOnJS(closeMenu)();
        });

    const toggleMode = () => setMode((p) => (p === "EDITING" ? "VIEWING" : "EDITING"));

    const buildEditingFns = () => {
        if (!editing) return undefined;

        const { handleDeleteNode, updateNode } = editing;

        return {
            saveUpdates: (selectedNode: Tree<Skill>, newProps: SkillPropertiesEditableOnPopMenu) => () => {
                if (newSkillProps.name === "") return Alert.alert("The skill name cannot be empty");

                const updatedData: Skill = { ...selectedNode.data, ...newProps };
                const result: Tree<Skill> = { ...selectedNode, data: updatedData };

                return updateNode(result);
            },
            handleDeleteSelectedNode: () => handleDeleteNode(selectedNode),
            checkIfCompleteAllowed: () => {
                if (!parentOfSelectedNode) return true;
                if (parentOfSelectedNode.category !== "SKILL") return true;
                if (parentOfSelectedNode.data.isCompleted) return true;

                return false;
            },
            checkIfUnCompleteAllowed: () => {
                return true;
            },
        };
    };

    const editingFunctions = buildEditingFns();

    const checkToggleCompletionPermissions = editingFunctions
        ? {
              checkComplete: editingFunctions.checkIfCompleteAllowed,
              checkUnComplete: editingFunctions.checkIfUnCompleteAllowed,
          }
        : undefined;

    return (
        <Animated.View
            entering={FadeInDown.easing(Easing.elastic()).duration(300)}
            exiting={FadeOutDown.easing(Easing.elastic()).duration(300)}
            style={[styles.container]}>
            <GestureDetector gesture={flingGesture}>
                <Animated.View style={styles.interactiveContainer} layout={Layout.stiffness(200).damping(26)}>
                    <View style={styles.dragLine} />
                    <AppText style={{ color: colors.line, marginBottom: 10 }} fontSize={12}>
                        Drag me down or click the cirlcle to close
                    </AppText>

                    {editingEnabled && (
                        <SliderToggler containerWidth={menuWidth / 2 - 10} isLeftSelected={mode === "VIEWING"} toggleMode={toggleMode} />
                    )}

                    {mode === "EDITING" && editingEnabled && (
                        <Editing
                            newSkillPropsState={[newSkillProps, setNewSkillProps]}
                            handleDeleteSelectedNode={editingFunctions!.handleDeleteSelectedNode}
                            checkToggleCompletionPermissions={checkToggleCompletionPermissions!}
                        />
                    )}
                    {mode === "VIEWING" && <Viewing selectedNode={selectedNode} functions={{ goToTreePage, goToSkillPage }} />}
                </Animated.View>
            </GestureDetector>
            <Pressable onPress={closeMenu} style={{ right: 0, width: 134, height, position: "absolute" }}>
                {showSaveChangesBtn && (
                    <Animated.View
                        entering={FadeInDown}
                        exiting={FadeOutUp}
                        style={{ marginBottom: 10, position: "absolute", right: 20, top: height / 2 + 2 * CIRCLE_SIZE_SELECTED }}>
                        <Pressable
                            onPress={editingFunctions!.saveUpdates(selectedNode, newSkillProps)}
                            style={[generalStyles.btn, { backgroundColor: "#282A2C" }]}>
                            <AppText fontSize={16} style={{ color: colors.accent }}>
                                Save
                            </AppText>
                        </Pressable>
                    </Animated.View>
                )}
            </Pressable>
        </Animated.View>
    );
}

export default SelectedNodeMenu;

function checkForSave(newSkillProps: SkillPropertiesEditableOnPopMenu, selectedNode: Tree<Skill>) {
    const { data } = selectedNode;
    if (newSkillProps.icon.text !== data.icon.text) return true;
    if (newSkillProps.icon.isEmoji !== data.icon.isEmoji) return true;
    if (newSkillProps.isCompleted !== data.isCompleted) return true;
    if (newSkillProps.name !== data.name) return true;
    return false;
}

function getNodeMenuStyles(screenDimensions: ScreenDimentions) {
    const { height, width } = screenDimensions;
    const menuHeight = height - NAV_HEGIHT - 20;
    const menuWidth = width - 3 * CIRCLE_SIZE_SELECTED;

    const styles = StyleSheet.create({
        interactiveContainer: {
            backgroundColor: colors.darkGray,
            borderRadius: 20,
            paddingHorizontal: 10,
            paddingTop: 30,
            paddingBottom: 10,
            width: menuWidth,
            overflow: "hidden",
        },
        container: {
            left: 0,
            top: 10,
            zIndex: 2,
            position: "absolute",
            height: menuHeight,
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
            left: (menuWidth - 150) / 2,
            borderRadius: 10,
            position: "absolute",
        },
    });

    return { styles, menuHeight, menuWidth };
}
