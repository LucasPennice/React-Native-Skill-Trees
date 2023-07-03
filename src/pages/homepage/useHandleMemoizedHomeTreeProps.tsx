import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SkiaDomView } from "@shopify/react-native-skia";
import { useCallback, useMemo } from "react";
import { Alert } from "react-native";
import { StackNavigatorParams } from "../../../App";
import { InteractiveNodeState, InteractiveTreeConfig, InteractiveTreeFunctions } from "../../components/treeRelated/InteractiveTree";
import SelectedNodeMenu from "../../components/treeRelated/selectedNodeMenu/SelectedNodeMenu";
import { getMenuNonEditingFunctions } from "../../components/treeRelated/selectedNodeMenu/useGetMenuFunctions";
import { findNodeById } from "../../functions/extractInformationFromTree";
import { updateNodeAndTreeCompletion } from "../../functions/mutateTree";
import { CanvasDisplaySettings } from "../../redux/canvasDisplaySettingsSlice";
import { useAppDispatch } from "../../redux/reduxHooks";
import { ScreenDimentions } from "../../redux/screenDimentionsSlice";
import { removeUserTree, updateUserTrees } from "../../redux/userTreesSlice";
import { DnDZone, SelectedNodeId, Skill, Tree } from "../../types";

function useHandleMemoizedHomeTreeProps(
    state: {
        screenDimensions: ScreenDimentions;
        canvasDisplaySettings: CanvasDisplaySettings;
        userTrees: Tree<Skill>[];
    },
    selectedNodeState: [SelectedNodeId, (v: SelectedNodeId) => void],
    canvasRef: React.RefObject<SkiaDomView>,
    homepageTree: Tree<Skill>,
    navigation: NativeStackNavigationProp<StackNavigatorParams, "Home", undefined>,
    openCanvasSettings: () => void
) {
    const { canvasDisplaySettings, screenDimensions } = state;
    const [selectedNodeId, setSelectedNodeId] = selectedNodeState;

    const dispatch = useAppDispatch();

    const clearSelectedNode = () => setSelectedNodeId(null);

    const selectedNode = findNodeById(homepageTree, selectedNodeId);

    const onNodeClick = useCallback((node: Tree<Skill>) => {
        const nodeId = node.nodeId;

        setSelectedNodeId(nodeId);

        return;
        //eslint-disable-next-line
    }, []);

    //Interactive Tree Props
    const config: InteractiveTreeConfig = useMemo(() => {
        return { canvasDisplaySettings, isInteractive: true, renderStyle: "radial", editTreeFromNodeMenu: false };
    }, [canvasDisplaySettings]);
    const interactiveTreeState: InteractiveNodeState = useMemo(() => {
        return { screenDimensions, canvasRef, selectedNodeId };
    }, [screenDimensions, canvasRef, selectedNodeId]);
    const functions: InteractiveTreeFunctions = useMemo(() => {
        return {
            onNodeClick,
            nodeMenu: {
                navigate: navigation.navigate,
                confirmDeleteTree: (treeId: string) => {
                    Alert.alert(
                        "Delete this tree?",
                        "",
                        [
                            { text: "No", style: "cancel" },
                            { text: "Yes", onPress: () => dispatch(removeUserTree(treeId)), style: "destructive" },
                        ],
                        { cancelable: true }
                    );
                },
                toggleCompletionOfSkill: (treeToUpdate: Tree<Skill>, node: Tree<Skill>) => {
                    let updatedNode: Tree<Skill> = { ...node, data: { ...node.data, isCompleted: !node.data.isCompleted } };

                    const updatedTree = updateNodeAndTreeCompletion(treeToUpdate, updatedNode);

                    dispatch(updateUserTrees(updatedTree));
                },
                openAddSkillModal: (dnDZoneType: DnDZone["type"], node: Tree<Skill>) => {
                    navigation.navigate("ViewingSkillTree", { treeId: node.treeId, addNodeModal: { dnDZoneType, nodeId: node.nodeId } });
                },
                openCanvasSettingsModal: openCanvasSettings,
            },
        };
    }, [onNodeClick]);

    //Interactive Tree Props - SelectedNodeMenu
    const RenderOnSelectedNodeId = useMemo(() => {
        const nonEditingMenuFunctions = getMenuNonEditingFunctions(selectedNode, navigation, clearSelectedNode);

        const selectedNodeMenuState = { screenDimensions, selectedNode: selectedNode!, selectedTree: homepageTree };

        return <SelectedNodeMenu functions={nonEditingMenuFunctions} state={selectedNodeMenuState} />;
        //eslint-disable-next-line
    }, [homepageTree, navigation, screenDimensions, selectedNode]);

    return { config, interactiveTreeState, functions, RenderOnSelectedNodeId };
}

export default useHandleMemoizedHomeTreeProps;
