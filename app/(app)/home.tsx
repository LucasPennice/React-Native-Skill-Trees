import OpenSettingsMenu from "@/components/OpenSettingsMenu";
import ProgressIndicatorAndName from "@/components/ProgressIndicatorAndName";
import ShareTreeScreenshot from "@/components/takingScreenshot/ShareTreeScreenshot";
import CanvasSettingsModal from "@/components/treeRelated/canvasSettingsModal/CanvasSettingsModal";
import SelectedNodeMenu, { SelectedNodeMenuState } from "@/components/treeRelated/selectedNodeMenu/SelectedNodeMenu";
import { selectedNodeMenuQueryFns } from "@/components/treeRelated/selectedNodeMenu/SelectedNodeMenuFunctions";
import HomepageTree from "@/pages/homepage/HomepageTree";
import { useAppSelector } from "@/redux/reduxHooks";
import { selectHomeTree } from "@/redux/slices/homeTreeSlice";
import { selectAllNodes } from "@/redux/slices/nodesSlice";
import { selectSafeScreenDimentions } from "@/redux/slices/screenDimentionsSlice";
import { selectTotalTreeQty } from "@/redux/slices/userTreesSlice";
import { NormalizedNode } from "@/types";
import { useCanvasRef } from "@shopify/react-native-skia";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { RoutesParams } from "routes";

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

function useIsStoreEmpty() {
    const userTreeQty = useAppSelector(selectTotalTreeQty);

    return userTreeQty === 0;
}

function useHandleSyncOnLoginOrSignUp() {
    const localParams = useLocalSearchParams<RoutesParams["home"]>();

    const { handleLogInSync, handleSignUpSync } = localParams;

    const isStoreEmpty = useIsStoreEmpty();

    const isCloudEmpty = true;

    const localLastModification = new Date();
    const cloudLastModification = new Date();

    const backUpLocalData = () => {};

    async function logInSync() {
        if (isCloudEmpty) {
            if (isStoreEmpty) return;

            return await backUpLocalData();
        }

        if (localLastModification === cloudLastModification) return;

        return console.log("el usuario elige entre cual de las dos consumir");
    }

    async function signUpSync() {
        if (isStoreEmpty) return;

        return await backUpLocalData();
    }

    useEffect(() => {
        if (handleLogInSync === "true") {
            logInSync();
            return;
        }

        if (handleSignUpSync === "true") {
            signUpSync();
            return;
        }
    }, [localParams]);
}

function Home() {
    const selectedNodeCoordState = useSelectedNodeCoordState();

    useHandleSyncOnLoginOrSignUp();
    //🧠 .4ms
    const { screenDimensions, allNodes, homePageTreeData } = useHomepageContentsState();

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
        <View style={{ position: "relative", flex: 1, overflow: "hidden" }}>
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
        </View>
    );
}

export default Home;
