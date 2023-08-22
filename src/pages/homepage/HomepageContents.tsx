import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCanvasRef } from "@shopify/react-native-skia";
import { useEffect, useMemo, useState } from "react";
import { StackNavigatorParams } from "../../../App";
import OpenSettingsMenu from "../../components/OpenSettingsMenu";
import ProgressIndicatorAndName from "../../components/ProgressIndicatorAndName";
import ShareTreeLayout from "../../components/takingScreenshot/ShareTreeScreenshot";
import CanvasSettingsModal from "../../components/treeRelated/canvasSettingsModal/CanvasSettingsModal";
import { buildHomepageTree } from "../../functions/treeToRadialCoordinates/general";
import { useAppDispatch, useAppSelector } from "../../redux/reduxHooks";
import { CanvasDisplaySettings, selectCanvasDisplaySettings } from "../../redux/slices/canvasDisplaySettingsSlice";
import { ScreenDimentions, selectSafeScreenDimentions } from "../../redux/slices/screenDimentionsSlice";
import { calculateHomeTreeCoordinatesInitially } from "../../redux/slices/treesCoordinatesSlice";
import { selectUserTrees } from "../../redux/slices/userTreesSlice";
import { Skill, Tree } from "../../types";
import HomepageTree from "./HomepageTree";

type Props = {
    n: NativeStackScreenProps<StackNavigatorParams, "Home">;
};

function useHandleInitialTreeCoordinates(userTrees: Tree<Skill>[], screenDimensions: ScreenDimentions, canvasDisplaySettings: CanvasDisplaySettings) {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(calculateHomeTreeCoordinatesInitially({ canvasDisplaySettings, screenDimensions, userTrees }));
    }, []);
}

function useHandleNavigationListener(
    navigation: NativeStackNavigationProp<StackNavigatorParams, "Home", undefined>,
    clearSelectedNodeId: () => void
) {
    useEffect(() => {
        navigation.addListener("state", (_) => clearSelectedNodeId());
        return () => {
            navigation.removeListener("state", (_) => clearSelectedNodeId());
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

function useSelectedNodeIdState() {
    const [selectedNodeId, setSelectedNodeId] = useState<{ nodeId: string; treeId: string } | null>(null);

    const clearSelectedNodeId = () => setSelectedNodeId(null);
    const updateSelectedNodeId = (value: { nodeId: string; treeId: string }) => setSelectedNodeId(value);

    return [selectedNodeId, { clearSelectedNodeId, updateSelectedNodeId }] as const;
}

function useCanvasSettingsState() {
    const [canvasSettings, setCanvasSettings] = useState(false);

    const openCanvasSettingsModal = () => setCanvasSettings(true);
    const closeCanvasSettingsModal = () => setCanvasSettings(false);

    return [canvasSettings, { openCanvasSettingsModal, closeCanvasSettingsModal }] as const;
}

function HomepageContents({ n: { navigation } }: Props) {
    const { canvasDisplaySettings, screenDimensions, userTrees } = useHomepageContentsState();

    const takingScreenShotState = useTakingScreenshotState();
    // const [takingScreenshot, { openTakingScreenshotModal, closeTakingScreenshotModal }] = takingScreenShotState;
    const selectedNodeIdState = useSelectedNodeIdState();
    const [selectedNodeId, { clearSelectedNodeId }] = selectedNodeIdState;

    const [canvasSettings, { openCanvasSettingsModal, closeCanvasSettingsModal }] = useCanvasSettingsState();

    const homepageTree = useMemo(() => buildHomepageTree(userTrees, canvasDisplaySettings), [canvasDisplaySettings, userTrees]);

    useHandleInitialTreeCoordinates(userTrees, screenDimensions, canvasDisplaySettings);

    useHandleNavigationListener(navigation, clearSelectedNodeId);

    const canvasRef = useCanvasRef();

    const lol = {
        selectedNodeIdState,
        canvasRef,
        homepageTree,
        navigation,
        openCanvasSettingsModal,
    };

    return (
        <>
            <HomepageTree lol={lol} />
            <ProgressIndicatorAndName tree={homepageTree} />
            <OpenSettingsMenu openModal={openCanvasSettingsModal} show={selectedNodeId === null} />
            <ShareTreeLayout
                canvasRef={canvasRef}
                shouldShare={selectedNodeId === null}
                takingScreenshotState={takingScreenShotState}
                tree={homepageTree}
            />
            <CanvasSettingsModal open={canvasSettings} closeModal={closeCanvasSettingsModal} />
        </>
    );
}

export default HomepageContents;
