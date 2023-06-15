import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useEffect } from "react";
import { Alert, ScrollView } from "react-native";
import { StackNavigatorParams } from "../../../App";
import AppText from "../../components/AppText";
import { colors } from "../../parameters";
import { open } from "../../redux/addTreeModalSlice";
import { setTree } from "../../redux/editTreeSlice";
import { useAppDispatch, useAppSelector } from "../../redux/reduxHooks";
import { changeTree, selectUserTrees } from "../../redux/userTreesSlice";
import TreeCard from "./TreeCard";
import AddTreeModal from "./modals/AddTreeModal";
import EditTreeModal from "./modals/EditTreeModal";

type Props = NativeStackScreenProps<StackNavigatorParams, "MyTrees">;

function MyTrees({ navigation, route }: Props) {
    const { params } = route;
    //Redux Related
    const userTrees = useAppSelector(selectUserTrees);
    const dispatch = useAppDispatch();

    const openNewTreeModal = useCallback(() => {
        if (params && params.openNewTreeModal) dispatch(open());
        //eslint-disable-next-line
    }, []);

    const openEditModal = useCallback(() => {
        if (params && params.editingTreeId) {
            const treeToEdit = userTrees.find((userTree) => userTree.treeId === params.editingTreeId);

            if (!treeToEdit) return Alert.alert("Could not find the tree");

            dispatch(setTree(treeToEdit));
        }
        //eslint-disable-next-line
    }, []);

    useEffect(() => {
        openNewTreeModal();
    }, [openNewTreeModal]);
    useEffect(() => {
        openEditModal();
    }, [openEditModal]);

    const factoryChangeTreeAndNavigateToViewingTree = (treeId: string) => () => {
        dispatch(changeTree(treeId));
        navigation.navigate("ViewingSkillTree");
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
// export default memo(MyTrees);
