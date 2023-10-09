import { CartesianCoordinate } from "@/types";
import { SkFont, Skia } from "@shopify/react-native-skia";
import { useEffect } from "react";
import { SharedValue, useDerivedValue, useSharedValue, withSpring } from "react-native-reanimated";
import { CIRCLE_SIZE, NODE_ICON_FONT_SIZE, TIME_TO_REORDER_TREE } from "../../../parameters";

export const getTextCoordinates = (coord: CartesianCoordinate, textWidth: number) => {
    const x = coord.x - textWidth / 2;
    const y = coord.y + getHeightForFont(NODE_ICON_FONT_SIZE) / 4 + 1;

    function getHeightForFont(fontSize: number) {
        return (fontSize * 125.5) / 110;
    }

    return { x, y };
};

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
    initialCoordinates: CartesianCoordinate,
    finalCoordinates: CartesianCoordinate,
    text: { color: string; letter: string; isEmoji: boolean },
    font: SkFont
) {
    const textWidth = getTextWidth();

    const x = useSharedValue(initialCoordinates.x);
    const y = useSharedValue(initialCoordinates.y);

    useEffect(() => {
        x.value = withSpring(finalCoordinates.x, { duration: TIME_TO_REORDER_TREE, dampingRatio: 0.7 });
        y.value = withSpring(finalCoordinates.y, { duration: TIME_TO_REORDER_TREE, dampingRatio: 0.7 });
    }, []);

    const { textX, textY } = useIconPosition(x, y, textWidth);

    const path = useDerivedValue(() => {
        const path = Skia.Path.Make();
        path.moveTo(x.value, y.value);
        path.addCircle(x.value, y.value, CIRCLE_SIZE);
        path.simplify();
        return path;
    });

    return { path, textX, textY, x, y };

    function getTextWidth() {
        if (text.isEmoji) return font.getTextWidth(text.letter);
        if (!text.isEmoji) return font.getTextWidth(text.letter.toUpperCase());

        return 0;
    }
}
export default useHandleNodeAnimatedCoordinates;
