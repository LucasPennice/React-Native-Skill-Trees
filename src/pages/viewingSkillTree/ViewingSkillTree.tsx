import { useCanvasRef } from "@shopify/react-native-skia";
import { useContext, useState } from "react";
import { View } from "react-native";
import OpenSettingsMenu from "../../components/OpenSettingsMenu";
import ProgressIndicatorAndName from "../../components/ProgressIndicatorAndName";
import CanvasSettingsModal from "../../components/CanvasSettingsModal";
import ShareTreeButton from "../../components/takingScreenshot/ShareTreeButton";
import { IsSharingAvailableContext } from "../../context";
import { colors } from "../../parameters";
import { useAppDispatch, useAppSelector } from "../../redux/reduxHooks";
import { selectCurrentTree, selectTentativeTree, selectTreeSlice, setSelectedDndZone, setSelectedNode } from "../../redux/userTreesSlice";
import { DnDZone, Skill, Tree } from "../../types";
import AddNodeStateIndicator from "./AddNodeStateIndicator";
import InteractiveTree from "./canvas/InteractiveTree";
import ChildrenHoistSelectorModal from "./modals/ChildrenHoistSelector";
import NewNodeModal from "./modals/NewNodeModal";
import useRunHomepageCleanup from "./useRunHomepageCleanup";

type Mode = "SelectedNode" | "AddingNode" | "TakingScreenshot" | "Idle";

function ViewingSkillTree() {
    //Redux State
    const currentTree = useAppSelector(selectCurrentTree);
    const { selectedDndZone, newNode, selectedNode } = useAppSelector(selectTreeSlice);
    const tentativeNewTree = useAppSelector(selectTentativeTree);
    const dispatch = useAppDispatch();
    //Hooks
    const isSharingAvailable = useContext(IsSharingAvailableContext);
    const canvasRef = useCanvasRef();
    //Local State
    const [isTakingScreenshot, setIsTakingScreenshot] = useState(false);
    const [canvasSettings, setCanvasSettings] = useState(false);
    const [newNodeModal, setNewNodeModal] = useState(false);
    const [candidatesToHoistModal, setCandidatesToHoistModal] = useState(false);
    const [candidatesToHoist, setCandidatesToHoist] = useState<Tree<Skill>[] | null>(null);
    useRunHomepageCleanup();
    //Derived State
    const shouldRenderDndZones = newNode && !selectedDndZone;
    const mode = getMode();
    const shouldRenderShareButton = isSharingAvailable && currentTree && mode === "Idle";

    const onNodeClick = (id: string) => {
        if (mode !== "Idle") return;

        dispatch(setSelectedNode(id));
    };

    const onDndZoneClick = (clickedZone: DnDZone | undefined) => {
        if (mode !== "AddingNode") return;
        dispatch(setSelectedDndZone(clickedZone));
    };

    const openChildrenHoistSelector = (childrenToHoist: Tree<Skill>[]) => {
        setCandidatesToHoist(childrenToHoist);
        setCandidatesToHoistModal(true);
    };

    return (
        <View style={{ position: "relative", backgroundColor: colors.background, overflow: "hidden" }}>
            {currentTree && (
                <InteractiveTree
                    openChildrenHoistSelector={openChildrenHoistSelector}
                    tree={tentativeNewTree ?? currentTree}
                    canvasRef={canvasRef}
                    onNodeClick={onNodeClick}
                    showDndZones={shouldRenderDndZones}
                    onDndZoneClick={onDndZoneClick}
                    isTakingScreenshot={isTakingScreenshot}
                />
            )}
            {currentTree && <ProgressIndicatorAndName tree={currentTree} />}
            {(mode === "Idle" || mode === "AddingNode") && <AddNodeStateIndicator openNewNodeModal={() => setNewNodeModal(true)} />}
            {mode === "Idle" && <OpenSettingsMenu openModal={() => setCanvasSettings(true)} />}

            {currentTree && (
                <ShareTreeButton
                    canvasRef={canvasRef}
                    shouldShare={Boolean(shouldRenderShareButton)}
                    takingScreenShotState={[isTakingScreenshot, setIsTakingScreenshot]}
                    tree={currentTree}
                />
            )}

            <ChildrenHoistSelectorModal
                open={candidatesToHoistModal}
                candidatesToHoist={candidatesToHoist}
                closeModalAndClearCandidates={() => {
                    setCandidatesToHoist(null);
                    setCandidatesToHoistModal(false);
                }}
            />
            <NewNodeModal open={newNodeModal} closeModal={() => setNewNodeModal(false)} />
            <CanvasSettingsModal open={canvasSettings} closeModal={() => setCanvasSettings(false)} />
        </View>
    );

    function getMode(): Mode {
        if (selectedNode !== null) return "SelectedNode";
        if (newNode !== undefined) return "AddingNode";
        if (isTakingScreenshot) return "TakingScreenshot";
        return "Idle";
    }
}

ViewingSkillTree.whyDidYouRender = false;
// HomePage.whyDidYouRender = {
//     logOnDifferentValues: true,
//     customName: "Homeapge",
// };

export default ViewingSkillTree;
