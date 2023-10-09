import { HOMEPAGE_TREE_ID } from "@/parameters";
import { useAppDispatch, useAppSelector } from "@/redux/reduxHooks";
import { selectAllNodes, selectNodeById, selectNodesOfTree, updateNodes } from "@/redux/slices/nodesSlice";
import { router } from "expo-router";
import { Alert } from "react-native";
import { RoutesParams } from "routes";
import { checkIfCompletionAllowed, checkIfReverseCompletionAllowed } from "../../functions/extractInformationFromTree";
import { InteractiveTreeFunctions, NodeCoordinate, Skill } from "../../types";
import { NodeMenuFunctions } from "./nodeMenu/NodeMenu";

function useReturnNodeMenuFunctions(
    actionNode: NodeCoordinate | undefined,
    treeId: string | undefined,
    editTreeFromNodeMenu: boolean | undefined,
    functions?: InteractiveTreeFunctions["nodeMenu"]
) {
    const dispatch = useAppDispatch();
    const normalizedNode = useAppSelector(selectNodeById(actionNode?.nodeId));

    const nodesOfTree = useAppSelector(treeId === HOMEPAGE_TREE_ID || treeId === undefined ? selectAllNodes : selectNodesOfTree(treeId));

    if (!normalizedNode || !functions) return { idle: {}, selectingPosition: {} };

    const { confirmDeleteTree, openAddSkillModal, openCanvasSettingsModal } = functions;

    if (normalizedNode.category === "SKILL") return menuFunctionsForSkillNode();

    if (normalizedNode.category === "SKILL_TREE") return menuFunctionsForSkillTreeNode();

    //USER NODE CASE 👇

    return {
        idle: {
            //@ts-ignore
            horizontalRight: () => router.push({ pathname: "/myTrees", params: { openNewTreeModal: true } }),
            horizontalLeft: openCanvasSettingsModal,
        },
        selectingPosition: {},
    };

    function menuFunctionsForSkillNode() {
        if (!normalizedNode) throw new Error("normalizedNode undefined at menuFunctionsForSkillNode");

        let result: NodeMenuFunctions = { idle: {}, selectingPosition: {} };

        result.idle.verticalUp = () => {
            const params: RoutesParams["myTrees_treeId"] = {
                nodeId: normalizedNode.nodeId,
                treeId: normalizedNode.treeId,
                selectedNodeMenuMode: "EDITING",
            };

            //@ts-ignore
            router.push({ pathname: `/myTrees/${normalizedNode.treeId}`, params });
        };

        result.idle.horizontalLeft = () => {
            const params: RoutesParams["myTrees_treeId"] = {
                nodeId: normalizedNode.nodeId,
                treeId: normalizedNode.treeId,
                selectedNodeMenuMode: "EDITING",
            };

            //@ts-ignore
            router.push({ pathname: `/myTrees/${normalizedNode.treeId}`, params });
        };

        result.selectingPosition = {
            verticalUp: () => openAddSkillModal("PARENT", normalizedNode),
            verticalDown: () => openAddSkillModal("CHILDREN", normalizedNode),
            horizontalLeft: () => openAddSkillModal("LEFT_BROTHER", normalizedNode),
            horizontalRight: () => openAddSkillModal("RIGHT_BROTHER", normalizedNode),
        };

        result.idle.verticalDown = () => {
            const params: RoutesParams["myTrees_treeId"] = {
                nodeId: normalizedNode.nodeId,
                treeId: normalizedNode.treeId,
                selectedNodeMenuMode: "EDITING",
            };
            //@ts-ignore
            router.push({ pathname: `/myTrees/${normalizedNode.treeId}`, params });
        };

        //👇 Add functions to edit nodes from the actionNode menu
        if (editTreeFromNodeMenu) {
            result.idle.verticalUp = () => {
                if (normalizedNode.data.isCompleted) {
                    const canUnComplete = checkIfReverseCompletionAllowed(normalizedNode, nodesOfTree);

                    if (!canUnComplete) return Alert.alert(`Cannot unlearn ${normalizedNode.data.name}, please unlearn it's children skills first`);

                    const updatedData: Skill = { ...normalizedNode.data, isCompleted: false };

                    return dispatch(updateNodes([{ id: normalizedNode.nodeId, changes: { data: updatedData } }]));
                }

                //NODE IS NOT COMPLETE CASE 👇

                const canComplete = checkIfCompletionAllowed(normalizedNode, nodesOfTree);

                if (!canComplete) return Alert.alert(`Cannot learn ${normalizedNode.data.name} because the parent skill is not learned`);

                const updatedData: Skill = { ...normalizedNode.data, isCompleted: true };

                return dispatch(updateNodes([{ id: normalizedNode.nodeId, changes: { data: updatedData } }]));
            };

            result.idle.verticalDown = () => functions?.confirmDeleteNode(normalizedNode);

            result.idle.horizontalLeft = () => functions?.selectNode(normalizedNode, "EDITING");
        }

        return result;
    }

    function menuFunctionsForSkillTreeNode() {
        if (!normalizedNode) throw new Error("normalizedNode undefined at menuFunctionsForSkillTreeNode");

        return {
            idle: {
                verticalDown: () =>
                    confirmDeleteTree(
                        normalizedNode.treeId,
                        nodesOfTree.map((n) => n.nodeId)
                    ),
                horizontalLeft: () => {
                    const params: RoutesParams["myTrees"] = { editingTreeId: actionNode!.treeId };
                    //@ts-ignore
                    router.push({ pathname: `/myTrees`, params });
                },
            },
            selectingPosition: {
                verticalDown: () => openAddSkillModal("CHILDREN", normalizedNode),
            },
        };
    }
}

export default useReturnNodeMenuFunctions;
