import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCanvasRef } from "@shopify/react-native-skia";
import { useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { View } from "react-native";
import { StackNavigatorParams } from "../../../App";
import OpenSettingsMenu from "../../components/OpenSettingsMenu";
import ProgressIndicatorAndName from "../../components/ProgressIndicatorAndName";
import ShareTreeUrl from "../../components/ShareTreeUrl";
import ShareTreeScreenshot from "../../components/takingScreenshot/ShareTreeScreenshot";
import InteractiveTree2H from "../../components/treeRelated/InteractiveTree2H";
import CanvasSettingsModal from "../../components/treeRelated/canvasSettingsModal/CanvasSettingsModal";
import { IsSharingAvailableContext } from "../../context";
import { treeCompletedSkillPercentage } from "../../functions/extractInformationFromTree";
import { insertNodesBasedOnDnDZone } from "../../functions/mutateTree";
import { colors } from "../../parameters";
import { useAppDispatch, useAppSelector } from "../../redux/reduxHooks";
import { selectCanvasDisplaySettings } from "../../redux/slices/canvasDisplaySettingsSlice";
import { clearSelectedDndZone, selectNewNodes } from "../../redux/slices/newNodeSlice";
import { ScreenDimentions, selectSafeScreenDimentions } from "../../redux/slices/screenDimentionsSlice";
import { calculateHierarchicalTreeCoordinatesInitially, selectTreesCoordinates } from "../../redux/slices/treesCoordinatesSlice";
import { changeTree, clearSelectedNode, selectTreeSlice, setSelectedNode, updateUserTreeWithAppendedNode } from "../../redux/slices/userTreesSlice";
import { DnDZone, SelectedNodeId, Skill, Tree } from "../../types";
import useCurrentTree from "../../useCurrentTree";
import AddNodeStateIndicator from "./AddNodeStateIndicator";
import AddNodeModal from "./modals/AddNodeModal";
import SelectChildrenToHoistWhenDeletingParentModal from "./modals/SelectChildrenToHoistWhenDeletingParentModal";
import useHandleMemoizedTreeProps from "./useHandleMemoizedTreeProps";
import useHandleTreeFunctions from "./useHandleTreeFunctions";

export type ModalState =
    | "TAKING_SCREENSHOT"
    | "EDITING_CANVAS_SETTINGS"
    | "IDLE"
    | "INPUT_DATA_FOR_NEW_NODE"
    | "CANDIDATES_TO_HOIST"
    | "PLACING_NEW_NODE"
    | "NODE_SELECTED";

export type ModalReducerAction =
    | "returnToIdle"
    | "openCandidatesToHoistModal"
    | "openNewNodeModal"
    | "openTakeScreenshotModal"
    | "openEditCanvasSettings"
    | "openSelectedNodeMenu"
    | "openNewNodePositionSelector";

type Props = NativeStackScreenProps<StackNavigatorParams, "ViewingSkillTree">;

function useViewingSkillTreeState() {
    const selectedTree = useCurrentTree();
    const { selectedNode: selectedNodeId, selectedNodeMenuMode } = useAppSelector(selectTreeSlice);
    const { selectedDndZone } = useAppSelector(selectNewNodes);
    const canvasDisplaySettings = useAppSelector(selectCanvasDisplaySettings);
    const screenDimensions = useAppSelector(selectSafeScreenDimentions);

    const treeCoordinates = useAppSelector(selectTreesCoordinates);

    const treeCoordinate = selectedTree === undefined ? undefined : treeCoordinates[selectedTree.treeId];

    return { selectedTree, selectedNodeId, selectedNodeMenuMode, selectedDndZone, canvasDisplaySettings, screenDimensions, treeCoordinate };
}

function useHandleInitialTreeCoordinates(treeToCheck: Tree<Skill> | undefined, screenDimensions: ScreenDimentions) {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(calculateHierarchicalTreeCoordinatesInitially({ treeToCheck, screenDimensions }));
    }, [treeToCheck]);
}

