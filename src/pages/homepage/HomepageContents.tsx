import useGetUserTrees from "@/components/treeRelated/hooks/useGetUserTrees";
import { buildHomepageTree } from "@/functions/treeToRadialCoordinates/general";
import { selectHomeTree } from "@/redux/slices/homeTreeSlice";
import { useCanvasRef } from "@shopify/react-native-skia";
import { useNavigation } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import OpenSettingsMenu from "../../components/OpenSettingsMenu";
import ProgressIndicatorAndName from "../../components/ProgressIndicatorAndName";
import ShareTreeScreenshot from "../../components/takingScreenshot/ShareTreeScreenshot";
import CanvasSettingsModal from "../../components/treeRelated/canvasSettingsModal/CanvasSettingsModal";
import SelectedNodeMenu, { SelectedNodeMenuState } from "../../components/treeRelated/selectedNodeMenu/SelectedNodeMenu";
import { selectedNodeMenuQueryFns } from "../../components/treeRelated/selectedNodeMenu/SelectedNodeMenuFunctions";
import { useAppSelector } from "../../redux/reduxHooks";
import { selectCanvasDisplaySettings } from "../../redux/slices/canvasDisplaySettingsSlice";
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
    const { userTrees, allNodes } = useGetUserTrees();
    const homePageTreeData = useAppSelector(selectHomeTree);

    const screenDimensions = useAppSelector(selectSafeScreenDimentions);
    const canvasDisplaySettings = useAppSelector(selectCanvasDisplaySettings);

    return { canvasDisplaySettings, screenDimensions, userTrees, allNodes, homePageTreeData };
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
    const { canvasDisplaySettings, userTrees, screenDimensions, allNodes } = useHomepageContentsState();

    const takingScreenShotState = useTakingScreenshotState();
    const selectedNodeCoordState = useSelectedNodeCoordState();
    const [selectedNodeCoord, { clearSelectedNodeCoord }] = selectedNodeCoordState;

    const [canvasSettings, { openCanvasSettingsModal, closeCanvasSettingsModal }] = useCanvasSettingsState();

    const homepageTree = useMemo(() => buildHomepageTree(userTrees, canvasDisplaySettings), [canvasDisplaySettings, userTrees]);

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
            <HomepageTree
                selectedNodeCoordState={selectedNodeCoordState}
                canvasRef={canvasRef}
                homepageTree={homepageTree}
                openCanvasSettingsModal={openCanvasSettingsModal}
            />
            <ProgressIndicatorAndName tree={homepageTree} />
            <OpenSettingsMenu openModal={openCanvasSettingsModal} show={selectedNodeCoord === null} />
            <ShareTreeScreenshot
                canvasRef={canvasRef}
                shouldShare={selectedNodeCoord === null}
                takingScreenshotState={takingScreenShotState}
                tree={homepageTree}
            />

            {selectedNodeCoord && <SelectedNodeMenu functions={selectedNodeQueryFns} state={selectedNodeMenuState} />}

            <CanvasSettingsModal open={canvasSettings} closeModal={closeCanvasSettingsModal} />
        </>
    );
}

export default HomepageContents;
