import { configureStore } from "@reduxjs/toolkit";
import canvasDisplaySettingsReducer from "./canvasDisplaySettingsSlice";
import currentTreeReducer from "./currentTreeSlice";
import loginReducer from "./loginSlice";
import screenDimentionsReducer from "./screenDimentionsSlice";

export const store = configureStore({
    reducer: {
        login: loginReducer,
        canvasDisplaySettings: canvasDisplaySettingsReducer,
        currentTree: currentTreeReducer,
        screenDimentions: screenDimentionsReducer,
    },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
