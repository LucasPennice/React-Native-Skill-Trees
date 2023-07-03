import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { Alert, Dimensions, Pressable, View } from "react-native";
import Animated, { Easing, FadeInDown, FadeOutUp, Layout, ZoomIn, ZoomOut, useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";
import { Line, Rect, Svg } from "react-native-svg";
import AppText from "../../../components/AppText";
import AppTextInput from "../../../components/AppTextInput";
import FlingToDismissModal from "../../../components/FlingToDismissModal";
import NodeView from "../../../components/NodeView";
import RadioInput from "../../../components/RadioInput";
import { makeid } from "../../../functions/misc";
import { centerFlex, colors } from "../../../parameters";
import { DnDZone, Skill, Tree, getDefaultSkillValue } from "../../../types";
import { findNodeById } from "../../../functions/extractInformationFromTree";

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
            let result = { ...p };
            result.data.name = v;
            return result;
        });
    };
    const setCompletion = (v: boolean) => {
        if (parentNode.category === "SKILL" && !parentNode.data.isCompleted)
            return Alert.alert(`Complete ${parentNode.data.name} before completing this skill`);

        setCurrentNode((p) => {
            let result = { ...p };
            result.data.isCompleted = v;
            return result;
        });
    };

    const setIcon = (v: string) => {
        const emoji = v.match(/\p{Extended_Pictographic}/gu);

        setCurrentNode((p) => {
            let result = { ...p };

            if (v === "") {
                result.data.icon = { isEmoji: false, text: "" };
                return result;
            }

            if (!emoji) return p;

            result.data.icon = { isEmoji: true, text: emoji[0] };

            return result;
        });
    };

    const updateAddNodeList = (nodeToUpdate: Tree<Skill>) => {
        const isValid = validateNodeToUpdate(nodeToUpdate);

        if (!isValid) return;

        setNodesToAdd((p) => {
            const isTreeInList = p.find((n) => n.nodeId === nodeToUpdate.nodeId);

            if (!isTreeInList) return [...p, nodeToUpdate];

            return p.map((n) => {
                if (n.nodeId === nodeToUpdate.nodeId) return nodeToUpdate;

                return n;
            });
        });

        setCurrentNode(getInitialCurrentSkillValue());
        setSelectedNodeId(undefined);
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

    return (
        <FlingToDismissModal
            closeModal={closeModal}
            open={open}
            leftHeaderButton={{ onPress: () => addNodes(nodesToAdd, dnDZone), title: "Confirm" }}>
            <View style={[centerFlex, { flex: 1, justifyContent: "space-between" }]}>
                <View>
                    <View style={{ paddingHorizontal: 10, marginBottom: 10 }}>
                        <AppText style={{ color: "#FFFFFF", marginBottom: 10, fontFamily: "helveticaBold" }} fontSize={24}>
                            Add Skills
                        </AppText>
                        <AppText style={{ color: colors.unmarkedText, marginBottom: 5 }} fontSize={16}>
                            Add as many nodes as you want, then hit “confirm”. Tap a node to edit it
                        </AppText>
                    </View>
                    <View style={{ height: 90, width, backgroundColor: "#282A2C", justifyContent: "center" }}>
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
                    </View>
                </View>

                <View style={{ width: "100%" }}>
                    <AppText style={{ color: "#FFFFFF", marginBottom: 5, fontFamily: "helveticaBold" }} fontSize={20}>
                        Name
                    </AppText>
                    <AppTextInput
                        placeholder={"Skill Name"}
                        textState={[currentNode.data.name, setName]}
                        pattern={new RegExp(/^[^ ]/)}
                        containerStyles={{ marginBottom: 15 }}
                    />
                    <View style={{ flexDirection: "row", marginBottom: 15, justifyContent: "space-between", alignItems: "center" }}>
                        <View style={{ width: width - 160 }}>
                            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                                <AppText style={{ color: "#FFFFFF", marginBottom: 5, fontFamily: "helveticaBold" }} fontSize={20}>
                                    Icon
                                </AppText>
                                <AppText style={{ color: colors.unmarkedText, marginLeft: 5, marginTop: 2 }} fontSize={16}>
                                    (optional)
                                </AppText>
                            </View>
                            <AppText style={{ color: colors.unmarkedText, marginBottom: 10 }} fontSize={14}>
                                Your keyboard can switch to an emoji mode. To access it, look for a button located near the bottom left of your
                                keyboard.
                            </AppText>
                        </View>
                        <AppTextInput
                            placeholder={"🧠"}
                            textStyle={{ fontFamily: "emojisMono", fontSize: 40 }}
                            textState={[currentNode.data.icon.text, setIcon]}
                            pattern={new RegExp(/\p{Extended_Pictographic}/u)}
                            containerStyles={{ width: 130 }}
                        />
                    </View>

                    <RadioInput state={[currentNode.data.isCompleted, setCompletion]} text={"Complete"} style={{ marginBottom: 10 }} />
                </View>

                <LinearGradient
                    colors={["#BF5AF2", "#5A7BF2"]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={{ height: 60, width: "100%", borderRadius: 10, opacity: shouldBlockAddButton ? 0.5 : 1 }}>
                    <Pressable
                        style={[centerFlex, { height: 60, width: "100%" }]}
                        onPress={
                            shouldBlockAddButton
                                ? () =>
                                      Alert.alert(
                                          "You can have only one parent node. To add multiple nodes at once, choose either LEFT, RIGHT, or CHILDREN from the ADD menu. Simply long-press a node and select 'add' to access the menu."
                                      )
                                : () => updateAddNodeList(currentNode)
                        }>
                        <AppText style={{ color: "#FFFFFF" }} fontSize={20}>
                            {selectedNodeId ? "Edit" : "Add"}
                        </AppText>
                    </Pressable>
                </LinearGradient>
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
            nodeId: makeid(24),
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
    const styles = useAnimatedStyle(() => {
        return {
            shadowOpacity: withTiming(isSelected ? 1 : 0, { duration: 150 }),
            transform: [{ scale: withSpring(isSelected ? 1.1 : 1) }],
        };
    }, [isSelected]);

    return (
        <Animated.View
            key={n.nodeId}
            layout={Layout.duration(240).easing(Easing.inOut(Easing.ease))}
            style={[
                styles,

                {
                    position: "relative",
                    backgroundColor: "#282A2C",
                    height: 90,
                    width: 90,
                    borderRadius: 10,
                    marginRight: 35,
                    shadowColor: "#000",
                    shadowOffset: {
                        width: 0,
                        height: 2,
                    },
                    shadowRadius: 3.84,
                    elevation: 5,
                },
            ]}
            entering={FadeInDown}
            exiting={FadeOutUp}>
            <Pressable onPress={selectNode} style={[centerFlex, { height: 90, width: 90 }]}>
                <NodeView node={n} size={65} />

                {isSelected && (
                    <Pressable style={{ position: "absolute", top: 5, right: 5, zIndex: 2 }} onPress={deleteNode}>
                        <Animated.View exiting={ZoomOut} entering={ZoomIn.springify().stiffness(150).damping(16)}>
                            <Svg width="39" height="39" viewBox="0 0 39 39" fill="none">
                                <Rect width="39" height="39" rx="19.5" fill="#181A1C" />
                                <Line x1="11.9006" y1="10.6478" x2="27.2555" y2="26.0026" stroke="#FE453A" strokeWidth="2" />
                                <Line x1="11.5832" y1="26.0026" x2="26.9381" y2="10.6478" stroke="#FE453A" strokeWidth="2" />
                            </Svg>
                        </Animated.View>
                    </Pressable>
                )}
            </Pressable>
        </Animated.View>
    );
}

export default AddNodeModal;
