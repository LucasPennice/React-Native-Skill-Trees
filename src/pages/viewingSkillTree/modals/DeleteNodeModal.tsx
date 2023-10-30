import { normalizedNodeToTree } from "@/components/treeRelated/general/functions";
import { deleteNodeAndChildren, deleteNodeAndHoistChild } from "@/functions/misc";
import { removeNodes, selectNodesOfTree, updateNodes } from "@/redux/slices/nodesSlice";
import { TreeData, selectTreeById } from "@/redux/slices/userTreesSlice";
import { Update } from "@reduxjs/toolkit";
import { Alert, Dimensions, Pressable, ScrollView, StyleSheet, View } from "react-native";
import AppText from "../../../components/AppText";
import FlingToDismissModal from "../../../components/FlingToDismissModal";
import NodeView from "../../../components/NodeView";
import { findParentOfNode } from "../../../functions/extractInformationFromTree";
import { CIRCLE_SIZE, PURPLE_GRADIENT, centerFlex, colors } from "../../../parameters";
import { useAppDispatch, useAppSelector } from "../../../redux/reduxHooks";
import { NodeCoordinate, NormalizedNode, getDefaultSkillValue } from "../../../types";
import { Defs, Line, LinearGradient, Path, Stop, Svg } from "react-native-svg";
import { Fragment } from "react";
import { HierarchicalPath } from "@/components/takingScreenshot/TakingScreenshotLoadingScreenModal";
import { nodeToCircularPath } from "@/functions/svg/toSvg";
import AppButton from "@/components/AppButton";
import Spacer from "@/components/Spacer";

type Props = {
    nodeToDelete: NormalizedNode;
    closeModalAndClearState: () => void;
    open: boolean;
};

function useGetSelectedTree(treeId: string) {
    //We can guarantee here that the type is TreeData because we will never pass the home tree id to the selector
    const treeData = useAppSelector(selectTreeById(treeId)) as TreeData;
    const treeNodes = useAppSelector(selectNodesOfTree(treeId));

    const selectedTree = normalizedNodeToTree(treeNodes, treeData);

    return selectedTree;
}

function DeleteNodeModal({ nodeToDelete, closeModalAndClearState, open }: Props) {
    const currentTree = useGetSelectedTree(nodeToDelete.treeId);

    const nodesOfTree = useAppSelector(selectNodesOfTree(nodeToDelete.treeId));

    const dispatch = useAppDispatch();

    const candidatesToHoist = nodesOfTree.filter((n) => nodeToDelete.childrenIds.includes(n.nodeId));

    const deleteParentAndHoistChildren = (childrenToHoist: NormalizedNode) => () => {
        const nodeToHoist = nodesOfTree.find((node) => node.nodeId === childrenToHoist.nodeId);

        if (!nodeToHoist) throw new Error("nodeToHoist undefined at deleteParentAndHoistChildren");

        const { nodeIdToDelete, updatedNodes } = deleteNodeAndHoistChild(nodesOfTree, nodeToHoist);

        const updatedNodesReducerFormat: Update<NormalizedNode>[] = updatedNodes.map((updatedNode) => {
            return {
                id: updatedNode.nodeId,
                changes: { childrenIds: updatedNode.childrenIds, parentId: updatedNode.parentId, level: updatedNode.level },
            };
        });

        closeModalAndClearState();

        dispatch(updateNodes(updatedNodesReducerFormat));
        dispatch(removeNodes({ treeId: childrenToHoist.treeId, nodesToDelete: [nodeIdToDelete] }));
    };

    const deleteParentAndAllItsChildren = () => {
        const { nodesToDelete, updatedNodes } = deleteNodeAndChildren(nodesOfTree, nodeToDelete);

        const updatedNodesReducerFormat: Update<NormalizedNode>[] = updatedNodes.map((updatedNode) => {
            return { id: updatedNode.nodeId, changes: { childrenIds: updatedNode.childrenIds } };
        });

        closeModalAndClearState();

        dispatch(updateNodes(updatedNodesReducerFormat));
        dispatch(removeNodes({ treeId: nodeToDelete.treeId, nodesToDelete }));
    };

    const confirmDeleteNode = (children: NormalizedNode) => () => {
        const parent = findParentOfNode(currentTree, children.nodeId);

        const parentName = parent ? parent.data.name : "";

        return Alert.alert(
            `Delete ${parentName} and replace it with ${children.data.name}?`,
            "",
            [
                { text: "No", style: "cancel" },
                { text: "Yes", onPress: deleteParentAndHoistChildren(children), style: "destructive" },
            ],
            { cancelable: true }
        );
    };

    return (
        <FlingToDismissModal closeModal={closeModalAndClearState} open={open} modalContainerStyles={{ backgroundColor: colors.background }}>
            <View style={{ flex: 1 }}>
                <AppText
                    children={`Replace "${nodeToDelete.data.name}" with one of it's children`}
                    fontSize={18}
                    style={{ color: "#E6E8E6", marginBottom: 5 }}
                />
                <AppText children={`example`} fontSize={16} style={{ color: "#E6E8E6", marginBottom: 10, opacity: 0.2 }} />
                <HoistExample />

                <View style={{ flex: 1 }}>
                    <ScrollView style={[{ flex: 1, width: "100%", marginTop: 20 }]}>
                        {candidatesToHoist.map((candidate, idx) => {
                            const blockDelete = checkIfShouldBlockDelete(nodeToDelete, candidate, nodesOfTree);

                            return (
                                <CandidateToHoistCard
                                    key={idx}
                                    blockDelete={blockDelete}
                                    candidate={candidate}
                                    confirmDeleteNode={confirmDeleteNode(candidate)}
                                />
                            );
                        })}
                    </ScrollView>
                </View>

                <View
                    style={{
                        flexDirection: "row",
                        marginVertical: 10,
                        alignItems: "center",
                    }}>
                    <Spacer style={{ flex: 1 }} />
                    <AppText children={`or`} fontSize={18} style={{ color: "#E6E8E680", marginBottom: 5, width: 50, textAlign: "center" }} />
                    <Spacer style={{ flex: 1 }} />
                </View>

                <AppButton
                    onPress={deleteParentAndAllItsChildren}
                    text={{ idle: "Delete skill and children" }}
                    style={{ backgroundColor: colors.background }}
                />
            </View>
        </FlingToDismissModal>
    );
}

