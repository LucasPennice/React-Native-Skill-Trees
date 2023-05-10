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
import { DnDZone } from "../../types";
import AddNode from "./AddNode";
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

    return (
        <View style={{ position: "relative", backgroundColor: colors.background, overflow: "hidden" }}>
            {currentTree && (
                <InteractiveTree
                    tree={tentativeNewTree ?? currentTree}
                    canvasRef={canvasRef}
                    onNodeClick={onNodeClick}
                    showDndZones={shouldRenderDndZones}
                    onDndZoneClick={onDndZoneClick}
                    isTakingScreenshot={isTakingScreenshot}
                />
            )}
            {currentTree && <ProgressIndicatorAndName tree={currentTree} />}
            {(mode === "Idle" || mode === "AddingNode") && <AddNode />}
            <OpenSettingsMenu openModal={() => setCanvasSettings(true)} />

            {currentTree && (
                <ShareTreeButton
                    canvasRef={canvasRef}
                    shouldShare={Boolean(shouldRenderShareButton)}
                    takingScreenShotState={[isTakingScreenshot, setIsTakingScreenshot]}
                    tree={currentTree}
                />
            )}

            <ChildrenHoistSelectorModal />
            <NewNodeModal />
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
