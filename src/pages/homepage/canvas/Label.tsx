import { Blur, Group, RoundedRect, SkiaMutableValue, Text, useFont } from "@shopify/react-native-skia";
import { Skill, Tree } from "../../../types";
import { colors } from "./parameters";

const labelMarginTop = 40;

function Label({
    coord,
    tree,
    pathBlurOnInactive,
    treeAccentColor,
}: {
    tree: Tree<Skill>;
    treeAccentColor: string;
    coord: { cx: number; cy: number };
    pathBlurOnInactive: SkiaMutableValue<number>;
}) {
    const labelFont = useFont(require("../../../../assets/Helvetica.ttf"), 12);

    if (!labelFont) return <></>;

    const { cx, cy } = coord;

    const text = tree.data.name;
    const wordArr = text.split(" ");

    const distanceBetweenWords = 14;
    const fontSize = 12;
    const horizontalPadding = 10;
    const verticalPadding = 5;

    const textHeight = wordArr.length * fontSize + (wordArr.length - 1) * (distanceBetweenWords - fontSize);

    const rectangleDimentions = calculateRectangleDimentions(wordArr);

    const rectX = cx - rectangleDimentions.width / 2 + 2;
    const rectY = cy + labelMarginTop - fontSize / 4 - verticalPadding;

    return (
        <Group opacity={pathBlurOnInactive}>
            <RoundedRect
                r={5}
                height={rectangleDimentions.height}
                width={rectangleDimentions.width}
                x={rectX}
                y={rectY}
                color={tree.data.isCompleted ? treeAccentColor : colors.line}
            />
            {wordArr.map((word, idx) => {
                const wordWidth = labelFont.getTextWidth(word);

                const textX = cx - wordWidth / 2;
                const textY = cy + fontSize / 2 + idx * distanceBetweenWords + labelMarginTop;

                return <Text key={idx} x={textX} y={textY} text={text} color="white" font={labelFont} />;
            })}
        </Group>
    );

    function calculateRectangleDimentions(wordArr: string[]) {
        let largestLetterWord = "";

        wordArr.forEach((w) => {
            if (w.length > largestLetterWord.length) largestLetterWord = w;
        });

        const longerWordWidth = labelFont!.getTextWidth(largestLetterWord);

        return {
            width: longerWordWidth + 2 * horizontalPadding,
            height: textHeight + 2 * verticalPadding,
        };
    }
}

export default Label;