const CandidateToHoistCard = ({
    candidate,
    blockDelete,
    confirmDeleteNode,
}: {
    candidate: NormalizedNode;
    blockDelete: boolean;
    confirmDeleteNode: () => void;
}) => {
    const currentTree = useAppSelector(selectTreeById(candidate.treeId));

    const notifyWhyDeleteBlocked = () =>
        Alert.alert("When this child is hosted skills will be complete without it's parent being complete. Breaking this skill tree's dependencies");

    const styles = StyleSheet.create({
        pressable: {
            paddingHorizontal: 15,
            height: 75,
            marginHorizontal: 10,
            marginBottom: 20,
            borderRadius: 20,
            backgroundColor: colors.darkGray,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
            opacity: blockDelete ? 0.3 : 1,
            gap: 10,
            position: "relative",
        },
    });

    return (
        <Pressable style={styles.pressable} onPress={blockDelete ? notifyWhyDeleteBlocked : confirmDeleteNode}>
            <NodeView
                node={{ ...candidate, accentColor: currentTree.accentColor }}
                params={{
                    fontSize: 22,
                    completePercentage: candidate.data.isCompleted ? 100 : 0,
                    size: 52,
                    oneColorPerTree: false,
                    showIcons: true,
                }}
            />
            <AppText style={{ color: "#E6E8E6", marginBottom: 5, height: 40, verticalAlign: "top" }} fontSize={18}>
                {candidate.data.name}
            </AppText>
            <AppText
                style={{
                    color: "#E6E8E6",
                    height: 28,
                    borderWidth: 1,
                    borderColor: colors.accent,
                    borderRadius: 10,
                    position: "absolute",
                    right: 15,
                    bottom: 15,
                    width: 93,
                    textAlign: "center",
                    verticalAlign: "middle",
                }}
                fontSize={12}>
                Select
            </AppText>
        </Pressable>
    );
};

const MOCK_SKILL_VALUE = getDefaultSkillValue("foo", false, { isEmoji: false, text: "foo" });

