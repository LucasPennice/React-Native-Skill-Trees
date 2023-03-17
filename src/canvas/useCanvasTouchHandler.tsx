import { useTouchHandler } from "@shopify/react-native-skia";
import { useRef } from "react";
import { findTreeNodeById } from "../treeFunctions";
import { Book, treeMock, TreeNode } from "../types";
import { didTapCircle } from "./functions";
import { Dimensions, ScrollView } from "react-native";
import { CIRCLE_SIZE_SELECTED } from "./Tree";
import { CirclePositionInCanvas } from "./CanvasTest";

type Props = {
    selectedNodeState: [null | string, React.Dispatch<React.SetStateAction<string | null>>];
    setSelectedNodeHistory: React.Dispatch<React.SetStateAction<(string | null)[]>>;
    circlePositionsInCanvas: CirclePositionInCanvas[];
    tree: TreeNode<Book>;
};

export const DISTANCE_FROM_LEFT_MARGIN_ON_SCROLL = CIRCLE_SIZE_SELECTED + 20;

const useCanvasTouchHandler = (props: Props) => {
    const {
        selectedNodeState: [selectedNode, setSelectedNode],
        setSelectedNodeHistory,
        circlePositionsInCanvas,
        tree,
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

                const { node: nodeInTree } = findTreeNodeById(tree, circleTapped.id);

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
        [selectedNode, circlePositionsInCanvas]
    );

    return { touchHandler, horizontalScrollViewRef, verticalScrollViewRef };
};

export default useCanvasTouchHandler;
