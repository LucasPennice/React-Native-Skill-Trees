import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../reduxStore";

// Define a type for the slice state
export type UserVariablesSlice = {
    marketFitSurvey: boolean;
    onboardingExperience: boolean;
    launchVersion: { prev: string; current: string };
    nthAppOpen: number;
};

// Define the initial state using that type
const initialState: UserVariablesSlice = {
    marketFitSurvey: false,
    onboardingExperience: false,
    launchVersion: { prev: "foo", current: "doo" },
    nthAppOpen: 0,
};

export const userVariablesSlice = createSlice({
    name: "userVariables",
    initialState,
    reducers: {
        completeMarkeyFitSurvey: (state) => {
            state.marketFitSurvey = true;
        },
        completeOnboardingExperienceSurvey: (state) => {
            state.onboardingExperience = true;
        },
        increaseAppOpenAccum: (state) => {
            state.nthAppOpen = state.nthAppOpen + 1;
        },
        updateLaunchVersion: (state, action: PayloadAction<string>) => {
            if (state.launchVersion.current === action.payload) return;

            const newPrev = state.launchVersion.current;

            state.launchVersion = { current: action.payload, prev: newPrev };
        },
    },
});

export const { completeMarkeyFitSurvey, completeOnboardingExperienceSurvey, increaseAppOpenAccum, updateLaunchVersion } = userVariablesSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectUserVariables = (state: RootState) => state.userVariables;

export default userVariablesSlice.reducer;
