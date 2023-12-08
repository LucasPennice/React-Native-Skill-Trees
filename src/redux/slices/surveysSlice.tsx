import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../reduxStore";

// Define a type for the slice state
export type SurveySlice = {
    marketFitSurvey: boolean;
    onboardingExperience: boolean;
};

// Define the initial state using that type
const initialState: SurveySlice = {
    marketFitSurvey: false,
    onboardingExperience: false,
};

export const surveySlice = createSlice({
    name: "survey",
    initialState,
    reducers: {
        completeMarkeyFitSurvey: (state) => {
            state.marketFitSurvey = true;
        },
        completeOnboardingExperienceSurvey: (state) => {
            state.onboardingExperience = true;
        },
    },
});

export const { completeMarkeyFitSurvey, completeOnboardingExperienceSurvey } = surveySlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectSurveys = (state: RootState) => state.survey;

export default surveySlice.reducer;
