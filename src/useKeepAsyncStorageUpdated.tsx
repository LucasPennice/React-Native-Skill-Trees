import { useEffect } from "react";
import { useAppSelector } from "./redux/reduxHooks";
import { selectTreeSlice } from "./redux/currentTreeSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";

function useKeepAsyncStorageUpdated() {
    const { userTrees } = useAppSelector(selectTreeSlice);

    useEffect(() => {
        if (userTrees.length === 0) return;

        (async () => {
            const userTreesInMemory = await AsyncStorage.getItem("@roadmaps");
            const stringUserTreesInMemory = JSON.stringify(userTreesInMemory);
            const stringUserTrees = JSON.stringify(userTrees);

            if (stringUserTreesInMemory !== stringUserTrees) {
                AsyncStorage.setItem("@roadmaps", stringUserTrees);
            }
        })();
    }, [userTrees]);
}

export default useKeepAsyncStorageUpdated;
