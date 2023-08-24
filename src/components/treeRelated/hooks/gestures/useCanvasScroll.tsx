import { useEffect } from "react";
import { Gesture } from "react-native-gesture-handler";
import { SharedValue, WithSpringConfig, runOnJS, useAnimatedReaction, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { CIRCLE_SIZE_SELECTED, MENU_HIGH_DAMPENING, NAV_HEGIHT } from "../../../../parameters";
import { ScreenDimentions } from "../../../../redux/slices/screenDimentionsSlice";
import { CanvasDimensions, CartesianCoordinate, CoordinatesWithTreeData } from "../../../../types";
import { useHandleCanvasBounds } from "../useHandleCanvasBounds";
import { ANIMATION_DURATION_AFTER_FAILED_LONG_PRESS_MS, DEACCELERATION_FACTOR, DEFAULT_SCALE } from "./params";

const AFTER_SCROLL_SPING_PARAMS: WithSpringConfig = {
    mass: 1,
    damping: 15,
    stiffness: 100,
    overshootClamping: true,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 2,
};

function useSyncStateToSharedValue<T>(state: T): SharedValue<T> {
    const result = useSharedValue<T>(state);

    useAnimatedReaction(
        () => state,
        (updatedSharedValue: T) => {
            result.value = updatedSharedValue;
        }
    );

    return result;
}

function useResetValuesOnCanvasDimensionUpdates(resetValues: () => void, canvasDimensions: CanvasDimensions) {
    useEffect(() => {
        resetValues();
    }, [canvasDimensions]);
}

function useUpdateStartValue(
    offsetX: SharedValue<number>,
    offsetY: SharedValue<number>,
    shouldUpdateStartValue: SharedValue<boolean>,
    start: SharedValue<CartesianCoordinate>
) {
    useAnimatedReaction(
        () => {
            return { offsetX: offsetX.value, offsetY: offsetY.value, shouldUpdateStartValue: shouldUpdateStartValue.value };
        },
        (args: { offsetX: number; offsetY: number; shouldUpdateStartValue: boolean }) => {
            if (shouldUpdateStartValue.value !== true) return;

            start.value = { x: args.offsetX, y: args.offsetY };
        }
    );
}

function useCanvasScroll(
    canvasDimentions: CanvasDimensions,
    screenDimensions: ScreenDimentions,
    foundNodeCoordinates: CoordinatesWithTreeData | undefined,
    foundNodeOfMenu: CoordinatesWithTreeData | undefined,
    onScroll: () => void,
    draggingNode: { state: boolean; endDragging: () => void },
    sharedValues: {
        offsetX: SharedValue<number>;
        offsetY: SharedValue<number>;
        scale: SharedValue<number>;
        selectedNode: SharedValue<CoordinatesWithTreeData | null>;
    }
) {
    const { offsetX, offsetY, scale, selectedNode } = sharedValues;

    const resetSharedValues = () => {
        shouldUpdateStartValue.value = true;
        offsetX.value = 0;
        offsetY.value = 0;
    };

    const screenHeightWithNavAccounted = screenDimensions.height - NAV_HEGIHT;
    const { canvasHeight, canvasWidth } = canvasDimentions;

    const start = useSharedValue<CartesianCoordinate>({ x: 0, y: 0 });
    //We don't want to update the start value while panning (normal scrolling, NOT the slide after the scrolling) because the offsetX is calculated
    //based on the start value, if we update it while panning it causes exponential growth in the offset variables
    const shouldUpdateStartValue = useSharedValue(false);

    const minScaleX = screenDimensions.width / canvasWidth;
    const minScaleY = screenHeightWithNavAccounted / canvasHeight;
    const minScale = minScaleX < minScaleY ? minScaleY : minScaleX;
    const MAX_SCALE = 1.4;

    const dragX = useSharedValue(0);
    const dragY = useSharedValue(0);

    const animatePan = useSharedValue(false);

    const updateAnimatePan = () => {
        setTimeout(() => {
            animatePan.value = false;
        }, ANIMATION_DURATION_AFTER_FAILED_LONG_PRESS_MS);
    };

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

    useResetValuesOnCanvasDimensionUpdates(resetSharedValues, canvasDimentions);

    useUpdateStartValue(offsetX, offsetY, shouldUpdateStartValue, start);

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
                const aX = e.velocityX > 0 ? -DEACCELERATION_FACTOR : DEACCELERATION_FACTOR;
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
                    offsetX.value = withSpring(safeXAfterSlide, { velocity: e.velocityX, ...AFTER_SCROLL_SPING_PARAMS });
                } else {
                    offsetX.value = withSpring(xCoordAfterFling, { velocity: e.velocityX, ...AFTER_SCROLL_SPING_PARAMS });
                }
            }

            if (outOfBounds.y) {
                offsetY.value = withSpring(safeY, MENU_HIGH_DAMPENING);
            } else {
                const aY = e.velocityY > 0 ? -DEACCELERATION_FACTOR : DEACCELERATION_FACTOR;
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
                    offsetY.value = withSpring(safeYAfterSlide, { velocity: e.velocityY, ...AFTER_SCROLL_SPING_PARAMS });
                } else {
                    offsetY.value = withSpring(yCoordAfterFling, { velocity: e.velocityY, ...AFTER_SCROLL_SPING_PARAMS });
                }
            }
        });

    const selectedNodeMenuOpen = foundNodeCoordinates !== undefined;
    const animateNodeMenuTransition = useAnimateNodeMenuTransition(selectedNodeMenuOpen);

    const scrollStyle = useAnimatedStyle(() => {
        if (foundNodeCoordinates) return transitionToSelectedNodeStyle();
        if (animateNodeMenuTransition.value) return transitionFromMenuToNormalScrolling();

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
    });

    const dragDelta = { x: dragX, y: dragY };

    return { canvasPan, scrollStyle, dragDelta };
}

export default useCanvasScroll;

function useAnimateNodeMenuTransition(isMenuOpen: boolean): SharedValue<boolean> {
    const result = useSharedValue<boolean>(false);

    useEffect(() => {
        if (isMenuOpen) result.value = true;

        let timeoutId: undefined | NodeJS.Timeout;

        if (!isMenuOpen) {
            timeoutId = setTimeout(() => {
                result.value = false;
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
