import { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from "react-native";
import Animated, { Easing, FadeInDown, FadeOutDown, FadeOutUp, Layout } from "react-native-reanimated";
import { checkIfCompletionIsAllowedForNode, checkIfUncompletionIsAllowedForNode, findNodeById } from "../../../functions/extractInformationFromTree";
import { CIRCLE_SIZE_SELECTED, NAV_HEGIHT, centerFlex, colors } from "../../../parameters";
import { ScreenDimentions } from "../../../redux/screenDimentionsSlice";
import { generalStyles } from "../../../styles";
import { Skill, SkillPropertiesEditableOnPopMenu, Tree } from "../../../types";
import AppText from "../../AppText";
import DirectionMenu, { Config } from "../../DirectionMenu";
import SliderToggler from "../../SliderToggler";
import Editing from "./Editing";
import Viewing from "./Viewing";

export type SelectedNodeMenuState = {
    selectedNode: Tree<Skill>;
    selectedTree: Tree<Skill>;
    initialMode: "EDITING" | "VIEWING";
    screenDimensions: ScreenDimentions;
};

export type SelectedNodeMenuFunctions = {
    closeMenu: () => void;
    goToSkillPage: () => void;
    goToTreePage: () => void;
    goToEditTreePage: () => void;
};

export type SelectedNodeMenuMutateFunctions = {
    updateNode: (updatedNode: Tree<Skill>) => void;
    handleDeleteNode: (node: Tree<Skill>) => void;
};

type Props = {
    state: SelectedNodeMenuState;
    mutateFunctions?: SelectedNodeMenuMutateFunctions;
    functions: SelectedNodeMenuFunctions;
    allowEdit?: boolean;
};

//☢️ POP MENU SHOULD ONLY BE ABLE TO EDIT SKILL TYPE NODES
//THIS IS BECAUSE IN POPUPMENU WE CAN TOGGLE THE COMPLETION STATE OF NODES, AND THE ONLY COMPLETION STATE THAT THE USER CAN TOGGLE
//IS THE SKILL NODES
//THE OTHER NODE TYPES' COMPLETION STATE IS CALCULATED ☢️

function SelectedNodeMenu({ mutateFunctions, functions, state, allowEdit }: Props) {
    const { screenDimensions, selectedNode, selectedTree, initialMode } = state;
    const { height, width } = screenDimensions;
    const { closeMenu, goToSkillPage, goToTreePage, goToEditTreePage } = functions;
    const { menuWidth, styles } = getNodeMenuStyles(screenDimensions);

    const parentOfSelectedNode = findNodeById(selectedTree, selectedNode.parentId);

    //Local State
    const [newSkillProps, setNewSkillProps] = useState<SkillPropertiesEditableOnPopMenu>({
        icon: selectedNode.data.icon,
        isCompleted: selectedNode.data.isCompleted,
        name: selectedNode.data.name,
    });
    const [mode, setMode] = useState<"EDITING" | "VIEWING">(initialMode);

    const editingEnabled = Boolean(mutateFunctions !== undefined) && Boolean(allowEdit) && selectedNode.category === "SKILL";

    useEffect(() => {
        setNewSkillProps({
            icon: selectedNode.data.icon,
            isCompleted: selectedNode.data.isCompleted,
            name: selectedNode.data.name,
        });
    }, [mode]);

    useEffect(() => {
        return () => {
            setMode(initialMode);
        };
    }, []);

    const showSaveChangesBtn = mode === "EDITING" && checkForSave(newSkillProps, selectedNode);

    const toggleMode = () => setMode((p) => (p === "EDITING" ? "VIEWING" : "EDITING"));

    const buildEditingFns = () => {
        if (!mutateFunctions) return undefined;

        const { handleDeleteNode, updateNode } = mutateFunctions;

        return {
            saveUpdates: (selectedNode: Tree<Skill>, newProps: SkillPropertiesEditableOnPopMenu) => () => {
                if (newSkillProps.name === "") return Alert.alert("The skill name cannot be empty");

                const updatedData: Skill = { ...selectedNode.data, ...newProps };
                const result: Tree<Skill> = { ...selectedNode, data: updatedData };

                return updateNode(result);
            },
            handleDeleteSelectedNode: () => handleDeleteNode(selectedNode),
            checkIfCompleteAllowed: () => checkIfCompletionIsAllowedForNode(parentOfSelectedNode),
            checkIfUnCompleteAllowed: () => checkIfUncompletionIsAllowedForNode(selectedNode),
        };
    };

    const editingFunctions = buildEditingFns();

    const checkToggleCompletionPermissions = editingFunctions
        ? {
              checkComplete: editingFunctions.checkIfCompleteAllowed,
              checkUnComplete: editingFunctions.checkIfUnCompleteAllowed,
          }
        : undefined;

    const nodeMenuConfig: Config = {
        horizontalSize: menuWidth,
        verticalSize: height - NAV_HEGIHT,
        circular: false,
        directions: ["vertical"],
        triggerZoneSize: 0.9,
        allowFling: true,
    };
    return (
        <Animated.View
            entering={FadeInDown.easing(Easing.elastic()).duration(300)}
            exiting={FadeOutDown.easing(Easing.elastic()).duration(200)}
            style={[
                centerFlex,
                {
                    left: 0,
                    top: 0,
                    zIndex: 2,
                    position: "absolute",
                    height: height - NAV_HEGIHT,
                    width,
                    alignItems: "flex-start",
                },
            ]}>
            <DirectionMenu action={{ verticalDown: closeMenu }} config={nodeMenuConfig}>
                <Animated.View
                    style={[
                        {
                            zIndex: 2,
                            width: menuWidth,
                            minHeight: 100,
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                        },
                    ]}>
                    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "position"} style={{ flex: 1 }} keyboardVerticalOffset={60}>
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
                            {mode === "VIEWING" && (
                                <Viewing
                                    selectedNode={selectedNode}
                                    selectedTree={selectedTree}
                                    functions={{ goToTreePage, goToSkillPage, goToEditTreePage }}
                                />
                            )}
                        </Animated.View>
                    </KeyboardAvoidingView>
                </Animated.View>
            </DirectionMenu>
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
