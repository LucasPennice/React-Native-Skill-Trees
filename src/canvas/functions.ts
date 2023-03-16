import { TouchInfo } from "@shopify/react-native-skia";
import { findTreeHeight } from "../treeFunctions";
import { treeMock } from "../types";
import { CIRCLE_SIZE, TOUCH_BUFFER } from "./parameters";

export function didTapCircle(touchInfo: TouchInfo) {
    return (circle: { x: number; y: number; id: string }) => {
        const isTouchInsideCircleXRange =
            touchInfo.x >= circle.x - CIRCLE_SIZE / 2 - TOUCH_BUFFER && touchInfo.x <= circle.x + CIRCLE_SIZE / 2 + TOUCH_BUFFER;
        const isTouchInsideCircleYRange =
            touchInfo.y >= circle.y - CIRCLE_SIZE / 2 - TOUCH_BUFFER && touchInfo.y <= circle.y + CIRCLE_SIZE / 2 + TOUCH_BUFFER;

        const isTouchingCircle = isTouchInsideCircleXRange && isTouchInsideCircleYRange;

        if (!isTouchingCircle) return false;

        return true;
    };
}

export const DISTANCE_BETWEEN_CHILDREN = 100;
export const DISTANCE_BETWEEN_GENERATIONS = 150;

export function getChildCoordinatesFromParentInfo(parentNodeInfo: {
    coordinates: { x: number; y: number };
    numberOfChildren: number;
    currentChildIndex: number;
}) {
    const distanceLeftShift = getDistanceLeftShift();

    const y = parentNodeInfo.coordinates.y + DISTANCE_BETWEEN_GENERATIONS;

    const x = parentNodeInfo.coordinates.x + DISTANCE_BETWEEN_CHILDREN * parentNodeInfo.currentChildIndex - distanceLeftShift;

    return { x, y };

    function getDistanceLeftShift() {
        if (parentNodeInfo.numberOfChildren === 1) return 0;

        let result = 0;

        result = ((parentNodeInfo.numberOfChildren - 1) * DISTANCE_BETWEEN_CHILDREN) / 2;

        return result;
    }
}

export function createBezierPathBetweenPoints(p1: { x: number; y: number }, p2: { x: number; y: number }) {
    if (p1.x === p2.x) return `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;

    // mid-point of line:
    var mpx = (p2.x + p1.x) * 0.49;
    var mpy = (p2.y + p1.y) * 0.49;

    // angle of perpendicular to line:
    var theta = Math.atan2(p2.y - p1.y, p2.x - p1.x) - Math.PI / 2;

    // distance of control point from mid-point of line:
    var offset = p2.x < p1.x ? -20 : 20;

    // location of control point:
    var c1x = mpx + offset * 1.5 * Math.cos(theta);
    var c1y = mpy + offset * 1.5 * Math.sin(theta);

    // construct the command to draw a quadratic curve
    var curve = "M" + p1.x + " " + p1.y + " Q " + c1x + " " + c1y + " " + p2.x + " " + p2.y;
    return curve;
}

export function getDeltaX() {
    const treeHeight = findTreeHeight(treeMock);
}

export const LETTER_SIZE_AT_10 = {
    A: 6.67,
    B: 6.67,
    C: 7.23,
    D: 7.23,
    E: 6.67,
    F: 6.11,
    G: 7.78,
    H: 7.23,
    I: 2.78,
    J: 5,
    K: 6.67,
    L: 5.56,
    M: 8.34,
    N: 7.23,
    O: 7.78,
    P: 6.67,
    Q: 7.78,
    R: 7.23,
    S: 6.67,
    T: 6.11,
    U: 7.23,
    V: 6.67,
    W: 9.45,
    X: 6.67,
    Y: 6.67,
    Z: 6.11,
    AT: 10.16,
    DOT: 2.78,
    SPACE: 5.56,
};

export function getSymbolWidthForCurrentFontSize(symbol: string, fontSize: number) {
    let currentSymbol = "";
    if (symbol === "@") currentSymbol = "AT";
    if (symbol === ".") currentSymbol = "DOT";
    if (symbol === " ") currentSymbol = "SPACE";
    if (symbol !== "@" && symbol !== "." && symbol !== " ") currentSymbol = symbol.toUpperCase();
    //@ts-ignore
    const letterSizeAtFont10: number = LETTER_SIZE_AT_10[currentSymbol];
    const letterSizeAtCurrentFont = (letterSizeAtFont10 / 10) * fontSize;
    return letterSizeAtCurrentFont;
}

export function getHeightForFont(fontSize: number) {
    return (fontSize * 125.5) / 110;
}
