import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/reduxHooks";
import { clearNewNodeState } from "../../redux/newNodeSlice";
import { selectCurrentTree, selectTreeSlice, setSelectedNode } from "../../redux/userTreesSlice";

function useRunHomepageCleanup(setSelectedNodeHistory: (v: (string | null)[]) => void) {
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
        dispatch(clearNewNodeState());

        const hasTreeChanged = getHasTreeChanged(selectedTreeIdHistory);

        if (hasTreeChanged) {
            dispatch(setSelectedNode(null));
            setSelectedNodeHistory([]);
        }
    }, [selectedTreeIdHistory]);

    return getHasTreeChanged(selectedTreeIdHistory);
}

export default useRunHomepageCleanup;

function getHasTreeChanged(selectedTreeIdHistory: (string | null)[]) {
    const last = selectedTreeIdHistory.length - 1;

    const currentTreeId = selectedTreeIdHistory[last];
    const prevTreeId = selectedTreeIdHistory[last - 1];

    return currentTreeId !== prevTreeId;
}
