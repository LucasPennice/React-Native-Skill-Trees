import { PersistedState } from "redux-persist";
import { HOMEPAGE_TREE_ID, HOMETREE_ROOT_ID } from "../parameters";
import { ColorGradient, NormalizedNode, Skill, Tree, getDefaultSkillValue } from "../types";
import { RootState } from "./reduxStore";
import { HomeTreeSlice, homeTreeSliceInitialState } from "./slices/homeTreeSlice";
import { NodeSlice } from "./slices/nodesSlice";
import { UserTreeSlice } from "./slices/userTreesSlice";

export type MigrationState = PersistedState &
    RootState & {
        currentTree?: {
            userTrees: Tree<Skill>[];
            currentTreeId: string | undefined;
        };
    } & {
        canvasDisplaySettings: {
            showLabel: boolean;
            oneColorPerTree: boolean;
            showCircleGuide: boolean;
            showIcons: boolean;
            homepageTreeColor?: ColorGradient;
            homepageTreeName?: string;
            homepageTreeIcon?: string;
        };
    };

export const migrationFunction = (state: MigrationState) => {
    // const migrateToHomeTreeSlice = shouldMigrateToHomeTree(state.canvasDisplaySettings, state.homeTree);

    // const migrateUserTreesSlice = shouldMigrateNodesAndTrees(state.nodes, state.userTrees, state.currentTree);

    let updatedState = { ...state };

    // if (migrateUserTreesSlice) {
    const { nodeState, userTrees } = migrateFromCurrentTreeToNormalizedSlice(state.currentTree!.userTrees, state.canvasDisplaySettings);
    updatedState["nodes"] = nodeState;
    updatedState["userTrees"] = userTrees;
    delete updatedState["currentTree"];
    // }

    // if (migrateToHomeTreeSlice) {
    updatedState["homeTree"] = {
        accentColor: state.canvasDisplaySettings.homepageTreeColor,
        icon: { isEmoji: false, text: state.canvasDisplaySettings.homepageTreeIcon },
        treeName: state.canvasDisplaySettings.homepageTreeName,
        rootNodeId: HOMETREE_ROOT_ID,
        treeId: HOMEPAGE_TREE_ID,
    } as HomeTreeSlice;
    // }

    return updatedState;
};

export function shouldMigrateNodesAndTrees(
    nodeState: MigrationState["nodes"],
    userTreeState: MigrationState["userTrees"],
    currentTreeState: MigrationState["currentTree"]
) {
    const nodesSliceEmpty = nodeState.ids[0] === null || nodeState.ids.length === 0;

    const userTreesSliceEmpty = userTreeState.ids[0] === null || userTreeState.ids.length === 0;

    if ((nodesSliceEmpty || userTreesSliceEmpty) && currentTreeState) return true;

    return false;
}

export function migrateFromCurrentTreeToNormalizedSlice(userTrees: Tree<Skill>[], canvasDisplaySettings: MigrationState["canvasDisplaySettings"]) {
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
        const iconText = canvasDisplaySettings.homepageTreeName ? canvasDisplaySettings.homepageTreeName[0] : homeTreeSliceInitialState.icon.text;

        const homepageRootNode: NormalizedNode = {
            nodeId: HOMETREE_ROOT_ID,
            isRoot: true,
            childrenIds: userTrees.map((uT) => uT.nodeId),
            data: getDefaultSkillValue(canvasDisplaySettings.homepageTreeName ?? homeTreeSliceInitialState.treeName, false, {
                isEmoji: false,
                text: iconText,
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
            showOnHomeScreen: true,
        };
    }
}

export function shouldMigrateToHomeTree(canvasDisplaySettings: MigrationState["canvasDisplaySettings"], homeTreeState?: HomeTreeSlice) {
    if (
        canvasDisplaySettings["homepageTreeIcon"] === undefined ||
        canvasDisplaySettings["homepageTreeName"] === undefined ||
        canvasDisplaySettings["homepageTreeColor"] === undefined
    )
        return false;

    if (homeTreeState === undefined) return true;

    const doesHomeTreeHasDefaultValues =
        JSON.stringify(homeTreeState.accentColor) === JSON.stringify(homeTreeSliceInitialState.accentColor) &&
        homeTreeState.icon.text === homeTreeSliceInitialState.icon.text &&
        homeTreeState.icon.isEmoji === homeTreeSliceInitialState.icon.isEmoji &&
        homeTreeState.treeName === homeTreeSliceInitialState.treeName;

    if (doesHomeTreeHasDefaultValues) return true;

    return false;
}
