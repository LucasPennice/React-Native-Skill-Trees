import { DashPathEffect, Rect, RoundedRect } from "@shopify/react-native-skia";
import { DnDZone } from "../../../types";
import { colors } from "./parameters";

function DragAndDropZones({ data }: { data: DnDZone[] }) {
    return (
        <>
            {data.map((z, idx) => {
                return (
                    <RoundedRect
                        r={5}
                        style={"stroke"}
                        strokeWidth={1}
                        key={idx}
                        height={z.height}
                        width={z.width}
                        x={z.x}
                        y={z.y}
                        color={colors.unmarkedText}
                        opacity={0.5}>
                        <DashPathEffect intervals={[2, 2]} />
                    </RoundedRect>
                );
            })}
        </>
    );
}

export default DragAndDropZones;
