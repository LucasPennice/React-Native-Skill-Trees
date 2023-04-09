import { TouchHandler, useTouchHandler } from "@shopify/react-native-skia";
import { useRef } from "react";
import { findTreeNodeById } from "../../treeFunctions";
import { CirclePositionInCanvasWithLevel, Skill, Tree } from "../../../../types";
import { didTapCircle } from "../functions";
import { Dimensions, ScrollView } from "react-native";
import { CIRCLE_SIZE_SELECTED } from "../parameters";
import { useAppDispatch, useAppSelector } from "../../../../redux/reduxHooks";
import { selectTreeSlice, setSelectedNode } from "../../../../redux/userTreesSlice";

type Props = {
    setSelectedNodeHistory: React.Dispatch<React.SetStateAction<(string | null)[]>>;
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
    const { setSelectedNodeHistory, circlePositionsInCanvas, tree } = props;
    const { height } = Dimensions.get("window");
    const verticalScrollViewRef = useRef<ScrollView | null>(null);
    const horizontalScrollViewRef = useRef<ScrollView | null>(null);

    const scrollToCoordinates = (x: number, y: number) => {
        if (!verticalScrollViewRef.current || !horizontalScrollViewRef.current) return;

        //This is the functions that handles the scrolling

        verticalScrollViewRef.current.scrollTo({ x, y, animated: true });
        horizontalScrollViewRef.current.scrollTo({ x, y, animated: true });
    };

    const touchHandler = useTouchHandler(
        {
            onEnd: (touchInfo) => {
                const circleTapped = circlePositionsInCanvas.find(didTapCircle(touchInfo));

                if (circleTapped === undefined) {
                    setSelectedNodeHistory((prev) => [...prev, null]);
                    return dispatch(setSelectedNode(null));
                }

                const foundNode = findTreeNodeById(tree, circleTapped.id);

                if (foundNode === undefined) return;

                const { data: nodeInTree } = foundNode;

                if (selectedNode != nodeInTree.id) {
                    scrollToCoordinates(circleTapped.x - DISTANCE_FROM_LEFT_MARGIN_ON_SCROLL, circleTapped.y - height / 2);
                    setSelectedNodeHistory((prev) => [...prev, nodeInTree.id]);
                    return dispatch(setSelectedNode(nodeInTree.id));
                }

                setSelectedNodeHistory((prev) => [...prev, null]);
                return dispatch(setSelectedNode(null));
            },
        },
        [selectedNode, circlePositionsInCanvas]
    );

    return { touchHandler, horizontalScrollViewRef, verticalScrollViewRef } as CanvasTouchHandler;
};

export default useCanvasTouchHandler;
