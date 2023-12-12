import { addNodes } from "./nodesSlice";
import { addUserTrees } from "./userTreesSlice";
import { mixpanel } from "app/_layout";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../reduxStore";

export enum OnboardingSteps {
    "CreateTree" = 0,
    "AddSkill" = 1,
    "CustomizeHomeTree" = 2,
    "LogIn/SignUp" = 3,
}

export const LAST_ONBOARDING_STEP = 3;

// Define a type for the slice state
export type UserVariablesSlice = {
    marketFitSurvey: boolean;
    exitPaywallSurvey: boolean;
    onboardingExperience: boolean;
    launchVersion: { prev: string; current: string };
    nthAppOpen: number;
    onboardingStep: number;
};

// Define the initial state using that type
const initialState: UserVariablesSlice = {
    marketFitSurvey: false,
    exitPaywallSurvey: false,
    onboardingExperience: false,
    launchVersion: { prev: "foo", current: "doo" },
    nthAppOpen: 0,
    onboardingStep: 0,
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
        completeCustomizeHomeTree: (state) => {
            state.onboardingStep = 3;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(addUserTrees, (state, action) => {
            if (state.onboardingStep !== OnboardingSteps.CreateTree) return;

            state.onboardingStep = 1;
            mixpanel.track(`onboarding step 0 (Create Tree) complete`);
        });
        builder.addCase(addNodes, (state, action) => {
            if (state.onboardingStep === OnboardingSteps.AddSkill) state.onboardingStep = 2;
        });
    },
});

export const { completeMarkeyFitSurvey, completeCustomizeHomeTree, completeOnboardingExperienceSurvey, increaseAppOpenAccum, updateLaunchVersion } =
    userVariablesSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectUserVariables = (state: RootState) => state.userVariables;

export default userVariablesSlice.reducer;
