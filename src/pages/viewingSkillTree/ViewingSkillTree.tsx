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
import { colors } from "../../parameters";
import { selectCanvasDisplaySettings } from "../../redux/canvasDisplaySettingsSlice";
import { useAppDispatch, useAppSelector } from "../../redux/reduxHooks";
import { selectSafeScreenDimentions } from "../../redux/screenDimentionsSlice";
import {
    changeTree,
    clearNewNodeState,
    selectTreeSlice,
    setSelectedDndZone,
    setSelectedNode,
    updateUserTreeWithAppendedNode,
} from "../../redux/userTreesSlice";
import { Skill, Tree } from "../../types";
import useCurrentTree from "../../useCurrentTree";
import useTentativeNewTree from "../../useTentativeNewTree";
import AddNodeStateIndicator from "./AddNodeStateIndicator";
import AddNodeModal from "./modals/AddNodeModal";
import SelectChildrenToHoistWhenDeletingParentModal from "./modals/SelectChildrenToHoistWhenDeletingParentModal";
import useHandleMemoizedTreeProps from "./useHandleMemoizedTreeProps";

export type ModalState =
    | "TAKING_SCREENSHOT"
    | "EDITING_CANVAS_SETTINGS"
    | "IDLE"
    | "INPUT_DATA_FOR_NEW_NODE"
    | "CANDIDATES_TO_HOIST"
    | "PLACING_NEW_NODE"
    | "CONFIRM_NEW_NODE_POSITION"
    | "NODE_SELECTED";
type Props = NativeStackScreenProps<StackNavigatorParams, "ViewingSkillTree">;

function ViewingSkillTree({ navigation, route }: Props) {
    //Redux State
    const selectedTree = useCurrentTree();
    const tentativeNewTree = useTentativeNewTree();
    const { selectedDndZone, newNode, selectedNode: selectedNodeId } = useAppSelector(selectTreeSlice);
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

    const showDndZones = newNode && !selectedDndZone;
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

    const { RenderOnSelectedNodeId, config, functions, interactiveTreeState, tree } = useHandleMemoizedTreeProps(
        { canvasDisplaySettings, modal: modalUseState, screenDimensions, selectedDndZone, selectedTree, showDndZones, tentativeNewTree },
        selectedNodeId,
        canvasRef,
        navigation,
        openChildrenHoistSelector
    );

    const addTreeFunctions = useMemo(() => {
        return {
            returnToIdleState: () => {
                setModalState("IDLE");
                dispatch(clearNewNodeState());
            },
            resetNewNodePosition: () => {
                setModalState("PLACING_NEW_NODE");
                dispatch(setSelectedDndZone(undefined));
            },
            updateUserTree: () => {
                setModalState("IDLE");
                if (tentativeNewTree === undefined) return;
                dispatch(updateUserTreeWithAppendedNode(tentativeNewTree));
            },
            openNewNodeModal: () => {
                if (modalState !== "IDLE") return;
                setModalState("INPUT_DATA_FOR_NEW_NODE");
            },
        };
    }, [tentativeNewTree]);

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

            {selectedTree && <AddNodeStateIndicator mode={modalState} functions={addTreeFunctions} currentTree={selectedTree} />}

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

            <SelectChildrenToHoistWhenDeletingParentModal
                open={modalState === "CANDIDATES_TO_HOIST"}
                nodeToDelete={nodeToDelete}
                closeModalAndClearState={closeChildrenHoistModal}
            />
            <AddNodeModal
                open={modalState === "INPUT_DATA_FOR_NEW_NODE"}
                confirmAddNewNode={() => setModalState("PLACING_NEW_NODE")}
                closeModal={() => setModalState("IDLE")}
            />
            <CanvasSettingsModal open={modalState === "EDITING_CANVAS_SETTINGS"} closeModal={() => setModalState("IDLE")} />
        </View>
    );

    function useRunCleanupOnNavigation() {
        useEffect(() => {
            return () => {
                setModalState("IDLE");
                setNodeToDelete(null);
                dispatch(setSelectedNode(null));
                dispatch(setSelectedDndZone(undefined));
                dispatch(clearNewNodeState());
            };
        }, []);
    }

    function useHandleRouteParams(params: Props["route"]["params"]) {
        useEffect(() => {
            if (!params) return;

            dispatch(changeTree(params.treeId));
            //eslint-disable-next-line
        }, []);
    }
}

export default ViewingSkillTree;
