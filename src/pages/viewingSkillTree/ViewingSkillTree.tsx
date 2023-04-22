import { SkiaDomView } from "@shopify/react-native-skia";
import { useContext, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { IsSharingAvailableContext } from "../../../App";
import AppText from "../../components/AppText";
import { centerFlex, colors } from "../../parameters";
import { useAppDispatch, useAppSelector } from "../../redux/reduxHooks";
import { selectScreenDimentions } from "../../redux/screenDimentionsSlice";
import { selectCurrentTree, selectTentativeTree, selectTreeSlice, setSelectedDndZone, setSelectedNode } from "../../redux/userTreesSlice";
import { DnDZone } from "../../types";
import { shareCanvasScreenshot } from "../../useIsSharingAvailable";
import AddNode from "./AddNode";
import TreeView from "./canvas/TreeView";
import ProgressIndicatorAndName from "./components/ProgressIndicatorAndName";
import SettingsMenu from "./components/SettingsMenu";
import ChildrenHoistSelectorModal from "./modals/ChildrenHoistSelector";
import NewNodeModal from "./modals/NewNodeModal";
import TakingScreenshotLoadingScreenModal from "./modals/TakingScreenshotLoadingScreenModal";
import useRunHomepageCleanup from "./useRunHomepageCleanup";

type Mode = "SelectedNode" | "AddingNode" | "TakingScreenshot" | "Idle";

function ViewingSkillTree() {
    //Redux State
    const currentTree = useAppSelector(selectCurrentTree);
    const { selectedDndZone, newNode, selectedNode } = useAppSelector(selectTreeSlice);
    const screenDimentions = useAppSelector(selectScreenDimentions);
    const tentativeNewTree = useAppSelector(selectTentativeTree);
    const dispatch = useAppDispatch();
    //Hooks
    const isSharingAvailable = useContext(IsSharingAvailableContext);
    const canvasRef = useRef<SkiaDomView | null>(null);
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
                <TreeView
                    tree={tentativeNewTree ?? currentTree}
                    canvasRef={canvasRef}
                    onNodeClick={onNodeClick}
                    showDndZones={shouldRenderDndZones}
                    onDndZoneClick={onDndZoneClick}
                    isTakingScreenshot={isTakingScreenshot}
                />
            )}
            <ProgressIndicatorAndName />
            {(mode === "Idle" || mode === "AddingNode") && <AddNode />}
            {currentTree !== undefined && <SettingsMenu />}

            {shouldRenderShareButton && (
                <Pressable
                    onPress={() => shareCanvasScreenshot(canvasRef.current, setIsTakingScreenshot, currentTree.treeName ?? "tree")}
                    style={[
                        centerFlex,
                        {
                            position: "absolute",
                            width: 50,
                            height: 50,
                            top: 70,
                            left: 10,
                            backgroundColor: colors.darkGray,
                            borderRadius: 10,
                        },
                    ]}>
                    <AppText fontSize={24} style={{ lineHeight: 33 }}>
                        🌎
                    </AppText>
                </Pressable>
            )}

            <ChildrenHoistSelectorModal />
            <NewNodeModal />
            <TakingScreenshotLoadingScreenModal open={isTakingScreenshot} />
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
