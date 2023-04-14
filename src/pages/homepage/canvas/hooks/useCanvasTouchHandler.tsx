import { TouchHandler, useTouchHandler } from "@shopify/react-native-skia";
import { useRef } from "react";
import { findTreeNodeById } from "../../treeFunctions";
import { CirclePositionInCanvasWithLevel, Skill, Tree } from "../../../../types";
import { didTapCircle } from "../functions";
import { Dimensions, Platform, ScrollView } from "react-native";
import { CIRCLE_SIZE_SELECTED } from "../parameters";
import { useAppDispatch, useAppSelector } from "../../../../redux/reduxHooks";
import { selectTreeSlice, setSelectedNode } from "../../../../redux/userTreesSlice";

type Props = {
    circlePositionsInCanvas: CirclePositionInCanvasWithLevel[];
    tree?: Tree<Skill>;
};

export const DISTANCE_FROM_LEFT_MARGIN_ON_SCROLL = CIRCLE_SIZE_SELECTED + 20;

export type CanvasTouchHandler = {
    touchHandler: TouchHandler;
    horizontalScrollViewRef: React.MutableRefObject<ScrollView | null>;
    verticalScrollViewRef: React.MutableRefObject<ScrollView | null>;
};

const useCanvasTouchHandler = (props: Props) => {
    //Redux
    const { selectedNode } = useAppSelector(selectTreeSlice);
    const dispatch = useAppDispatch();
    //
    const { circlePositionsInCanvas, tree } = props;
    const { height } = Dimensions.get("screen");
    const verticalScrollViewRef = useRef<ScrollView | null>(null);
    const horizontalScrollViewRef = useRef<ScrollView | null>(null);

    const scrollToCoordinates = (x: number, y: number) => {
        if (!verticalScrollViewRef.current || !horizontalScrollViewRef.current) return;

        //This is the functions that handles the scrolling

        verticalScrollViewRef.current.scrollTo({ x: undefined, y, animated: true });
        horizontalScrollViewRef.current.scrollTo({ x, y: undefined, animated: true });
    };

    const touchHandler = useTouchHandler(
        {
            onEnd: (touchInfo) => {
                //Avoids bug on android
                if (touchInfo.type !== 2) return;

                const circleTapped = circlePositionsInCanvas.find(didTapCircle(touchInfo));

                if (circleTapped === undefined) {
                    return dispatch(setSelectedNode(null));
                }

                const foundNode = findTreeNodeById(tree, circleTapped.id);

                if (foundNode === undefined) return;

                const { data: nodeInTree } = foundNode;

                if (selectedNode != nodeInTree.id) {
                    scrollToCoordinates(circleTapped.x - DISTANCE_FROM_LEFT_MARGIN_ON_SCROLL, circleTapped.y - height / 2);
                    return dispatch(setSelectedNode(nodeInTree.id));
                }

                return dispatch(setSelectedNode(null));
            },
        },
        [selectedNode, circlePositionsInCanvas]
    );

    return { touchHandler, horizontalScrollViewRef, verticalScrollViewRef } as CanvasTouchHandler;
};

export default useCanvasTouchHandler;
