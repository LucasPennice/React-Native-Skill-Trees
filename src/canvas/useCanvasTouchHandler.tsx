import { useTouchHandler } from "@shopify/react-native-skia";
import { Dispatch, SetStateAction } from "react";
import { findTreeNodeById } from "../treeFunctions";
import { treeMock } from "../types";
import { circlePositionsInCanvas } from "./CanvasTest";
import { didTapCircle } from "./functions";

type Props = {
    selectedNodeState: [null | string, React.Dispatch<React.SetStateAction<string | null>>];
    scrollToCoordinates: (x: number, y: number) => void;
};

const useCanvasTouchHandler = (props: Props) => {
    const {
        selectedNodeState: [selectedNode, setSelectedNode],
        scrollToCoordinates,
    } = props;

    const touchHandler = useTouchHandler(
        {
            onEnd: (touchInfo) => {
                const circleTapped = circlePositionsInCanvas.find(didTapCircle(touchInfo));

                if (circleTapped === undefined) return setSelectedNode(null);

                const nodeInTree = findTreeNodeById(treeMock, circleTapped.id);

                if (nodeInTree === undefined) return;

                if (selectedNode != nodeInTree.id) {
                    scrollToCoordinates(circleTapped.x, circleTapped.y);
                    return setSelectedNode(nodeInTree.id);
                }

                return setSelectedNode(null);
            },
        },
        [selectedNode]
    );

    return touchHandler;
};

export default useCanvasTouchHandler;
