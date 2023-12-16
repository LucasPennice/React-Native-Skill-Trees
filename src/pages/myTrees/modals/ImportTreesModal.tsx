import AppText from "@/components/AppText";
import FlingToDismissModal from "@/components/FlingToDismissModal";
import PlusIcon from "@/components/Icons/PlusIcon";
import LoadingIcon from "@/components/LoadingIcon";
import { handlePurchase } from "@/components/subscription/functions";
import { dictionaryToArray } from "@/functions/extractInformationFromTree";
import { colors } from "@/parameters";
import { useAppDispatch, useAppSelector } from "@/redux/reduxHooks";
import { TreeData, importUserTrees, removeUserTrees, selectTotalTreeQty, selectTreeIds } from "@/redux/slices/userTreesSlice";
import { ColorGradient, NormalizedNode } from "@/types";
import useSubscriptionHandler from "@/useSubscriptionHandler";
import { Dictionary } from "@reduxjs/toolkit";
import { HandleAlertContext, mixpanel } from "app/_layout";
import axiosClient from "axiosClient";
import { useCallback, useContext, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { batch } from "react-redux";
import TreeCard, { TreeCardProps } from "../TreeCard";

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center" },
    flex1: { flex: 1 },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 4,
        backgroundColor: colors.darkGray,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },
    pressable: { height: 45, justifyContent: "center" },
});

type ImportTreeResponse = { treesFound: Dictionary<TreeData>; treesNotFound: string[]; nodesToImport: Dictionary<NormalizedNode> };

const useHandleTreesToImport = () => {
    const [importTreeResponse, setImportTreeResponse] = useState<ImportTreeResponse | null>(null);
    const [mode, setMode] = useState<"Fetching" | "ShowTreesToImport">("Fetching");

    const showTreesToImport = (v: ImportTreeResponse) => {
        setMode("ShowTreesToImport");
        setImportTreeResponse(v);
    };

    return { mode, showTreesToImport, importTreeResponse };
};

function ImportTreesModal({
    closeModal,
    open,
    data,
}: {
    open: boolean;
    closeModal: () => void;
    data: { userIdImport: string; treesToImportIds: string };
}) {
    const { importTreeResponse, mode, showTreesToImport } = useHandleTreesToImport();

    const { isProUser, currentOffering } = useSubscriptionHandler();

    const formattedTreesToImportIds = `[${data.treesToImportIds
        .split(",")
        .map((id) => `"${id}"`)
        .join(",")}]`;

    const getTreesToImport = () => axiosClient.get<ImportTreeResponse>(`backup/${data.userIdImport}?treesToImportIds=${formattedTreesToImportIds}`);

    useEffect(() => {
        if (open === false) return;
        if (isProUser === null) return;
        if (currentOffering === null) return;

        (async () => {
            try {
                const { data: response } = await getTreesToImport();
                showTreesToImport(response);
            } catch (error) {
                Alert.alert("There was an error importing your trees", "Please contact the developer");
                mixpanel.track(`CRASH`, { message: error, stack: error });
                closeModal();
            }
        })();
    }, [open, isProUser, currentOffering]);

    return (
        <FlingToDismissModal closeModal={closeModal} open={open}>
            <>
                {mode === "Fetching" && <Fetching />}
                {mode === "ShowTreesToImport" && importTreeResponse !== null && (
                    <ShowTreesToImport importTreeResponse={importTreeResponse} closeModal={closeModal} />
                )}
            </>
        </FlingToDismissModal>
    );
}

const ImportTreesButton = ({ onPress, selectedQty }: { onPress: () => void; selectedQty: number }) => {
    return (
        <TouchableOpacity style={styles.pressable} onPress={onPress} disabled={selectedQty === 0}>
            <View style={styles.buttonContainer}>
                <PlusIcon width={12} height={12} fill={colors.accent} />
                <AppText children={`Import ${selectedQty}`} fontSize={14} style={{ color: colors.accent }} />
            </View>
        </TouchableOpacity>
    );
};

