import { useEffect, useState } from "react";
import { DnDZone, NodeCoordinate } from "../../../types";
import { calculateDragAndDropZones, minifyDragAndDropZones } from "../coordinateFunctions";

function useCalculateDnDZonesWhenDraggingNode(subtreeIds: string[] | null, nodeCoordinatesCentered: NodeCoordinate[]) {
    const [result, setResult] = useState<DnDZone[]>([]);

    useEffect(() => {
        if (subtreeIds === null) return;

        console.log(subtreeIds);

        const dndZones = calculateDragAndDropZones(nodeCoordinatesCentered);

        const allowedZones = returnAllowedZones(dndZones, subtreeIds);

        const minifiedDndZones = minifyDragAndDropZones(allowedZones, nodeCoordinatesCentered);

        setResult(minifiedDndZones);
    }, [subtreeIds]);

    return result;

    function returnAllowedZones(dndZones: DnDZone[], nodeId: string[]) {
        //Remove DndZones asociated with the subtrees that are being dragged
        return dndZones.filter((n) => !nodeId.includes(n.ofNode));
    }
}

export default useCalculateDnDZonesWhenDraggingNode;
