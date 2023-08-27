import { Alert } from "react-native";
import { checkIfCompletionIsAllowedForNode, checkIfUncompletionIsAllowedForNode, findNodeById } from "../../functions/extractInformationFromTree";
import { NodeCoordinate, InteractiveTreeFunctions, Skill, Tree } from "../../types";
import { NodeMenuFunctions } from "./nodeMenu/NodeMenu";

function returnNodeMenuFunctions(
    node: NodeCoordinate | undefined,
    tree: Tree<Skill>,
    editTreeFromNodeMenu: boolean | undefined,
    functions?: InteractiveTreeFunctions["nodeMenu"]
) {
    if (!node || !functions) return { idle: {}, selectingPosition: {} };

    const { confirmDeleteTree, navigate, openAddSkillModal, openCanvasSettingsModal, toggleCompletionOfSkill } = functions;

    if (node.category === "SKILL") return menuFunctionsForSkillNode();

    if (node.category === "SKILL_TREE") return menuFunctionsForSkillTreeNode();

    //USER NODE CASE 👇

    return {
        idle: {
            horizontalRight: () => navigate("MyTrees", { openNewTreeModal: true }),
            horizontalLeft: openCanvasSettingsModal,
        },
        selectingPosition: {},
    };

    function menuFunctionsForSkillNode() {
        const parentOfNode = findNodeById(tree, node!.parentId);
        // const parentOfNode = centeredCoordinatedWithTreeData.find((n) => n.nodeId === node!.parentId);
        const nodeInTree = findNodeById(tree, node!.nodeId);

        if (!nodeInTree) throw new Error("Node not in tree in menuFunctionsForSkillNode");

        let result: NodeMenuFunctions = { idle: {}, selectingPosition: {} };

        result.idle.verticalUp = () => functions?.navigate("ViewingSkillTree", { node: nodeInTree, selectedNodeMenuMode: "EDITING" });

        result.idle.horizontalLeft = () => functions?.navigate("ViewingSkillTree", { node: nodeInTree, selectedNodeMenuMode: "EDITING" });

        result.selectingPosition = {
            verticalUp: () => openAddSkillModal("PARENT", nodeInTree),
            verticalDown: () => openAddSkillModal("CHILDREN", nodeInTree),
            horizontalLeft: () => openAddSkillModal("LEFT_BROTHER", nodeInTree),
            horizontalRight: () => openAddSkillModal("RIGHT_BROTHER", nodeInTree),
        };

        result.idle.verticalDown = () => functions?.navigate("ViewingSkillTree", { node: nodeInTree, selectedNodeMenuMode: "EDITING" });

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

            result.idle.horizontalLeft = () => functions?.selectNode(nodeInTree, "EDITING");
        }

        return result;
    }

    function menuFunctionsForSkillTreeNode() {
        const nodeInTree = findNodeById(tree, node!.nodeId);
        if (!nodeInTree) throw new Error("Node not in tree in menuFunctionsForSkillNode");

        return {
            idle: {
                verticalDown: () => confirmDeleteTree(node!.treeId),
                horizontalLeft: () => navigate("MyTrees", { editingTreeId: node!.treeId }),
            },
            selectingPosition: {
                verticalDown: () => openAddSkillModal("CHILDREN", nodeInTree),
            },
        };
    }
}

export default returnNodeMenuFunctions;
