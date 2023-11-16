import OpenSettingsMenu from "@/components/OpenSettingsMenu";
import ProgressIndicatorAndName from "@/components/ProgressIndicatorAndName";
import ShareTreeScreenshot from "@/components/takingScreenshot/ShareTreeScreenshot";
import CanvasSettingsModal from "@/components/treeRelated/canvasSettingsModal/CanvasSettingsModal";
import SelectedNodeMenu, { SelectedNodeMenuState } from "@/components/treeRelated/selectedNodeMenu/SelectedNodeMenu";
import { selectedNodeMenuQueryFns } from "@/components/treeRelated/selectedNodeMenu/SelectedNodeMenuFunctions";
import HomepageTree from "@/pages/homepage/HomepageTree";
import { useAppDispatch, useAppSelector } from "@/redux/reduxHooks";
import { overwriteHomeTreeSlice, selectHomeTree } from "@/redux/slices/homeTreeSlice";
import { NodeSlice, overwriteNodeSlice, selectAllNodeIds, selectAllNodes, selectNodesTable } from "@/redux/slices/nodesSlice";
import { OnboardignState, overwriteOnboardingSlice, selectOnboarding } from "@/redux/slices/onboardingSlice";
import { selectSafeScreenDimentions } from "@/redux/slices/screenDimentionsSlice";
import { selectSyncSlice } from "@/redux/slices/syncSlice";
import { TreeData, UserTreeSlice, overwriteUserTreesSlice, selectAllTreesEntities, selectTreeIds } from "@/redux/slices/userTreesSlice";
import { NormalizedNode } from "@/types";
import useMongoCompliantUserId from "@/useMongoCompliantUserId";
import { Dictionary } from "@reduxjs/toolkit";
import { useCanvasRef } from "@shopify/react-native-skia";
import axiosClient from "axiosClient";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, View } from "react-native";
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

export type UserBackup = {
    nodeSlice: NodeSlice;
    userTreesSlice: UserTreeSlice;
    homeTree: Omit<TreeData, "nodes">;
    onboarding: OnboardignState;
    lastUpdateUTC_Timestamp: number;
};

const createInitialBackup = async (userId: string, newUserBackup: UserBackup) => {
    try {
        await axiosClient.post(`backup/${userId}`, newUserBackup);
    } catch (error) {
        Alert.alert("There was an error creating your backup", `Please contact the developer ${error}`);
    }
};

function useHandleSyncOnLoginOrSignUp() {
    const localParams = useLocalSearchParams<RoutesParams["home"]>();
    const skipSync = localParams.handleLogInSync === undefined && localParams.handleSignUpSync === undefined;

    const userId = useMongoCompliantUserId();
    const nodesTable = useAppSelector(selectNodesTable);
    const nodesIds = useAppSelector(selectAllNodeIds);
    const treesTable = useAppSelector(selectAllTreesEntities);
    const treesIds = useAppSelector(selectTreeIds);
    const homeTree = useAppSelector(selectHomeTree);
    const onboarding = useAppSelector(selectOnboarding);
    const { lastUpdateUTC_Timestamp } = useAppSelector(selectSyncSlice);

    const dispatch = useAppDispatch();

    const { handleLogInSync, handleSignUpSync } = localParams;

    const getUserExistsOnDB = () => axiosClient.get<boolean>(`userExists/${userId}`);

    const getUserBackup = () => axiosClient.get<UserBackup>(`backup/${userId}`);

    const initialUserBackup: UserBackup = {
        nodeSlice: { entities: nodesTable, ids: nodesIds },
        userTreesSlice: { entities: treesTable, ids: treesIds },
        homeTree,
        onboarding,
        lastUpdateUTC_Timestamp,
    };

    useEffect(() => {
        (async () => {
            if (skipSync) return;
            if (!userId) throw new Error("Couldn't get userId");

            const { data: userExistsOnDB } = await getUserExistsOnDB();

            if (handleLogInSync === "true") {
                logInSync(userExistsOnDB);
                return;
            }

            if (handleSignUpSync === "true" && !userExistsOnDB) {
                signUpSync();
                return;
            }
        })();

        async function logInSync(userExistsOnDB: boolean) {
            if (!userExistsOnDB) return createInitialBackup(userId!, initialUserBackup);

            try {
                const { data: userBackup } = await getUserBackup();

                dispatch(overwriteNodeSlice(userBackup.nodeSlice));
                dispatch(overwriteHomeTreeSlice(userBackup.homeTree));
                dispatch(overwriteOnboardingSlice(userBackup.onboarding));
                dispatch(overwriteUserTreesSlice(userBackup.userTreesSlice));

                return console.log("Inyecto la data de la base de datos en mi store", userBackup);
            } catch (error) {
                Alert.alert("There was an error loading you backup", `Please contact the developer ${error}`);
            }
        }

        function signUpSync() {
            return createInitialBackup(userId!, initialUserBackup);
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
