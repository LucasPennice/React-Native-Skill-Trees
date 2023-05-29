import { useCallback, useEffect, useState } from "react";
import { useAppSelector } from "./redux/reduxHooks";
import { selectTreeSlice } from "./redux/userTreesSlice";
import { Skill, Tree } from "./types";
import useCurrentTree from "./useCurrentTree";
import { insertNodeBasedOnDnDZone } from "./functions/mutateTree";
import { treeCompletedSkillPercentage } from "./functions/extractInformationFromTree";

function useTentativeNewTree() {
    const { selectedDndZone, newNode } = useAppSelector(selectTreeSlice);

    const currentTree = useCurrentTree();

    const [tentativeNewTree, setTentativeNewTree] = useState<Tree<Skill> | undefined>(undefined);

    const getTentativeNewTree = useCallback(() => {
        let result = selectedDndZone && currentTree && newNode ? insertNodeBasedOnDnDZone(selectedDndZone, currentTree, newNode) : undefined;

        if (result === undefined) return setTentativeNewTree(result);

        const treeSkillCompletion = treeCompletedSkillPercentage(result);

        if (treeSkillCompletion === 100) result = { ...result, data: { ...result.data, isCompleted: true } };
        if (treeSkillCompletion !== 100) result = { ...result, data: { ...result.data, isCompleted: false } };

        return setTentativeNewTree(result);
    }, [selectedDndZone, newNode, currentTree]);

    useEffect(() => {
        getTentativeNewTree();
    }, [getTentativeNewTree]);

    return tentativeNewTree;
}

export default useTentativeNewTree;
