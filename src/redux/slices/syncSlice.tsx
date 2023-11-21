import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../reduxStore";

export type SyncSlice = {
    lastUpdateUTC_Timestamp: number;
    localMutationsSinceBackups: boolean;
    shouldWaitForClerkToLoad: boolean;
};

export const syncSliceInitialState: SyncSlice = {
    lastUpdateUTC_Timestamp: new Date().getTime(),
    localMutationsSinceBackups: false,
    shouldWaitForClerkToLoad: true,
};

export const syncSlice = createSlice({
    name: "syncSlice",
    initialState: syncSliceInitialState,
    reducers: {
        resetLocalMutationsSinceBackups: (state) => {
            state.localMutationsSinceBackups = false;
        },
        updateLastBackupTime: (state) => {
            state.lastUpdateUTC_Timestamp = new Date().getTime();
            state.localMutationsSinceBackups = false;
        },
        setShouldWaitForClerkToLoad: (state, action: PayloadAction<boolean>) => {
            state.shouldWaitForClerkToLoad = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addMatcher(matchMutationReducers, (state, action) => {
            state.localMutationsSinceBackups = true;
        });
    },
});

export const { resetLocalMutationsSinceBackups, updateLastBackupTime, setShouldWaitForClerkToLoad } = syncSlice.actions;

export default syncSlice.reducer;

export const selectSyncSlice = (state: RootState) => state.sync;

const matchMutationReducers = (e: { payload: unknown; type: string }) => {
    if (e.type.includes("nodes") || e.type.includes("userTrees") || e.type.includes("homeTree") || e.type.includes("onboarding")) return true;

    return false;
};
