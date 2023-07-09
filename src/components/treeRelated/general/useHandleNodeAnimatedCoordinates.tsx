import { SkFont, Skia, useComputedValue } from "@shopify/react-native-skia";
import { CIRCLE_SIZE } from "../../../parameters";
import useAnimateSkiaValue from "../hooks/useAnimateSkiaValue";

const NODE_ICON_FONT_SIZE = 17;

function useHandleNodeAnimatedCoordinates(
    coordinates: { cx: number; cy: number },
    text: { color: string; letter: string; isEmoji: boolean },
    font: SkFont
) {
    const { cx, cy } = coordinates;

    const textWidth = getTextWidth();

    const x = useAnimateSkiaValue({ initialValue: cx, stateToAnimate: cx });
    const y = useAnimateSkiaValue({ initialValue: cy, stateToAnimate: cy });

    const textX = useComputedValue(() => x.value - textWidth / 2, [x, textWidth]);
    const textY = useComputedValue(() => y.value + getHeightForFont(NODE_ICON_FONT_SIZE) / 4 + 1, [y]);

    const path = useComputedValue(() => {
        const strokeWidth = 2;
        const radius = CIRCLE_SIZE + strokeWidth / 2;
        const p = Skia.Path.Make();

        p.moveTo(x.value, y.value);
        p.addCircle(x.value, y.value, radius);
        p.simplify();

        return p;
    }, [x, y]);

    return { path, textX, textY, x, y };

    function getHeightForFont(fontSize: number) {
        return (fontSize * 125.5) / 110;
    }

    function getTextWidth() {
        if (text.isEmoji) return font.getTextWidth(text.letter);
        if (!text.isEmoji) return font.getTextWidth(text.letter.toUpperCase());

        return 0;
    }
}
export default useHandleNodeAnimatedCoordinates;
