import { TouchHandler, useTouchHandler, useValue } from "@shopify/react-native-skia";
import { useRef, useState } from "react";
import { findTreeNodeById } from "../../treeFunctions";
import { CirclePositionInCanvasWithLevel, DnDZone, Skill, Tree } from "../../../../types";
import { didTapCircle, didTapDndZone } from "../functions";
import { Dimensions, Platform, ScrollView } from "react-native";
import { CIRCLE_SIZE_SELECTED } from "../parameters";
import { useAppDispatch, useAppSelector } from "../../../../redux/reduxHooks";
import { selectTreeSlice, setSelectedNode } from "../../../../redux/userTreesSlice";

type Props = {
    nodeCoordinatesCentered: CirclePositionInCanvasWithLevel[];
    tree: Tree<Skill>;
    onNodeClick?: (nodeId: string) => void;
    onDndZoneClick?: (clickedZone?: DnDZone) => void;
    showDndZones?: boolean;
    dragAndDropZones: DnDZone[];
};

export const DISTANCE_FROM_LEFT_MARGIN_ON_SCROLL = CIRCLE_SIZE_SELECTED + 20;

export type CanvasTouchHandler = { touchHandler: TouchHandler };

const useCanvasTouchHandler = ({ nodeCoordinatesCentered, onNodeClick, tree, dragAndDropZones, onDndZoneClick, showDndZones }: Props) => {
    //Redux
    const { selectedNode, newNode } = useAppSelector(selectTreeSlice);
    const dispatch = useAppDispatch();
    //

    const touchHandler = useTouchHandler(
        {
            onEnd: (touchInfo) => {
                //Avoids bug on android
                if (touchInfo.type !== 2) return;

                const clickedDndZone = dragAndDropZones.find(didTapDndZone(touchInfo));

                if (onDndZoneClick && showDndZones) return onDndZoneClick(clickedDndZone);

                //Blocks the select node functionality when adding a new node
                if (newNode) return;

                const clickedNode = nodeCoordinatesCentered.find(didTapCircle(touchInfo));

                if (clickedNode === undefined) return dispatch(setSelectedNode(null));

                if (selectedNode != clickedNode.id && onNodeClick) return onNodeClick(clickedNode.id);

                return dispatch(setSelectedNode(null));
            },
        },
        [selectedNode, nodeCoordinatesCentered]
    );

    return { touchHandler };
};

export default useCanvasTouchHandler;
