import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../reduxStore";

export type SyncSlice = {
    lastUpdateUTC_Timestamp: number;
    shouldSync: boolean;
    shouldWaitForClerkToLoad: boolean;
};

export const syncSliceInitialState: SyncSlice = {
    lastUpdateUTC_Timestamp: new Date().getTime(),
    shouldSync: false,
    shouldWaitForClerkToLoad: true,
};

export const syncSlice = createSlice({
    name: "syncSlice",
    initialState: syncSliceInitialState,
    reducers: {
        resetShouldSync: (state) => {
            state.shouldSync = false;
        },
        updateLastBackupTime: (state) => {
            state.lastUpdateUTC_Timestamp = new Date().getTime();
            state.shouldSync = false;
        },
        setShouldWaitForClerkToLoad: (state, action: PayloadAction<boolean>) => {
            state.shouldWaitForClerkToLoad = action.payload;
        },
    },
});

export const { resetShouldSync, updateLastBackupTime, setShouldWaitForClerkToLoad } = syncSlice.actions;

export default syncSlice.reducer;

export const selectSyncSlice = (state: RootState) => state.sync;
