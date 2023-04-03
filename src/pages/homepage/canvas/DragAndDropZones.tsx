import { DashPathEffect, Rect, RoundedRect } from "@shopify/react-native-skia";
import { DnDZone } from "../../../types";
import { colors } from "./parameters";

function DragAndDropZones({ data }: { data: DnDZone[] }) {
    const getColor = (type: DnDZone["type"]) => {
        if (type === "PARENT") return colors.blue;

        if (type === "LEFT_BROTHER") return colors.green;

        if (type === "RIGHT_BROTHER") return colors.pink;

        return colors.yellow;
    };
    return (
        <>
            {data.map((z, idx) => {
                return (
                    <RoundedRect
                        r={10}
                        style={"stroke"}
                        strokeWidth={1}
                        key={idx}
                        height={z.height}
                        width={z.width}
                        x={z.x}
                        y={z.y}
                        color={getColor(z.type)}
                        opacity={0.7}>
                        <DashPathEffect intervals={[10, 10]} />
                    </RoundedRect>
                );
            })}
        </>
    );
}

export default DragAndDropZones;
