import AppText from "@/components/AppText";
import PlusIcon from "@/components/Icons/PlusIcon";
import ShareIcon from "@/components/Icons/ShareIcon";
import { ProgressBar } from "@/components/ProgressBarAndIndicator";
import { countCompleteNodes } from "@/functions/extractInformationFromTree";
import TreeCard, { TreeCardProps } from "@/pages/myTrees/TreeCard";
import AddTreeModal from "@/pages/myTrees/modals/AddTreeModal";
import EditTreeModal from "@/pages/myTrees/modals/EditTreeModal";
import GenerateShareLinkModal from "@/pages/myTrees/modals/GenerateShareLinkModal";
import ImportTreesModal from "@/pages/myTrees/modals/ImportTreesModal";
import { colors } from "@/parameters";
import { useAppDispatch, useAppSelector } from "@/redux/reduxHooks";
import { open } from "@/redux/slices/addTreeModalSlice";
import { selectNodeById, selectNodesOfTree } from "@/redux/slices/nodesSlice";
import { TreeData, selectAllTrees, selectTotalTreeQty } from "@/redux/slices/userTreesSlice";
import { ColorGradient, NormalizedNode } from "@/types";
import useSubscriptionHandler from "@/useSubscriptionHandler";
import { useUser } from "@clerk/clerk-expo";
import { HandleAlertContext } from "app/_layout";
import { router, useLocalSearchParams } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { RoutesParams } from "routes";

const useHandleEditingTreeId = () => {
    const [editingTreeId, setEditingTreeId] = useState<string | null>(null);

    const closeEditTreeModal = () => setEditingTreeId(null);

    const editTree = (treeId: string) => setEditingTreeId(treeId);

    return { editingTreeId, editTree, closeEditTreeModal };
};

type HandleShareTreesHook = {
    selectionMode: boolean;
    cancelSelection: () => void;
    startSelectionMode: () => void;
    toggleSelection: (selectedTreeId: string) => void;
    selectedTreeIds: string[];
    generateLinkModal: boolean;
    closeGenerateLinkModal: () => void;
    openGenerateLinkModal: () => void;
};

const useHandleShareTrees = () => {
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedTreeIds, setSelectedTreeIds] = useState<string[]>([]);
    const [generateLinkModal, setGenerateLinkModal] = useState(false);
    const { isSignedIn } = useUser();

    const { open } = useContext(HandleAlertContext);

    const cancelSelection = () => {
        setSelectionMode(false);
        setSelectedTreeIds([]);
    };

    const navigateToSignUp = () => router.push("/(app)/auth/signUp");

    const startSelectionMode = () => {
        if (isSignedIn === undefined || isSignedIn === false)
            return open({
                title: "Create an account to share",
                state: "error",
                subtitle: "",
                buttonAction: navigateToSignUp,
                buttonText: "Sign Up",
            });
        setSelectionMode(true);
    };

    const toggleSelection = (selectedTreeId: string) => {
        setSelectedTreeIds((prev) => {
            if (prev.includes(selectedTreeId)) return prev.filter((treeId) => treeId !== selectedTreeId);

            return [...prev, selectedTreeId];
        });
    };

    const openGenerateLinkModal = () => setGenerateLinkModal(true);

    const closeGenerateLinkModal = () => {
        setGenerateLinkModal(false);
        cancelSelection();
    };

    return {
        selectionMode,
        cancelSelection,
        startSelectionMode,
        toggleSelection,
        selectedTreeIds,
        generateLinkModal,
        closeGenerateLinkModal,
        openGenerateLinkModal,
    };
};

