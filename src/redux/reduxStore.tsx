import { HOMEPAGE_TREE_ID, HOMETREE_ROOT_ID, WHITE_GRADIENT } from "@/parameters";
import { NormalizedNode, Skill, Tree, getDefaultSkillValue } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { FLUSH, PAUSE, PERSIST, PURGE, PersistConfig, PersistedState, REGISTER, REHYDRATE, persistReducer, persistStore } from "redux-persist";
import addTreeReducer from "./slices/addTreeModalSlice";
import canvasDisplaySettingsReducer, { CanvasDisplaySettings } from "./slices/canvasDisplaySettingsSlice";
import homeTreeSlice, { HomeTreeSlice } from "./slices/homeTreeSlice";
import loginReducer from "./slices/loginSlice";
import newUserTreesSlice, { UserTreeSlice } from "./slices/userTreesSlice";
import nodesSlice, { NodeSlice } from "./slices/nodesSlice";
import screenDimentionsReducer from "./slices/screenDimentionsSlice";
import userReducer from "./slices/userSlice";

const persistConfig: PersistConfig<any> = {
    key: "root",
    version: 1,
    storage: AsyncStorage,
    //@ts-ignore
    migrate: (state: PersistedState & RootState) => {
        try {
            const nodesSliceEmpty = state.nodes.ids[0] === null || state.nodes.ids.length === 0;

            const userTreesSliceEmpty = state.userTrees.ids[0] === null || state.userTrees.ids.length === 0;

            const migrateToHomeTreeSlice = shouldMigrateToHomeTree(state.canvasDisplaySettings, state.homeTree);

            let updatedState = { ...state };

            if (nodesSliceEmpty || userTreesSliceEmpty) {
                const { nodeState, userTrees } = migrateFromCurrentTreeToNormalizedSlice(
                    //@ts-ignore
                    state.currentTree.userTrees,
                    state.canvasDisplaySettings
                );
                updatedState["nodes"] = nodeState;
                updatedState["userTrees"] = userTrees;
                //@ts-ignore
                delete updatedState["currentTree"];
            }

            if (migrateToHomeTreeSlice) {
                updatedState["homeTree"] = {
                    //@ts-ignore
                    accentColor: state.canvasDisplaySettings.homepageTreeColor,
                    //@ts-ignore
                    icon: { isEmoji: false, text: state.canvasDisplaySettings.homepageTreeIcon },
                    //@ts-ignore
                    treeName: state.canvasDisplaySettings.homepageTreeName,
                    rootNodeId: HOMETREE_ROOT_ID,
                    treeId: HOMEPAGE_TREE_ID,
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

function migrateFromCurrentTreeToNormalizedSlice(userTrees: Tree<Skill>[], canvasDisplaySettings: CanvasDisplaySettings) {
    let result: { nodeState: NodeSlice; userTrees: UserTreeSlice } = { nodeState: { entities: {}, ids: [] }, userTrees: { entities: {}, ids: [] } };

    addRootNodeEntity();

    for (const userTree of userTrees) {
        let userTreeWithRootTrue: Tree<Skill> = { ...userTree, isRoot: true };

        createTreeDataEntity(userTreeWithRootTrue);

        result.userTrees.ids.push(userTreeWithRootTrue.treeId);

        runFnOnEveryNode(userTreeWithRootTrue, (node: Tree<Skill>) => {
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
            //@ts-ignore
            data: getDefaultSkillValue(canvasDisplaySettings.homepageTreeName, false, {
                isEmoji: false,
                //@ts-ignore
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

function shouldMigrateToHomeTree(canvasDisplaySettings: CanvasDisplaySettings, homeTreeState?: HomeTreeSlice) {
    if (
        //@ts-ignore
        canvasDisplaySettings["homepageTreeIcon"] === undefined ||
        //@ts-ignore
        canvasDisplaySettings["homepageTreeName"] === undefined ||
        //@ts-ignore
        canvasDisplaySettings["homepageTreeColor"] === undefined
    )
        return false;

    if (homeTreeState === undefined) return true;

    const doesHomeTreeHasDefaultValues =
        JSON.stringify(homeTreeState.accentColor) === JSON.stringify(WHITE_GRADIENT) &&
        homeTreeState.icon.text === "L" &&
        homeTreeState.icon.isEmoji === false &&
        homeTreeState.treeName === "Life Skills";

    if (doesHomeTreeHasDefaultValues) return true;

    return false;
}
