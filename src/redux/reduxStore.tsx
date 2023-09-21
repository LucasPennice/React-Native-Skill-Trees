import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { FLUSH, PAUSE, PERSIST, PURGE, PersistConfig, REGISTER, REHYDRATE, persistReducer, persistStore } from "redux-persist";
import addTreeReducer from "./slices/addTreeModalSlice";
import canvasDisplaySettingsReducer, { CanvasDisplaySettings } from "./slices/canvasDisplaySettingsSlice";
import loginReducer from "./slices/loginSlice";
import newUserTreesSlice, { UserTreeSlice } from "./slices/newUserTreesSlice";
import nodesSlice, { NodeSlice } from "./slices/nodesSlice";
import screenDimentionsReducer from "./slices/screenDimentionsSlice";
import userReducer from "./slices/userSlice";
import toBeDepricatedCurrentTreeReducer, { UserTreesSlice } from "./slices/userTreesSlice";
import { NormalizedNode, Skill, Tree, getDefaultSkillValue } from "@/types";
import homeTreeSlice, { HomeTreeSlice } from "./slices/homeTreeSlice";
import { HOMEPAGE_TREE_ID, HOMETREE_ROOT_ID, WHITE_GRADIENT } from "@/parameters";

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

            //@ts-ignore
            const migrateToHomeTreeSlice = shouldMigrateToHomeTree(state.homeTree);

            let updatedState = { ...state };

            if (nodesSliceEmpty || userTreesSliceEmpty) {
                const { nodeState, userTrees } = migrateFromCurrentTreeToNormalizedSlice(
                    //@ts-ignore
                    state.currentTree.userTrees,
                    //@ts-ignore
                    state.canvasDisplaySettings
                );

                //@ts-ignore
                updatedState[nodes] = nodeState;
                //@ts-ignore
                updatedState[userTrees] = userTrees;
                //@ts-ignore
                updatedState[currentTree] = undefined;
            }

            if (migrateToHomeTreeSlice) {
                //@ts-ignore
                updatedState[homeTree] = {
                    //@ts-ignore
                    accentColor: state.canvasDisplaySettings.homepageTreeColor,
                    //@ts-ignore
                    icon: { isEmoji: false, text: state.canvasDisplaySettings.homepageTreeIcon },
                    //@ts-ignore
                    treeName: state.canvasDisplaySettings.homepageTreeName,
                } as HomeTreeSlice;
            }
            return Promise.resolve(updatedState);
        } catch (error) {
            return Promise.resolve(state);
        }
    },
    blacklist: ["addTree"],
};

const rootReducer = combineReducers({
    login: loginReducer,
    canvasDisplaySettings: canvasDisplaySettingsReducer,
    currentTree: toBeDepricatedCurrentTreeReducer,
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

function migrateFromCurrentTreeToNormalizedSlice(userTrees: UserTreesSlice["userTrees"], canvasDisplaySettings: CanvasDisplaySettings) {
    let result: { nodeState: NodeSlice; userTrees: UserTreeSlice } = { nodeState: { entities: {}, ids: [] }, userTrees: { entities: {}, ids: [] } };

    addRootNodeEntity();

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

    function addRootNodeEntity() {
        const homepageRootNode: NormalizedNode = {
            nodeId: HOMETREE_ROOT_ID,
            isRoot: true,
            childrenIds: userTrees.map((uT) => uT.nodeId),
            data: getDefaultSkillValue(canvasDisplaySettings.homepageTreeName, false, {
                isEmoji: false,
                text: canvasDisplaySettings.homepageTreeName,
            }),
            level: 0,
            parentId: null,
            treeId: HOMEPAGE_TREE_ID,
            x: 0,
            y: 0,
            category: "USER",
        };

        result.nodeState.ids.push(HOMETREE_ROOT_ID);

        result.nodeState.entities[HOMETREE_ROOT_ID] = homepageRootNode;
    }

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

function shouldMigrateToHomeTree(homeTreeState?: HomeTreeSlice) {
    if (homeTreeState === undefined) return true;

    const doesHomeTreeHasDefaultValues =
        homeTreeState.accentColor === WHITE_GRADIENT &&
        homeTreeState.icon.text === "L" &&
        homeTreeState.icon.isEmoji === false &&
        homeTreeState.treeName === "Life Skills";

    if (doesHomeTreeHasDefaultValues) return true;

    return false;
}
