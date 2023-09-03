import AppText from "@/components/AppText";
import TreeCard from "@/pages/myTrees/TreeCard";
import AddTreeModal from "@/pages/myTrees/modals/AddTreeModal";
import EditTreeModal from "@/pages/myTrees/modals/EditTreeModal";
import { colors } from "@/parameters";
import { useAppDispatch, useAppSelector } from "@/redux/reduxHooks";
import { open } from "@/redux/slices/addTreeModalSlice";
import { setTree } from "@/redux/slices/editTreeSlice";
import { changeTree, selectUserTrees } from "@/redux/slices/userTreesSlice";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect } from "react";
import { Alert } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { RoutesParams } from "routes";

function MyTrees() {
    const localParams = useLocalSearchParams();
    //@ts-ignore
    const { openNewTreeModal, editingTreeId }: { openNewTreeModal?: boolean; editingTreeId?: string } = localParams;
    //Redux Related
    const userTrees = useAppSelector(selectUserTrees);
    const dispatch = useAppDispatch();

    const doOpenNewTreeModal = useCallback(() => {
        if (openNewTreeModal) {
            dispatch(open());
            //@ts-ignore
            router.setParams({ openNewTreeModal: undefined } as RoutesParams["myTrees"]);
        }
    }, []);

    const openEditModal = useCallback(() => {
        if (editingTreeId) {
            const treeToEdit = userTrees.find((userTree) => userTree.treeId === editingTreeId);

            if (!treeToEdit) return Alert.alert("Could not find the tree");

            dispatch(setTree(treeToEdit));
            //@ts-ignore
            router.setParams({ editingTreeId: undefined } as RoutesParams["myTrees"]);
        }
    }, []);

    useEffect(() => {
        doOpenNewTreeModal();
    }, [doOpenNewTreeModal]);
    useEffect(() => {
        openEditModal();
    }, [openEditModal]);

    const factoryChangeTreeAndNavigateToViewingTree = (treeId: string) => () => {
        dispatch(changeTree(treeId));
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
                        return <TreeCard element={element} changeTreeAndNavigateToViewingTree={changeTreeAndNavigateToViewingTree} key={idx} />;
                    })}
            </ScrollView>

            <EditTreeModal />
            <AddTreeModal />
        </>
    );
}

export default MyTrees;
