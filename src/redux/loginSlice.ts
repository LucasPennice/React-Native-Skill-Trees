import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./reduxStore";

// Define a type for the slice state
type LoggedState = {
    isLogged: boolean;
    username?: string;
    email?: string;
};

// Define the initial state using that type
const initialState: LoggedState = {
    isLogged: false,
};

export const loggedSlice = createSlice({
    name: "logged",
    initialState,
    reducers: {
        login: (state) => {
            state.isLogged = true;
        },
        logout: (state) => {
            state.isLogged = false;
        },
        //Only to have an example of a working reducer with a payload
        setLoginInfo: (state, action: PayloadAction<boolean>) => {
            state.isLogged = action.payload;
        },
    },
});

export const { login, logout, setLoginInfo } = loggedSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectLoginInfo = (state: RootState) => state.login;

export default loggedSlice.reducer;
