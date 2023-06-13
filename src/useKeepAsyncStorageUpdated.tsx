import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect } from "react";
import { selectCanvasDisplaySettings } from "./redux/canvasDisplaySettingsSlice";
import { useAppSelector } from "./redux/reduxHooks";
import { selectUserId } from "./redux/userSlice";
import { selectUserTrees } from "./redux/userTreesSlice";
import useIsFirstRender from "./useIsFirstRender";

function useKeepAsyncStorageUpdated() {
    const userTrees = useAppSelector(selectUserTrees);
    const userId = useAppSelector(selectUserId);
    const canvasDisplaySettings = useAppSelector(selectCanvasDisplaySettings);

    const isFirstRender = useIsFirstRender();

    const keepUserTreesUpdated = useCallback(async () => {
        if (isFirstRender) return;

        const userTreesInMemory = await AsyncStorage.getItem("@roadmaps");
        const stringUserTreesInMemory = JSON.stringify(userTreesInMemory);
        const stringUserTrees = JSON.stringify(userTrees);

        if (stringUserTreesInMemory !== stringUserTrees) {
            AsyncStorage.setItem("@roadmaps", stringUserTrees);
        }
    }, [userTrees]);

    useEffect(() => {
        keepUserTreesUpdated();
    }, [keepUserTreesUpdated]);

    const keepCanvasDisplaySettingsUpdated = useCallback(async () => {
        if (isFirstRender) return;

        const canvasDisplaySettingsInMemory = await AsyncStorage.getItem("@canvasDisplaySettings");
        const stringCanvasSettingInMemory = JSON.stringify(canvasDisplaySettingsInMemory);
        const stringCanvasSetting = JSON.stringify(canvasDisplaySettings);

        if (stringCanvasSettingInMemory !== stringCanvasSetting) {
            AsyncStorage.setItem("@canvasDisplaySettings", stringCanvasSetting);
        }
    }, [canvasDisplaySettings]);

    useEffect(() => {
        keepCanvasDisplaySettingsUpdated();
    }, [keepCanvasDisplaySettingsUpdated]);

    const keepUserIdUpdated = useCallback(() => {
        if (userId === "") return;

        AsyncStorage.setItem("@userId", userId);
    }, [userId]);

    useEffect(() => {
        keepUserIdUpdated();
    }, [keepUserIdUpdated]);
}

export default useKeepAsyncStorageUpdated;