const useHandleLocalParams = (editTree: (treeId: string) => void, openImportTreesModal: () => void) => {
    const localParams = useLocalSearchParams();
    const dispatch = useAppDispatch();
    const [importData, setImportData] = useState<{ userIdImport: string; treesToImportIds: string } | null>(null);

    useEffect(() => {
        const { openNewTreeModal, editingTreeId, treesToImportIds, userIdImport }: RoutesParams["myTrees"] = localParams;

        if (editingTreeId) {
            editTree(editingTreeId);
            return;
        }

        if (openNewTreeModal) {
            dispatch(open());
            return;
        }

        if (treesToImportIds && userIdImport) {
            openImportTreesModal();
            setImportData({ treesToImportIds, userIdImport });
            return;
        }
    }, [localParams]);

    return importData;
};

const useHandleImportTreesModal = () => {
    const [importTreesModal, setImportTreesModal] = useState(false);

    const closeImportTreesModal = () => setImportTreesModal(false);
    const openImportTreesModal = () => setImportTreesModal(true);

    return { importTreesModal, closeImportTreesModal, openImportTreesModal };
};

function MyTrees() {
    const { closeEditTreeModal, editTree, editingTreeId } = useHandleEditingTreeId();
    const { isProUser } = useSubscriptionHandler();

    const handleShareTrees = useHandleShareTrees();
    const { selectionMode, toggleSelection, selectedTreeIds, closeGenerateLinkModal, generateLinkModal } = handleShareTrees;

    const { closeImportTreesModal, importTreesModal, openImportTreesModal } = useHandleImportTreesModal();

    const importData = useHandleLocalParams(editTree, openImportTreesModal);
    const userTrees = useAppSelector(selectAllTrees);

    //@ts-ignore
    const navigateToTree = (treeId: string) => router.push(`/myTrees/${treeId}`);

    return (
        <View style={{ flex: 1, padding: 10 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <View style={{ justifyContent: "center" }}>
                    <AppText fontSize={18} children={"My Skill Trees"} />
                    <AppText style={{ color: `${colors.white}80` }} fontSize={14} children={"Long press for options"} />
                </View>
                <HeaderButtons handleShareTrees={handleShareTrees} />
            </View>
            <View style={{ flex: 1 }}>
                {true && (
                    // {isProUser === false && (
                    <RemainingFreeTrees />
                )}
                <ScrollView>
                    {userTrees.length > 0 &&
                        userTrees.map((element, idx) => {
                            const onPress = selectionMode ? toggleSelection : navigateToTree;
                            const selected = selectedTreeIds.includes(element.treeId);

                            return (
                                <TreeCardWrapper
                                    onLongPress={editTree}
                                    onPress={onPress}
                                    element={element}
                                    blockLongPress={selectionMode}
                                    animationDelay={idx * 100}
                                    key={idx}
                                    selected={selected}
                                />
                            );
                        })}
                </ScrollView>
            </View>

            {editingTreeId && <EditTreeModal editingTreeId={editingTreeId} closeModal={closeEditTreeModal} />}
            {generateLinkModal && <GenerateShareLinkModal closeModal={closeGenerateLinkModal} selectedTreeIds={selectedTreeIds} />}
            {importData && <ImportTreesModal open={importTreesModal} closeModal={closeImportTreesModal} data={importData} />}

            <AddTreeModal />
        </View>
    );
}

const TreeCardWrapper = ({
    element,
    onLongPress,
    onPress,
    animationDelay,
    blockLongPress,
    containerStyles,
    selected,
}: Omit<TreeCardProps<NormalizedNode>, "data"> & { element: TreeData }) => {
    const nodesOfTree = useAppSelector(selectNodesOfTree(element.treeId));
    const rootNodeOfTree = useAppSelector(selectNodeById(element.rootNodeId))!;
    const completedSkillsQty = countCompleteNodes(nodesOfTree);
    const skillsQty = nodesOfTree.length - 1;
    const completePercentage = skillsQty === 0 ? 0 : (completedSkillsQty / skillsQty) * 100;

    const data: TreeCardProps<NormalizedNode & { accentColor: ColorGradient }>["data"] = {
        tree: element,
        completionPercentage: completePercentage,
        nodeToDisplay: { ...rootNodeOfTree, accentColor: element.accentColor },
    };

    return (
        <TreeCard
            onLongPress={onLongPress}
            onPress={onPress}
            data={data}
            containerStyles={containerStyles}
            blockLongPress={blockLongPress}
            animationDelay={animationDelay}
            selected={selected}
        />
    );
};

const RemainingFreeTrees = () => {
    const style = StyleSheet.create({
        container: {
            backgroundColor: colors.clearGray,
            padding: 20,
            gap: 10,
            borderRadius: 10,
            marginBottom: 20,
        },
        header: { flexDirection: "row", justifyContent: "space-between", opacity: 0.8 },
    });

    const navigateToPaywall = () => router.push("/(app)/postOnboardingPaywall");

    const treeQty = useAppSelector(selectTotalTreeQty);

    const percentage = (treeQty / 3) * 100;
    const cappedPercentage = parseInt(percentage > 100 ? "100" : `${percentage}`);

    return (
        <TouchableOpacity style={style.container} onPress={navigateToPaywall}>
            <View style={style.header}>
                <AppText fontSize={18} children={"Skill Trees created"} />
                <AppText fontSize={18} children={`${treeQty} / 3`} />
            </View>

            <ProgressBar progress={cappedPercentage} colorGrading={[colors.yellow, colors.orange, colors.red]} />

            <View>
                <AppText fontSize={18} children={"Upgrade to add more"} style={{ textAlign: "right", color: colors.softPurle }} />
            </View>
        </TouchableOpacity>
    );
};

const HeaderButtons = ({ handleShareTrees }: { handleShareTrees: HandleShareTreesHook }) => {
    const { cancelSelection, selectionMode, startSelectionMode, selectedTreeIds, openGenerateLinkModal } = handleShareTrees;

    const dispatch = useAppDispatch();

    return (
        <View style={{ flexDirection: "row", gap: 5 }}>
            {!selectionMode && (
                <>
                    <StartShareModeButton onPress={startSelectionMode} />
                    <NewTreeButton onPress={() => dispatch(open())} />
                </>
            )}
            {selectionMode && (
                <>
                    <OpenShareModalButton onPress={openGenerateLinkModal} selectedQty={selectedTreeIds.length} />
                    <CancelShareButton onPress={cancelSelection} />
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 4,
        backgroundColor: colors.darkGray,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },
    pressable: { height: 45, justifyContent: "center" },
    text: { paddingTop: 0 },
});

const OpenShareModalButton = ({ onPress, selectedQty }: { onPress: () => void; selectedQty: number }) => {
    return (
        <TouchableOpacity style={styles.pressable} onPress={onPress} disabled={selectedQty === 0}>
            <View style={styles.container}>
                <ShareIcon width={12} height={12} fill={colors.accent} />
                <AppText children={`Share ${selectedQty}`} fontSize={14} style={[styles.text, { color: colors.accent }]} />
            </View>
        </TouchableOpacity>
    );
};

const CancelShareButton = ({ onPress }: { onPress: () => void }) => {
    return (
        <TouchableOpacity style={styles.pressable} onPress={onPress}>
            <View style={styles.container}>
                <AppText children={"Cancel"} fontSize={14} style={styles.text} />
            </View>
        </TouchableOpacity>
    );
};
const StartShareModeButton = ({ onPress }: { onPress: () => void }) => {
    return (
        <TouchableOpacity style={styles.pressable} onPress={onPress}>
            <View style={styles.container}>
                <ShareIcon width={12} height={12} fill={colors.white} />
                <AppText children={"Share"} fontSize={14} style={styles.text} />
            </View>
        </TouchableOpacity>
    );
};
const NewTreeButton = ({ onPress }: { onPress: () => void }) => {
    return (
        <TouchableOpacity style={styles.pressable} onPress={onPress}>
            <View style={styles.container}>
                <PlusIcon width={12} height={12} fill={colors.white} />
                <AppText children={"New"} fontSize={14} style={styles.text} />
            </View>
        </TouchableOpacity>
    );
};

export default MyTrees;
