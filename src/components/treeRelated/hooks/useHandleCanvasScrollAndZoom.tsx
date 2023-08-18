import { useEffect, useState } from "react";
import { Gesture } from "react-native-gesture-handler";
import { runOnJS, useAnimatedReaction, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { CIRCLE_SIZE_SELECTED, MENU_HIGH_DAMPENING, NAV_HEGIHT } from "../../../parameters";
import { ScreenDimentions } from "../../../redux/screenDimentionsSlice";
import { CanvasDimensions, NodeCoordinate } from "../../../types";
import { getXBounds, getYBounds, useHandleCanvasBounds } from "./useHandleCanvasBounds";

const DEFAULT_SCALE = 1;
const deaccelerationFactor = 2500;
const ANIMATION_DURATION_AFTER_FAILED_LONG_PRESS_MS = 1000;

function useHandleCanvasScrollAndZoom(
    canvasDimentions: CanvasDimensions,
    screenDimensions: ScreenDimentions,
    foundNodeCoordinates: NodeCoordinate | undefined,
    foundNodeOfMenu: NodeCoordinate | undefined,
    onScroll: () => void,
    draggingNode: { state: boolean; endDragging: () => void }
) {
    const { canvasHeight, canvasWidth } = canvasDimentions;

    const screenHeightWithNavAccounted = screenDimensions.height - NAV_HEGIHT;

    const minScaleX = screenDimensions.width / canvasWidth;
    const minScaleY = screenHeightWithNavAccounted / canvasHeight;
    const minScale = minScaleX < minScaleY ? minScaleY : minScaleX;
    const MAX_SCALE = 1.4;

    const start = useSharedValue({ x: 0, y: 0 });
    //We don't want to update the start value while panning (normal scrolling, NOT the slide after the scrolling) because the offsetX is calculated
    //based on the start value, if we update it while panning it causes exponential growth in the offset variables
    const shouldUpdateStartValue = useSharedValue(false);
    const offsetX = useSharedValue(0);
    const offsetY = useSharedValue(0);

    const scale = useSharedValue(DEFAULT_SCALE);
    const savedScale = useSharedValue(DEFAULT_SCALE);

    const selectedNodeMenuOpen = foundNodeCoordinates !== undefined;
    const animateFromSelectedNodeMenu = useShouldAnimateTransformation(selectedNodeMenuOpen);
    // const animateFromNodeMenu = useShouldAnimateTransformation(nodeMenuOpen);

    const dragX = useSharedValue(0);
    const dragY = useSharedValue(0);

    const boundsProps = {
        minScale,
        scale,
        screenWidth: screenDimensions.width,
        canvasWidth,
        canvasHeight,
        screenHeight: screenDimensions.height,
        maxScale: MAX_SCALE,
    };
    const { maxXBound, minXBound, maxYBound, minYBound } = useHandleCanvasBounds(boundsProps);

    const [scaleState, setScaleState] = useState(0);

    useAnimatedReaction(
        () => scale.value,
        (scaleValue: number) => {
            runOnJS(setScaleState)(scaleValue);
        },
        [scale]
    );

    useAnimatedReaction(
        () => offsetX.value,
        (offsetX: number) => {
            if (shouldUpdateStartValue.value !== true) return;
            start.value = { x: offsetX, y: start.value.y };
        },
        [offsetX, shouldUpdateStartValue]
    );

    useAnimatedReaction(
        () => offsetY.value,
        (offsetY: number) => {
            if (shouldUpdateStartValue.value !== true) return;
            start.value = { x: start.value.x, y: offsetY };
        },
        [offsetY, shouldUpdateStartValue]
    );

    useEffect(() => {
        const currentCanvasMinScale = screenDimensions.width / canvasWidth;

        //Avoids being zoomed out more than allowed when switching from a big tree to a small one
        if (!(scale.value >= currentCanvasMinScale && scale.value <= MAX_SCALE)) {
            scale.value = currentCanvasMinScale;
            savedScale.value = currentCanvasMinScale;
        }

        shouldUpdateStartValue.value = true;
        offsetX.value = 0;
        offsetY.value = 0;
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

    const animatePan = useSharedValue(false);

    const updateAnimatePan = () => {
        setTimeout(() => {
            animatePan.value = false;
        }, ANIMATION_DURATION_AFTER_FAILED_LONG_PRESS_MS);
    };

    const canvasPan = Gesture.Pan()
        .onStart(() => {
            if (draggingNode.state) return (animatePan.value = true);

            shouldUpdateStartValue.value = false;
            offsetX.value = start.value.x;
            offsetY.value = start.value.y;
            runOnJS(onScroll)();
        })
        .onUpdate((e) => {
            //Handles node dragging 👇
            if (draggingNode.state) {
                dragX.value = e.translationX;
                dragY.value = e.translationY;
                return;
            }

            if (foundNodeCoordinates) return;

            //Handles scrolling 👇

            const newXValue = e.translationX + start.value.x;
            const newYValue = e.translationY + start.value.y;

            shouldUpdateStartValue.value = false;

            if (animatePan.value) {
                offsetX.value = withSpring(newXValue, { duration: ANIMATION_DURATION_AFTER_FAILED_LONG_PRESS_MS });
                offsetY.value = withSpring(newYValue, { duration: ANIMATION_DURATION_AFTER_FAILED_LONG_PRESS_MS });

                runOnJS(updateAnimatePan)();
            } else {
                offsetX.value = newXValue;
                offsetY.value = newYValue;
            }
        })
        .onEnd((e) => {
            if (draggingNode.state) return runOnJS(draggingNode.endDragging)();

            shouldUpdateStartValue.value = true;

            const outOfBounds = checkIfScrollOutOfBounds({
                offset: { x: offsetX.value, y: offsetY.value },
                bounds: { x: [minXBound.value, maxXBound.value], y: [minYBound.value, maxYBound.value] },
            });

            const { x: safeX, y: safeY } = returnSafeOffset({
                offset: { x: offsetX.value, y: offsetY.value },
                outOfBounds,
                bounds: { x: [minXBound.value, maxXBound.value], y: [minYBound.value, maxYBound.value] },
            });

            if (outOfBounds.x) {
                offsetX.value = withSpring(safeX, MENU_HIGH_DAMPENING);
            } else {
                const aX = e.velocityX > 0 ? -deaccelerationFactor : deaccelerationFactor;
                const timeX = (0 - e.velocityX) / aX;
                const xCoordAfterFling = offsetX.value + e.velocityX * timeX + 0.5 * aX * timeX ** 2;

                const { x: xAfterSlideOutOfBounds } = checkIfScrollOutOfBounds({
                    offset: { x: xCoordAfterFling, y: 0 },
                    bounds: { x: [minXBound.value, maxXBound.value], y: [0, 0] },
                });

                if (xAfterSlideOutOfBounds) {
                    const { x: safeXAfterSlide } = returnSafeOffset({
                        offset: { x: xCoordAfterFling, y: 0 },
                        outOfBounds: { x: xAfterSlideOutOfBounds, y: false },
                        bounds: { x: [minXBound.value, maxXBound.value], y: [0, 0] },
                    });
                    offsetX.value = withSpring(safeXAfterSlide, { velocity: e.velocityX, stiffness: 10, dampingRatio: 1 });
                } else {
                    offsetX.value = withSpring(xCoordAfterFling, { velocity: e.velocityX, stiffness: 10, dampingRatio: 1 });
                }
            }

            if (outOfBounds.y) {
                offsetY.value = withSpring(safeY, MENU_HIGH_DAMPENING);
            } else {
                const aY = e.velocityY > 0 ? -deaccelerationFactor : deaccelerationFactor;
                const timeY = (0 - e.velocityY) / aY;
                const yCoordAfterFling = offsetY.value + e.velocityY * timeY + 0.5 * aY * timeY ** 2;

                const { y: yAfterSlideOutOfBounds } = checkIfScrollOutOfBounds({
                    offset: { x: 0, y: yCoordAfterFling },
                    bounds: { x: [0, 0], y: [minYBound.value, maxYBound.value] },
                });

                if (yAfterSlideOutOfBounds) {
                    const { y: safeYAfterSlide } = returnSafeOffset({
                        offset: { x: 0, y: yCoordAfterFling },
                        outOfBounds: { x: false, y: yAfterSlideOutOfBounds },
                        bounds: { x: [0, 0], y: [minYBound.value, maxYBound.value] },
                    });
                    offsetY.value = withSpring(safeYAfterSlide, { velocity: e.velocityY, stiffness: 10, dampingRatio: 1 });
                } else {
                    offsetY.value = withSpring(yCoordAfterFling, { velocity: e.velocityY, stiffness: 10, dampingRatio: 1 });
                }
            }
        });

    const canvasScrollAndZoom = Gesture.Simultaneous(canvasPan, canvasZoom);

    const transform = useAnimatedStyle(() => {
        if (foundNodeCoordinates) return transitionToSelectedNodeStyle();
        if (animateFromSelectedNodeMenu) return transitionFromMenuToNormalScrolling();
        // if (foundNodeOfMenu) return transitionToNodeOption();

        //This is the regular scrolling style
        return {
            transform: [{ translateX: offsetX.value }, { translateY: offsetY.value }, { scale: scale.value }],
        };

        function transitionToSelectedNodeStyle() {
            const alignCanvasLeftSideWithScreenLeftSide = (canvasWidth - screenDimensions.width) / 2;
            const foundNodeTranslatedX =
                alignCanvasLeftSideWithScreenLeftSide - foundNodeCoordinates!.x + screenDimensions.width - 1.5 * CIRCLE_SIZE_SELECTED;

            const deltaY = (screenDimensions.height - NAV_HEGIHT) / 2 - foundNodeCoordinates!.y;
            const foundNodeTranslatedY = deltaY;

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

        function transitionFromMenuToNormalScrolling() {
            return {
                transform: [
                    { translateX: withSpring(offsetX.value, { damping: 32, stiffness: 350 }) },
                    { translateY: withSpring(offsetY.value, { damping: 32, stiffness: 350 }) },
                    { scale: withSpring(scale.value, { damping: 32, stiffness: 350 }) },
                ],
            };
        }
    }, [offsetX, offsetY, scale, foundNodeCoordinates, animateFromSelectedNodeMenu, foundNodeOfMenu]);

    const dragDelta = { x: dragX, y: dragY };

    return { transform, canvasScrollAndZoom, scale: scaleState, dragDelta };
}

export default useHandleCanvasScrollAndZoom;

function useShouldAnimateTransformation(isMenuOpen: boolean) {
    const [result, setResult] = useState(false);

    useEffect(() => {
        if (isMenuOpen) setResult(true);

        let timeoutId: undefined | NodeJS.Timeout;

        if (!isMenuOpen) {
            timeoutId = setTimeout(() => {
                setResult(false);
            }, 200);
        }

        return () => {
            clearTimeout(timeoutId);
        };
    }, [isMenuOpen]);

    return result;
}

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
