import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCanvasRef } from "@shopify/react-native-skia";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { StackNavigatorParams } from "../../../App";
import CanvasSettingsModal from "../../components/CanvasSettingsModal";
import OpenSettingsMenu from "../../components/OpenSettingsMenu";
import ProgressIndicatorAndName from "../../components/ProgressIndicatorAndName";
import ShareTreeUrl from "../../components/ShareTreeUrl";
import ShareTreeScreenshot from "../../components/takingScreenshot/ShareTreeScreenshot";
import InteractiveTree from "../../components/treeRelated/InteractiveTree";
import { IsSharingAvailableContext } from "../../context";
import { treeCompletedSkillPercentage } from "../../functions/extractInformationFromTree";
import { insertNodesBasedOnDnDZone } from "../../functions/mutateTree";
import { colors } from "../../parameters";
import { selectCanvasDisplaySettings } from "../../redux/canvasDisplaySettingsSlice";
import { clearSelectedDndZone, selectNewNodes } from "../../redux/newNodeSlice";
import { useAppDispatch, useAppSelector } from "../../redux/reduxHooks";
import { selectSafeScreenDimentions } from "../../redux/screenDimentionsSlice";
import { changeTree, clearSelectedNode, selectTreeSlice, setSelectedNode, updateUserTreeWithAppendedNode } from "../../redux/userTreesSlice";
import { DnDZone, Skill, Tree } from "../../types";
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
type Props = NativeStackScreenProps<StackNavigatorParams, "ViewingSkillTree">;

function ViewingSkillTree({ navigation, route }: Props) {
    //Redux State
    const selectedTree = useCurrentTree();
    const { selectedNode: selectedNodeId, selectedNodeMenuMode } = useAppSelector(selectTreeSlice);
    const { selectedDndZone } = useAppSelector(selectNewNodes);
    const canvasDisplaySettings = useAppSelector(selectCanvasDisplaySettings);
    const screenDimensions = useAppSelector(selectSafeScreenDimentions);
    const dispatch = useAppDispatch();
    //Hooks
    const isSharingAvailable = useContext(IsSharingAvailableContext);
    const canvasRef = useCanvasRef();
    useRunCleanupOnNavigation();
    useHandleRouteParams(route.params);
    //Local State - MODALS
    const modalUseState = useState<ModalState>("IDLE");
    const [modalState, setModalState] = modalUseState;
    //Local State
    const [nodeToDelete, setNodeToDelete] = useState<Tree<Skill> | null>(null);
    //Derived State

    const showDndZones = modalState === "PLACING_NEW_NODE";
    const shouldRenderShareButton = isSharingAvailable && selectedTree && modalState === "IDLE";

    useEffect(() => {
        if (selectedNodeId === null) setModalState("IDLE");
        //eslint-disable-next-line
    }, [selectedNodeId]);

    const openChildrenHoistSelector = useCallback((nodeToDelete: Tree<Skill>) => {
        setNodeToDelete(nodeToDelete);
        setModalState("CANDIDATES_TO_HOIST");
    }, []);

    //Select ChildrenToHoistWhenDeletingParentModal
    const closeChildrenHoistModal = () => {
        setNodeToDelete(null);
        setModalState("IDLE");
    };

    const { RenderOnSelectedNodeId, config, interactiveTreeState, tree } = useHandleMemoizedTreeProps(
        { canvasDisplaySettings, modalState, screenDimensions, selectedDndZone, selectedTree, showDndZones, selectedNodeMenuMode },
        selectedNodeId,
        canvasRef,
        navigation,
        openChildrenHoistSelector
    );
    const functions = useHandleTreeFunctions({ modal: modalUseState, params: route.params }, { openChildrenHoistSelector }, navigation);

    const addTreeFunctions = useMemo(() => {
        return {
            returnToIdleState: () => {
                setModalState("IDLE");
            },
            openNewNodeModal: () => {
                if (modalState !== "IDLE") return;
                setModalState("PLACING_NEW_NODE");
            },
        };
    }, []);

    const addNodes = (newNodes: Tree<Skill>[], dnDZone: DnDZone) => {
        let result = selectedTree ? insertNodesBasedOnDnDZone(dnDZone, selectedTree, newNodes) : undefined;

        if (result === undefined) throw new Error("result undefined at foo");

        const treeSkillCompletion = treeCompletedSkillPercentage(result);

        if (treeSkillCompletion === 100) result = { ...result, data: { ...result.data, isCompleted: true } };
        if (treeSkillCompletion !== 100) result = { ...result, data: { ...result.data, isCompleted: false } };

        dispatch(updateUserTreeWithAppendedNode(result));
        dispatch(clearSelectedDndZone());
        setModalState("IDLE");
    };

    return (
        <View style={{ position: "relative", backgroundColor: colors.background, flex: 1, overflow: "hidden" }}>
            {tree && (
                <InteractiveTree
                    config={config}
                    state={interactiveTreeState}
                    tree={tree}
                    functions={functions}
                    renderOnSelectedNodeId={RenderOnSelectedNodeId}
                />
            )}
            {selectedTree && <ProgressIndicatorAndName tree={selectedTree} />}

            {selectedTree && (
                <ShareTreeScreenshot
                    canvasRef={canvasRef}
                    shouldShare={Boolean(shouldRenderShareButton)}
                    takingScreenShotState={[
                        modalState === "TAKING_SCREENSHOT",
                        (v: boolean) => {
                            if (v === true) return setModalState("TAKING_SCREENSHOT");
                            return setModalState("IDLE");
                        },
                    ]}
                    tree={selectedTree}
                />
            )}
            {selectedTree && <ShareTreeUrl tree={selectedTree} show={modalState === "IDLE"} />}

            <OpenSettingsMenu show={modalState === "IDLE"} openModal={() => setModalState("EDITING_CANVAS_SETTINGS")} />

            {selectedTree && <AddNodeStateIndicator mode={modalState} functions={addTreeFunctions} currentTree={selectedTree} />}

            <SelectChildrenToHoistWhenDeletingParentModal
                open={modalState === "CANDIDATES_TO_HOIST"}
                nodeToDelete={nodeToDelete}
                closeModalAndClearState={closeChildrenHoistModal}
            />
            {selectedTree && selectedDndZone && (
                <AddNodeModal
                    open={modalState === "INPUT_DATA_FOR_NEW_NODE"}
                    addNodes={addNodes}
                    closeModal={() => {
                        dispatch(clearSelectedDndZone());
                        setModalState("IDLE");
                    }}
                    selectedTree={selectedTree}
                    dnDZone={selectedDndZone}
                />
            )}

            <CanvasSettingsModal open={modalState === "EDITING_CANVAS_SETTINGS"} closeModal={() => setModalState("IDLE")} />
        </View>
    );

    function useRunCleanupOnNavigation() {
        useEffect(() => {
            return () => {
                setModalState("IDLE");
                setNodeToDelete(null);
                dispatch(clearSelectedNode());
                dispatch(clearSelectedDndZone());
            };
        }, []);
    }

    function useHandleRouteParams(params: Props["route"]["params"]) {
        useEffect(() => {
            if (!params) return;

            dispatch(changeTree(params.treeId));

            //Add Node Modal param is handled inside useHandleMemoizedTreeProps

            if (!params.selectedNodeId) return;

            dispatch(setSelectedNode({ nodeId: params.selectedNodeId, menuMode: params.selectedNodeMenuMode ?? "VIEWING" }));
            //eslint-disable-next-line
        }, []);
    }
}

export default ViewingSkillTree;