const useHandleSelectTreesToImport = () => {
    const [selectedTreeIds, setSelectedTreeIds] = useState<string[]>([]);

    const treeQty = useAppSelector(selectTotalTreeQty);
    const { isProUser, currentOffering } = useSubscriptionHandler();
    const { open, close } = useContext(HandleAlertContext);

    const cancelSelection = () => setSelectedTreeIds([]);

    const openCongratulationMessage = () => {
        open({ state: "success", subtitle: "To check your membership details visit your profile", title: "Congratulations" });
    };

    const annualPackage = currentOffering?.availablePackages.find((p) => p.packageType === "ANNUAL");

    const purchase = useCallback(() => {
        if (currentOffering === null) return;

        handlePurchase(
            currentOffering.availablePackages.find((p) => p.packageType === "ANNUAL")!,
            close,
            openCongratulationMessage,
            `PAYWALL Tree Limit On Import Subscription <1.0>`
        )();
    }, [currentOffering]);

    const toggleSelection = useCallback(
        (selectedTreeId: string) => {
            if (isProUser === null) return;

            setSelectedTreeIds((prev) => {
                const addingTreeCase = !prev.includes(selectedTreeId);

                const block = isProUser === false && treeQty + prev.length + 1 > 3;

                console.log(treeQty, prev.length);

                if (addingTreeCase) {
                    if (!block) return [...prev, selectedTreeId];

                    if (annualPackage)
                        open({
                            title: `Unlimited trees for only ${annualPackage.product.priceString} per year`,
                            subtitle: `Only ${annualPackage.product.currencyCode} ${(annualPackage.product.price / 12)
                                .toFixed(2)
                                .replace(".", ",")} per month, billed annually`,
                            state: "success",
                            buttonAction: purchase,
                            buttonText: "Start your 7 days free trial",
                        });

                    return prev;
                }

                return prev.filter((treeId) => treeId !== selectedTreeId);
            });
        },
        [isProUser, treeQty, selectTreeIds, annualPackage]
    );

    return { cancelSelection, toggleSelection, selectedTreeIds };
};

const ShowTreesToImport = ({ importTreeResponse, closeModal }: { importTreeResponse: ImportTreeResponse; closeModal: () => void }) => {
    const { treesFound, treesNotFound, nodesToImport } = importTreeResponse;

    const userTreeIds = useAppSelector(selectTreeIds);
    const dispatch = useAppDispatch();

    const treesFoundArray = dictionaryToArray(treesFound);
    const nodesToImportArray = dictionaryToArray(nodesToImport);

    const { selectedTreeIds, toggleSelection } = useHandleSelectTreesToImport();

    const handleImport = () => {
        //When a tree has to be overwritten instead of checking for differences I just delete the user tree and add the nodes again
        const treesToDelete = treesFoundArray.filter((t) => userTreeIds.includes(t.treeId));
        const treesToDeleteId = treesToDelete.map((t) => t.treeId);
        const nodesToDeleteId = treesToDelete.flatMap((t) => t.nodes);

        batch(() => {
            if (treesToDelete.length !== 0) dispatch(removeUserTrees({ nodes: nodesToDeleteId, treeIds: treesToDeleteId }));
            dispatch(importUserTrees({ trees: treesFoundArray, nodes: nodesToImportArray }));
        });

        closeModal();
    };

    return (
        <View style={styles.flex1}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <View>
                    <AppText children={"Select trees to import"} fontSize={18} />
                    <AppText children={"Outlined trees replace an existing tree"} style={{ color: `${colors.white}80` }} fontSize={14} />
                </View>
                <ImportTreesButton onPress={handleImport} selectedQty={selectedTreeIds.length} />
            </View>

            <View style={styles.flex1}>
                <ScrollView>
                    {treesFoundArray.map((element, idx) => {
                        const selected = selectedTreeIds.includes(element.treeId);
                        const overwrite = userTreeIds.includes(element.treeId);

                        const completedNodes = nodesToImportArray.reduce((accum, curr) => {
                            if (curr.treeId !== element.treeId) return accum;

                            if (curr.data.isCompleted === true) return accum + 1;

                            return accum;
                        }, 0);

                        const treeSkillNodes = element.nodes.length - 1;

                        const completionPercentage = treeSkillNodes === 0 ? 0 : (completedNodes / treeSkillNodes) * 100;

                        const rootNodeOfTree = nodesToImportArray.find((n) => n.nodeId === element.rootNodeId);

                        if (!rootNodeOfTree) throw new Error(`The root node is not included in nodes to import for tree ${element.treeId}`);

                        const data: TreeCardProps<NormalizedNode & { accentColor: ColorGradient }>["data"] = {
                            tree: element,
                            completionPercentage,
                            nodeToDisplay: { ...rootNodeOfTree, accentColor: element.accentColor },
                        };

                        return (
                            <TreeCard
                                containerStyles={overwrite ? { borderColor: `${colors.gold}80`, borderWidth: 1 } : undefined}
                                onLongPress={() => {}}
                                onPress={toggleSelection}
                                data={data}
                                blockLongPress={true}
                                key={idx}
                                selected={selected}
                            />
                        );
                    })}
                </ScrollView>
            </View>

            {treesNotFound.length !== 0 && (
                <AppText
                    children={`${treesNotFound.length} ${treesNotFound.length === 1 ? "tree" : "trees"} could not be found`}
                    fontSize={14}
                    style={{ color: colors.pink }}
                />
            )}
        </View>
    );
};

const Fetching = () => {
    return (
        <View style={styles.container}>
            <LoadingIcon />
            <AppText children={"Fetching trees..."} fontSize={24} style={{ marginVertical: 20, textAlign: "center" }} />
        </View>
    );
};

export default ImportTreesModal;
