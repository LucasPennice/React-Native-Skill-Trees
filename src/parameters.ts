import { StyleProp, ViewStyle } from "react-native";
import { ColorGradient, Skill, Tree, getDefaultSkillValue } from "./types";

export const CIRCLE_SIZE = 15;
export const CIRCLE_SIZE_SELECTED = CIRCLE_SIZE * 3;

//Added range to detect a touch on a circle on every side
export const TOUCH_BUFFER = 15;

export const DISTANCE_BETWEEN_CHILDREN = 100;
export const DISTANCE_BETWEEN_GENERATIONS = 25 + 50 + 3 * CIRCLE_SIZE;

export const NAV_HEGIHT = 60;

export const CANVAS_SPRING = { damping: 29 };
export const MENU_DAMPENING = { damping: 20, stiffness: 300 };
export const MENU_HIGH_DAMPENING = { damping: 26, stiffness: 300 };
export const ONBOARDING_DAMPENING = { damping: 28, stiffness: 300 };

export const PARENT_DND_ZONE_DIMENTIONS = { width: 4 * CIRCLE_SIZE, height: 75 / 2 };
export const CHILD_DND_ZONE_DIMENTIONS = { ...PARENT_DND_ZONE_DIMENTIONS, height: 75 / 2 };
export const BROTHER_DND_ZONE_HEIGHT = 3 * CIRCLE_SIZE;

export const CANVAS_HORIZONTAL_PADDING = 200;
export const CANVAS_VERTICAL_PADDING = 200;

export const colors = {
    background: "#000000",
    darkGray: "#181A1C",
    white: "#E6E8E6",
    line: "#515053",
    unmarkedText: "#B1B2B2",
    red: "#FE453A",
    accent: "#BF5AF2",
    yellow: "#FED739",
    gold: "#ECA400",
    orange: "#FF9F23",
    green: "#50D158",
    teal: "#40C8E0",
    blue: "#1982F9",
    purple: "#BF5AF2",
    pink: "#FC385F",
};

export const centerFlex: StyleProp<ViewStyle> = { display: "flex", justifyContent: "center", alignItems: "center" };

//☢️ These colors have to be in hex format
export const possibleTreeColors = [
    { label: "Red", color: "#FE453A" },
    { label: "Yellow", color: "#FED739" },
    { label: "Orange", color: "#FF9F23" },
    { label: "Green", color: "#50D158" },
    { label: "Sky Blue", color: "#40C8E0" },
    { label: "Blue", color: "#1982F9" },
    { label: "Purple", color: "#BF5AF2" },
    { label: "Magenta", color: "#FC385F" },
    { label: "White", color: "#FFFFFF" },
];

export const nodeGradients: ColorGradient[] = [
    { label: "Red", color1: "#FE453A", color2: "#FF9F23" },
    { label: "Yellow", color1: "#FED739", color2: "#FF9F23" },
    { label: "Orange", color1: "#FF9F23", color2: "#BF5AF2" },
    { label: "Green", color1: "#50D158", color2: "#1982F9" },
    { label: "Sky Blue", color1: "#40C8E0", color2: "#BF6AF2" },
    { label: "Blue", color1: "#1982F9", color2: "#BF5AF2" },
    { label: "Purple", color1: "#BF5AF2", color2: "#5A7BF2" },
    { label: "Magenta", color1: "#FC385F", color2: "#BF5AF2" },
    { label: "White", color1: "#FFFFFF", color2: "#CAEFD7" },
];

export const PURPLE_GRADIENT = { label: "Purple", color1: "#BF5AF2", color2: "#5A7BF2" };
export const WHITE_GRADIENT = { label: "White", color1: "#FFFFFF", color2: "#CAEFD7" };

export const ALLOWED_NODE_SPACING = 0.65;

export const UNCENTERED_ROOT_COORDINATES = { x: 0, y: 0 };

export const EmojiRegex = /\p{Extended_Pictographic}/gu;

export const HOMETREE_ROOT_ID = "homepageRoot";

export const NODE_ICON_FONT_SIZE = 15;

export const RADIAL_LABEL_FONT_SIZE = 14;

export const HOMEPAGE_TREE_ID = "HomepageTree";

export const CANVAS_SETTINGS_MOCK_NODE: Tree<Skill> = {
    accentColor: nodeGradients[5],
    category: "SKILL",
    children: [],
    data: getDefaultSkillValue("Example", true, { isEmoji: true, text: "🗿" }),
    isRoot: true,
    level: 0,
    nodeId: "exampleNodeId",
    parentId: null,
    treeId: "exampleTreeId",
    treeName: "exampleTreeName",
    x: 0,
    y: 0,
};

export const CANVAS_SETTINGS_EXAMPLE_NODE_SIZE = 57;

export const DESELECT_NODE_ANIMATION_DURATION = 400;

export const TIME_TO_REORDER_TREE = 1000;

export const USER_ICON_FONT_SIZE = 22;

export const dayInMilliseconds = 1000 * 60 * 60 * 24;
