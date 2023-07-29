import { combineReducers, configureStore } from "@reduxjs/toolkit";
import canvasDisplaySettingsReducer from "./canvasDisplaySettingsSlice";
import currentTreeReducer from "./userTreesSlice";
import loginReducer from "./loginSlice";
import screenDimentionsReducer from "./screenDimentionsSlice";
import addTreeReducer from "./addTreeModalSlice";
import treeOptionsReducer from "./editTreeSlice";
import userReducer from "./userSlice";
import newNodeReducer from "./newNodeSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";

const persistConfig = {
    key: "root",
    version: 1,
    storage: AsyncStorage,
};

const rootReducer = combineReducers({
    login: loginReducer,
    canvasDisplaySettings: canvasDisplaySettingsReducer,
    currentTree: currentTreeReducer,
    screenDimentions: screenDimentionsReducer,
    addTree: addTreeReducer,
    treeOptions: treeOptionsReducer,
    user: userReducer,
    newNodes: newNodeReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export let persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
