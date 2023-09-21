import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { FLUSH, PAUSE, PERSIST, PURGE, PersistConfig, PersistedState, REGISTER, REHYDRATE, persistReducer, persistStore } from "redux-persist";
import { migrationFunction } from "./migration";
import addTreeReducer from "./slices/addTreeModalSlice";
import canvasDisplaySettingsReducer from "./slices/canvasDisplaySettingsSlice";
import homeTreeSlice from "./slices/homeTreeSlice";
import loginReducer from "./slices/loginSlice";
import nodesSlice from "./slices/nodesSlice";
import screenDimentionsReducer from "./slices/screenDimentionsSlice";
import userReducer from "./slices/userSlice";
import newUserTreesSlice from "./slices/userTreesSlice";

const persistConfig: PersistConfig<any> = {
    key: "root",
    version: 1,
    storage: AsyncStorage,
    //@ts-ignore
    migrate: (state: PersistedState & RootState) => {
        try {
            return migrationFunction(state);
        } catch (error) {
            return Promise.resolve(state);
        }
    },
    blacklist: ["addTree"],
};

const rootReducer = combineReducers({
    login: loginReducer,
    canvasDisplaySettings: canvasDisplaySettingsReducer,
    // currentTree: toBeDepricatedCurrentTreeReducer,
    screenDimentions: screenDimentionsReducer,
    addTree: addTreeReducer,
    user: userReducer,
    userTrees: newUserTreesSlice,
    nodes: nodesSlice,
    homeTree: homeTreeSlice,
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

export type RootState = ReturnType<typeof rootReducer>;

export type AppDispatch = typeof store.dispatch;
