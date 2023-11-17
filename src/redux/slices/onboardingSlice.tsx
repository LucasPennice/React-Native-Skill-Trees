import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../reduxStore";
import { addUserTree } from "./userTreesSlice";
import { addNodes } from "./nodesSlice";

export enum OnboardingSteps {
    "CreateTree" = 0,
    "AddSkill" = 1,
    "PastSkills" = 2,
    "LogIn" = 3,
}

// Define a type for the slice state
export type OnboardignState = {
    currentStep: OnboardingSteps;
    complete: boolean;
    open: boolean;
};

// Define the initial state using that type
const initialState: OnboardignState = {
    complete: false,
    currentStep: 0,
    open: false,
};

export const onboardingSlice = createSlice({
    name: "logged",
    initialState,
    reducers: {
        completeOnboarding: (state) => {
            state.complete = true;
        },
        skipToStep: (state, action: PayloadAction<OnboardingSteps>) => {
            state.currentStep = action.payload;
        },
        expandOnboardingMenu: (state) => {
            state.open = true;
        },
        closeOnboardingMenu: (state) => {
            state.open = false;
        },
        overwriteOnboardingSlice: (state, action: PayloadAction<OnboardignState>) => {
            state.complete = action.payload.complete;
            state.currentStep = action.payload.currentStep;
            state.open = action.payload.open;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(addUserTree, (state, action) => {
            if (state.currentStep === OnboardingSteps.CreateTree) state.currentStep = 1;

            if (state.currentStep === OnboardingSteps.PastSkills) state.currentStep = 3;
        });
        builder.addCase(addNodes, (state, action) => {
            if (state.currentStep === OnboardingSteps.AddSkill) state.currentStep = 2;
        });
    },
});

export const { completeOnboarding, skipToStep, closeOnboardingMenu, expandOnboardingMenu, overwriteOnboardingSlice } = onboardingSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectOnboarding = (state: RootState) => state.onboarding;

export default onboardingSlice.reducer;
