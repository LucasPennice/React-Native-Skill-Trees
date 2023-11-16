import AppButton from "@/components/AppButton";
import AppEmojiPicker, { Emoji, findEmoji } from "@/components/AppEmojiPicker";
import Spacer from "@/components/Spacer";
import { generate24CharHexId, toggleEmoji } from "@/functions/misc";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useEffect, useState } from "react";
import { Alert, Dimensions, Keyboard, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import Animated, { Easing, FadeInDown, Layout, ZoomIn, ZoomOut, useAnimatedStyle, withTiming } from "react-native-reanimated";
import AppText from "../../../components/AppText";
import AppTextInput from "../../../components/AppTextInput";
import FlingToDismissModal from "../../../components/FlingToDismissModal";
import NodeView from "../../../components/NodeView";
import RadioInput from "../../../components/RadioInput";
import { findNodeById } from "../../../functions/extractInformationFromTree";
import { centerFlex, colors } from "../../../parameters";
import { DnDZone, Skill, Tree, getDefaultSkillValue } from "../../../types";
import GoalForm from "./AddNodeModal/GoalForm";

type Props = {
    closeModal: () => void;
    addNodes: (nodesToAdd: Tree<Skill>[], dnDZone: DnDZone) => void;
    open: boolean;
    selectedTree: Tree<Skill>;
    dnDZone: DnDZone;
};

function AddNodeModal({ closeModal, open, addNodes, selectedTree, dnDZone }: Props) {
    const nodeOfDnDZone = findNodeById(selectedTree, dnDZone.ofNode);

    if (!nodeOfDnDZone) throw new Error("undefined nodeOfDnDZone at AddNodeModal");

    let parentNode = nodeOfDnDZone;

    if (dnDZone.type !== "CHILDREN") {
        const n = findNodeById(selectedTree, nodeOfDnDZone!.parentId);
        if (!n) throw new Error("undefined n at AddNodeModal");
        parentNode = n;
    }

    const { width } = Dimensions.get("screen");

    const [nodesToAdd, setNodesToAdd] = useState<Tree<Skill>[]>([]);
    const [currentNode, setCurrentNode] = useState<Tree<Skill>>(getInitialCurrentSkillValue());
    const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>(undefined);
    const [emojiSelectorOpen, setEmojiSelectorOpen] = useState(false);

    const isEditing = selectedNodeId !== undefined;

    const shouldBlockAddButton = getShouldBlockAddButton();

    useEffect(() => {
        if (!selectedNodeId) return setCurrentNode(getInitialCurrentSkillValue());

        const selectedNode = nodesToAdd.find((n) => n.nodeId === selectedNodeId);

        if (!selectedNode) throw new Error("selected node not found at AddNodeModal");

        setCurrentNode(selectedNode);
    }, [selectedNodeId]);

    useEffect(() => {
        setNodesToAdd([]);
        setCurrentNode(getInitialCurrentSkillValue());
        setSelectedNodeId(undefined);
    }, [open]);

    const setName = (v: string) => {
        setCurrentNode((p) => {
            let result: Tree<Skill> = { ...p, data: { ...p.data, name: v } };
            return result;
        });
    };
    const setCompletion = (v: boolean) => {
        if (parentNode.category === "SKILL" && !parentNode.data.isCompleted)
            return Alert.alert(`Complete ${parentNode.data.name} before completing this skill`);

        setCurrentNode((p) => {
            let result: Tree<Skill> = { ...p, data: { ...p.data, isCompleted: v } };
            return result;
        });
    };

    const setIcon = (emoji?: Emoji) => {
        setCurrentNode((p) => {
            if (emoji === undefined) {
                return { ...p, data: { ...p.data, icon: { isEmoji: false, text: p.data.name[0] } } };
            }

            return { ...p, data: { ...p.data, icon: { isEmoji: true, text: emoji.emoji } } };
        });
    };

    const updateAddNodeList = (nodeToUpdate: Tree<Skill>) => {
        const isValid = validateNodeToUpdate(nodeToUpdate);

        let result: Tree<Skill>[] = [];

        if (!isValid) return result;

        setNodesToAdd((p) => {
            const isTreeInList = p.find((n) => n.nodeId === nodeToUpdate.nodeId);

            if (!isTreeInList) {
                result = [...p, nodeToUpdate];
                return result;
            }

            result = p.map((n) => {
                if (n.nodeId === nodeToUpdate.nodeId) return nodeToUpdate;

                return n;
            });

            return result;
        });

        setCurrentNode(getInitialCurrentSkillValue());
        setSelectedNodeId(undefined);

        return result;
    };

    function validateNodeToUpdate(nodeToUpdate: Tree<Skill>) {
        if (nodeToUpdate.data.name === "") {
            Alert.alert("Please enter a name for the new skill");
            return false;
        }

        return true;
    }

    const selectNode = (id: string) => () => {
        setSelectedNodeId((p) => {
            if (id === p) return undefined;

            return id;
        });
    };

    const deleteNode = (id: string) => () => {
        setSelectedNodeId(undefined);

        setNodesToAdd((p) => {
            return p.filter((n) => n.nodeId !== id);
        });
    };

    const checkIfInputsValid = () => {
        if (currentNode.data.name.trim() !== "") return true;

        return false;
    };

    const handleAddNodeToList = () => {
        if (shouldBlockAddButton) {
            Alert.alert(
                "You can have only one parent node. To add multiple nodes at once, choose either LEFT, RIGHT, or CHILDREN from the ADD menu. Simply long-press a node and select 'add' to access the menu."
            );
            return [];
        }

        return updateAddNodeList(currentNode);
    };

    const handleConfirm = () => {
        if (isEditing) {
            if (checkIfInputsValid()) return addNodeToListAndSave();

            return Alert.alert("Please enter a name for the new skill");
        }

        const inputsEmpty = currentNode.data.name === "" && currentNode.data.icon.text === "";

        if (inputsEmpty) return saveToTreeElementsOfArray(nodesToAdd);

        if (checkIfInputsValid()) return addNodeToListAndSave();

        return Alert.alert("Please enter a name for the new skill");

        function addNodeToListAndSave() {
            const updatedList = handleAddNodeToList();
            saveToTreeElementsOfArray(updatedList);
        }
        function saveToTreeElementsOfArray(nodesToAdd: Tree<Skill>[]) {
            if (nodesToAdd.length === 0) return closeModal();

            return addNodes(nodesToAdd, dnDZone);
        }
    };

    const selectedNodeEmoji = currentNode.data.icon.isEmoji ? findEmoji(currentNode.data.icon.text) : undefined;

    return (
        <FlingToDismissModal
            closeModal={closeModal}
            open={open}
            leftHeaderButton={{ onPress: handleConfirm, title: "Add Skills" }}
            modalContainerStyles={{ backgroundColor: colors.background }}>
            <View style={[centerFlex, { flex: 1, justifyContent: "flex-start", alignItems: "flex-start" }]}>
                <Animated.View
                    style={{
                        height: 90,
                        flexDirection: "row",
                        justifyContent: "center",
                        backgroundColor: colors.darkGray,
                        borderRadius: 10,
                    }}>
                    <Animated.ScrollView
                        horizontal
                        layout={Layout}
                        showsHorizontalScrollIndicator={false}
                        style={{ overflow: "visible" }}
                        contentContainerStyle={{ paddingLeft: 10 }}>
                        {nodesToAdd.map((n) => (
                            <SelectableNodeView
                                n={n}
                                key={n.nodeId}
                                isSelected={n.nodeId === selectedNodeId}
                                selectNode={selectNode(n.nodeId)}
                                deleteNode={deleteNode(n.nodeId)}
                            />
                        ))}
                    </Animated.ScrollView>
                </Animated.View>
                <AppText style={{ color: `${colors.white}80`, marginTop: 5 }} fontSize={14} children={"Tap a node to edit it"} />

                <View style={[centerFlex, { width: "100%", justifyContent: "flex-start", alignItems: "flex-start", flex: 1, marginTop: 10 }]}>
                    <ScrollView style={{ width: "100%" }}>
                        <AppText style={{ marginBottom: 5 }} fontSize={18} children={"Skill Name & Icon"} />
                        <View style={{ flexDirection: "row", marginBottom: 10 }}>
                            <AppTextInput
                                placeholder={"Education"}
                                textState={[currentNode.data.name, setName]}
                                pattern={new RegExp(/^[^ ]/)}
                                containerStyles={{ flex: 1 }}
                            />
                            <Pressable onPress={() => setEmojiSelectorOpen(true)}>
                                <AppText
                                    children={currentNode.data.icon.isEmoji ? currentNode.data.icon.text : "🧠"}
                                    style={{
                                        fontFamily: "emojisMono",
                                        color: currentNode.data.icon.isEmoji ? colors.white : colors.line,
                                        width: 45,
                                        paddingTop: 2,
                                        height: 45,
                                        backgroundColor: colors.darkGray,
                                        borderRadius: 10,
                                        marginLeft: 10,
                                        textAlign: "center",
                                        verticalAlign: "middle",
                                    }}
                                    fontSize={24}
                                />
                            </Pressable>
                        </View>

                        <View style={{ flexDirection: "row" }}>
                            <RadioInput
                                state={[currentNode.data.isCompleted, setCompletion]}
                                text={"Complete"}
                                iconProps={{ name: "pencil", size: 18, color: `${colors.white}80` }}
                                textProps={{ fontSize: 16, paddingTop: 3 }}
                                style={{ height: 45, backgroundColor: colors.darkGray, marginBottom: 0, flex: 1, borderRadius: 10 }}
                            />
                        </View>

                        <AppEmojiPicker
                            selectedEmojisName={currentNode.data.icon.isEmoji ? [selectedNodeEmoji!.name] : undefined}
                            onEmojiSelected={toggleEmoji(setIcon, currentNode.data.icon.isEmoji ? selectedNodeEmoji! : undefined)}
                            state={[emojiSelectorOpen, setEmojiSelectorOpen]}
                        />

                        <Spacer style={{ marginVertical: 10 }} />

                        <GoalForm blockInteraction={currentNode.data.isCompleted} />
                    </ScrollView>
                </View>
                <AddAndEditButton handleAddNodeToList={handleAddNodeToList} isEditing={isEditing} shouldBlockAddButton={shouldBlockAddButton} />
            </View>
        </FlingToDismissModal>
    );

    function getInitialCurrentSkillValue() {
        const tree: Tree<Skill> = {
            accentColor: selectedTree.accentColor,
            treeId: selectedTree.treeId,
            treeName: selectedTree.treeName,
            category: "SKILL",
            children: [],
            data: getDefaultSkillValue("", false, { isEmoji: false, text: "" }),
            isRoot: false,
            level: 0,
            nodeId: generate24CharHexId(),
            parentId: "",
            x: 0,
            y: 0,
        };

        return tree;
    }

    function getShouldBlockAddButton() {
        if (dnDZone.type === "PARENT" && nodesToAdd.length >= 1 && selectedNodeId === undefined) return true;
        if (dnDZone.type === "CHILDREN" && nodesToAdd.length >= 1 && nodeOfDnDZone!.children.length > 0 && selectedNodeId === undefined) return true;

        return false;
    }
}

function SelectableNodeView({
    n,
    isSelected,
    selectNode,
    deleteNode,
}: {
    n: Tree<Skill>;
    isSelected: boolean;
    selectNode: () => void;
    deleteNode: () => void;
}) {
    const styles = StyleSheet.create({
        container: {
            position: "relative",
            height: 90,
            width: 90,
            borderRadius: 10,
            marginRight: 35,
            borderWidth: 1,
        },
        deleteButton: {
            position: "absolute",
            top: 0,
            right: 0,
            zIndex: 2,
            width: 30,
            height: 30,
            justifyContent: "center",
            alignItems: "center",
        },
    });

    const animatedBorderColor = useAnimatedStyle(() => {
        return {
            borderColor: withTiming(isSelected ? colors.accent : colors.line, { duration: 150 }),
        };
    }, [isSelected]);

    return (
        <Animated.View
            key={n.nodeId}
            layout={Layout.duration(240).easing(Easing.inOut(Easing.ease))}
            style={[animatedBorderColor, styles.container]}
            entering={FadeInDown}>
            <Pressable onPress={selectNode} style={[centerFlex, { height: 90, width: 90 }]}>
                <NodeView
                    node={n}
                    params={{
                        fontSize: 18,
                        completePercentage: n.data.isCompleted ? 100 : 0,
                        size: 50,
                        oneColorPerTree: false,
                        showIcons: true,
                    }}
                />

                {isSelected && (
                    <Pressable style={styles.deleteButton} onPress={deleteNode}>
                        <Animated.View entering={ZoomIn} exiting={ZoomOut}>
                            <FontAwesome size={20} name="trash" color={colors.line} />
                        </Animated.View>
                    </Pressable>
                )}
            </Pressable>
        </Animated.View>
    );
}

function AddAndEditButton({
    handleAddNodeToList,
    isEditing,
    shouldBlockAddButton,
}: {
    shouldBlockAddButton: boolean;
    handleAddNodeToList: () => void;
    isEditing: boolean;
}) {
    const handleClick = () => {
        Keyboard.dismiss();
        handleAddNodeToList();
    };

    return (
        <View style={{ position: "absolute", bottom: Platform.OS === "ios" ? 65 : 0, right: 0 }}>
            <AppButton
                color={{ idle: isEditing ? colors.green : colors.accent }}
                onPress={handleClick}
                text={{ idle: isEditing ? "Edit Skill" : "Add Skill" }}
                pressableStyle={{ width: 100, opacity: shouldBlockAddButton ? 0.5 : 1 }}
            />
        </View>
    );
}

export default AddNodeModal;
