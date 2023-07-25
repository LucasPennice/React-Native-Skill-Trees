import { Group, RoundedRect, Text, useFont } from "@shopify/react-native-skia";
import { Fragment, useEffect } from "react";
import { useSharedValue, withTiming } from "react-native-reanimated";
import { colors } from "../../../parameters";
import { DnDZone } from "../../../types";

function DragAndDropZones({ data, selectedDndZone }: { data: DnDZone[]; selectedDndZone?: DnDZone }) {
    const selectedZoneId = selectedDndZone ? `${selectedDndZone.ofNode}${selectedDndZone.type}` : "";

    const font = useFont(require("../../../../assets/Helvetica.ttf"), 22);

    const opacity = useSharedValue(0);

    useEffect(() => {
        opacity.value = withTiming(1);
    }, []);

    if (!font) return <></>;

    return (
        <Group opacity={opacity}>
            {data.map((z, idx) => {
                const dndZoneId = `${z.ofNode}${z.type}`;

                const isSelected = selectedZoneId === dndZoneId;

                const text = {
                    x: z.x + z.width / 2 - 7,
                    y: z.y + z.height / 2 + 5,
                };

                return (
                    <Fragment key={idx}>
                        <RoundedRect
                            r={5}
                            style={"fill"}
                            strokeWidth={1}
                            height={z.height}
                            width={z.width}
                            x={z.x}
                            y={z.y}
                            color={colors.darkGray}
                            opacity={isSelected ? 0.4 : 0.8}
                        />
                        <RoundedRect
                            r={5}
                            style={"stroke"}
                            strokeWidth={1}
                            height={z.height}
                            width={z.width}
                            x={z.x}
                            y={z.y}
                            color={colors.line}
                            opacity={isSelected ? 0.4 : 1}
                        />
                        <Text x={text.x} y={text.y} text={"+"} font={font} color={colors.accent} />
                    </Fragment>
                );
            })}
        </Group>
    );
}

export default DragAndDropZones;
