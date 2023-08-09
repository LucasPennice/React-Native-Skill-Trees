import { Group, useFont } from "@shopify/react-native-skia";
import { Fragment, useEffect } from "react";
import { useSharedValue, withTiming } from "react-native-reanimated";
import { DnDZone } from "../../../types";
import TreeInsertPositions from "./TreeInsertPositions";

function DragAndDropZones({ data, selectedDndZone }: { data: DnDZone[]; selectedDndZone?: DnDZone }) {
    const font = useFont(require("../../../../assets/Helvetica.ttf"), 22);

    const opacity = useSharedValue(0);

    useEffect(() => {
        opacity.value = withTiming(1);
    }, []);

    if (!font) return <></>;

    const selectedDndZoneId = selectedDndZone === undefined ? "undefined" : `${selectedDndZone.ofNode}${selectedDndZone.type}`;

    return (
        <Group opacity={opacity}>
            {data.map((z) => {
                const dndZoneId = `${z.ofNode}${z.type}`;

                const isSelected = dndZoneId === selectedDndZoneId;

                if (isSelected) return <Fragment key={"foo"}></Fragment>;

                return <TreeInsertPositions font={font} z={z} key={`${z.ofNode}${z.type}`} selectedDndZone={undefined} />;
            })}
            {selectedDndZone && (
                <TreeInsertPositions
                    key={`${selectedDndZone.ofNode}${selectedDndZone.type}`}
                    font={font}
                    z={selectedDndZone}
                    selectedDndZone={selectedDndZone}
                />
            )}
        </Group>
    );
}

export default DragAndDropZones;
