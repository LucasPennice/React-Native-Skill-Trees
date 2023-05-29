import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCanvasRef } from "@shopify/react-native-skia";
import { useContext, useEffect, useState } from "react";
import { View } from "react-native";
import { StackNavigatorParams } from "../../../App";
import CanvasSettingsModal from "../../components/CanvasSettingsModal";
import OpenSettingsMenu from "../../components/OpenSettingsMenu";
import ProgressIndicatorAndName from "../../components/ProgressIndicatorAndName";
import ShareTreeUrl from "../../components/ShareTreeUrl";
import ShareTreeLayout from "../../components/takingScreenshot/ShareTreeLayout";
import { IsSharingAvailableContext } from "../../context";
import { colors } from "../../parameters";
import { useAppDispatch, useAppSelector } from "../../redux/reduxHooks";
import { clearNewNodeState, selectTreeSlice, setSelectedDndZone, setSelectedNode, updateUserTreeWithAppendedNode } from "../../redux/userTreesSlice";
import { DnDZone, Skill, Tree } from "../../types";
import useCurrentTree from "../../useCurrentTree";
import useTentativeNewTree from "../../useTentativeNewTree";
import AddNodeStateIndicator from "./AddNodeStateIndicator";
import InteractiveTree from "./canvas/InteractiveTree";
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

function ViewingSkillTree({ navigation }: Props) {
    //Redux State
    const currentTree = useCurrentTree();
    const tentativeNewTree = useTentativeNewTree();
    const { selectedDndZone, newNode, selectedNode } = useAppSelector(selectTreeSlice);
    const dispatch = useAppDispatch();
    //Hooks
    const isSharingAvailable = useContext(IsSharingAvailableContext);
    const canvasRef = useCanvasRef();
    useRunCleanupOnNavigation();
    //Local State - MODALS
    const [modalState, setModalState] = useState<ModalState>("IDLE");
    //Local State
    const [candidatesToHoist, setCandidatesToHoist] = useState<Tree<Skill>[] | null>(null);
    //Derived State
    const shouldRenderDndZones = newNode && !selectedDndZone;
    const shouldRenderShareButton = isSharingAvailable && currentTree && modalState === "IDLE";

    // useEffect(() => {
    //     console.log("current Tree", currentTree);
    // }, [currentTree]);
    // useEffect(() => {
    //     console.log("tentative tree", tentativeNewTree);
    // }, [tentativeNewTree]);

    useEffect(() => {
        if (selectedNode === null) setModalState("IDLE");
    }, [selectedNode]);

    const onNodeClick = (id: string) => {
        if (modalState !== "IDLE") return;
        dispatch(setSelectedNode(id));
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

    return (
        <View style={{ position: "relative", backgroundColor: colors.background, flex: 1, overflow: "hidden" }}>
            {currentTree && (
                <InteractiveTree
                    openChildrenHoistSelector={openChildrenHoistSelector}
                    tree={tentativeNewTree ?? currentTree}
                    canvasRef={canvasRef}
                    onNodeClick={onNodeClick}
                    showDndZones={shouldRenderDndZones}
                    onDndZoneClick={onDndZoneClick}
                />
            )}
            {currentTree && <ProgressIndicatorAndName tree={currentTree} />}
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
                    dispatch(updateUserTreeWithAppendedNode(tentativeNewTree));
                }}
                openNewNodeModal={() => setModalState("INPUT_DATA_FOR_NEW_NODE")}
            />

            {currentTree && (
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
                    tree={currentTree}
                />
            )}
            {currentTree && modalState === "IDLE" && <ShareTreeUrl tree={currentTree} />}

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
}

export default ViewingSkillTree;
