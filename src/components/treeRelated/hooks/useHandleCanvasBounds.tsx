import { SharedValue, useAnimatedReaction, useSharedValue } from "react-native-reanimated";
import { NAV_HEGIHT } from "../../../parameters";

function useHandleCanvasBounds(state: {
    minScale: number;
    scale: SharedValue<number>;
    screenWidth: number;
    canvasWidth: number;
    canvasHeight: number;
    screenHeight: number;
}) {
    const { canvasWidth, minScale, scale, screenWidth, canvasHeight, screenHeight } = state;
    //
    const minYBound = useSharedValue(0);
    const maxYBound = useSharedValue(0);
    const minXBound = useSharedValue(0);
    const maxXBound = useSharedValue(0);

    useAnimatedReaction(
        () => scale.value,
        (scaleValue: number) => {
            const [minX, maxX] = getXBounds(scaleValue, canvasWidth, screenWidth);

            minXBound.value = minX;

            maxXBound.value = maxX;
        },
        [scale, canvasWidth, screenWidth, minScale]
    );
    useAnimatedReaction(
        () => scale.value,
        (scaleValue: number) => {
            const [minY, maxY] = getYBounds(scaleValue, canvasHeight, screenHeight);

            minYBound.value = minY;

            maxYBound.value = maxY;
        },
        [scale, canvasWidth, screenHeight, minScale]
    );

    return { minXBound, maxXBound, minYBound, maxYBound };
}

function getXBounds(scale: number, canvasWidth: number, screenWidth: number): [number, number] {
    "worklet";
    const range = scale * canvasWidth - screenWidth;

    const minXBound = range / 2;

    const maxXBound = -range / 2;

    return [minXBound, maxXBound];
}

function getYBounds(scaleValue: number, canvasHeight: number, screenHeight: number): [number, number] {
    "worklet";
    const screenHeightWithNavAccounted = screenHeight - NAV_HEGIHT;

    const range = getRange(scaleValue);

    const m = 10 * (getRange(1.1) - getRange(1) - screenHeight * 0.1);

    const h = -m;

    const minY = scaleValue * m + h;

    const maxY = minY - range;

    function getRange(scale: number) {
        return scale * canvasHeight - screenHeightWithNavAccounted;
    }

    return [minY, maxY];
}

export { getYBounds, getXBounds, useHandleCanvasBounds };
