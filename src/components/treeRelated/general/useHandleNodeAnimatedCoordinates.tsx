import { SkFont, Skia } from "@shopify/react-native-skia";
import { useAnimatedReaction, useDerivedValue, useSharedValue } from "react-native-reanimated";
import { CIRCLE_SIZE } from "../../../parameters";
import { DragObject } from "../../../types";

const NODE_ICON_FONT_SIZE = 17;

function useHandleNodeAnimatedCoordinates(
    coordinates: { cx: number; cy: number },
    text: { color: string; letter: string; isEmoji: boolean },
    font: SkFont,
    nodeDrag: DragObject["sharedValues"] | undefined
) {
    const { cx, cy } = coordinates;

    const textWidth = getTextWidth();

    const x = useSharedValue(cx);
    const y = useSharedValue(cy);

    useAnimatedReaction(
        () => {
            return [nodeDrag, coordinates] as const;
        },
        (arr, _) => {
            const [nodeDrag, coordinates] = arr;

            let updatedX = coordinates.cx;
            let updatedY = coordinates.cy;

            if (nodeDrag !== undefined) {
                updatedX += nodeDrag.x.value;
                updatedY += nodeDrag.y.value;
            }

            x.value = updatedX;
            y.value = updatedY;
        },
        [coordinates, nodeDrag]
    );

    const textX = useDerivedValue(() => x.value - textWidth / 2, [x, textWidth]);
    const textY = useDerivedValue(() => {
        function getHeightForFont(fontSize: number) {
            return (fontSize * 125.5) / 110;
        }

        return y.value + getHeightForFont(NODE_ICON_FONT_SIZE) / 4 + 1;
    }, [y]);

    const path = useDerivedValue(() => {
        const strokeWidth = 2;
        const radius = CIRCLE_SIZE + strokeWidth / 2;
        const p = Skia.Path.Make();

        p.moveTo(x.value, y.value);
        p.addCircle(x.value, y.value, radius);
        p.simplify();

        return p;
    }, [x, y]);

    return { path, textX, textY, x, y };

    function getTextWidth() {
        if (text.isEmoji) return font.getTextWidth(text.letter);
        if (!text.isEmoji) return font.getTextWidth(text.letter.toUpperCase());

        return 0;
    }
}
export default useHandleNodeAnimatedCoordinates;
