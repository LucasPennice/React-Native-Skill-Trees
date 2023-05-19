import { findNodeById } from "../../functions/extractInformationFromTree";
import { useAppSelector } from "../../redux/reduxHooks";
import { selectTreeSlice } from "../../redux/userTreesSlice";
import { Skill, Tree } from "../../types";

function useCheckForUnsavedChanges(updatedSkill: Skill, nodeToUpdate: Tree<Skill>) {
    const { userTrees } = useAppSelector(selectTreeSlice);

    const treeToEdit = userTrees.find((tree) => tree.treeId === nodeToUpdate.treeId);

    if (treeToEdit === undefined) throw "useCheckForUnsavedChanges tree to edit is undefined";

    const node = findNodeById(treeToEdit, nodeToUpdate.nodeId);

    if (node === undefined) throw "useCheckForUnsavedChanges node undefined";

    return JSON.stringify(node.data) !== JSON.stringify(updatedSkill);
}

export default useCheckForUnsavedChanges;
