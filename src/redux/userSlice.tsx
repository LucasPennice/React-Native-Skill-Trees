import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./reduxStore";

// Define a type for the slice state
type UserSlice = {
    userId: string;
};

// Define the initial state using that type
const initialState: UserSlice = {
    userId: "",
};

export type ModifiableNodeProperties = { name?: string; isCompleted?: boolean };

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        populateUserId: (state, action: PayloadAction<string>) => {
            state.userId = action.payload;
        },
    },
});

export const { populateUserId } = userSlice.actions;

export const selectUserSlice = (state: RootState) => state.user;
export const selectUserId = (state: RootState) => state.user.userId;

export default userSlice.reducer;
