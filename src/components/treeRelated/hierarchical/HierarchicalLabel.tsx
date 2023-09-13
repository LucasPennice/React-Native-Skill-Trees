import { Group, SkFont, Text } from "@shopify/react-native-skia";
import { getNodeLabelLines } from "../general/functions";

const labelToNodeDistance = 30;

function HierarchicalLabel({ coord, text, font }: { text: string; coord: { cx: number; cy: number }; font: SkFont }) {
    const { cx, cy } = coord;

    const verticalDistanceBetweenWords = 14;
    const fontSize = 14;

    const lines = getNodeLabelLines(text.split(" "), font);

    return (
        <Group>
            {lines.map((line, idx) => {
                const lineWidth = font.getTextWidth(line);

                const textX = cx - lineWidth / 2;
                const textY = cy + fontSize / 2 + idx * verticalDistanceBetweenWords + labelToNodeDistance;

                return <Text key={idx} x={textX} y={textY} text={line} color={"#FFFFFF"} font={font} />;
            })}
        </Group>
    );
}

export default HierarchicalLabel;
