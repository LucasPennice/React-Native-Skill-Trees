import { Group, LinearGradient, RoundedRect, SkFont, Text, vec } from "@shopify/react-native-skia";
import { useEffect } from "react";
import { useSharedValue, withSpring } from "react-native-reanimated";
import { colors } from "../../../parameters";
import { DnDZone } from "../../../types";

function TreeInsertPositions({ z, font, selectedDndZone }: { z: DnDZone; font: SkFont; selectedDndZone: DnDZone | undefined }) {
    const dndZoneId = `${z.ofNode}${z.type}`;
    const selectedDndZoneId = selectedDndZone === undefined ? "undefined" : `${selectedDndZone.ofNode}${selectedDndZone.type}`;
    const isSelected = dndZoneId === selectedDndZoneId;

    const defaultDifRectCoord = { x: z.x, y: z.y };
    const defaultOuter = { x: defaultDifRectCoord.x, y: defaultDifRectCoord.y, width: z.width, height: z.height };

    const x = useSharedValue(defaultOuter.x);
    const y = useSharedValue(defaultOuter.y);
    const width = useSharedValue(defaultOuter.width);
    const height = useSharedValue(defaultOuter.height);

    const text = { x: z.x + z.width / 2 - 7, y: z.y + z.height / 2 + 5 };

    const opacity = useSharedValue(isSelected ? 1 : 0);

    useEffect(() => {
        opacity.value = withSpring(isSelected ? 1 : 0);
        x.value = withSpring(isSelected ? z.x - (z.width * (1.4 - 1)) / 2 : defaultOuter.x);
        y.value = withSpring(isSelected ? z.y - (z.height * (1.4 - 1)) / 2 : defaultOuter.y);
        width.value = withSpring(isSelected ? z.width * 1.4 : defaultOuter.width);
        height.value = withSpring(isSelected ? z.height * 1.4 : defaultOuter.height);
    }, [isSelected]);

    return (
        <Group>
            <RoundedRect r={5} style={"fill"} strokeWidth={1} height={height} width={width} x={x} y={y} opacity={opacity}>
                <LinearGradient
                    start={vec(x.value, y.value)}
                    end={vec(x.value + width.value, y.value + height.value)}
                    colors={["#1982F9", "#BF5AF2"]}
                />
            </RoundedRect>
            <RoundedRect
                r={5}
                style={"fill"}
                strokeWidth={1}
                height={z.height}
                width={z.width}
                x={z.x}
                y={z.y}
                color={colors.darkGray}
                opacity={isSelected ? 1 : 0.7}
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
        </Group>
    );
}

export default TreeInsertPositions;
