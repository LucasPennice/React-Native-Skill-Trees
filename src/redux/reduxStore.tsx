import { combineReducers, configureStore } from "@reduxjs/toolkit";
import canvasDisplaySettingsReducer from "./slices/canvasDisplaySettingsSlice";
import currentTreeReducer from "./slices/userTreesSlice";
import loginReducer from "./slices/loginSlice";
import screenDimentionsReducer from "./slices/screenDimentionsSlice";
import addTreeReducer from "./slices/addTreeModalSlice";
import treeOptionsReducer from "./slices/editTreeSlice";
import userReducer from "./slices/userSlice";
import newNodeReducer from "./slices/newNodeSlice";
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
