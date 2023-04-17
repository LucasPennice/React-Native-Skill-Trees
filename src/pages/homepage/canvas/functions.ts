import { TouchInfo } from "@shopify/react-native-skia";
import { CIRCLE_SIZE, DISTANCE_BETWEEN_CHILDREN, DISTANCE_BETWEEN_GENERATIONS, LETTER_SIZE_AT_10, TOUCH_BUFFER } from "./parameters";
import { DnDZone } from "../../../types";

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

export function didTapDndZone(touchInfo: TouchInfo) {
    return (zone: DnDZone) => {
        const isTouchInsideCircleXRange = touchInfo.x >= zone.x && touchInfo.x <= zone.x + zone.width;

        const isTouchInsideCircleYRange = touchInfo.y >= zone.y && touchInfo.y <= zone.y + zone.height;

        const isTouchingCircle = isTouchInsideCircleXRange && isTouchInsideCircleYRange;

        if (!isTouchingCircle) return false;

        return true;
    };
}

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
