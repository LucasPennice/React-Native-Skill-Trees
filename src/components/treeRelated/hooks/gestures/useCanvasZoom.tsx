import { useEffect, useState } from "react";
import { Gesture } from "react-native-gesture-handler";
import { SharedValue, runOnJS, useSharedValue, withSpring } from "react-native-reanimated";
import { MENU_HIGH_DAMPENING, NAV_HEGIHT } from "../../../../parameters";
import { ScreenDimentions } from "../../../../redux/slices/screenDimentionsSlice";
import { CanvasDimensions, NodeCoordinate } from "../../../../types";
import { getXBounds, getYBounds } from "../useHandleCanvasBounds";
import { DEFAULT_SCALE } from "./params";

function useCanvasZoom(
    canvasDimentions: CanvasDimensions,
    screenDimensions: ScreenDimentions,
    foundNodeCoordinates: NodeCoordinate | undefined,
    sharedValues: { offsetX: SharedValue<number>; offsetY: SharedValue<number>; scale: SharedValue<number> }
) {
    const { offsetX, offsetY, scale } = sharedValues;

    const { canvasHeight, canvasWidth } = canvasDimentions;

    const screenHeightWithNavAccounted = screenDimensions.height - NAV_HEGIHT;

    const shouldUpdateStartValue = useSharedValue(false);

    const minScaleX = screenDimensions.width / canvasWidth;
    const minScaleY = screenHeightWithNavAccounted / canvasHeight;
    const minScale = minScaleX < minScaleY ? minScaleY : minScaleX;
    const MAX_SCALE = 1.4;

    const savedScale = useSharedValue(DEFAULT_SCALE);

    const [scaleState, setScaleState] = useState(DEFAULT_SCALE);

    useEffect(() => {
        const currentCanvasMinScale = screenDimensions.width / canvasWidth;
        //Avoids being zoomed out more than allowed when switching from a big tree to a small one
        if (!(scale.value >= currentCanvasMinScale && scale.value <= MAX_SCALE)) {
            scale.value = currentCanvasMinScale;
            savedScale.value = currentCanvasMinScale;
        }
    }, [canvasDimentions.canvasHeight, canvasDimentions.canvasWidth]);

    const canvasZoom = Gesture.Pinch()
        .onBegin(() => {
            shouldUpdateStartValue.value = false;
        })
        .onUpdate((e) => {
            if (foundNodeCoordinates) return;
            const newScaleValue = savedScale.value * e.scale;

            scale.value = newScaleValue;
        })
        .onEnd(() => {
            let safeScale = scale.value;
            //Handle scale out of bounds 👇
            if (scale.value < minScale) {
                savedScale.value = minScale;
                safeScale = minScale;
                scale.value = withSpring(minScale, MENU_HIGH_DAMPENING);
            } else if (scale.value > MAX_SCALE) {
                savedScale.value = MAX_SCALE;
                safeScale = MAX_SCALE;
                scale.value = withSpring(MAX_SCALE, MENU_HIGH_DAMPENING);
            } else {
                savedScale.value = scale.value;
            }

            runOnJS(setScaleState)(savedScale.value);

            const xBounds = getXBounds(safeScale, canvasWidth, screenDimensions.width);
            const yBounds = getYBounds(safeScale, canvasHeight, screenHeightWithNavAccounted);

            const outOfBounds = checkIfScrollOutOfBounds({
                offset: { x: offsetX.value, y: offsetY.value },
                bounds: { x: xBounds, y: yBounds },
            });

            if (!outOfBounds.x && !outOfBounds.y) return;

            const { x: safeX, y: safeY } = returnSafeOffset({
                offset: { x: offsetX.value, y: offsetY.value },
                outOfBounds,
                bounds: { x: xBounds, y: yBounds },
            });

            shouldUpdateStartValue.value = true;

            if (outOfBounds.x) {
                offsetX.value = withSpring(safeX, MENU_HIGH_DAMPENING);
            }

            if (outOfBounds.y) {
                offsetY.value = withSpring(safeY, MENU_HIGH_DAMPENING);
            }
        });
    return { scaleState, canvasZoom };
}

export default useCanvasZoom;

function checkIfScrollOutOfBounds(args: {
    offset: { x: number; y: number };
    bounds: {
        x: [number, number];
        y: [number, number];
    };
}) {
    "worklet";
    const { bounds, offset } = args;
    const { x, y } = offset;
    const [minX, maxX] = bounds.x;
    const [minY, maxY] = bounds.y;

    let result = { x: false, y: false };

    const offsetYInsideBounds = y >= maxY && y <= minY;

    if (!offsetYInsideBounds) result.y = true;

    const offsetXInsideBounds = x >= maxX && x <= minX;

    if (!offsetXInsideBounds) result.x = true;

    return result;
}

function returnSafeOffset(args: {
    offset: { x: number; y: number };
    outOfBounds: { x: boolean; y: boolean };
    bounds: {
        x: [number, number];
        y: [number, number];
    };
}) {
    "worklet";
    const { bounds, offset, outOfBounds } = args;
    const { x, y } = offset;
    const [minX, maxX] = bounds.x;
    const [minY, maxY] = bounds.y;

    let result = { x, y };

    if (outOfBounds.y) {
        if (y >= minY) result.y = minY;
        if (y <= maxY) result.y = maxY;
    }

    if (outOfBounds.x) {
        if (x >= minX) result.x = minX;
        if (x <= minX) result.x = maxX;
    }

    return result;
}
