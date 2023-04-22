import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/reduxHooks";
import { selectTreeSlice, setSelectedNode } from "../../redux/userTreesSlice";

function useRunHomepageCleanup() {
    //Redux Related
    const { currentTreeId } = useAppSelector(selectTreeSlice);
    const dispatch = useAppDispatch();
    //

    useEffect(() => {
        dispatch(setSelectedNode(null));
    }, [currentTreeId]);
}

export default useRunHomepageCleanup;
