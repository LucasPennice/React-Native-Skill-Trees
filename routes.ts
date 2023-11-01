export const routes = {
    welcomeScreen: {
        name: "welcomeScreen",
        route: "/welcomeScreen",
    },
    home: {
        name: "home",
        route: "/home",
    },
    myTrees: {
        name: "myTrees/index",
        route: "/myTrees",
    },
    myTrees_treeId: {
        name: "myTrees/[treeId]/index",
        route: "/myTrees/[treeId]/index",
    },
    myTrees_skillId: {
        name: "myTrees/[treeId]/[skillId]",
        route: "/myTrees/[treeId]/[skillId]",
    },
    feedback: {
        name: "feedback",
        route: "/feedback",
    },
};

export type RoutesParams = {
    myTrees_treeId: {
        treeId: string;
        nodeId: string;
        selectedNodeMenuMode?: "EDITING" | "VIEWING";
        addNewNodePosition?: "PARENT" | "CHILDREN" | "LEFT_BROTHER" | "RIGHT_BROTHER";
    };
    myTrees_skillId: {
        treeId: string;
        skillId: string;
    };
    myTrees: {
        openNewTreeModal?: boolean;
        editingTreeId?: string;
    };
};
