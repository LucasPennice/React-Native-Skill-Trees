import AppButton from "@/components/AppButton";
import AppText from "@/components/AppText";
import TreeCard from "@/pages/myTrees/TreeCard";
import AddTreeModal from "@/pages/myTrees/modals/AddTreeModal";
import EditTreeModal from "@/pages/myTrees/modals/EditTreeModal";
import { colors } from "@/parameters";
import { useAppDispatch, useAppSelector } from "@/redux/reduxHooks";
import { open } from "@/redux/slices/addTreeModalSlice";
import { selectAllTrees } from "@/redux/slices/userTreesSlice";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { RoutesParams } from "routes";

function MyTrees() {
    const localParams = useLocalSearchParams();

    //@ts-ignore
    const { openNewTreeModal, editingTreeId: paramsEditingTreeId }: { openNewTreeModal?: boolean; editingTreeId?: string } = localParams;

    const [editingTreeId, setEditingTreeId] = useState<string | null>(null);
    //Redux Related
    const userTrees = useAppSelector(selectAllTrees);

    const dispatch = useAppDispatch();

    const doOpenNewTreeModal = useCallback(() => {
        if (openNewTreeModal) {
            dispatch(open());
            //@ts-ignore
            router.setParams({ openNewTreeModal: undefined } as RoutesParams["myTrees"]);
        }
    }, [localParams]);

    const openEditModal = useCallback(() => {
        if (paramsEditingTreeId) {
            setEditingTreeId(paramsEditingTreeId);
            //@ts-ignore
            router.setParams({ paramsEditingTreeId: undefined } as RoutesParams["myTrees"]);
        }
    }, []);

    useEffect(() => {
        doOpenNewTreeModal();
    }, [doOpenNewTreeModal]);
    useEffect(() => {
        openEditModal();
    }, [openEditModal]);

    const factoryChangeTreeAndNavigateToViewingTree = (treeId: string) => () => {
        //@ts-ignore
        router.push(`/myTrees/${treeId}`);
    };

    return (
        <View style={{ flex: 1, padding: 10 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <View style={{ justifyContent: "center" }}>
                    <AppText fontSize={18} children={"My Skill Trees"} />
                    <AppText style={{ color: `${colors.white}80` }} fontSize={14}>
                        Long Press to options menu
                    </AppText>
                </View>
                <AppButton
                    onPress={() => dispatch(open())}
                    text={{ idle: "New Skill Tree" }}
                    color={{ idle: colors.background }}
                    style={{ paddingHorizontal: 20, borderRadius: 15, backgroundColor: colors.background }}
                    textStyle={{ color: colors.accent }}
                />
            </View>
            <View style={{ flex: 1 }}>
                <ScrollView>
                    {userTrees.length > 0 &&
                        userTrees.map((element, idx) => {
                            const changeTreeAndNavigateToViewingTree = factoryChangeTreeAndNavigateToViewingTree(element.treeId ?? "");
                            return (
                                <TreeCard
                                    openEditTreeModal={setEditingTreeId}
                                    element={element}
                                    changeTreeAndNavigateToViewingTree={changeTreeAndNavigateToViewingTree}
                                    animationDelay={idx * 100}
                                    key={idx}
                                />
                            );
                        })}
                </ScrollView>
            </View>

            {editingTreeId && <EditTreeModal editingTreeId={editingTreeId} closeModal={() => setEditingTreeId(null)} />}

            <AddTreeModal />
        </View>
    );
}

export default MyTrees;
