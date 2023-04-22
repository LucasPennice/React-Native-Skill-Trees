import { Gesture } from "react-native-gesture-handler";
import { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useAppSelector } from "../../../../redux/reduxHooks";
import { selectScreenDimentions } from "../../../../redux/screenDimentionsSlice";
import { CanvasDimentions, CirclePositionInCanvasWithLevel } from "../../../../types";
import { CANVAS_HORIZONTAL_PADDING } from "../coordinateFunctions";
import { CIRCLE_SIZE } from "../parameters";
import { useEffect } from "react";

const DEFAULT_SCALE = 1;

function useHandleCanvasScroll(
    canvasDimentions: CanvasDimentions,
    foundNodeCoordinates?: CirclePositionInCanvasWithLevel,
    isTakingScreenshot?: boolean
) {
    const { canvasHeight, canvasWidth } = canvasDimentions;
    const screenDimentions = useAppSelector(selectScreenDimentions);

    const minScale = screenDimentions.width / canvasWidth;
    const MAX_SCALE = 1.4;

    const start = useSharedValue({ x: 0, y: 0 });
    const offset = useSharedValue({ x: 0, y: 0 });

    const scale = useSharedValue(DEFAULT_SCALE);
    const savedScale = useSharedValue(DEFAULT_SCALE);

    useEffect(() => {
        const currentCanvasMinScale = screenDimentions.width / canvasWidth;

        //Avoids being zoomed out more than allowed when switching from a big tree to a small one
        if (!(scale.value >= currentCanvasMinScale && scale.value <= MAX_SCALE)) {
            scale.value = currentCanvasMinScale;
            savedScale.value = currentCanvasMinScale;
        }

        offset.value = { x: 0, y: 0 };
        start.value = { x: 0, y: 0 };
    }, [canvasDimentions]);

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
                y: clamp(-screenDimentions.height / 2, screenDimentions.height / 2, newYValue),
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
        if (isTakingScreenshot) {
            return {
                transform: [
                    { translateX: withSpring(0, { damping: 32, stiffness: 350 }) },
                    { translateY: withSpring(0, { damping: 32, stiffness: 350 }) },
                    { scale: withSpring(DEFAULT_SCALE, { damping: 32, stiffness: 350 }) },
                ],
            };
        }
        if (foundNodeCoordinates) {
            const position = whereShouldNodeBe({ foundNodeCoordinates, canvasWidth, screenWidth: screenDimentions.width });

            const leftBound = (canvasWidth - screenDimentions.width) / 2;

            const foundNodeTranslatedX = leftBound - foundNodeCoordinates.x;
            const positionAdjustmentsForX = position === "LEFT_SIDE_OF_SCREEN" ? screenDimentions.width - 9.5 * CIRCLE_SIZE : 0;
            const foundNodeTranslatedY = canvasHeight / 2 - foundNodeCoordinates.y - 8 * CIRCLE_SIZE;

            return {
                transform: [
                    {
                        translateX: withSpring(foundNodeTranslatedX + positionAdjustmentsForX, { damping: 32, stiffness: 350 }),
                    },
                    {
                        translateY: withSpring(foundNodeTranslatedY, { damping: 32, stiffness: 350 }),
                    },
                    { scale: withSpring(DEFAULT_SCALE, { damping: 32, stiffness: 350 }) },
                ],
            };
        }
        return {
            transform: [
                { translateX: withSpring(offset.value.x, { damping: 32, stiffness: 500 }) },
                { translateY: withSpring(offset.value.y, { damping: 32, stiffness: 500 }) },
                { scale: withSpring(scale.value, { damping: 32, stiffness: 500 }) },
            ],
        };

        function whereShouldNodeBe({
            canvasWidth,
            foundNodeCoordinates,
            screenWidth,
        }: {
            foundNodeCoordinates: CirclePositionInCanvasWithLevel;
            canvasWidth: number;
            screenWidth: number;
        }) {
            const distanceFromRightMargin = canvasWidth - foundNodeCoordinates.x;

            if (distanceFromRightMargin <= screenWidth + CANVAS_HORIZONTAL_PADDING / 2) return "LEFT_SIDE_OF_SCREEN";

            return "RIGHT_SIDE_OF_SCREEN";
        }
    }, [offset, scale, foundNodeCoordinates, isTakingScreenshot]);

    return { transform, canvasGestures };
}

export default useHandleCanvasScroll;
