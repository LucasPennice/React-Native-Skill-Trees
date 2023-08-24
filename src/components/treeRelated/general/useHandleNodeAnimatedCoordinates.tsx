import { SkFont, Skia } from "@shopify/react-native-skia";
import { SharedValue, useDerivedValue, withSpring } from "react-native-reanimated";
import { CANVAS_SPRING, CIRCLE_SIZE, NODE_ICON_FONT_SIZE } from "../../../parameters";

function useSharedValuesFromNodeCoord(coordinates: { cx: number; cy: number }) {
    const x = useDerivedValue(() => {
        return withSpring(coordinates.cx, CANVAS_SPRING);
    });
    const y = useDerivedValue(() => {
        return withSpring(coordinates.cy, CANVAS_SPRING);
    });

    return { x, y };
}

function useIconPosition(x: SharedValue<number>, y: SharedValue<number>, textWidth: number) {
    const textX = useDerivedValue(() => x.value - textWidth / 2);
    const textY = useDerivedValue(() => {
        function getHeightForFont(fontSize: number) {
            return (fontSize * 125.5) / 110;
        }

        return y.value + getHeightForFont(NODE_ICON_FONT_SIZE) / 4 + 1;
    });

    return { textX, textY };
}

function useHandleNodeAnimatedCoordinates(
    coordinates: { cx: number; cy: number },
    text: { color: string; letter: string; isEmoji: boolean },
    font: SkFont
) {
    const textWidth = getTextWidth();

    const { x, y } = useSharedValuesFromNodeCoord(coordinates);
    // const x = useAnimateSkiaValue({ initialValue: cx, stateToAnimate: cx });
    // const y = useAnimateSkiaValue({ initialValue: cy, stateToAnimate: cy });

    const { textX, textY } = useIconPosition(x, y, textWidth);

    const path = useDerivedValue(() => {
        const strokeWidth = 2;
        const radius = CIRCLE_SIZE + strokeWidth / 2;
        const p = Skia.Path.Make();

        p.moveTo(x.value, y.value);
        p.addCircle(x.value, y.value, radius);
        p.simplify();

        return p;
    });

    return { path, textX, textY, x, y };

    function getTextWidth() {
        if (text.isEmoji) return font.getTextWidth(text.letter);
        if (!text.isEmoji) return font.getTextWidth(text.letter.toUpperCase());

        return 0;
    }
}
export default useHandleNodeAnimatedCoordinates;
