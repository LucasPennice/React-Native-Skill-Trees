import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SkiaDomView } from "@shopify/react-native-skia";
import { useEffect, useMemo, useRef } from "react";
import { StackNavigatorParams } from "../../../App";
import { InteractiveNodeState, InteractiveTreeConfig, InteractiveTreeFunctions } from "../../components/treeRelated/InteractiveTree";
import SelectedNodeMenu from "../../components/treeRelated/selectedNodeMenu/SelectedNodeMenu";
import { getMenuEditingFunctions, getMenuNonEditingFunctions } from "../../components/treeRelated/selectedNodeMenu/useGetMenuFunctions";
import { findNodeById } from "../../functions/extractInformationFromTree";
import { CanvasDisplaySettings } from "../../redux/canvasDisplaySettingsSlice";
import { useAppDispatch } from "../../redux/reduxHooks";
import { ScreenDimentions } from "../../redux/screenDimentionsSlice";
import { removeUserTree, setSelectedDndZone, setSelectedNode, updateUserTrees } from "../../redux/userTreesSlice";
import { DnDZone, SelectedNodeId, Skill, Tree } from "../../types";
import { ModalState } from "./ViewingSkillTree";
import { Alert } from "react-native";
import { updateNodeAndTreeCompletion } from "../../functions/mutateTree";

function useHandleMemoizedTreeProps(
    state: {
        screenDimensions: ScreenDimentions;
        canvasDisplaySettings: CanvasDisplaySettings;
        selectedTree: Tree<Skill> | undefined;
        params: StackNavigatorParams["ViewingSkillTree"];
        showDndZones: boolean | undefined;
        selectedDndZone: DnDZone | undefined;
        modal: [ModalState, (v: ModalState) => void];
    },
    selectedNodeId: SelectedNodeId,
    canvasRef: React.RefObject<SkiaDomView>,
    navigation: NativeStackNavigationProp<StackNavigatorParams, "ViewingSkillTree", undefined>,
    openChildrenHoistSelector: (nodeToDelete: Tree<Skill>) => void
) {
    const { canvasDisplaySettings, screenDimensions, selectedTree, showDndZones, selectedDndZone, modal, params } = state;
    const [modalState, setModalState] = modal;
    //
    const dispatch = useAppDispatch();
    const modalRef = useRef<ModalState>(modalState);
    //CHANGE REDUX STATE TO HOLD NODE LATER 😝
    const selectedNode = findNodeById(selectedTree, selectedNodeId);

    useEffect(() => {
        modalRef.current = modalState;
    }, [modalState]);

    //Interactive Tree Props
    const config: InteractiveTreeConfig = useMemo(() => {
        const hierarchicalTreeSettings: CanvasDisplaySettings = { ...canvasDisplaySettings, showCircleGuide: false };
        return {
            canvasDisplaySettings: hierarchicalTreeSettings,
            isInteractive: true,
            renderStyle: "hierarchy",
            showDndZones,
            blockLongPress: modalState !== "IDLE",
        };
    }, [canvasDisplaySettings, modalState, showDndZones]);

    const interactiveTreeState: InteractiveNodeState = useMemo(() => {
        return { screenDimensions, canvasRef, selectedDndZone, selectedNodeId };
    }, [canvasRef, screenDimensions, selectedDndZone, selectedNodeId]);

    const tree: Tree<Skill> | undefined = useMemo(() => {
        return selectedTree;
    }, [selectedTree]);

    const functions: InteractiveTreeFunctions = useMemo(() => {
        const onNodeClick = (node: Tree<Skill>) => {
            if (modalRef.current !== "IDLE") return;

            const nodeId = node.nodeId;

            dispatch(setSelectedNode(nodeId));
            setModalState("NODE_SELECTED");
        };

        const onDndZoneClick = (clickedZone: DnDZone | undefined) => {
            if (modalRef.current !== "PLACING_NEW_NODE") return;
            if (clickedZone === undefined) return;
            dispatch(setSelectedDndZone(clickedZone));
            setModalState("INPUT_DATA_FOR_NEW_NODE");
        };

        const nodeMenu: InteractiveTreeFunctions["nodeMenu"] = {
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
            openAddSkillModal: () => {},
        };

        const runOnTreeRender = (dndZoneCoordinates: DnDZone[]) => {
            if (!params || !params.addNodeModal) return;

            const { dnDZoneType, nodeId } = params.addNodeModal;

            const dndZone = dndZoneCoordinates.find((zone) => zone.ofNode === nodeId && zone.type === dnDZoneType);

            if (!dndZone) throw new Error("couldn't find dndZone in runOnTreeRender");

            dispatch(setSelectedDndZone(dndZone));
            setModalState("INPUT_DATA_FOR_NEW_NODE");
        };

        return { onNodeClick, onDndZoneClick, nodeMenu, runOnTreeRender };
        //eslint-disable-next-line
    }, [dispatch]);

    //Interactive Tree Props - SelectedNodeMenu
    const RenderOnSelectedNodeId = useMemo(() => {
        const clearSelectedNode = () => dispatch(setSelectedNode(null));

        const menuNonEditingFunctions = getMenuNonEditingFunctions(selectedNode, navigation, clearSelectedNode);

        const fn = {
            openChildrenHoistSelector,
            updateUserTrees: (v: Tree<Skill> | undefined) => dispatch(updateUserTrees(v)),
            clearSelectedNode,
        };

        const menuEditingFunctions = getMenuEditingFunctions(fn, { selectedTree, selectedNode });

        const selectedNodeMenuState = { screenDimensions, selectedNode: selectedNode!, selectedTree: selectedTree! };

        return (
            <SelectedNodeMenu functions={menuNonEditingFunctions} mutateFunctions={menuEditingFunctions} state={selectedNodeMenuState} allowEdit />
        );
    }, [dispatch, navigation, openChildrenHoistSelector, screenDimensions, selectedNode, selectedTree]);

    return { RenderOnSelectedNodeId, functions, tree, interactiveTreeState, config };
}

export default useHandleMemoizedTreeProps;
