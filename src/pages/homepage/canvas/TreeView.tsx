import { Canvas } from "@shopify/react-native-skia";
import { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import useCanvasTouchHandler from "./hooks/useCanvasTouchHandler";
import PopUpMenu from "../components/PopUpMenu";
import { NAV_HEGIHT } from "../HomePage";
import { selectCanvasDisplaySettings } from "../../../redux/canvasDisplaySettingsSlice";
import { selectCurrentTree } from "../../../redux/currentTreeSlice";
import { selectScreenDimentions } from "../../../redux/screenDimentionsSlice";
import CanvasTree from "./CanvasTree";
import { useAppSelector } from "../../../redux/reduxHooks";
import { CIRCLE_SIZE, CIRCLE_SIZE_SELECTED, colors, DISTANCE_BETWEEN_GENERATIONS } from "./parameters";
import { getCirclePositions, getTreeWidth } from "./coordinateFunctions";

export type CirclePositionInCanvas = { x: number; y: number; id: string };
export type CirclePositionInCanvasWithLevel = { x: number; y: number; id: string; level: number; parentId: string | null };

function TreeView() {
    const { height } = useAppSelector(selectScreenDimentions);

    const { value: currentTree } = useAppSelector(selectCurrentTree);

    const circlePositions = getCirclePositions(currentTree);

    const canvasDimentions = calculateDimentionsAndRootCoordinates(circlePositions);

    const { canvasHeight, canvasWidth, horizontalMargin, verticalMargin } = canvasDimentions;

    //These sets of coordinates are centered in the canvas opposite to being rendered on the top left corner of the canvas
    const circlePositionsInCanvas = circlePositions.map((p) => {
        return { ...p, y: p.y + verticalMargin, x: p.x + horizontalMargin };
    });

    const { showLabel } = useAppSelector(selectCanvasDisplaySettings);

    const [selectedNode, setSelectedNode] = useState<null | string>(null);
    const [selectedNodeHistory, setSelectedNodeHistory] = useState<(null | string)[]>([null]);

    useEffect(() => {
        setSelectedNode(null);
        setSelectedNodeHistory([]);
    }, [currentTree]);

    const { touchHandler, horizontalScrollViewRef, verticalScrollViewRef } = useCanvasTouchHandler({
        selectedNodeState: [selectedNode, setSelectedNode],
        setSelectedNodeHistory,
        circlePositionsInCanvas,
        tree: currentTree,
    });

    useEffect(() => {
        if (!verticalScrollViewRef.current) return;
        if (!horizontalScrollViewRef.current) return;

        const x = horizontalMargin / 2;

        const HEIGHT_WITHOUT_NAV = height - NAV_HEGIHT;

        const y = 0.5 * (canvasHeight - HEIGHT_WITHOUT_NAV);

        let timerId = setTimeout(() => {
            horizontalScrollViewRef.current!.scrollTo({ x, y, animated: true });
            verticalScrollViewRef.current!.scrollTo({ x, y, animated: true });
        }, 50);

        return () => {
            clearTimeout(timerId);
        };
    }, [verticalScrollViewRef, horizontalScrollViewRef, currentTree]);

    const foundNodeCoordinates = circlePositionsInCanvas.find((c) => c.id === selectedNode);

    return (
        <ScrollView showsVerticalScrollIndicator={false} ref={verticalScrollViewRef} style={{ height: height - NAV_HEGIHT }}>
            <ScrollView ref={horizontalScrollViewRef} horizontal showsHorizontalScrollIndicator={false} style={{ position: "relative" }}>
                {currentTree !== undefined && (
                    <Canvas onTouch={touchHandler} style={{ width: canvasWidth, height: canvasHeight, backgroundColor: colors.background }}>
                        <CanvasTree
                            stateProps={{ selectedNode, showLabel, circlePositionsInCanvas }}
                            tree={currentTree}
                            wholeTree={currentTree}
                            rootCoordinates={{ width: horizontalMargin, height: verticalMargin }}
                        />
                    </Canvas>
                )}
                {selectedNode && foundNodeCoordinates && currentTree && (
                    <PopUpMenu foundNodeCoordinates={foundNodeCoordinates} selectedNode={selectedNode} selectedNodeHistory={selectedNodeHistory} />
                )}
            </ScrollView>
        </ScrollView>
    );
}

function calculateDimentionsAndRootCoordinates(coordinates: CirclePositionInCanvasWithLevel[]) {
    const { height, width } = useAppSelector(selectScreenDimentions);

    const HEIGHT_WITHOUT_NAV = height - NAV_HEGIHT;

    if (coordinates.length === 0) return { canvasWidth: width, canvasHeight: height, horizontalMargin: 0, verticalMargin: 0 };

    const treeDepth = Math.max(...coordinates.map((t) => t.level));

    const treeHeight = treeDepth * DISTANCE_BETWEEN_GENERATIONS + treeDepth * CIRCLE_SIZE;
    const treeWidth = getTreeWidth(coordinates);

    return {
        canvasWidth: treeWidth + 2 * width,
        canvasHeight: treeHeight + HEIGHT_WITHOUT_NAV,
        verticalMargin: HEIGHT_WITHOUT_NAV / 2,
        horizontalMargin: width,
    };
}

export default TreeView;
