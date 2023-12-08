import { generateMongoCompliantId } from "@/functions/misc";
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
import { MigrationConfig } from "redux-persist/es/createMigrate";
import { migrationFunction } from "./migration";
import addTreeReducer from "./slices/addTreeModalSlice";
import canvasDisplaySettingsReducer from "./slices/canvasDisplaySettingsSlice";
import homeTreeSlice from "./slices/homeTreeSlice";
import nodesSlice from "./slices/nodesSlice";
import onboardingSlice from "./slices/onboardingSlice";
import screenDimentionsReducer from "./slices/screenDimentionsSlice";
import surveysSlice from "./slices/surveysSlice";
import syncSlice from "./slices/syncSlice";
import userFeedbackSlice from "./slices/userFeedbackSlice";
import userTreesSlice from "./slices/userTreesSlice";

const migration: MigrationManifest = {
    //@ts-ignore
    2: (state) => {
        //@ts-ignore
        const result = migrationFunction(state);
        return result;
    },
    //@ts-ignore
    3: (state) => {
        let updatedState = { ...state };
        //@ts-ignore
        const newID = generateMongoCompliantId();
        //@ts-ignore
        updatedState["user"] = { userId: newID };
        return updatedState;
    },
    //@ts-ignore
    4: (state) => {
        let updatedState = { ...state };
        //@ts-ignore
        updatedState["userFeedback"] = { ...updatedState["userFeedback"], currentSolution: [], whyIsItHard: [], reasonToSolveProblem: [] };
        return updatedState;
    },
};

const persistConfig: PersistConfig<any> = {
    key: "root",
    version: 4,
    storage: AsyncStorage,
    migrate: createMigrate(migration, { debug: false } as MigrationConfig),
    blacklist: ["addTree"],
};

const rootReducer = combineReducers({
    canvasDisplaySettings: canvasDisplaySettingsReducer,
    screenDimentions: screenDimentionsReducer,
    addTree: addTreeReducer,
    userTrees: userTreesSlice,
    nodes: nodesSlice,
    homeTree: homeTreeSlice,
    sync: syncSlice,
    userFeedback: userFeedbackSlice,
    onboarding: onboardingSlice,
    survey: surveysSlice,
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
