import { editTreeProperties } from "../../functions/mutateTree";
import { useAppDispatch, useAppSelector } from "../../redux/reduxHooks";
import { selectTreeSlice, updateUserTrees } from "../../redux/userTreesSlice";
import { Skill, Tree } from "../../types";

function useUpdateTreeWithNewSkillDetails(updatedSkill: Skill, nodeToUpdate: Tree<Skill>) {
    const { userTrees } = useAppSelector(selectTreeSlice);
    const dispatch = useAppDispatch();

    const updateSkillDetails = () => {
        const treeToEdit = userTrees.find((tree) => tree.treeId === nodeToUpdate.treeId);

        if (treeToEdit === undefined) throw "useUpdateTreeWithNewSkillDetails tree to edit is undefined";

        const newProperties = { ...nodeToUpdate, data: { ...updatedSkill } };

        const updatedTree = editTreeProperties(treeToEdit, nodeToUpdate, newProperties);

        if (updatedTree === undefined) throw "couldn't update tree useUpdateTreeWithNewSkillDetails";

        dispatch(updateUserTrees(updatedTree));

        console.log("parece andar");
    };

    return updateSkillDetails;
}

export default useUpdateTreeWithNewSkillDetails;
