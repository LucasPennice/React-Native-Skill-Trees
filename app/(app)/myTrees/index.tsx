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
    }, []);

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
        router.push(`/myTrees/${treeId}`);
    };

    return (
        <>
            <ScrollView style={{ backgroundColor: colors.background, flex: 1, paddingHorizontal: 10 }}>
                <AppText style={{ color: "#FFFFFF", fontFamily: "helveticaBold", marginBottom: 5 }} fontSize={32}>
                    My Skill Trees
                </AppText>
                <AppText style={{ color: colors.unmarkedText, marginBottom: 5 }} fontSize={16}>
                    Click a Skill Tree to access it
                </AppText>
                <AppText style={{ color: colors.unmarkedText, marginBottom: 20 }} fontSize={16}>
                    Long Press to options menu
                </AppText>

                {userTrees.length > 0 &&
                    userTrees.map((element, idx) => {
                        const changeTreeAndNavigateToViewingTree = factoryChangeTreeAndNavigateToViewingTree(element.treeId ?? "");
                        return (
                            <TreeCard
                                openEditTreeModal={setEditingTreeId}
                                element={element}
                                changeTreeAndNavigateToViewingTree={changeTreeAndNavigateToViewingTree}
                                key={idx}
                            />
                        );
                    })}
            </ScrollView>

            {editingTreeId && <EditTreeModal editingTreeId={editingTreeId} closeModal={() => setEditingTreeId(null)} />}
            <AddTreeModal />
        </>
    );
}

export default MyTrees;
