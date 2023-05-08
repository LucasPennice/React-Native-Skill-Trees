import { Group, RoundedRect, Text, useFont } from "@shopify/react-native-skia";
import { CIRCLE_SIZE } from "../../../parameters";
import { CartesianCoordinate } from "../../../types";

function RadialLabel({
    coord,
    color,
    text,
    rootCoord,
}: {
    color: { rect: string; text: string };
    text: string;
    coord: CartesianCoordinate;
    rootCoord: CartesianCoordinate;
}) {
    const labelFont = useFont(require("../../../../assets/Helvetica.ttf"), 12);

    if (!labelFont) return <></>;

    const { x, y } = coord;

    const wordArr = text.split(" ");

    const distanceBetweenWords = 14;
    const fontSize = 12;
    const horizontalPadding = 10;
    const verticalPadding = 5;

    const textHeight = wordArr.length * fontSize + (wordArr.length - 1) * (distanceBetweenWords - fontSize);

    const rectangleDimentions = calculateRectangleDimentions(wordArr);

    const rectX = x + CIRCLE_SIZE + horizontalPadding;
    const rectY = y - fontSize / 4 - verticalPadding - 3;

    const directionVector = { x: coord.x - rootCoord.x, y: coord.y - rootCoord.y };
    const angleInRadians = Math.atan2(directionVector.y, directionVector.x);

    return (
        <Group origin={{ x: x, y: y }} transform={[{ rotate: angleInRadians }]}>
            <RoundedRect r={5} height={rectangleDimentions.height} width={rectangleDimentions.width} x={rectX} y={rectY} color={color.rect} />
            {wordArr.map((word, idx) => {
                const textX = rectX + horizontalPadding - 1;
                const textY = rectY + 3 * verticalPadding + idx * distanceBetweenWords;

                return <Text key={idx} x={textX} y={textY} text={word} color={color.text} font={labelFont} />;
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

export default RadialLabel;
