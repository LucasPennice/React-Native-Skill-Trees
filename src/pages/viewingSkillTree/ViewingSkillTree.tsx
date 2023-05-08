import { SkiaDomView, useCanvasRef } from "@shopify/react-native-skia";
import { useContext, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import AppText from "../../components/AppText";
import { centerFlex, colors } from "../../parameters";
import { useAppDispatch, useAppSelector } from "../../redux/reduxHooks";
import { selectCurrentTree, selectTentativeTree, selectTreeSlice, setSelectedDndZone, setSelectedNode } from "../../redux/userTreesSlice";
import { DnDZone } from "../../types";
import { shareCanvasScreenshot } from "../../useIsSharingAvailable";
import AddNode from "./AddNode";
import InteractiveTree from "./canvas/InteractiveTree";
import ProgressIndicatorAndName from "../../components/ProgressIndicatorAndName";
import SettingsMenu from "./components/SettingsMenu";
import ChildrenHoistSelectorModal from "./modals/ChildrenHoistSelector";
import NewNodeModal from "./modals/NewNodeModal";
import TakingScreenshotLoadingScreenModal from "./modals/TakingScreenshotLoadingScreenModal";
import useRunHomepageCleanup from "./useRunHomepageCleanup";
import { IsSharingAvailableContext } from "../../context";
import ShareTreeButton from "../../components/ShareTreeButton";

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
    const [isTakingScreenshot, setIsTakingScreenshot] = useState(false);
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
            {currentTree !== undefined && <SettingsMenu />}

            {currentTree && (
                <ShareTreeButton
                    canvasRef={canvasRef}
                    shouldShare={Boolean(shouldRenderShareButton)}
                    takingScreenShotState={[isTakingScreenshot, setIsTakingScreenshot]}
                    treeName={currentTree.treeName}
                />
            )}

            <ChildrenHoistSelectorModal />
            <NewNodeModal />
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
