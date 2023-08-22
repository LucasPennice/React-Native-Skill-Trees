import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SkiaDomView } from "@shopify/react-native-skia";
import { useCallback, useMemo } from "react";
import { Alert } from "react-native";
import { StackNavigatorParams } from "../../../App";
import { InteractiveTreeConfig, InteractiveTreeFunctions } from "../../components/treeRelated/InteractiveTree";
import { InteractiveNodeState } from "../../components/treeRelated/InteractiveTree2H";
import SelectedNodeMenu, { SelectedNodeMenuState } from "../../components/treeRelated/selectedNodeMenu/SelectedNodeMenu";
import { getMenuNonEditingFunctions } from "../../components/treeRelated/selectedNodeMenu/useGetMenuFunctions";
import { findNodeById } from "../../functions/extractInformationFromTree";
import { updateNodeAndTreeCompletion } from "../../functions/mutateTree";
import { useAppDispatch, useAppSelector } from "../../redux/reduxHooks";
import { CanvasDisplaySettings } from "../../redux/slices/canvasDisplaySettingsSlice";
import { selectHomeTreeCoordinates } from "../../redux/slices/treesCoordinatesSlice";
import { removeUserTree, updateUserTrees } from "../../redux/slices/userTreesSlice";
import { DnDZone, SelectedNodeId, Skill, Tree } from "../../types";
import { ScreenDimentions } from "../../redux/slices/screenDimentionsSlice";

function useHandleMemoizedHomeTreeProps(
    state: {
        screenDimensions: ScreenDimentions;
        canvasDisplaySettings: CanvasDisplaySettings;
        userTrees: Tree<Skill>[];
    },
    selectedNodeIdState: readonly [
        SelectedNodeId,
        {
            readonly clearSelectedNodeId: () => void;
            readonly updateSelectedNodeId: (id: string) => void;
        }
    ],
    canvasRef: React.RefObject<SkiaDomView>,
    homepageTree: Tree<Skill>,
    navigation: NativeStackNavigationProp<StackNavigatorParams, "Home", undefined>,
    openCanvasSettings: () => void
) {
    const homeTreeCoordinate = useAppSelector(selectHomeTreeCoordinates);

    const { canvasDisplaySettings, screenDimensions } = state;
    const [selectedNodeId, { clearSelectedNodeId, updateSelectedNodeId }] = selectedNodeIdState;

    const dispatch = useAppDispatch();

    const selectedNode = findNodeById(homepageTree, selectedNodeId);

    const onNodeClick = useCallback((node: Tree<Skill>) => {
        const nodeId = node.nodeId;

        updateSelectedNodeId(nodeId);

        return;
        //eslint-disable-next-line
    }, []);

    //Interactive Tree Props
    const config: InteractiveTreeConfig = useMemo(() => {
        return { canvasDisplaySettings, isInteractive: true, renderStyle: "radial", editTreeFromNodeMenu: false, blockDragAndDrop: true };
    }, [canvasDisplaySettings]);

    const interactiveTreeState: InteractiveNodeState = useMemo(() => {
        const treeCoordinate = homeTreeCoordinate;

        return { screenDimensions, selectedNodeId, treeCoordinate, canvasRef, selectedDndZone: undefined };
    }, [screenDimensions, canvasRef, selectedNodeId, homeTreeCoordinate]);

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
                selectNode: () => {},
                confirmDeleteNode: () => {},
                toggleCompletionOfSkill: (treeToUpdate: Tree<Skill>, node: Tree<Skill>) => {
                    let updatedNode: Tree<Skill> = { ...node, data: { ...node.data, isCompleted: !node.data.isCompleted } };

                    const updatedTree = updateNodeAndTreeCompletion(treeToUpdate, updatedNode);

                    dispatch(updateUserTrees({ updatedTree, screenDimensions }));
                },
                openAddSkillModal: (dnDZoneType: DnDZone["type"], node: Tree<Skill>) => {
                    navigation.navigate("ViewingSkillTree", { treeId: node.treeId, addNodeModal: { dnDZoneType, nodeId: node.nodeId } });
                },
                openCanvasSettingsModal: openCanvasSettings,
            },
        };
    }, [dispatch, navigation, onNodeClick, openCanvasSettings, screenDimensions]);

    //Interactive Tree Props - SelectedNodeMenu
    const RenderOnSelectedNodeId = useMemo(() => {
        const nonEditingMenuFunctions = getMenuNonEditingFunctions(selectedNode, navigation, clearSelectedNodeId);

        const selectedNodeMenuState: SelectedNodeMenuState = {
            screenDimensions,
            selectedNode: selectedNode!,
            selectedTree: homepageTree,
            initialMode: "VIEWING",
        };

        return <SelectedNodeMenu functions={nonEditingMenuFunctions} state={selectedNodeMenuState} />;
        //eslint-disable-next-line
    }, [homepageTree, navigation, screenDimensions, selectedNode]);

    return { config, interactiveTreeState, functions, RenderOnSelectedNodeId };
}

export default useHandleMemoizedHomeTreeProps;
