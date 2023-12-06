import { dayInMilliseconds } from "@/parameters";
import { useAppSelector } from "@/redux/reduxHooks";
import { selectSyncSlice } from "@/redux/slices/syncSlice";
import useUpdateBackup from "@/useUpdateBackup";
import { useEffect, useRef, useState } from "react";
import { Alert, AppState } from "react-native";

const useRunDailyBackup = (isSignedIn: boolean | undefined) => {
    const { localMutationsSinceBackups, lastUpdateUTC_Timestamp } = useAppSelector(selectSyncSlice);

    const appState = useRef(AppState.currentState);
    const [appStateVisible, setAppStateVisible] = useState(appState.current);

    useEffect(() => {
        const subscription = AppState.addEventListener("change", (nextAppState) => {
            appState.current = nextAppState;
            setAppStateVisible(appState.current);
        });

        return () => {
            subscription.remove();
        };
    }, []);

    const { handleUserBackup } = useUpdateBackup();

    useEffect(() => {
        (async () => {
            const dayOrMoreSinceLastBackup = new Date().getTime() - lastUpdateUTC_Timestamp >= dayInMilliseconds;
            if (!(dayOrMoreSinceLastBackup && localMutationsSinceBackups)) return;
            if (!isSignedIn) return;

            if (appStateVisible !== "active") return;

            try {
                await handleUserBackup();
            } catch (error) {
                Alert.alert("Error creating a backup", `Please contact the developer ${error}`);
            }
        })();
    }, [appStateVisible, isSignedIn]);
};

export default useRunDailyBackup;
