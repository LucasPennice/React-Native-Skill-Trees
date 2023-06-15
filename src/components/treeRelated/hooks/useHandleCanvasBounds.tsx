import { SharedValue, useAnimatedReaction, useSharedValue } from "react-native-reanimated";

function useHandleCanvasBounds(state: { minScale: number; scale: SharedValue<number>; screenWidth: number; canvasWidth: number }) {
    const { canvasWidth, minScale, scale, screenWidth } = state;
    const xBounds = useSharedValue(getWidthBounds(minScale, scale.value, screenWidth, canvasWidth));

    useAnimatedReaction(
        () => scale.value,
        (scaleValue: number) => {
            const h = minScale;

            const deltaY = 1 - minScale;
            const deltaX = (canvasWidth - screenWidth) / 2;

            const m = deltaY / deltaX;

            const y = scaleValue;

            const result = (y - h) / m;

            xBounds.value = result;
        },
        [scale, canvasWidth, screenWidth, minScale]
    );

    return { xBounds };
}

export default useHandleCanvasBounds;

function getWidthBounds(minScale: number, scale: number, screenWidth: number, canvasWidth: number) {
    const h = minScale;

    const deltaY = 1 - minScale;
    const deltaX = (canvasWidth - screenWidth) / 2;

    const m = deltaY / deltaX;

    const y = scale;

    const result = (y - h) / m;

    return result;
}
