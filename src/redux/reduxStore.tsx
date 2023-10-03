import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
    FLUSH,
    MigrationManifest,
    PAUSE,
    PERSIST,
    PURGE,
    PersistConfig,
    REGISTER,
    REHYDRATE,
    createMigrate,
    persistReducer,
    persistStore,
} from "redux-persist";
import { migrationFunction } from "./migration";
import addTreeReducer from "./slices/addTreeModalSlice";
import canvasDisplaySettingsReducer from "./slices/canvasDisplaySettingsSlice";
import homeTreeSlice from "./slices/homeTreeSlice";
import loginReducer from "./slices/loginSlice";
import nodesSlice from "./slices/nodesSlice";
import screenDimentionsReducer from "./slices/screenDimentionsSlice";
import userReducer from "./slices/userSlice";
import newUserTreesSlice from "./slices/userTreesSlice";
import { MigrationConfig } from "redux-persist/es/createMigrate";

const migration: MigrationManifest = {
    //@ts-ignore
    2: (state) => {
        //@ts-ignore
        const result = migrationFunction(state);
        return result;
    },
};

const persistConfig: PersistConfig<any> = {
    key: "root",
    version: 2,
    storage: AsyncStorage,
    migrate: createMigrate(migration, { debug: false } as MigrationConfig),
    blacklist: ["addTree"],
};

const rootReducer = combineReducers({
    login: loginReducer,
    canvasDisplaySettings: canvasDisplaySettingsReducer,
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
            immutableCheck: { warnAfter: 128 },
            serializableCheck: {
                warnAfter: 128,
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export let persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;

export type AppDispatch = typeof store.dispatch;
