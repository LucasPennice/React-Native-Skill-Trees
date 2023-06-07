import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCanvasRef } from "@shopify/react-native-skia";
import { useContext, useEffect, useState } from "react";
import { View } from "react-native";
import { StackNavigatorParams } from "../../../App";
import CanvasSettingsModal from "../../components/CanvasSettingsModal";
import OpenSettingsMenu from "../../components/OpenSettingsMenu";
import ProgressIndicatorAndName from "../../components/ProgressIndicatorAndName";
import ShareTreeUrl from "../../components/ShareTreeUrl";
import ShareTreeLayout from "../../components/takingScreenshot/ShareTreeScreenshot";
import InteractiveTree, { InteractiveNodeState, InteractiveTreeConfig, InteractiveTreeFunctions } from "../../components/treeRelated/InteractiveTree";
import SelectedNodeMenu from "../../components/treeRelated/selectedNodeMenu/SelectedNodeMenu";
import useGetMenuFunctions from "../../components/treeRelated/selectedNodeMenu/useGetMenuFunctions";
import { IsSharingAvailableContext } from "../../context";
import { findNodeById } from "../../functions/extractInformationFromTree";
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
import { DnDZone, Skill, Tree } from "../../types";
import useCurrentTree from "../../useCurrentTree";
import useTentativeNewTree from "../../useTentativeNewTree";
import AddNodeStateIndicator from "./AddNodeStateIndicator";
import AddNodeModal from "./modals/AddNodeModal";
import ChildrenHoistSelectorModal from "./modals/ChildrenHoistSelector";

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
    const [modalState, setModalState] = useState<ModalState>("IDLE");
    //Local State
    const [candidatesToHoist, setCandidatesToHoist] = useState<Tree<Skill>[] | null>(null);
    //Derived State

    const showDndZones = newNode && !selectedDndZone;
    const shouldRenderShareButton = isSharingAvailable && selectedTree && modalState === "IDLE";

    useEffect(() => {
        if (selectedNodeId === null) setModalState("IDLE");
    }, [selectedNodeId]);

    const onNodeClick = (node: Tree<Skill>) => {
        if (modalState !== "IDLE") return;

        const nodeId = node.nodeId;

        dispatch(setSelectedNode(nodeId));
        setModalState("NODE_SELECTED");
    };

    const onDndZoneClick = (clickedZone: DnDZone | undefined) => {
        if (modalState !== "PLACING_NEW_NODE") return;
        if (clickedZone === undefined) return;
        dispatch(setSelectedDndZone(clickedZone));
        setModalState("CONFIRM_NEW_NODE_POSITION");
    };

    const openChildrenHoistSelector = (childrenToHoist: Tree<Skill>[]) => {
        setCandidatesToHoist(childrenToHoist);
        setModalState("CANDIDATES_TO_HOIST");
    };

    const clearSelectedNode = () => dispatch(setSelectedNode(null));

    //CHANGE REDUX STATE TO HOLD NODE LATER 😝
    const selectedNode = findNodeById(selectedTree, selectedNodeId);

    //Interactive Tree Props
    const config: InteractiveTreeConfig = { canvasDisplaySettings, isInteractive: true, renderStyle: "hierarchy", showDndZones };
    const state: InteractiveNodeState = { screenDimensions, canvasRef, selectedDndZone, selectedNodeId };
    const tree: Tree<Skill> | undefined = tentativeNewTree ?? selectedTree;
    const functions: InteractiveTreeFunctions = { onNodeClick, onDndZoneClick };
    //Interactive Tree Props - SelectedNodeMenu
    const menuFunctions = useGetMenuFunctions({ openChildrenHoistSelector, selectedNode, selectedTree, navigation, clearSelectedNode });

    return (
        <View style={{ position: "relative", backgroundColor: colors.background, flex: 1, overflow: "hidden" }}>
            {tree && (
                <InteractiveTree
                    config={config}
                    state={state}
                    tree={tree}
                    functions={functions}
                    renderOnSelectedNodeId={
                        <SelectedNodeMenu functions={menuFunctions} state={{ screenDimensions, selectedNode: selectedNode! }} allowEdit />
                    }
                />
            )}
            {selectedTree && <ProgressIndicatorAndName tree={selectedTree} />}
            <AddNodeStateIndicator
                mode={modalState}
                returnToIdleState={() => {
                    setModalState("IDLE");
                    dispatch(clearNewNodeState());
                }}
                resetNewNodePosition={() => {
                    setModalState("PLACING_NEW_NODE");
                    dispatch(setSelectedDndZone(undefined));
                }}
                updateUserTree={() => {
                    setModalState("IDLE");
                    if (tentativeNewTree === undefined) return;
                    dispatch(updateUserTreeWithAppendedNode(tentativeNewTree));
                }}
                openNewNodeModal={() => setModalState("INPUT_DATA_FOR_NEW_NODE")}
            />

            {selectedTree && (
                <ShareTreeLayout
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
            {selectedTree && modalState === "IDLE" && <ShareTreeUrl tree={selectedTree} />}

            {modalState === "IDLE" && <OpenSettingsMenu openModal={() => setModalState("EDITING_CANVAS_SETTINGS")} />}

            <ChildrenHoistSelectorModal
                open={modalState === "CANDIDATES_TO_HOIST"}
                candidatesToHoist={candidatesToHoist}
                closeModalAndClearCandidates={() => {
                    setCandidatesToHoist(null);
                    setModalState("IDLE");
                }}
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
                setCandidatesToHoist(null);
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
        }, []);
    }
}

export default ViewingSkillTree;
