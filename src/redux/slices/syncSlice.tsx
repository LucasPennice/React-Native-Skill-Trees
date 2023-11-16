import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../reduxStore";

export type SyncSlice = {
    lastUpdateUTC_Timestamp: number;
    shouldSync: boolean;
};

export const syncSliceInitialState: SyncSlice = {
    lastUpdateUTC_Timestamp: new Date().getTime(),
    shouldSync: false,
};

export const syncSlice = createSlice({
    name: "syncSlice",
    initialState: syncSliceInitialState,
    reducers: {
        resetShouldSync: (state) => {
            state.shouldSync = false;
        },
        updateShouldSync: (state) => {
            state.lastUpdateUTC_Timestamp = new Date().getTime();
            state.shouldSync = false;
        },
    },
});

export const { resetShouldSync, updateShouldSync } = syncSlice.actions;

export default syncSlice.reducer;

export const selectSyncSlice = (state: RootState) => state.sync;
