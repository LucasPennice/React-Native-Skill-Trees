import { CIRCLE_SIZE } from "../../../../parameters";
import { CartesianCoordinate } from "../../../../types";
import { TOUCH_BUFFER } from "./params";

export function didTapCircle<T extends CartesianCoordinate>(touchInfo: { x: number; y: number }) {
    return (circle: T) => {
        const isTouchInsideCircleXRange =
            touchInfo.x >= circle.x - CIRCLE_SIZE / 2 - TOUCH_BUFFER && touchInfo.x <= circle.x + CIRCLE_SIZE / 2 + TOUCH_BUFFER;

        if (!isTouchInsideCircleXRange) return false;

        const isTouchInsideCircleYRange =
            touchInfo.y >= circle.y - CIRCLE_SIZE / 2 - TOUCH_BUFFER && touchInfo.y <= circle.y + CIRCLE_SIZE / 2 + TOUCH_BUFFER;

        if (!isTouchInsideCircleYRange) return false;

        return true;
    };
}
