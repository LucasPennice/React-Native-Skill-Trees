import { SharedValue, useAnimatedReaction, useSharedValue } from "react-native-reanimated";
import { NAV_HEGIHT } from "../../../parameters";

function useHandleCanvasBounds(state: {
    minScale: number;
    maxScale: number;
    scale: SharedValue<number>;
    screenWidth: number;
    canvasWidth: number;
    canvasHeight: number;
    screenHeight: number;
}) {
    const { canvasWidth, minScale, scale, screenWidth, canvasHeight, screenHeight, maxScale } = state;
    const screenHeightWithNavAccounted = screenHeight - NAV_HEGIHT;

    //
    const minYBound = useSharedValue(0);
    const maxYBound = useSharedValue(0);
    const minXBound = useSharedValue(0);
    const maxXBound = useSharedValue(0);

    useAnimatedReaction(
        () => scale.value,
        (scaleValue: number) => {
            const safeScale = getSafeScale(scaleValue, minScale, maxScale);

            const [minX, maxX] = getXBounds(safeScale, canvasWidth, screenWidth);

            minXBound.value = minX;

            maxXBound.value = maxX;
        },
        [scale, canvasWidth, screenWidth, minScale]
    );
    useAnimatedReaction(
        () => scale.value,
        (scaleValue: number) => {
            const safeScale = getSafeScale(scaleValue, minScale, maxScale);

            const [minY, maxY] = getYBounds(safeScale, canvasHeight, screenHeightWithNavAccounted);

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

function getYBounds(scale: number, canvasHeight: number, screenHeightWithNavAccounted: number): [number, number] {
    "worklet";

    const range = getRange(scale);

    //This is the heightDelta between the screen size and the relative screen size with the current scale
    const deltaHeight = screenHeightWithNavAccounted * (scale - 1);
    const minY = deltaHeight / 2;

    const maxY = minY - range;

    function getRange(scale: number) {
        const x = scale;
        const m = canvasHeight;
        const h = -screenHeightWithNavAccounted;

        const result = x * m + h;

        return result;
    }

    return [minY, maxY];
}

function getSafeScale(scaleValue: number, minScale: number, maxScale: number): number {
    "worklet";

    let result = scaleValue;
    //Handle scale out of bounds 👇
    if (scaleValue < minScale) {
        result = minScale;
    } else if (scaleValue > maxScale) {
        result = maxScale;
    } else {
        result = scaleValue;
    }

    return result;
}

export { getYBounds, getXBounds, useHandleCanvasBounds };
