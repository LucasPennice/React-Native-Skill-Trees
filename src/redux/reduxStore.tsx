import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { FLUSH, PAUSE, PERSIST, PURGE, PersistConfig, REGISTER, REHYDRATE, persistReducer, persistStore } from "redux-persist";
import addTreeReducer from "./slices/addTreeModalSlice";
import canvasDisplaySettingsReducer from "./slices/canvasDisplaySettingsSlice";
import treeOptionsReducer from "./slices/editTreeSlice";
import loginReducer from "./slices/loginSlice";
import newUserTreesSlice, { UserTreeSlice } from "./slices/newUserTreesSlice";
import nodesSlice, { NodeSlice } from "./slices/nodesSlice";
import screenDimentionsReducer from "./slices/screenDimentionsSlice";
import userReducer from "./slices/userSlice";
import toBeDepricatedCurrentTreeReducer, { UserTreesSlice } from "./slices/userTreesSlice";
import { Skill, Tree } from "@/types";

const persistConfig: PersistConfig<any> = {
    key: "root",
    version: 1,
    storage: AsyncStorage,
    //@ts-ignore
    migrate: (state) => {
        try {
            //@ts-ignore
            const nodesSliceEmpty = state.nodes.ids[0] === null;
            //@ts-ignore
            const userTreesSliceEmpty = state.userTrees.ids[0] === null;

            if (nodesSliceEmpty || userTreesSliceEmpty) {
                //@ts-ignore
                const migratedState = migrationFunction(state.currentTree.userTrees);

                //ESTO deberia migrar al nuevo formato de data normalizado
                // y despues borrar la data vieja
                return Promise.resolve({
                    ...state,
                    nodes: migratedState.nodeState,
                    userTrees: migratedState.userTrees,
                });
            }

            return Promise.resolve(state);
        } catch (error) {
            return Promise.resolve(state);
        }
    },
    blacklist: ["addTree", "treeOptions"],
};

const rootReducer = combineReducers({
    login: loginReducer,
    canvasDisplaySettings: canvasDisplaySettingsReducer,
    currentTree: toBeDepricatedCurrentTreeReducer,
    screenDimentions: screenDimentionsReducer,
    addTree: addTreeReducer,
    treeOptions: treeOptionsReducer,
    user: userReducer,
    userTrees: newUserTreesSlice,
    nodes: nodesSlice,
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

function migrationFunction(userTrees: UserTreesSlice["userTrees"]) {
    let result: { nodeState: NodeSlice; userTrees: UserTreeSlice } = { nodeState: { entities: {}, ids: [] }, userTrees: { entities: {}, ids: [] } };

    for (const userTree of userTrees) {
        createTreeDataEntity(userTree);

        result.userTrees.ids.push(userTree.treeId);

        runFnOnEveryNode(userTree, (node: Tree<Skill>) => {
            createNodeEntity(node);

            result.nodeState.ids.push(node.nodeId);

            result.userTrees.entities[node.treeId]!.nodes.push(node.nodeId);
        });
    }

    return result;

    function createNodeEntity(node: Tree<Skill>) {
        result.nodeState.entities[node.nodeId] = {
            category: node.category,
            data: node.data,
            isRoot: node.isRoot,
            level: node.level,
            nodeId: node.nodeId,
            parentId: node.parentId,
            treeId: node.treeId,
            x: node.x,
            y: node.y,
            childrenIds: node.children.map((node) => node.nodeId),
        };
    }

    function runFnOnEveryNode(rootNode: Tree<Skill>, fn: (value: Tree<Skill>) => void) {
        //Base case 👇

        if (!rootNode.children.length) return fn(rootNode);

        //Recursive case 👇

        for (let i = 0; i < rootNode.children.length; i++) {
            runFnOnEveryNode(rootNode.children[i], fn);
        }

        return fn(rootNode);
    }

    function createTreeDataEntity(userTree: Tree<Skill>) {
        result.userTrees.entities[userTree.treeId] = {
            icon: userTree.data.icon,
            accentColor: userTree.accentColor,
            // //We don't add the root node id here because we will do so when iterating over each user tree
            nodes: [],
            rootNodeId: userTree.nodeId,
            treeId: userTree.treeId,
            treeName: userTree.treeName,
        };
    }
}
