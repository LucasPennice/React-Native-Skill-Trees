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

    const WORD_LENGTH_LIMIT = 7;
    const WORD_QTY_LIMIT = 3;

    let wordArr = text.split(" ").map((word) => {
        if (word.length > WORD_LENGTH_LIMIT) return `${word.slice(0, WORD_LENGTH_LIMIT)}...`;
        return word;
    });

    wordArr = wordArr.length > WORD_QTY_LIMIT ? [...wordArr.slice(0, WORD_QTY_LIMIT), "..."] : wordArr;

    const distanceBetweenWords = 14;
    const fontSize = 12;
    const horizontalPadding = 10;
    const verticalPadding = 5;

    const textHeight = wordArr.length * fontSize + (wordArr.length - 1) * (distanceBetweenWords - fontSize);

    const rectangleDimentions = calculateRectangleDimentions(wordArr);

    const rectX = x + CIRCLE_SIZE + horizontalPadding;
    const rectY = y - fontSize / 4 - verticalPadding - 4 * wordArr.length;

    const directionVector = { x: coord.x - rootCoord.x, y: coord.y - rootCoord.y };
    const possiblyNegativeAngleInRadians = Math.atan2(directionVector.y, directionVector.x);
    const angleInRadians = possiblyNegativeAngleInRadians < 0 ? possiblyNegativeAngleInRadians + 2 * Math.PI : possiblyNegativeAngleInRadians;

    return (
        <Group origin={{ x: x, y: y }} transform={[{ rotate: angleInRadians }]}>
            <RoundedRect r={5} height={rectangleDimentions.height} width={rectangleDimentions.width} x={rectX} y={rectY} color={color.rect} />
            {wordArr.map((word, idx) => {
                const textX = rectX + horizontalPadding - 1;
                const textY = rectY + 3 * verticalPadding + idx * distanceBetweenWords;

                const rotatedTextX = textX - rectangleDimentions.width + 2 * horizontalPadding - 2;
                const rotatedTextY = textY + verticalPadding + 3;

                const shouldRotate = angleInRadians > Math.PI / 2 && angleInRadians < 3 * (Math.PI / 2);

                return (
                    <Text
                        origin={{
                            x: textX,
                            y: textY,
                        }}
                        transform={[{ rotate: shouldRotate ? Math.PI : 0 }]}
                        key={idx}
                        x={shouldRotate ? rotatedTextX : textX}
                        y={shouldRotate ? rotatedTextY : textY}
                        text={word}
                        color={color.text}
                        font={labelFont}
                    />
                );
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
