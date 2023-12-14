import { useUser } from "@clerk/clerk-expo";
import { UserBackup } from "app/(app)/home";
import { mixpanel } from "app/_layout";
import { useHandleButtonState } from "app/(app)/auth/signUp";
import axiosClient from "axiosClient";
import { useAppDispatch, useAppSelector } from "./redux/reduxHooks";
import { selectHomeTree } from "./redux/slices/homeTreeSlice";
import { selectAllNodeIds, selectNodesTable } from "./redux/slices/nodesSlice";
import { selectSyncSlice, updateLastBackupTime } from "./redux/slices/syncSlice";
import { selectAllTreesEntities, selectTreeIds } from "./redux/slices/userTreesSlice";
import useMongoCompliantUserId from "./useMongoCompliantUserId";

function useUpdateBackup() {
    const { setSubmitLoading, setSubmitError, submitState: backupState, setSubmitSuccess } = useHandleButtonState();

    const { isSignedIn } = useUser();

    const dispatch = useAppDispatch();

    const userId = useMongoCompliantUserId();
    const nodesTable = useAppSelector(selectNodesTable);
    const nodesIds = useAppSelector(selectAllNodeIds);
    const treesTable = useAppSelector(selectAllTreesEntities);
    const treesIds = useAppSelector(selectTreeIds);
    const homeTree = useAppSelector(selectHomeTree);
    const { lastUpdateUTC_Timestamp } = useAppSelector(selectSyncSlice);

    const updateBackup = async (userId: string, newUserBackup: UserBackup) => {
        if (!isSignedIn) return;

        setSubmitLoading();

        try {
            await axiosClient.patch(`backup/${userId}`, newUserBackup);

            dispatch(updateLastBackupTime());
            setSubmitSuccess();
        } catch (error) {
            setSubmitError();
            mixpanel.track(`CRASH`, { message: error, stack: error });
            throw new Error(`${error}`);
        }
    };

    const newUserBackup: UserBackup = {
        nodeSlice: { entities: nodesTable, ids: nodesIds },
        userTreesSlice: { entities: treesTable, ids: treesIds },
        homeTree,
        lastUpdateUTC_Timestamp,
    };

    const handleUserBackup = () => {
        return updateBackup(userId!, newUserBackup);
    };

    return { handleUserBackup, backupState };
}

export default useUpdateBackup;