const HoistExample = () => {
    const { width } = Dimensions.get("window");
    const BEFORE_HOIST_SVG_DIMENSIONS = { width: 116, height: 98 };

    const BEFORE_COORD: NodeCoordinate[] = [
        {
            accentColor: PURPLE_GRADIENT,
            category: "SKILL",
            data: MOCK_SKILL_VALUE,
            isRoot: true,
            level: 0,
            nodeId: "0",
            parentId: null,
            treeId: "mockTree",
            treeName: "mockName",
            x: BEFORE_HOIST_SVG_DIMENSIONS.width / 2 + CIRCLE_SIZE,
            y: CIRCLE_SIZE + 1,
        },
        {
            accentColor: PURPLE_GRADIENT,
            category: "SKILL",
            data: MOCK_SKILL_VALUE,
            isRoot: false,
            level: 1,
            nodeId: "1-1",
            parentId: "0",
            treeId: "mockTree",
            treeName: "mockName",
            x: 2 * CIRCLE_SIZE + 1,
            y: 80,
        },
        {
            accentColor: PURPLE_GRADIENT,
            category: "SKILL",
            data: MOCK_SKILL_VALUE,
            isRoot: false,
            level: 1,
            nodeId: "1-2",
            parentId: "0",
            treeId: "mockTree",
            treeName: "mockName",
            x: BEFORE_HOIST_SVG_DIMENSIONS.width / 2 + CIRCLE_SIZE,
            y: 80,
        },
        {
            accentColor: PURPLE_GRADIENT,
            category: "SKILL",
            data: MOCK_SKILL_VALUE,
            isRoot: false,
            level: 1,
            nodeId: "1-3",
            parentId: "0",
            treeId: "mockTree",
            treeName: "mockName",
            x: BEFORE_HOIST_SVG_DIMENSIONS.width,
            y: 80,
        },
    ];

    const AFTER_COORD: NodeCoordinate[] = [
        {
            accentColor: PURPLE_GRADIENT,
            category: "SKILL",
            data: MOCK_SKILL_VALUE,
            isRoot: true,
            level: 0,
            nodeId: "after0",
            parentId: null,
            treeId: "aftermockTree",
            treeName: "aftermockName",
            x: width - 5.5 * CIRCLE_SIZE,
            y: CIRCLE_SIZE + 1,
        },
        {
            accentColor: PURPLE_GRADIENT,
            category: "SKILL",
            data: MOCK_SKILL_VALUE,
            isRoot: false,
            level: 1,
            nodeId: "after1-1",
            parentId: "after0",
            treeId: "aftermockTree",
            treeName: "aftermockName",
            x: width - 3.5 * CIRCLE_SIZE,
            y: 80,
        },

        {
            accentColor: PURPLE_GRADIENT,
            category: "SKILL",
            data: MOCK_SKILL_VALUE,
            isRoot: false,
            level: 1,
            nodeId: "after1-3",
            parentId: "after0",
            treeId: "aftermockTree",
            treeName: "aftermockName",
            x: width - 7.5 * CIRCLE_SIZE,
            y: 80,
        },
    ];

    return (
        <View style={[centerFlex, { position: "relative" }]}>
            <Svg style={{ width: width, height: BEFORE_HOIST_SVG_DIMENSIONS.height, marginTop: 10 }}>
                <Defs>
                    <LinearGradient id="gray" x1="0%" x2="100%" y1="0%" y2="100%">
                        <Stop offset="0%" stopColor={"#515053"} stopOpacity={1} />
                        <Stop offset="100%" stopColor={"#2C2C2D"} stopOpacity={1} />
                    </LinearGradient>
                </Defs>
                <Defs>
                    <LinearGradient id="selected" x1="0%" x2="100%" y1="0%" y2="100%">
                        <Stop offset="0%" stopColor={"#50D158"} stopOpacity={0.5} />
                        <Stop offset="100%" stopColor={"#1982F9"} stopOpacity={0.5} />
                    </LinearGradient>
                </Defs>
                {BEFORE_COORD.map((node, idx) => {
                    return (
                        <Fragment key={node.nodeId}>
                            {!node.isRoot && <HierarchicalPath node={node} coordinatesInsideCanvas={BEFORE_COORD} />}

                            <Path
                                stroke={idx === 3 ? "url(#selected)" : "url(#gray)"}
                                strokeLinecap="round"
                                strokeWidth={2}
                                d={nodeToCircularPath(node)}
                            />
                        </Fragment>
                    );
                })}
                {AFTER_COORD.map((node, idx) => {
                    return (
                        <Fragment key={node.nodeId}>
                            {!node.isRoot && <HierarchicalPath node={node} coordinatesInsideCanvas={AFTER_COORD} />}

                            <Path
                                stroke={idx === 0 ? "url(#selected)" : "url(#gray)"}
                                strokeLinecap="round"
                                strokeWidth={2}
                                d={nodeToCircularPath(node)}
                            />
                        </Fragment>
                    );
                })}
                <Line
                    x1={BEFORE_COORD[0].x - CIRCLE_SIZE}
                    y1={BEFORE_COORD[0].y - CIRCLE_SIZE}
                    x2={BEFORE_COORD[0].x + CIRCLE_SIZE}
                    y2={BEFORE_COORD[0].y + CIRCLE_SIZE}
                    strokeDasharray={5}
                    stroke={colors.red}
                    strokeWidth={2}
                    strokeOpacity={0.5}
                />
                <Line
                    x1={BEFORE_COORD[0].x - CIRCLE_SIZE}
                    y1={BEFORE_COORD[0].y + CIRCLE_SIZE}
                    x2={BEFORE_COORD[0].x + CIRCLE_SIZE}
                    y2={BEFORE_COORD[0].y - CIRCLE_SIZE}
                    strokeDasharray={5}
                    stroke={colors.red}
                    strokeWidth={2}
                    strokeOpacity={0.5}
                />
            </Svg>
            <AppText children={"to"} fontSize={16} style={{ color: "#E6E8E680", position: "absolute" }} />
        </View>
    );
};

export default DeleteNodeModal;

function checkIfShouldBlockDelete(nodeToDelete: NormalizedNode, candidate: NormalizedNode, nodesOfTree: NormalizedNode[]) {
    if (candidate.data.isCompleted) return false;

    //These are the children of the candidate node if it were to be hoisted
    const possibleChildrenOfCandidate = nodesOfTree.filter((n) => {
        if (n.nodeId === candidate.nodeId) return false;
        if (nodeToDelete.childrenIds.includes(n.nodeId)) return true;
        return false;
    });

    const anyPossibleChildrenOfCandidateComplete = possibleChildrenOfCandidate.find((n) => n.data.isCompleted);

    if (anyPossibleChildrenOfCandidateComplete) return true;

    return false;
}
