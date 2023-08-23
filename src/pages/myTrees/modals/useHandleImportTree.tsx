import { Alert } from "react-native";
import { useAppDispatch, useAppSelector } from "../../../redux/reduxHooks";
import { saveNewTree, selectTreeSlice, updateUserTrees } from "../../../redux/slices/userTreesSlice";
import { Skill, Tree } from "../../../types";
import { selectSafeScreenDimentions } from "../../../redux/slices/screenDimentionsSlice";

function useHandleImportTree(treeToImport: Tree<Skill> | undefined, closeModal: () => void) {
    const { userTrees } = useAppSelector(selectTreeSlice);
    const screenDimensions = useAppSelector(selectSafeScreenDimentions);
    const dispatch = useAppDispatch();

    if (treeToImport === undefined)
        return () => {
            Alert.alert("No Tree Information");
            closeModal();
        };

    const overwriteTree = userTrees.find((userTree) => userTree.treeId === treeToImport.treeId);

    const updateUserTree = () => {
        dispatch(updateUserTrees({ updatedTree: treeToImport, screenDimensions }));
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
        dispatch(saveNewTree({ newTree: treeToImport, screenDimensions }));
        closeModal();
    };
}

export default useHandleImportTree;
