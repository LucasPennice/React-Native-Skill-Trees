import { useEffect, useState } from "react";
import { Gesture } from "react-native-gesture-handler";
import { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { CIRCLE_SIZE_SELECTED, NAV_HEGIHT } from "../../../../parameters";
import { useAppSelector } from "../../../../redux/reduxHooks";
import { selectSafeScreenDimentions } from "../../../../redux/screenDimentionsSlice";
import { CanvasDimensions, NodeCoordinate } from "../../../../types";

const DEFAULT_SCALE = 1;

function useHandleCanvasScroll(canvasDimentions: CanvasDimensions, foundNodeCoordinates?: NodeCoordinate) {
    const { canvasHeight, canvasWidth } = canvasDimentions;
    const screenDimentions = useAppSelector(selectSafeScreenDimentions);

    const minScale = screenDimentions.width / canvasWidth;
    const MAX_SCALE = 1.4;

    const start = useSharedValue({ x: 0, y: 0 });
    const offset = useSharedValue({ x: 0, y: 0 });

    const scale = useSharedValue(DEFAULT_SCALE);
    const savedScale = useSharedValue(DEFAULT_SCALE);

    const shouldAnimateTransformation = useShouldAnimateTransformation(foundNodeCoordinates !== undefined);

    useEffect(() => {
        const currentCanvasMinScale = screenDimentions.width / canvasWidth;

        //Avoids being zoomed out more than allowed when switching from a big tree to a small one
        if (!(scale.value >= currentCanvasMinScale && scale.value <= MAX_SCALE)) {
            scale.value = currentCanvasMinScale;
            savedScale.value = currentCanvasMinScale;
        }

        offset.value = { x: 0, y: 0 };
        start.value = { x: 0, y: 0 };
    }, [canvasDimentions.canvasHeight, canvasDimentions.canvasWidth]);

    const canvasZoom = Gesture.Pinch()
        .onUpdate((e) => {
            if (foundNodeCoordinates) return;

            const newScaleValue = savedScale.value * e.scale;
            scale.value = clamp(minScale, MAX_SCALE, newScaleValue);

            function clamp(min: number, max: number, value: number) {
                if (value <= min) return min;

                if (value >= max) return max;

                return value;
            }
        })
        .onEnd(() => {
            savedScale.value = scale.value;
        });

    const canvasPan = Gesture.Pan()
        .onUpdate((e) => {
            if (foundNodeCoordinates) return;

            const newXValue = e.translationX + start.value.x;
            const newYValue = e.translationY + start.value.y;

            const widthBounds = getWidthBounds(canvasWidth, scale.value, screenDimentions.width);

            offset.value = {
                x: clamp(-widthBounds, widthBounds, newXValue),
                y: clamp(-screenDimentions.height / 2 + NAV_HEGIHT, screenDimentions.height / 2, newYValue),
            };

            function getWidthBounds(canvasW: number, scale: number, screenW: number) {
                return (canvasW * scale - screenW) / 2;
            }

            function clamp(min: number, max: number, value: number) {
                if (value <= min) return min;

                if (value >= max) return max;

                return value;
            }
        })
        .onEnd(() => {
            start.value = {
                x: offset.value.x,
                y: offset.value.y,
            };
        });

    const canvasGestures = Gesture.Simultaneous(canvasPan, canvasZoom);

    const transform = useAnimatedStyle(() => {
        if (foundNodeCoordinates) {
            console.log(foundNodeCoordinates.x);
            const alignCanvasLeftSideWithScreenLeftSide = (canvasWidth - screenDimentions.width) / 2;
            const foundNodeTranslatedX =
                alignCanvasLeftSideWithScreenLeftSide - foundNodeCoordinates.x + screenDimentions.width - 1.5 * CIRCLE_SIZE_SELECTED;

            const deltaY = canvasHeight / 2 - foundNodeCoordinates.y;
            const foundNodeTranslatedY = canvasHeight / 2 + deltaY - screenDimentions.height / 2 + CIRCLE_SIZE_SELECTED;

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
                    { translateX: withSpring(offset.value.x, { damping: 32, stiffness: 350 }) },
                    { translateY: withSpring(offset.value.y, { damping: 32, stiffness: 350 }) },
                    { scale: withSpring(scale.value, { damping: 32, stiffness: 350 }) },
                ],
            };
        return {
            transform: [{ translateX: offset.value.x }, { translateY: offset.value.y }, { scale: scale.value }],
        };
    }, [offset, scale, foundNodeCoordinates, shouldAnimateTransformation]);

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
