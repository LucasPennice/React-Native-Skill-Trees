import AppText from "@/components/AppText";
import PlusIcon from "@/components/Icons/PlusIcon";
import ShareIcon from "@/components/Icons/ShareIcon";
import TreeCard from "@/pages/myTrees/TreeCard";
import AddTreeModal from "@/pages/myTrees/modals/AddTreeModal";
import EditTreeModal from "@/pages/myTrees/modals/EditTreeModal";
import GenerateShareLinkModal from "@/pages/myTrees/modals/GenerateShareLinkModal";
import { colors } from "@/parameters";
import { useAppDispatch, useAppSelector } from "@/redux/reduxHooks";
import { open } from "@/redux/slices/addTreeModalSlice";
import { selectAllTrees } from "@/redux/slices/userTreesSlice";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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

    const cancelSelection = () => {
        setSelectionMode(false);
        setSelectedTreeIds([]);
    };

    const startSelectionMode = () => setSelectionMode(true);

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

const useHandleLocalParams = (editTree: (treeId: string) => void) => {
    const localParams = useLocalSearchParams();
    const dispatch = useAppDispatch();
    const { openNewTreeModal, editingTreeId }: { openNewTreeModal?: boolean; editingTreeId?: string } = localParams;

    const doOpenNewTreeModal = useCallback(() => {
        if (openNewTreeModal) {
            dispatch(open());

            const newParams: RoutesParams["myTrees"] = { openNewTreeModal: undefined };
            //@ts-ignore
            router.setParams(newParams);
        }
    }, [localParams]);

    const openEditModal = useCallback(() => {
        if (editingTreeId) {
            editTree(editingTreeId);

            const newParams: RoutesParams["myTrees"] = { editingTreeId: undefined };
            //@ts-ignore
            router.setParams(newParams);
        }
    }, [localParams]);

    useEffect(() => {
        doOpenNewTreeModal();
    }, [doOpenNewTreeModal]);

    useEffect(() => {
        openEditModal();
    }, [openEditModal]);
};

function MyTrees() {
    const { closeEditTreeModal, editTree, editingTreeId } = useHandleEditingTreeId();

    const handleShareTrees = useHandleShareTrees();
    const { selectionMode, toggleSelection, selectedTreeIds, closeGenerateLinkModal, generateLinkModal } = handleShareTrees;

    useHandleLocalParams(editTree);
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
                <ScrollView>
                    {userTrees.length > 0 &&
                        userTrees.map((element, idx) => {
                            const onPress = selectionMode ? toggleSelection : navigateToTree;
                            const selected = selectedTreeIds.includes(element.treeId);

                            return (
                                <TreeCard
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

            <AddTreeModal />
        </View>
    );
}

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