function useModalStateReducer() {
    function reducer(state: ModalState, action: ModalReducerAction) {
        switch (action) {
            case "returnToIdle":
                return "IDLE";
            case "openCandidatesToHoistModal":
                return "CANDIDATES_TO_HOIST";
            case "openNewNodePositionSelector":
                return "PLACING_NEW_NODE";
            case "openEditCanvasSettings":
                return "EDITING_CANVAS_SETTINGS";
            case "openSelectedNodeMenu":
                return "NODE_SELECTED";
            case "openTakeScreenshotModal":
                return "TAKING_SCREENSHOT";
            case "openNewNodeModal":
                return "INPUT_DATA_FOR_NEW_NODE";
            default:
                return state;
        }
    }

    const [state, dispatch] = useReducer(reducer, "IDLE");

    return [state, dispatch] as const;
}

function useOnUnSelectNodeReturnToIdle(selectedNodeId: SelectedNodeId, dispatchModalState: React.Dispatch<ModalReducerAction>) {
    useEffect(() => {
        if (selectedNodeId === null) dispatchModalState("returnToIdle");
        //eslint-disable-next-line
    }, [selectedNodeId]);
}

function useCleanupOnNavigation(dispatchModalState: React.Dispatch<ModalReducerAction>, resetNodeToDelete: () => void) {
    const dispatch = useAppDispatch();

    useEffect(() => {
        return () => {
            dispatchModalState("returnToIdle");
            resetNodeToDelete();
            dispatch(clearSelectedNode());
            dispatch(clearSelectedDndZone());
        };
    }, []);
}

function useHandleRouteParams(params: Props["route"]["params"]) {
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (!params) return;

        dispatch(changeTree(params.treeId));

        //Add Node Modal param is handled inside useHandleMemoizedTreeProps

        if (!params.selectedNodeId) return;

        dispatch(setSelectedNode({ nodeId: params.selectedNodeId, menuMode: params.selectedNodeMenuMode ?? "VIEWING" }));
        //eslint-disable-next-line
    }, []);
}

function useNodeToDelete() {
    const [nodeToDelete, setNodeToDelete] = useState<Tree<Skill> | null>(null);

    const resetNodeToDelete = () => setNodeToDelete(null);

    const updateNodeToDelete = (node: Tree<Skill>) => setNodeToDelete(node);

    return [nodeToDelete, { updateNodeToDelete, resetNodeToDelete }] as const;
}

function useChildrenHoistSelectorProps(
    mutateNodeToDelete: { updateNodeToDelete: (node: Tree<Skill>) => void; resetNodeToDelete: () => void },
    dispatchModalState: React.Dispatch<ModalReducerAction>
) {
    const { resetNodeToDelete, updateNodeToDelete } = mutateNodeToDelete;

    const openChildrenHoistSelector = useCallback((nodeToDelete: Tree<Skill>) => {
        updateNodeToDelete(nodeToDelete);
        dispatchModalState("openCandidatesToHoistModal");
    }, []);

    //Select ChildrenToHoistWhenDeletingParentModal
    const closeChildrenHoistModal = () => {
        resetNodeToDelete();
        dispatchModalState("returnToIdle");
    };

    return { openChildrenHoistSelector, closeChildrenHoistModal };
}

function useNodeStateFunctions(dispatchModalState: React.Dispatch<ModalReducerAction>, modalState: ModalState) {
    return useMemo(() => {
        return {
            returnToIdleState: () => {
                dispatchModalState("returnToIdle");
            },
            openNewNodePositionSelector: () => {
                if (modalState !== "IDLE") return;
                dispatchModalState("openNewNodePositionSelector");
            },
        };
    }, []);
}

function useAddNodeModalFunctions(dispatchModalState: React.Dispatch<ModalReducerAction>, selectedTree: Tree<Skill> | undefined) {
    const dispatch = useAppDispatch();

    const result = (newNodes: Tree<Skill>[], dnDZone: DnDZone) => {
        let result = selectedTree ? insertNodesBasedOnDnDZone(dnDZone, selectedTree, newNodes) : undefined;

        if (result === undefined) throw new Error("result undefined at foo");

        const treeSkillCompletion = treeCompletedSkillPercentage(result);

        if (treeSkillCompletion === 100) result = { ...result, data: { ...result.data, isCompleted: true } };
        if (treeSkillCompletion !== 100) result = { ...result, data: { ...result.data, isCompleted: false } };

        dispatch(updateUserTreeWithAppendedNode(result));
        dispatch(clearSelectedDndZone());
        dispatchModalState("returnToIdle");
    };

    return result;
}

