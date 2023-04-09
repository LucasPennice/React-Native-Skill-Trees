import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/reduxHooks";
import { clearNewNodeState } from "../../redux/newNodeSlice";
import { selectCurrentTree, selectTreeSlice } from "../../redux/userTreesSlice";

function useRunHomepageCleanup(setSelectedNode: (v: string | null) => void, setSelectedNodeHistory: (v: (string | null)[]) => void) {
    //Redux Related
    const currentTree = useAppSelector(selectCurrentTree);
    const { currentTreeId } = useAppSelector(selectTreeSlice);
    const dispatch = useAppDispatch();
    //
    const [selectedTreeIdHistory, setSelectedTreeIdHistory] = useState<(null | string)[]>([null]);
    //

    useEffect(() => {
        //@ts-ignore
        setSelectedTreeIdHistory((p) => [...p, currentTreeId ? currentTreeId : null]);
    }, [currentTree]);

    useEffect(() => {
        const last = selectedTreeIdHistory.length - 1;

        const currentTreeId = selectedTreeIdHistory[last];
        const prevTreeId = selectedTreeIdHistory[last - 1];

        dispatch(clearNewNodeState());

        const hasTreeChanged = currentTreeId !== prevTreeId;

        if (hasTreeChanged) {
            setSelectedNode(null);
            setSelectedNodeHistory([]);
        }
    }, [selectedTreeIdHistory]);
}

export default useRunHomepageCleanup;
