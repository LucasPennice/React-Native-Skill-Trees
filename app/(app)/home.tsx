import AppButton, { ButtonState } from "@/components/AppButton";
import AppText from "@/components/AppText";
import SadFaceIcon from "@/components/Icons/SadFaceIcon";
import LoadingIcon from "@/components/LoadingIcon";
import OpenSettingsMenu from "@/components/OpenSettingsMenu";
import ProgressIndicatorAndName from "@/components/ProgressIndicatorAndName";
import ShareTreeScreenshot from "@/components/takingScreenshot/ShareTreeScreenshot";
import CanvasSettingsModal from "@/components/treeRelated/canvasSettingsModal/CanvasSettingsModal";
import SelectedNodeMenu, { SelectedNodeMenuState } from "@/components/treeRelated/selectedNodeMenu/SelectedNodeMenu";
import { selectedNodeMenuQueryFns } from "@/components/treeRelated/selectedNodeMenu/SelectedNodeMenuFunctions";
import HomepageTree from "@/pages/homepage/HomepageTree";
import { colors } from "@/parameters";
import { useAppDispatch, useAppSelector } from "@/redux/reduxHooks";
import { overwriteHomeTreeSlice, selectHomeTree } from "@/redux/slices/homeTreeSlice";
import { NodeSlice, overwriteNodeSlice, selectAllNodeIds, selectAllNodes, selectNodesTable } from "@/redux/slices/nodesSlice";
import { OnboardignState, overwriteOnboardingSlice, selectOnboarding } from "@/redux/slices/onboardingSlice";
import { selectSafeScreenDimentions } from "@/redux/slices/screenDimentionsSlice";
import { selectSyncSlice, setShouldWaitForClerkToLoad, updateLastBackupTime } from "@/redux/slices/syncSlice";
import { TreeData, UserTreeSlice, overwriteUserTreesSlice, selectAllTreesEntities, selectTreeIds } from "@/redux/slices/userTreesSlice";
import { NormalizedNode } from "@/types";
import useMongoCompliantUserId from "@/useMongoCompliantUserId";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useCanvasRef } from "@shopify/react-native-skia";
import { useHandleButtonState } from "app/signUp";
import axiosClient from "axiosClient";
import * as ExpoNavigationBar from "expo-navigation-bar";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Modal, Platform, StatusBar, StyleSheet, View } from "react-native";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import { RoutesParams } from "routes";
import { Contact } from "./feedback";

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

function useHandleSyncOnLoginOrSignUp(
    syncStateObj: {
        submitState: ButtonState;
        setSubmitError: () => void;
        setSubmitLoading: () => void;
        resetSubmitState: () => void;
        setSubmitSuccess: () => void;
    },
    setShowModal: (v: boolean) => void
) {
    const { setSubmitSuccess: setSyncSuccess, setSubmitError: setSyncError, setSubmitLoading: setSyncLoading } = syncStateObj;

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
                setShowModal(true);
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

            setSyncLoading();

            try {
                const { data: userBackup } = await getUserBackup();

                dispatch(overwriteOnboardingSlice(userBackup.onboarding));
                dispatch(overwriteHomeTreeSlice(userBackup.homeTree));
                dispatch(overwriteUserTreesSlice(userBackup.userTreesSlice));
                dispatch(overwriteNodeSlice(userBackup.nodeSlice));

                setSyncSuccess();

                setTimeout(() => setShowModal(false), 1000);

                dispatch(setShouldWaitForClerkToLoad(false));

                return;
            } catch (error) {
                Alert.alert("There was an error loading you backup", `Please contact the developer ${error}`);

                setSyncError();
            }
        }

        function signUpSync() {
            try {
                dispatch(setShouldWaitForClerkToLoad(false));
                return createInitialBackup(userId!, initialUserBackup);
            } catch (error) {}
        }
    }, [localParams]);

    const createInitialBackup = async (userId: string, newUserBackup: UserBackup) => {
        try {
            await axiosClient.post(`backup/${userId}`, newUserBackup);

            dispatch(updateLastBackupTime());
        } catch (error) {
            Alert.alert("There was an error creating your backup", `Please contact the developer ${error}`);
        }
    };
}

function Home() {
    const selectedNodeCoordState = useSelectedNodeCoordState();

    const syncStateObj = useHandleButtonState();

    const { submitState: syncState } = syncStateObj;
    const [showModal, setShowModal] = useState(false);

    useHandleSyncOnLoginOrSignUp(syncStateObj, setShowModal);
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

    const closeModal = () => setShowModal(false);

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

            <SyncStateModal showModal={showModal} state={syncState} closeModal={closeModal} />
        </View>
    );
}

const SyncStateModal = ({ state, closeModal, showModal }: { state: ButtonState; closeModal: () => void; showModal: boolean }) => {
    if (Platform.OS === "android") ExpoNavigationBar.setBackgroundColorAsync(colors.darkGray);

    const styles = StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center", position: "relative" },
        foo: { justifyContent: "center", alignItems: "center", gap: 20, width: "100%", padding: 20 },
        text: { textAlign: "center" },
    });

    return (
        <Modal
            animationType="fade"
            visible={showModal}
            onRequestClose={undefined}
            presentationStyle={Platform.OS === "android" ? "overFullScreen" : "formSheet"}>
            <StatusBar backgroundColor={colors.background} barStyle="light-content" />
            <View style={styles.container}>
                {state === "loading" && (
                    <Animated.View style={styles.foo} entering={FadeInDown} exiting={FadeOutUp}>
                        <LoadingIcon />
                        <AppText style={styles.text} fontSize={24} children={"Fetching your trees from far away..."} />
                        <AppText style={styles.text} fontSize={24} children={"Depending on where you live"} />
                    </Animated.View>
                )}
                {state === "success" && (
                    <Animated.View style={styles.foo} entering={FadeInDown} exiting={FadeOutUp}>
                        <FontAwesome size={130} name="check" color={colors.green} />
                        <AppText style={styles.text} fontSize={24} children={"Success"} />
                    </Animated.View>
                )}
                {state === "error" && (
                    <Animated.View style={styles.foo} entering={FadeInDown} exiting={FadeOutUp}>
                        <SadFaceIcon height={100} width={100} />
                        <AppText style={styles.text} fontSize={24} children={"There was an error"} />
                        <Contact />
                        <AppButton onPress={closeModal} text={{ idle: "Close" }} style={{ width: 150 }} />
                    </Animated.View>
                )}
            </View>
        </Modal>
    );
};

export default Home;
