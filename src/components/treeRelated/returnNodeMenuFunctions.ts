import { Alert } from "react-native";
import { checkIfCompletionIsAllowedForNode, checkIfUncompletionIsAllowedForNode, findNodeById } from "../../functions/extractInformationFromTree";
import { CoordinatesWithTreeData, Skill, Tree } from "../../types";
import { InteractiveTreeFunctions } from "./InteractiveTree";
import { NodeMenuFunctions } from "./nodeMenu/NodeMenu";

function returnNodeMenuFunctions(
    foundNodeOfMenu: CoordinatesWithTreeData | undefined,
    centeredCoordinatedWithTreeData: CoordinatesWithTreeData[],
    tree: Tree<Skill>,
    editTreeFromNodeMenu: boolean | undefined,
    functions?: InteractiveTreeFunctions["nodeMenu"]
) {
    if (!foundNodeOfMenu || !functions) return { idle: {}, selectingPosition: {} };

    const { confirmDeleteTree, navigate, openAddSkillModal, openCanvasSettingsModal, toggleCompletionOfSkill } = functions;

    if (foundNodeOfMenu.category === "SKILL") return menuFunctionsForSkillNode();

    if (foundNodeOfMenu.category === "SKILL_TREE") return menuFunctionsForSkillTreeNode();

    //USER NODE CASE 👇

    return {
        idle: {
            horizontalRight: () => navigate("MyTrees", { openNewTreeModal: true }),
            horizontalLeft: openCanvasSettingsModal,
        },
        selectingPosition: {},
    };

    function menuFunctionsForSkillNode() {
        const parentOfNode = centeredCoordinatedWithTreeData.find((n) => n.nodeId === foundNodeOfMenu!.parentId);
        const nodeInTree = findNodeById(tree, foundNodeOfMenu!.nodeId);

        if (!nodeInTree) throw new Error("Node not in tree in menuFunctionsForSkillNode");

        let result: NodeMenuFunctions = { idle: {}, selectingPosition: {} };

        result.idle.verticalUp = () =>
            functions?.navigate("ViewingSkillTree", {
                treeId: nodeInTree.treeId,
                selectedNodeId: nodeInTree.nodeId,
                selectedNodeMenuMode: "EDITING",
            });

        result.idle.horizontalLeft = () =>
            functions?.navigate("ViewingSkillTree", {
                treeId: nodeInTree.treeId,
                selectedNodeId: nodeInTree.nodeId,
                selectedNodeMenuMode: "EDITING",
            });

        result.selectingPosition = {
            verticalUp: () => openAddSkillModal("PARENT", nodeInTree),
            verticalDown: () => openAddSkillModal("CHILDREN", nodeInTree),
            horizontalLeft: () => openAddSkillModal("LEFT_BROTHER", nodeInTree),
            horizontalRight: () => openAddSkillModal("RIGHT_BROTHER", nodeInTree),
        };

        result.idle.verticalDown = () =>
            functions?.navigate("ViewingSkillTree", {
                treeId: nodeInTree.treeId,
                selectedNodeId: nodeInTree.nodeId,
                selectedNodeMenuMode: "EDITING",
            });

        //👇 Add functions to edit nodes from the node menu
        if (editTreeFromNodeMenu) {
            result.idle.verticalUp = () => {
                if (nodeInTree.data.isCompleted) {
                    const canUnComplete = checkIfUncompletionIsAllowedForNode(nodeInTree);

                    if (!canUnComplete) return Alert.alert(`Cannot unlearn ${nodeInTree.data.name}, please unlearn it's children skills first`);

                    return toggleCompletionOfSkill(tree, nodeInTree);
                }

                //NODE IS NOT COMPLETE CASE 👇

                const canComplete = checkIfCompletionIsAllowedForNode(parentOfNode);

                if (!canComplete) return Alert.alert(`Cannot learn ${nodeInTree.data.name} because the parent skill is not learned`);

                return toggleCompletionOfSkill(tree, nodeInTree);
            };

            result.idle.verticalDown = () => functions?.confirmDeleteNode(tree, nodeInTree);

            result.idle.horizontalLeft = () => functions?.selectNode(nodeInTree.nodeId, "EDITING");
        }

        return result;
    }

    function menuFunctionsForSkillTreeNode() {
        const nodeInTree = findNodeById(tree, foundNodeOfMenu!.nodeId);
        if (!nodeInTree) throw new Error("Node not in tree in menuFunctionsForSkillNode");

        return {
            idle: {
                verticalDown: () => confirmDeleteTree(foundNodeOfMenu!.treeId),
                horizontalLeft: () => navigate("MyTrees", { editingTreeId: foundNodeOfMenu!.treeId }),
            },
            selectingPosition: {
                verticalDown: () => openAddSkillModal("CHILDREN", nodeInTree),
            },
        };
    }
}

export default returnNodeMenuFunctions;
