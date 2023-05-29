import { useCallback, useEffect, useState } from "react";
import { useAppSelector } from "./redux/reduxHooks";
import { selectTreeSlice } from "./redux/userTreesSlice";
import { Skill, Tree } from "./types";

function useCurrentTree() {
    const { currentTreeId, userTrees } = useAppSelector(selectTreeSlice);

    const [selectedTree, setSelectedTree] = useState<Tree<Skill> | undefined>(undefined);

    const getSelectedTree = useCallback(() => {
        if (currentTreeId === undefined) return setSelectedTree(undefined);

        const tentativeCurrentTree = userTrees.find((t) => t.treeId === currentTreeId);

        if (tentativeCurrentTree !== undefined) return setSelectedTree(tentativeCurrentTree);

        return setSelectedTree(undefined);
    }, [currentTreeId, userTrees]);

    useEffect(() => {
        getSelectedTree();
    }, [getSelectedTree]);

    return selectedTree;
}

export default useCurrentTree;
