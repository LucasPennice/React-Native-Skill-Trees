import { buildHomepageTree } from "@/functions/treeToRadialCoordinates/general";
import { useCanvasRef } from "@shopify/react-native-skia";
import { useNavigation } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import OpenSettingsMenu from "../../components/OpenSettingsMenu";
import ProgressIndicatorAndName from "../../components/ProgressIndicatorAndName";
import ShareTreeScreenshot from "../../components/takingScreenshot/ShareTreeScreenshot";
import CanvasSettingsModal from "../../components/treeRelated/canvasSettingsModal/CanvasSettingsModal";
import SelectedNodeMenu, { SelectedNodeMenuState } from "../../components/treeRelated/selectedNodeMenu/SelectedNodeMenu";
import { selectedNodeMenuQueryFns } from "../../components/treeRelated/selectedNodeMenu/SelectedNodeMenuFunctions";
import { findNodeByIdInHomeTree } from "../../functions/extractInformationFromTree";
import { useAppSelector } from "../../redux/reduxHooks";
import { selectCanvasDisplaySettings } from "../../redux/slices/canvasDisplaySettingsSlice";
import { selectSafeScreenDimentions } from "../../redux/slices/screenDimentionsSlice";
import { selectUserTrees } from "../../redux/slices/userTreesSlice";
import { NodeCoordinate } from "../../types";
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
    const userTrees = useAppSelector(selectUserTrees);

    const screenDimensions = useAppSelector(selectSafeScreenDimentions);
    const canvasDisplaySettings = useAppSelector(selectCanvasDisplaySettings);

    return { canvasDisplaySettings, screenDimensions, userTrees };
}

function useTakingScreenshotState() {
    const [takingScreenshot, setTakingScreenshot] = useState(false);

    const openTakingScreenshotModal = () => setTakingScreenshot(true);
    const closeTakingScreenshotModal = () => setTakingScreenshot(false);

    return [takingScreenshot, { openTakingScreenshotModal, closeTakingScreenshotModal }] as const;
}

function useSelectedNodeCoordState() {
    const [selectedNodeCoord, setSelectedNodeCoord] = useState<NodeCoordinate | null>(null);

    const clearSelectedNodeCoord = () => setSelectedNodeCoord(null);
    const updateSelectedNodeCoord = (value: NodeCoordinate) => setSelectedNodeCoord(value);

    return [selectedNodeCoord, { clearSelectedNodeCoord, updateSelectedNodeCoord }] as const;
}

function useCanvasSettingsState() {
    const [canvasSettings, setCanvasSettings] = useState(false);

    const openCanvasSettingsModal = useCallback(() => setCanvasSettings(true), []);
    const closeCanvasSettingsModal = useCallback(() => setCanvasSettings(false), []);

    return [canvasSettings, { openCanvasSettingsModal, closeCanvasSettingsModal }] as const;
}

function HomepageContents() {
    const { canvasDisplaySettings, userTrees, screenDimensions } = useHomepageContentsState();

    const takingScreenShotState = useTakingScreenshotState();
    const selectedNodeCoordState = useSelectedNodeCoordState();
    const [selectedNodeCoord, { clearSelectedNodeCoord }] = selectedNodeCoordState;

    const [canvasSettings, { openCanvasSettingsModal, closeCanvasSettingsModal }] = useCanvasSettingsState();

    const homepageTree = useMemo(() => buildHomepageTree(userTrees, canvasDisplaySettings), [canvasDisplaySettings, userTrees]);

    useHandleNavigationListener(clearSelectedNodeCoord);

    const canvasRef = useCanvasRef();

    const selectedNode = findNodeByIdInHomeTree(homepageTree, selectedNodeCoord);

    const selectedNodeQueryFns = selectedNodeMenuQueryFns(selectedNode, clearSelectedNodeCoord);

    const selectedNodeMenuState: SelectedNodeMenuState = {
        screenDimensions,
        selectedNode: selectedNode!,
        selectedTree: homepageTree,
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
