import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SkiaDomView } from "@shopify/react-native-skia";
import { useEffect, useMemo, useRef } from "react";
import { StackNavigatorParams } from "../../../App";
import { InteractiveNodeState, InteractiveTreeConfig } from "../../components/treeRelated/InteractiveTree";
import SelectedNodeMenu from "../../components/treeRelated/selectedNodeMenu/SelectedNodeMenu";
import { getMenuEditingFunctions, getMenuNonEditingFunctions } from "../../components/treeRelated/selectedNodeMenu/useGetMenuFunctions";
import { findNodeById } from "../../functions/extractInformationFromTree";
import { CanvasDisplaySettings } from "../../redux/canvasDisplaySettingsSlice";
import { useAppDispatch } from "../../redux/reduxHooks";
import { ScreenDimentions } from "../../redux/screenDimentionsSlice";
import { setSelectedNode, updateUserTrees } from "../../redux/userTreesSlice";
import { DnDZone, SelectedNodeId, Skill, Tree } from "../../types";
import { ModalState } from "./ViewingSkillTree";

function useHandleMemoizedTreeProps(
    state: {
        screenDimensions: ScreenDimentions;
        canvasDisplaySettings: CanvasDisplaySettings;
        selectedTree: Tree<Skill> | undefined;
        showDndZones: boolean | undefined;
        selectedDndZone: DnDZone | undefined;
        modalState: ModalState;
    },
    selectedNodeId: SelectedNodeId,
    canvasRef: React.RefObject<SkiaDomView>,
    navigation: NativeStackNavigationProp<StackNavigatorParams, "ViewingSkillTree", undefined>,
    openChildrenHoistSelector: (nodeToDelete: Tree<Skill>) => void
) {
    const { canvasDisplaySettings, screenDimensions, selectedTree, showDndZones, selectedDndZone, modalState } = state;
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

    return { RenderOnSelectedNodeId, tree, interactiveTreeState, config };
}

export default useHandleMemoizedTreeProps;
