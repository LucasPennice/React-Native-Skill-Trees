import { TouchHandler, TouchInfo, useTouchHandler } from "@shopify/react-native-skia";
import { CIRCLE_SIZE, CIRCLE_SIZE_SELECTED, TOUCH_BUFFER } from "../../../parameters";
import { useAppDispatch } from "../../../redux/reduxHooks";
import { setSelectedNode } from "../../../redux/userTreesSlice";
import { DnDZone, NodeCoordinate, SelectedNodeId } from "../../../types";

type Props = {
    nodeCoordinatesCentered: NodeCoordinate[];
    selectedNodeId: SelectedNodeId;
    onNodeClick?: (nodeId: string) => void;
    onDndZoneClick?: (clickedZone?: DnDZone) => void;
    showDndZones?: boolean;
    dragAndDropZones: DnDZone[];
};

export const DISTANCE_FROM_LEFT_MARGIN_ON_SCROLL = CIRCLE_SIZE_SELECTED + 20;

export type CanvasTouchHandler = { touchHandler: TouchHandler };

const useCanvasTouchHandler = ({ nodeCoordinatesCentered, onNodeClick, dragAndDropZones, onDndZoneClick, showDndZones, selectedNodeId }: Props) => {
    //Redux
    const dispatch = useAppDispatch();
    //
    const touchHandler = useTouchHandler(
        {
            onEnd: (touchInfo) => {
                //Avoids bug on android
                if (touchInfo.type !== 2) return;

                const clickedDndZone = dragAndDropZones.find(didTapDndZone(touchInfo));

                if (onDndZoneClick && showDndZones) return onDndZoneClick(clickedDndZone);

                const clickedNode = nodeCoordinatesCentered.find(didTapCircle(touchInfo));

                if (clickedNode === undefined) return dispatch(setSelectedNode(null));

                if (selectedNodeId !== clickedNode.id && onNodeClick) return onNodeClick(clickedNode.id);

                return dispatch(setSelectedNode(null));
            },
        },
        [selectedNodeId, nodeCoordinatesCentered]
    );

    return { touchHandler };
};

export default useCanvasTouchHandler;

function didTapCircle(touchInfo: TouchInfo) {
    return (circle: { x: number; y: number; id: string }) => {
        const isTouchInsideCircleXRange =
            touchInfo.x >= circle.x - CIRCLE_SIZE / 2 - TOUCH_BUFFER && touchInfo.x <= circle.x + CIRCLE_SIZE / 2 + TOUCH_BUFFER;

        const isTouchInsideCircleYRange =
            touchInfo.y >= circle.y - CIRCLE_SIZE / 2 - TOUCH_BUFFER && touchInfo.y <= circle.y + CIRCLE_SIZE / 2 + TOUCH_BUFFER;

        const isTouchingCircle = isTouchInsideCircleXRange && isTouchInsideCircleYRange;

        if (!isTouchingCircle) return false;

        return true;
    };
}

function didTapDndZone(touchInfo: TouchInfo) {
    return (zone: DnDZone) => {
        const isTouchInsideCircleXRange = touchInfo.x >= zone.x && touchInfo.x <= zone.x + zone.width;

        const isTouchInsideCircleYRange = touchInfo.y >= zone.y && touchInfo.y <= zone.y + zone.height;

        const isTouchingCircle = isTouchInsideCircleXRange && isTouchInsideCircleYRange;

        if (!isTouchingCircle) return false;

        return true;
    };
}
