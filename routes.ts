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
    logIn: {
        name: "logIn",
        route: "/logIn",
    },
    signUp: {
        name: "signUp",
        route: "/signUp",
    },
    backup: {
        name: "backup",
        route: "/(app)/backup",
    },
    support: {
        name: "support",
        route: "/support",
    },
    paywall: {
        name: "paywall",
        route: "/paywall",
    },
    preOnboardingPaywall: {
        name: "preOnboardingPaywall",
        route: "/preOnboardingPaywall",
    },
    postOnboardingPaywall: {
        name: "postOnboardingPaywall",
        route: "/postOnboardingPaywall",
    },
    welcomeNewUser: {
        name: "welcomeNewUser",
        route: "/welcomeNewUser",
    },
    subscriptionDetails: {
        name: "subscriptionDetails",
        route: "/(app)/subscriptionDetails",
    },
};

export const routesToHideNavBar: (keyof typeof routes)[] = [
    "welcomeScreen",
    "welcomeNewUser",
    "logIn",
    "signUp",
    "paywall",
    "preOnboardingPaywall",
    "postOnboardingPaywall",
];

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
        treesToImportIds?: string;
        userIdImport?: string;
    };
    home: {
        handleLogInSync?: "true";
        handleSignUpSync?: "true";
        openEditCanvasSettings?: "true";
    };
    signUp: {
        hideRedirectToLogin?: "true";
    };
};
