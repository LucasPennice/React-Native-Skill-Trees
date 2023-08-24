import { Group, SkFont, Text } from "@shopify/react-native-skia";
import { memo } from "react";
import { CIRCLE_SIZE, RADIAL_LABEL_FONT_SIZE } from "../../../parameters";
import { CartesianCoordinate } from "../../../types";

type Props = { text: string; coord: CartesianCoordinate; rootCoord: CartesianCoordinate; labelFont: SkFont };

function RadialLabel({ coord, text, rootCoord, labelFont }: Props) {
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
    const horizontalPadding = 10;
    const verticalPadding = 5;

    const textHeight = wordArr.length * RADIAL_LABEL_FONT_SIZE + (wordArr.length - 1) * (distanceBetweenWords - RADIAL_LABEL_FONT_SIZE);

    const rectangleDimentions = calculateRectangleDimentions(wordArr);

    const directionVector = { x: coord.x - rootCoord.x, y: coord.y - rootCoord.y };
    const possiblyNegativeAngleInRadians = Math.atan2(directionVector.y, directionVector.x);
    const angleInRadians = possiblyNegativeAngleInRadians < 0 ? possiblyNegativeAngleInRadians + 2 * Math.PI : possiblyNegativeAngleInRadians;

    return (
        <Group origin={{ x: x, y: y }} transform={[{ rotate: angleInRadians }]}>
            {wordArr.map((word, idx) => {
                const textX = x + CIRCLE_SIZE + horizontalPadding;
                const textY =
                    y - RADIAL_LABEL_FONT_SIZE / 4 - verticalPadding - 4 * wordArr.length + 3 * verticalPadding + idx * distanceBetweenWords;

                const rotatedTextX = textX - rectangleDimentions.width + 2 * horizontalPadding - 2;
                const rotatedTextY = textY + verticalPadding + 3;

                const shouldRotate = angleInRadians > Math.PI / 2 && angleInRadians < 3 * (Math.PI / 2);

                return (
                    <Text
                        origin={{ x: textX, y: textY }}
                        transform={[{ rotate: shouldRotate ? Math.PI : 0 }]}
                        key={idx}
                        x={shouldRotate ? rotatedTextX : textX}
                        y={shouldRotate ? rotatedTextY : textY}
                        text={word}
                        color={"#FFFFFF"}
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

export default memo(RadialLabel, arePropsEqual);

function arePropsEqual(prevProps: Props, nextProps: Props): boolean {
    if (prevProps.coord.x !== nextProps.coord.x) return false;
    if (prevProps.coord.y !== nextProps.coord.y) return false;
    if (prevProps.rootCoord.x !== nextProps.rootCoord.x) return false;
    if (prevProps.rootCoord.y !== nextProps.rootCoord.y) return false;
    if (prevProps.text !== nextProps.text) return false;

    return true;
}
