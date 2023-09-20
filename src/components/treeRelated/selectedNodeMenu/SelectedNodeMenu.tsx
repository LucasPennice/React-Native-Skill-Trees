import { useAppSelector } from "@/redux/reduxHooks";
import { selectNodesOfTree } from "@/redux/slices/nodesSlice";
import { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from "react-native";
import Animated, { Easing, FadeInDown, FadeOutDown, FadeOutUp, Layout } from "react-native-reanimated";
import { checkIfCompletionAllowed, checkIfReverseCompletionAllowed } from "../../../functions/extractInformationFromTree";
import { CIRCLE_SIZE_SELECTED, NAV_HEGIHT, centerFlex, colors } from "../../../parameters";
import { ScreenDimentions } from "../../../redux/slices/screenDimentionsSlice";
import { generalStyles } from "../../../styles";
import { NormalizedNode, Skill, SkillIcon, SkillPropertiesEditableOnPopMenu } from "../../../types";
import AppText from "../../AppText";
import SliderToggler from "../../SliderToggler";
import Editing from "./Editing";
import Viewing from "./Viewing";

export type SelectedNodeMenuState = {
    selectedNode: NormalizedNode;
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
    updateNode: (updatedNode: NormalizedNode) => void;
    handleDeleteNode: (node: NormalizedNode) => void;
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

function useHandleModeState(initialMode: "EDITING" | "VIEWING") {
    const [mode, setMode] = useState<"EDITING" | "VIEWING">(initialMode);

    const setInitialMode = () => setMode(initialMode);
    const toggleMode = () => setMode((p) => (p === "EDITING" ? "VIEWING" : "EDITING"));

    return [mode, { setInitialMode, toggleMode }] as const;
}

function useCleanup(setInitialMode: () => void) {
    useEffect(() => {
        return () => {
            setInitialMode();
        };
    }, []);
}

function useSkillPropsState(selectedNode: NormalizedNode) {
    const initialState = { icon: selectedNode.data.icon, isCompleted: selectedNode.data.isCompleted, name: selectedNode.data.name };

    const [newSkillProps, setNewSkillProps] = useState<SkillPropertiesEditableOnPopMenu>(initialState);

    const setInitialSkillProps = () => setNewSkillProps(initialState);
    const updateSkillName = (name: string) => {
        setNewSkillProps((prev) => {
            return { ...prev, name };
        });
    };
    const updateSkillIcon = (icon: SkillIcon) => {
        setNewSkillProps({ ...newSkillProps, icon });
    };
    const updateSkillCompletion = (isCompleted: boolean) => {
        setNewSkillProps((prev: SkillPropertiesEditableOnPopMenu) => {
            return { ...prev, isCompleted };
        });
    };

    return [newSkillProps, { setInitialSkillProps, updateSkillCompletion, updateSkillIcon, updateSkillName }] as const;
}

function useResetSkillPropsToDefaultOnModeUpdate(setInitialSkillProps: () => void, mode: "EDITING" | "VIEWING") {
    useEffect(() => {
        setInitialSkillProps();
    }, [mode]);
}

function SelectedNodeMenu({ mutateFunctions, functions, state, allowEdit }: Props) {
    const { screenDimensions, selectedNode, initialMode } = state;
    const { height, width } = screenDimensions;
    const { closeMenu, goToSkillPage, goToTreePage, goToEditTreePage } = functions;
    const { menuWidth, styles } = getNodeMenuStyles(screenDimensions);

    const [mode, { toggleMode, setInitialMode }] = useHandleModeState(initialMode);
    const skillPropsState = useSkillPropsState(selectedNode);
    const [newSkillProps, { setInitialSkillProps }] = skillPropsState;

    const nodesOfTree = useAppSelector(selectNodesOfTree(selectedNode.treeId));

    const editingEnabled = Boolean(mutateFunctions !== undefined) && Boolean(allowEdit) && selectedNode.category === "SKILL";

    useCleanup(setInitialMode);
    useResetSkillPropsToDefaultOnModeUpdate(setInitialSkillProps, mode);

    const showSaveChangesBtn = mode === "EDITING" && checkForSave(newSkillProps, selectedNode);

    const buildEditingFns = () => {
        if (!mutateFunctions) return undefined;

        const { handleDeleteNode, updateNode } = mutateFunctions;

        return {
            saveUpdates: (selectedNode: NormalizedNode, newProps: SkillPropertiesEditableOnPopMenu) => () => {
                if (newSkillProps.name === "") return Alert.alert("The skill name cannot be empty");

                const updatedData: Skill = { ...selectedNode.data, ...newProps };
                const result: NormalizedNode = { ...selectedNode, data: updatedData };

                return updateNode(result);
            },
            handleDeleteSelectedNode: () => handleDeleteNode(selectedNode),
            checkIfCompleteAllowed: () => checkIfCompletionAllowed(selectedNode, nodesOfTree),
            checkIfUnCompleteAllowed: () => checkIfReverseCompletionAllowed(selectedNode, nodesOfTree),
        };
    };

    const editingFunctions = buildEditingFns();

    const checkToggleCompletionPermissions = editingFunctions
        ? {
              checkComplete: editingFunctions.checkIfCompleteAllowed,
              checkUnComplete: editingFunctions.checkIfUnCompleteAllowed,
          }
        : undefined;

    const saveChanges = () => editingFunctions!.saveUpdates(selectedNode, newSkillProps)();

    return (
        <Pressable
            onPress={closeMenu}
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
            <Animated.View
                onStartShouldSetResponder={(event) => true}
                onTouchEnd={(e) => e.stopPropagation()}
                entering={FadeInDown.easing(Easing.elastic()).duration(300)}
                exiting={FadeOutDown.easing(Easing.elastic()).duration(200)}
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
                    <Animated.View style={[styles.interactiveContainer]} layout={Layout.stiffness(200).damping(26)}>
                        <AppText style={{ color: colors.line, paddingBottom: 10 }} fontSize={12}>
                            Click outside this menu to close
                        </AppText>

                        {editingEnabled && (
                            <SliderToggler containerWidth={menuWidth / 2 - 10} isLeftSelected={mode === "VIEWING"} toggleMode={toggleMode} />
                        )}

                        {mode === "EDITING" && editingEnabled && (
                            <Editing
                                skillPropsState={skillPropsState}
                                handleDeleteSelectedNode={editingFunctions!.handleDeleteSelectedNode}
                                checkToggleCompletionPermissions={checkToggleCompletionPermissions!}
                            />
                        )}
                        {mode === "VIEWING" && (
                            <Viewing
                                selectedNode={selectedNode}
                                selectedTreeId={selectedNode.treeId}
                                functions={{ goToTreePage, goToSkillPage, goToEditTreePage }}
                            />
                        )}
                    </Animated.View>
                </KeyboardAvoidingView>
            </Animated.View>
            {showSaveChangesBtn && <SaveChangesButton height={height} saveChanges={saveChanges} />}
        </Pressable>
    );
}

export default SelectedNodeMenu;

function SaveChangesButton({ saveChanges, height }: { saveChanges: () => void; height: number }) {
    return (
        <View style={{ right: 0, width: 134, height, position: "absolute" }}>
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
        </View>
    );
}

function checkForSave(newSkillProps: SkillPropertiesEditableOnPopMenu, selectedNode: NormalizedNode) {
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
            borderRadius: 10,
            padding: 10,
            width: menuWidth,
            overflow: "hidden",
        },
    });

    return { styles, menuHeight, menuWidth };
}
