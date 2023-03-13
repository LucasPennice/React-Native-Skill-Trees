import { useTouchHandler } from "@shopify/react-native-skia";
import { useRef } from "react";
import { findTreeNodeById } from "../treeFunctions";
import { treeMock } from "../types";
import { circlePositionsInCanvas } from "./CanvasTest";
import { didTapCircle } from "./functions";
import { Dimensions, ScrollView } from "react-native";
import { CIRCLE_SIZE_SELECTED } from "./Tree";

type Props = {
    selectedNodeState: [null | string, React.Dispatch<React.SetStateAction<string | null>>];
    setSelectedNodeHistory: React.Dispatch<React.SetStateAction<(string | null)[]>>;
};

export const DISTANCE_FROM_LEFT_MARGIN_ON_SCROLL = CIRCLE_SIZE_SELECTED + 20;

const useCanvasTouchHandler = (props: Props) => {
    const {
        selectedNodeState: [selectedNode, setSelectedNode],
        setSelectedNodeHistory,
    } = props;

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
                    return setSelectedNode(null);
                }

                const nodeInTree = findTreeNodeById(treeMock, circleTapped.id);

                if (nodeInTree === undefined) return;

                if (selectedNode != nodeInTree.id) {
                    scrollToCoordinates(circleTapped.x - DISTANCE_FROM_LEFT_MARGIN_ON_SCROLL, circleTapped.y - height / 2);
                    setSelectedNodeHistory((prev) => [...prev, nodeInTree.id]);
                    return setSelectedNode(nodeInTree.id);
                }

                setSelectedNodeHistory((prev) => [...prev, null]);
                return setSelectedNode(null);
            },
        },
        [selectedNode]
    );

    return { touchHandler, horizontalScrollViewRef, verticalScrollViewRef, scrollToCoordinates };
};

export default useCanvasTouchHandler;
