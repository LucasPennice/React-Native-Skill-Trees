import { Alert } from "react-native";
import { useAppDispatch, useAppSelector } from "../../../redux/reduxHooks";
import { appendToUserTree, selectTreeSlice, updateUserTrees } from "../../../redux/slices/userTreesSlice";
import { Skill, Tree } from "../../../types";

function useHandleImportTree(treeToImport: Tree<Skill> | undefined, closeModal: () => void) {
    const { userTrees } = useAppSelector(selectTreeSlice);
    const dispatch = useAppDispatch();

    if (treeToImport === undefined)
        return () => {
            Alert.alert("No Tree Information");
            closeModal();
        };

    const overwriteTree = userTrees.find((userTree) => userTree.treeId === treeToImport.treeId);

    const updateUserTree = () => {
        dispatch(updateUserTrees(treeToImport));
        closeModal();
    };

    if (overwriteTree !== undefined)
        return () => {
            Alert.alert(
                `Importing this tree will overwrite your local ${overwriteTree.treeName} tree`,
                "Are you sure you want to continue?",
                [
                    { text: "No", style: "cancel" },
                    { text: "Yes", onPress: updateUserTree, style: "destructive" },
                ],
                { cancelable: true }
            );
        };

    return () => {
        dispatch(appendToUserTree(treeToImport));
        closeModal();
    };
}

export default useHandleImportTree;
