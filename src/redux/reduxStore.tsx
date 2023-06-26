import { configureStore } from "@reduxjs/toolkit";
import canvasDisplaySettingsReducer from "./canvasDisplaySettingsSlice";
import currentTreeReducer from "./userTreesSlice";
import loginReducer from "./loginSlice";
import screenDimentionsReducer from "./screenDimentionsSlice";
import addTreeReducer from "./addTreeModalSlice";
import treeOptionsReducer from "./editTreeSlice";
import userReducer from "./userSlice";
import newNodeReducer from "./newNodeSlice";

export const store = configureStore({
    reducer: {
        login: loginReducer,
        canvasDisplaySettings: canvasDisplaySettingsReducer,
        currentTree: currentTreeReducer,
        screenDimentions: screenDimentionsReducer,
        addTree: addTreeReducer,
        treeOptions: treeOptionsReducer,
        user: userReducer,
        newNodes: newNodeReducer,
    },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
