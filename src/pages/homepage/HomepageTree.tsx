import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SkiaDomView } from "@shopify/react-native-skia";
import { useMemo } from "react";
import { Alert } from "react-native";
import { StackNavigatorParams } from "../../../App";
import { InteractiveTreeConfig, InteractiveTreeFunctions } from "../../components/treeRelated/InteractiveTree";
import InteractiveTree2H, { InteractiveNodeState } from "../../components/treeRelated/InteractiveTree2H";
import SelectedNodeMenu, { SelectedNodeMenuState } from "../../components/treeRelated/selectedNodeMenu/SelectedNodeMenu";
import { getMenuNonEditingFunctions } from "../../components/treeRelated/selectedNodeMenu/useGetMenuFunctions";
import { findNodeByIdInHomeTree } from "../../functions/extractInformationFromTree";
import { updateNodeAndTreeCompletion } from "../../functions/mutateTree";
import { useAppDispatch, useAppSelector } from "../../redux/reduxHooks";
import { selectCanvasDisplaySettings } from "../../redux/slices/canvasDisplaySettingsSlice";
import { selectSafeScreenDimentions } from "../../redux/slices/screenDimentionsSlice";
import { selectHomeTreeCoordinates } from "../../redux/slices/treesCoordinatesSlice";
import { removeUserTree, updateUserTrees } from "../../redux/slices/userTreesSlice";
import { DnDZone, Skill, Tree } from "../../types";

type Props = {
    lol: {
        selectedNodeIdState: readonly [
            {
                nodeId: string;
                treeId: string;
            } | null,
            {
                readonly clearSelectedNodeId: () => void;
                readonly updateSelectedNodeId: (value: { nodeId: string; treeId: string }) => void;
            }
        ];
        canvasRef: React.RefObject<SkiaDomView>;
        homepageTree: Tree<Skill>;
        navigation: NativeStackNavigationProp<StackNavigatorParams, "Home", undefined>;
        openCanvasSettingsModal: () => void;
    };
};

function useHomepageTreeState() {
    const screenDimensions = useAppSelector(selectSafeScreenDimentions);

    return { screenDimensions };
}

function useCreateTreeFunctions(
    updateSelectedNodeId: (value: { nodeId: string; treeId: string }) => void,
    navigation: NativeStackNavigationProp<StackNavigatorParams, "Home", undefined>,
    openCanvasSettingsModal: () => void
) {
    const dispatch = useAppDispatch();
    const screenDimensions = useAppSelector(selectSafeScreenDimentions);

    const result: InteractiveTreeFunctions = useMemo(() => {
        return {
            onNodeClick: (node: Tree<Skill>) => {
                const nodeId = node.nodeId;
                updateSelectedNodeId({ nodeId, treeId: node.treeId });
                return;
            },
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
                openCanvasSettingsModal,
            },
        };
    }, [dispatch, navigation, openCanvasSettingsModal, screenDimensions]);

    return result;
}

function useGetTreeState(canvasRef: React.RefObject<SkiaDomView>, selectedNode: { nodeId: string; treeId: string } | null) {
    const homeTreeCoordinate = useAppSelector(selectHomeTreeCoordinates);
    const screenDimensions = useAppSelector(selectSafeScreenDimentions);

    const result: InteractiveNodeState = useMemo(() => {
        const treeCoordinate = homeTreeCoordinate;

        const selectedNodeId = selectedNode ? selectedNode.nodeId : null;

        return { screenDimensions, selectedNodeId, treeCoordinate, canvasRef, selectedDndZone: undefined };
    }, [screenDimensions, canvasRef, selectedNode, homeTreeCoordinate]);

    return result;
}

function useGetTreeConfig() {
    const canvasDisplaySettings = useAppSelector(selectCanvasDisplaySettings);

    const result: InteractiveTreeConfig = useMemo(() => {
        return { canvasDisplaySettings, isInteractive: true, renderStyle: "radial", editTreeFromNodeMenu: false, blockDragAndDrop: true };
    }, [canvasDisplaySettings]);

    return result;
}

function HomepageTree({ lol }: Props) {
    const { screenDimensions } = useHomepageTreeState();

    const { canvasRef, homepageTree, navigation, openCanvasSettingsModal, selectedNodeIdState } = lol;

    const [selectedNodeId, { clearSelectedNodeId, updateSelectedNodeId }] = selectedNodeIdState;

    //☢️ ESTO TIENE QUE SER OPTIMIZADO
    const selectedNode = findNodeByIdInHomeTree(homepageTree, selectedNodeId);

    const treeConfig = useGetTreeConfig();
    const treeState = useGetTreeState(canvasRef, selectedNodeId);
    const treeFunctions = useCreateTreeFunctions(updateSelectedNodeId, navigation, openCanvasSettingsModal);

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

    return (
        <InteractiveTree2H
            config={treeConfig}
            state={treeState}
            tree={homepageTree}
            functions={treeFunctions}
            renderOnSelectedNodeId={RenderOnSelectedNodeId}
        />
    );
}

// function HomepageTreeNodeMenu() {

// }

export default HomepageTree;
