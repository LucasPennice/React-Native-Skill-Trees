import { useEffect, useState } from "react";
import { Gesture } from "react-native-gesture-handler";
import { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { CIRCLE_SIZE_SELECTED, MENU_HIGH_DAMPENING, NAV_HEGIHT } from "../../../parameters";
import { CanvasDimensions, NodeCoordinate } from "../../../types";
import { ScreenDimentions } from "../../../redux/screenDimentionsSlice";

const DEFAULT_SCALE = 1;

function useHandleCanvasScroll(canvasDimentions: CanvasDimensions, screenDimensions: ScreenDimentions, foundNodeCoordinates?: NodeCoordinate) {
    const { canvasHeight, canvasWidth } = canvasDimentions;

    const minScale = screenDimensions.width / canvasWidth;
    const MAX_SCALE = 1.4;

    const start = useSharedValue({ x: 0, y: 0 });
    const offsetX = useSharedValue(0);
    const offsetY = useSharedValue(0);

    const scale = useSharedValue(DEFAULT_SCALE);
    const savedScale = useSharedValue(DEFAULT_SCALE);

    const shouldAnimateTransformation = useShouldAnimateTransformation(foundNodeCoordinates !== undefined);

    useEffect(() => {
        const currentCanvasMinScale = screenDimensions.width / canvasWidth;

        //Avoids being zoomed out more than allowed when switching from a big tree to a small one
        if (!(scale.value >= currentCanvasMinScale && scale.value <= MAX_SCALE)) {
            scale.value = currentCanvasMinScale;
            savedScale.value = currentCanvasMinScale;
        }

        offsetX.value = 0;
        offsetY.value = 0;
        start.value = { x: 0, y: 0 };
    }, [canvasDimentions.canvasHeight, canvasDimentions.canvasWidth]);

    const canvasZoom = Gesture.Pinch()
        .onUpdate((e) => {
            if (foundNodeCoordinates) return;
            const newScaleValue = savedScale.value * e.scale;

            scale.value = newScaleValue;
        })
        .onEnd(() => {
            //We return scale to safe values here

            if (scale.value < minScale) {
                savedScale.value = minScale;
                scale.value = withSpring(minScale, MENU_HIGH_DAMPENING);
                return;
            }

            if (scale.value > MAX_SCALE) {
                savedScale.value = MAX_SCALE;
                scale.value = withSpring(MAX_SCALE, MENU_HIGH_DAMPENING);
                return;
            }

            savedScale.value = scale.value;
        });

    const widthBounds = getWidthBounds(canvasWidth, scale.value, screenDimensions.width);
    const minX = -widthBounds;
    const maxX = widthBounds;

    const minY = -screenDimensions.height / 2 + NAV_HEGIHT;
    const maxY = screenDimensions.height / 2;

    const canvasPan = Gesture.Pan()
        .onUpdate((e) => {
            if (foundNodeCoordinates) return;

            const newXValue = e.translationX + start.value.x;
            const newYValue = e.translationY + start.value.y;

            offsetX.value = newXValue;
            offsetY.value = newYValue;
        })
        .onEnd(() => {
            const xOutOfBounds = !(minX <= offsetX.value && offsetX.value <= maxX);
            const yOutOfBounds = !(minY <= offsetY.value && offsetY.value <= maxY);

            if (!xOutOfBounds && !yOutOfBounds) return (start.value = { x: offsetX.value, y: offsetY.value });

            let newX = offsetX.value;
            let newY = offsetY.value;

            if (xOutOfBounds) {
                if (offsetX.value < minX) newX = minX;
                if (offsetX.value > maxX) newX = maxX;
            }

            if (yOutOfBounds) {
                if (offsetY.value < minY) newY = minY;
                if (offsetY.value > maxY) newY = maxY;
            }

            offsetX.value = withSpring(newX, MENU_HIGH_DAMPENING);
            offsetY.value = withSpring(newY, MENU_HIGH_DAMPENING);
            start.value = { x: newX, y: newY };
        });

    const canvasGestures = Gesture.Race(canvasPan, canvasZoom);

    const transform = useAnimatedStyle(() => {
        if (foundNodeCoordinates) {
            const alignCanvasLeftSideWithScreenLeftSide = (canvasWidth - screenDimensions.width) / 2;
            const foundNodeTranslatedX =
                alignCanvasLeftSideWithScreenLeftSide - foundNodeCoordinates.x + screenDimensions.width - 1.5 * CIRCLE_SIZE_SELECTED;

            const deltaY = canvasHeight / 2 - foundNodeCoordinates.y;
            const foundNodeTranslatedY = canvasHeight / 2 + deltaY - screenDimensions.height / 2 + CIRCLE_SIZE_SELECTED;

            return {
                transform: [
                    {
                        translateX: withSpring(foundNodeTranslatedX, { damping: 32, stiffness: 350 }),
                    },
                    {
                        translateY: withSpring(foundNodeTranslatedY, { damping: 32, stiffness: 350 }),
                    },
                    { scale: withSpring(DEFAULT_SCALE, { damping: 32, stiffness: 350 }) },
                ],
            };
        }
        if (shouldAnimateTransformation)
            return {
                transform: [
                    { translateX: withSpring(offsetX.value, { damping: 32, stiffness: 350 }) },
                    { translateY: withSpring(offsetY.value, { damping: 32, stiffness: 350 }) },
                    { scale: withSpring(scale.value, { damping: 32, stiffness: 350 }) },
                ],
            };
        return {
            transform: [{ translateX: offsetX.value }, { translateY: offsetY.value }, { scale: scale.value }],
        };
    }, [offsetX, offsetY, scale, foundNodeCoordinates, shouldAnimateTransformation]);

    return { transform, canvasGestures };
}

export default useHandleCanvasScroll;

function useShouldAnimateTransformation(popUpMenuOpen: boolean) {
    const [result, setResult] = useState(true);

    useEffect(() => {
        if (popUpMenuOpen) setResult(true);

        if (!popUpMenuOpen) {
            setTimeout(() => {
                setResult(false);
            }, 200);
        }
    }, [popUpMenuOpen]);

    return result;
}
function getWidthBounds(canvasW: number, scale: number, screenW: number) {
    return (canvasW * scale - screenW) / 2;
}
