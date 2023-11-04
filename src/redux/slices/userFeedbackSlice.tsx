import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "./../reduxStore";

export type DataAndDate = { data: string; date: string };
export type UserFeedback = {
    problems: DataAndDate[];
    mainObstacle: DataAndDate[];
    suggestedFeatures: DataAndDate[];
    dislikes: DataAndDate[];
    currentSolution: DataAndDate[];
    whyIsItHard: DataAndDate[];
    reasonToSolveProblem: DataAndDate[];
};

// Define the initial state using that type
const initialState: UserFeedback = {
    dislikes: [],
    mainObstacle: [],
    problems: [],
    suggestedFeatures: [],
    currentSolution: [],
    whyIsItHard: [],
    reasonToSolveProblem: [],
};

export const userFeedbackSlice = createSlice({
    name: "userFeedback",
    initialState,
    reducers: {
        appendNewEntry: (state, action: PayloadAction<{ keyToUpdate: keyof UserFeedback; newEntry: DataAndDate }>) => {
            const updatedFeedback = [
                ...state[action.payload.keyToUpdate],
                { data: action.payload.newEntry.data, date: action.payload.newEntry.data.toString() },
            ];

            state[action.payload.keyToUpdate] = updatedFeedback;
        },
        initializeFeedbackArrays: (state) => {
            if (state.currentSolution === undefined) state.currentSolution = [];
            if (state.dislikes === undefined) state.dislikes = [];
            if (state.mainObstacle === undefined) state.mainObstacle = [];
            if (state.problems === undefined) state.problems = [];
            if (state.reasonToSolveProblem === undefined) state.reasonToSolveProblem = [];
            if (state.suggestedFeatures === undefined) state.suggestedFeatures = [];
            if (state.whyIsItHard === undefined) state.whyIsItHard = [];
        },
    },
});

export const { appendNewEntry, initializeFeedbackArrays } = userFeedbackSlice.actions;

export const selectUserFeedbackSlice = (state: RootState) => state.userFeedback;

export default userFeedbackSlice.reducer;
