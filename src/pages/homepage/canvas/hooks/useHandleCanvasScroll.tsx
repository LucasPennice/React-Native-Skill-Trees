import { Gesture } from "react-native-gesture-handler";
import { useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { useAppSelector } from "../../../../redux/reduxHooks";
import { selectScreenDimentions } from "../../../../redux/screenDimentionsSlice";

function useHandleCanvasScroll(canvasWidth: number, canvasHeight: number) {
    const screenDimentions = useAppSelector(selectScreenDimentions);

    const minScale = screenDimentions.width / canvasWidth;

    const start = useSharedValue({ x: 0, y: 0 });
    const offset = useSharedValue({ x: 0, y: 0 });

    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);

    const canvasZoom = Gesture.Pinch()
        .onUpdate((e) => {
            const newScaleValue = savedScale.value * e.scale;
            scale.value = clamp(minScale, 1.4, newScaleValue);

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
        .onStart(() => {})
        .onUpdate((e) => {
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
        return { transform: [{ translateX: offset.value.x }, { translateY: offset.value.y }, { scale: scale.value }] };
    }, [offset]);

    return { transform, canvasGestures };
}

export default useHandleCanvasScroll;
