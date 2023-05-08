import { StyleProp, ViewStyle } from "react-native";

export const CIRCLE_SIZE = 15;
export const CIRCLE_SIZE_SELECTED = CIRCLE_SIZE * 3;

//Added range to detect a touch on a circle on every side
export const TOUCH_BUFFER = 15;

export const DISTANCE_BETWEEN_CHILDREN = 100;
export const DISTANCE_BETWEEN_GENERATIONS = 25 + 50 + 3 * CIRCLE_SIZE;

export const NAV_HEGIHT = 65;

export const CANVAS_SPRING = { damping: 29 };
export const MENU_DAMPENING = { damping: 20, stiffness: 300 };
export const MENU_HIGH_DAMPENING = { damping: 26, stiffness: 300 };

export const PARENT_DND_ZONE_DIMENTIONS = { width: 4 * CIRCLE_SIZE, height: 25 };
export const ONLY_CHILDREN_DND_ZONE_DIMENTIONS = { ...PARENT_DND_ZONE_DIMENTIONS, height: 50 };
export const BROTHER_DND_ZONE_HEIGHT = 3 * CIRCLE_SIZE;

export const CANVAS_HORIZONTAL_PADDING = 200;
export const CANVAS_VERTICAL_PADDING = 200;

export const colors = {
    background: "#000000",
    darkGray: "#181A1C",
    line: "#515053",
    unmarkedText: "#96959B",
    red: "#FE453A",
    accent: "#1982F9",
    yellow: "#FED739",
    orange: "#FF9F23",
    green: "#50D158",
    teal: "#40C8E0",
    blue: "#1982F9",
    purple: "#BF5AF2",
    pink: "#FC385F",
};

export const centerFlex: StyleProp<ViewStyle> = { display: "flex", justifyContent: "center", alignItems: "center" };

//☢️ These colors have to be in hex format
export const possibleTreeColors = ["#FE453A", "#FED739", "#FF9F23", "#50D158", "#40C8E0", "#1982F9", "#BF5AF2", "#FC385F"];

export const ALLOWED_NODE_SPACING = 0.5;

export const UNCENTERED_ROOT_COORDINATES = { x: 0, y: 0 };
