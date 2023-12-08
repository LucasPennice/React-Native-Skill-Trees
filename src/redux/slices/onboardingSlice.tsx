import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../reduxStore";
import { addNodes } from "./nodesSlice";
import { addUserTrees } from "./userTreesSlice";
import { mixpanel } from "app/_layout";

enum OnboardingSteps {
    "CreateTree" = 0,
    "AddSkill" = 1,
    "LogIn/SignUp" = 2,
}

// Define a type for the slice state
export type OnboardignState = {
    currentStep: number;
};

// Define the initial state using that type
const initialState: OnboardignState = {
    currentStep: 0,
};

export const onboardingSlice = createSlice({
    name: "onboarding",
    initialState,
    reducers: {
        // skipToStep: (state, action: PayloadAction<OnboardingSteps>) => {
        //     state.currentStep = action.payload;
        // },
        // expandOnboardingMenu: (state) => {
        //     state.open = true;
        // },
        // closeOnboardingMenu: (state) => {
        //     state.open = false;
        // },
        // overwriteOnboardingSlice: (state, action: PayloadAction<OnboardignState>) => {
        //     state.complete = action.payload.complete;
        //     state.currentStep = action.payload.currentStep;
        //     state.open = action.payload.open;
        // },
    },
    extraReducers: (builder) => {
        builder.addCase(addUserTrees, (state, action) => {
            if (state.currentStep !== OnboardingSteps.CreateTree) return;

            state.currentStep = 1;
            mixpanel.track(`onboarding step 0 (Create Tree) complete`);
        });
        builder.addCase(addNodes, (state, action) => {
            if (state.currentStep === OnboardingSteps.AddSkill) state.currentStep = 2;
        });
    },
});

export const {} = onboardingSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectOnboarding = (state: RootState) => state.newOnboarding;

export default onboardingSlice.reducer;
