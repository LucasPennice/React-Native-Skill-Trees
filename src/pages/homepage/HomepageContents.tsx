import { selectHomeTree } from "@/redux/slices/homeTreeSlice";
import { selectAllNodes } from "@/redux/slices/nodesSlice";
import { useCanvasRef } from "@shopify/react-native-skia";
import { useNavigation } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import OpenSettingsMenu from "../../components/OpenSettingsMenu";
import ProgressIndicatorAndName from "../../components/ProgressIndicatorAndName";
import ShareTreeScreenshot from "../../components/takingScreenshot/ShareTreeScreenshot";
import CanvasSettingsModal from "../../components/treeRelated/canvasSettingsModal/CanvasSettingsModal";
import SelectedNodeMenu, { SelectedNodeMenuState } from "../../components/treeRelated/selectedNodeMenu/SelectedNodeMenu";
import { selectedNodeMenuQueryFns } from "../../components/treeRelated/selectedNodeMenu/SelectedNodeMenuFunctions";
import { useAppSelector } from "../../redux/reduxHooks";
import { selectSafeScreenDimentions } from "../../redux/slices/screenDimentionsSlice";
import { NormalizedNode } from "../../types";
import HomepageTree from "./HomepageTree";

function useHandleNavigationListener(clearSelectedNodeCoord: () => void) {
    const navigation = useNavigation();

    useEffect(() => {
        navigation.addListener("state", (_) => clearSelectedNodeCoord());
        return () => {
            navigation.removeListener("state", (_) => clearSelectedNodeCoord());
        };
    }, []);
}

function useHomepageContentsState() {
    const allNodes = useAppSelector(selectAllNodes);

    const homePageTreeData = useAppSelector(selectHomeTree);

    const screenDimensions = useAppSelector(selectSafeScreenDimentions);

    return { screenDimensions, allNodes, homePageTreeData };
}

function useTakingScreenshotState() {
    const [takingScreenshot, setTakingScreenshot] = useState(false);

    const openTakingScreenshotModal = () => setTakingScreenshot(true);
    const closeTakingScreenshotModal = () => setTakingScreenshot(false);

    return [takingScreenshot, { openTakingScreenshotModal, closeTakingScreenshotModal }] as const;
}

function useSelectedNodeCoordState() {
    const [selectedNodeCoord, setSelectedNodeCoord] = useState<NormalizedNode | null>(null);

    const clearSelectedNodeCoord = () => setSelectedNodeCoord(null);
    const updateSelectedNodeCoord = (value: NormalizedNode) => setSelectedNodeCoord(value);

    return [selectedNodeCoord, { clearSelectedNodeCoord, updateSelectedNodeCoord }] as const;
}

function useCanvasSettingsState() {
    const [canvasSettings, setCanvasSettings] = useState(false);

    const openCanvasSettingsModal = useCallback(() => setCanvasSettings(true), []);
    const closeCanvasSettingsModal = useCallback(() => setCanvasSettings(false), []);

    return [canvasSettings, { openCanvasSettingsModal, closeCanvasSettingsModal }] as const;
}

function HomepageContents() {
    const selectedNodeCoordState = useSelectedNodeCoordState();

    //🧠 .4ms
    const { screenDimensions, allNodes, homePageTreeData } = useHomepageContentsState();

    // return (
    //     <View style={{ backgroundColor: "green", flex: 1, justifyContent: "center" }}>
    //         <Button
    //             title={"toggleSelect"}
    //             onPress={() => {
    //                 console.log("cajeta");
    //                 if (selectedNodeCoordState[0]) return selectedNodeCoordState[1].clearSelectedNodeCoord();
    //                 selectedNodeCoordState[1].updateSelectedNodeCoord({
    //                     category: "SKILL",
    //                     data: {
    //                         name: "b",
    //                         isCompleted: false,
    //                         icon: { isEmoji: false, text: "" },
    //                         logs: [],
    //                         milestones: [],
    //                         motivesToLearn: [],
    //                         usefulResources: [],
    //                     },
    //                     isRoot: false,
    //                     level: 1,
    //                     nodeId: "lGbDlPoI87rvxVBThUE38orH",
    //                     parentId: "ngevJAb90cbcAf9uUnW5IZYe",
    //                     treeId: "cDZz7HWQ38QWsWyjPOe9enM1",
    //                     x: 0,
    //                     y: 0,
    //                     childrenIds: [],
    //                 });
    //             }}
    //         />
    //     </View>
    // );

    const takingScreenShotState = useTakingScreenshotState();
    const [selectedNodeCoord, { clearSelectedNodeCoord }] = selectedNodeCoordState;

    const [canvasSettings, { openCanvasSettingsModal, closeCanvasSettingsModal }] = useCanvasSettingsState();

    useHandleNavigationListener(clearSelectedNodeCoord);

    const canvasRef = useCanvasRef();

    const selectedNode = allNodes.find((n) => n.nodeId === selectedNodeCoord?.nodeId);

    const selectedNodeQueryFns = selectedNodeMenuQueryFns(selectedNode, clearSelectedNodeCoord);

    const selectedNodeMenuState: SelectedNodeMenuState = {
        screenDimensions,
        selectedNode: selectedNode!,
        initialMode: "VIEWING",
    };

    return (
        <>
            <HomepageTree selectedNodeCoordState={selectedNodeCoordState} canvasRef={canvasRef} openCanvasSettingsModal={openCanvasSettingsModal} />
            <ProgressIndicatorAndName treeData={homePageTreeData} nodesOfTree={allNodes} />
            <OpenSettingsMenu openModal={openCanvasSettingsModal} show={selectedNodeCoord === null} />
            <ShareTreeScreenshot
                canvasRef={canvasRef}
                shouldShare={selectedNodeCoord === null}
                takingScreenshotState={takingScreenShotState}
                treeData={homePageTreeData}
            />

            {selectedNodeCoord && <SelectedNodeMenu functions={selectedNodeQueryFns} state={selectedNodeMenuState} />}

            <CanvasSettingsModal open={canvasSettings} closeModal={closeCanvasSettingsModal} />
        </>
    );
}

export default HomepageContents;