function ViewingSkillTree({ navigation, route }: Props) {
    const dispatch = useAppDispatch();
    //Redux State
    const { canvasDisplaySettings, screenDimensions, selectedDndZone, selectedNodeId, selectedNodeMenuMode, selectedTree, treeCoordinate } =
        useViewingSkillTreeState();
    //Local State
    const modalStateReducer = useModalStateReducer();
    const [modalState, dispatchModalState] = modalStateReducer;
    const [nodeToDelete, mutateNodeToDelete] = useNodeToDelete();
    const { resetNodeToDelete } = mutateNodeToDelete;
    //Hooks
    const { closeChildrenHoistModal, openChildrenHoistSelector } = useChildrenHoistSelectorProps(mutateNodeToDelete, dispatchModalState);
    const isSharingAvailable = useContext(IsSharingAvailableContext);
    const canvasRef = useCanvasRef();
    useHandleRouteParams(route.params);
    useCleanupOnNavigation(dispatchModalState, resetNodeToDelete);
    useOnUnSelectNodeReturnToIdle(selectedNodeId, dispatchModalState);
    useHandleInitialTreeCoordinates(selectedTree, screenDimensions);
    const functions = useHandleTreeFunctions({ modalStateReducer, params: route.params }, { openChildrenHoistSelector }, navigation);
    const nodeStateFunctions = useNodeStateFunctions(dispatchModalState, modalState);
    const addNodes = useAddNodeModalFunctions(dispatchModalState, selectedTree);
    //
    const showDndZones = modalState === "PLACING_NEW_NODE";
    const shouldRenderShareButton = isSharingAvailable && selectedTree && modalState === "IDLE";
    const showTree = selectedTree && treeCoordinate;
    const showAddNodeModal = selectedTree && selectedDndZone;

    const { RenderOnSelectedNodeId, config, interactiveTreeState } = useHandleMemoizedTreeProps(
        { canvasDisplaySettings, modalState, screenDimensions, selectedDndZone, selectedTree, showDndZones, selectedNodeMenuMode },
        selectedNodeId,
        canvasRef,
        navigation,
        openChildrenHoistSelector
    );

    const takingScreenshotState = [
        modalState === "TAKING_SCREENSHOT",
        {
            openTakingScreenshotModal: () => dispatchModalState("openTakeScreenshotModal"),
            closeTakingScreenshotModal: () => dispatchModalState("returnToIdle"),
        },
    ] as const;

    return (
        <View style={{ position: "relative", backgroundColor: colors.background, flex: 1, overflow: "hidden" }}>
            {showTree && (
                <InteractiveTree2H
                    config={config}
                    state={{ ...interactiveTreeState, treeCoordinate }}
                    tree={selectedTree}
                    functions={functions}
                    renderOnSelectedNodeId={RenderOnSelectedNodeId}
                />
            )}
            {selectedTree && <ProgressIndicatorAndName tree={selectedTree} />}

            {selectedTree && (
                <ShareTreeScreenshot
                    canvasRef={canvasRef}
                    shouldShare={Boolean(shouldRenderShareButton)}
                    takingScreenshotState={takingScreenshotState}
                    tree={selectedTree}
                />
            )}
            {selectedTree && <ShareTreeUrl tree={selectedTree} show={modalState === "IDLE"} />}

            <OpenSettingsMenu show={modalState === "IDLE"} openModal={() => dispatchModalState("openEditCanvasSettings")} />

            {selectedTree && <AddNodeStateIndicator mode={modalState} functions={nodeStateFunctions} currentTree={selectedTree} />}

            <SelectChildrenToHoistWhenDeletingParentModal
                open={modalState === "CANDIDATES_TO_HOIST"}
                nodeToDelete={nodeToDelete}
                closeModalAndClearState={closeChildrenHoistModal}
            />
            {showAddNodeModal && (
                <AddNodeModal
                    open={modalState === "INPUT_DATA_FOR_NEW_NODE"}
                    addNodes={addNodes}
                    closeModal={() => {
                        dispatch(clearSelectedDndZone());
                        dispatchModalState("returnToIdle");
                    }}
                    selectedTree={selectedTree}
                    dnDZone={selectedDndZone}
                />
            )}

            <CanvasSettingsModal open={modalState === "EDITING_CANVAS_SETTINGS"} closeModal={() => dispatchModalState("returnToIdle")} />
        </View>
    );
}

export default ViewingSkillTree;
