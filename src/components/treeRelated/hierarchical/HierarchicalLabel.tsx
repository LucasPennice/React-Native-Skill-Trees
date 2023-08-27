import { Group, SkFont, Text } from "@shopify/react-native-skia";

const labelMarginTop = 30;

function HierarchicalLabel({ coord, text, font }: { text: string; coord: { cx: number; cy: number }; font: SkFont }) {
    const { cx, cy } = coord;

    const WORD_LENGTH_LIMIT = 13;
    const WORD_QTY_LIMIT = 3;
    let wordArr = text.split(" ").map((word) => {
        if (word.length > WORD_LENGTH_LIMIT) return `${word.slice(0, WORD_LENGTH_LIMIT)}...`;
        return word;
    });

    wordArr = wordArr.length > WORD_QTY_LIMIT ? [...wordArr.slice(0, WORD_QTY_LIMIT), "..."] : wordArr;

    const distanceBetweenWords = 14;
    const fontSize = 14;

    return (
        <Group>
            {wordArr.map((word, idx) => {
                const wordWidth = font.getTextWidth(word);

                const textX = cx - wordWidth / 2;
                const textY = cy + fontSize / 2 + idx * distanceBetweenWords + labelMarginTop;

                return <Text key={idx} x={textX} y={textY} text={word} color={"#FFFFFF"} font={font} />;
            })}
        </Group>
    );
}

export default HierarchicalLabel;
