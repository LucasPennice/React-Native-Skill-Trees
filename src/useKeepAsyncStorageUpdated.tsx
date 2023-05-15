import { useEffect, useState } from "react";
import { useAppSelector } from "./redux/reduxHooks";
import { selectTreeSlice } from "./redux/userTreesSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { selectCanvasDisplaySettings } from "./redux/canvasDisplaySettingsSlice";
import useIsFirstRender from "./useIsFirstRender";

function useKeepAsyncStorageUpdated() {
    const { userTrees } = useAppSelector(selectTreeSlice);
    const canvasDisplaySettings = useAppSelector(selectCanvasDisplaySettings);

    const isFirstRender = useIsFirstRender();

    useEffect(() => {
        if (isFirstRender) return;

        (async () => {
            const userTreesInMemory = await AsyncStorage.getItem("@roadmaps");
            const stringUserTreesInMemory = JSON.stringify(userTreesInMemory);
            const stringUserTrees = JSON.stringify(userTrees);

            if (stringUserTreesInMemory !== stringUserTrees) {
                AsyncStorage.setItem("@roadmaps", stringUserTrees);
            }
        })();
    }, [userTrees]);

    useEffect(() => {
        if (isFirstRender) return;

        (async () => {
            const canvasDisplaySettingsInMemory = await AsyncStorage.getItem("@canvasDisplaySettings");
            const stringCanvasSettingInMemory = JSON.stringify(canvasDisplaySettingsInMemory);
            const stringCanvasSetting = JSON.stringify(canvasDisplaySettings);

            if (stringCanvasSettingInMemory !== stringCanvasSetting) {
                AsyncStorage.setItem("@canvasDisplaySettings", stringCanvasSetting);
            }
        })();
    }, [canvasDisplaySettings]);
}

export default useKeepAsyncStorageUpdated;
