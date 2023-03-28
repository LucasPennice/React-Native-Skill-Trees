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
import { CIRCLE_SIZE_SELECTED, colors, DISTANCE_BETWEEN_GENERATIONS } from "./parameters";
import { getCirclePositions, getTreeWidth } from "./coordinateFunctions";

export type CirclePositionInCanvas = { x: number; y: number; id: string };
export type CirclePositionInCanvasWithLevel = { x: number; y: number; id: string; level: number; parentId: string | null };

function TreeView() {
    const { height, width } = useAppSelector(selectScreenDimentions);

    const { value: currentTree } = useAppSelector(selectCurrentTree);

    const testCirlcePositions = getCirclePositions(currentTree);

    const canvasDimentions = calculateDimentionsAndRootCoordinates(testCirlcePositions);
    const { rootX: positionHorizontalPadding, rootY: positionVerticalPadding } = canvasDimentions;

    const circlePositionsCenteredInCanvas = testCirlcePositions.map((p) => {
        return { ...p, y: p.y + positionVerticalPadding, x: p.x + positionHorizontalPadding };
    });

    const { showLabel } = useAppSelector(selectCanvasDisplaySettings);

    const [selectedNode, setSelectedNode] = useState<null | string>(null);
    const [selectedNodeHistory, setSelectedNodeHistory] = useState<(null | string)[]>([null]);
    const [circlePositionsInCanvas, setCirclePositionsInCanvas] = useState<CirclePositionInCanvas[]>([]);

    useEffect(() => {
        setCirclePositionsInCanvas([]);
        setSelectedNode(null);
        setSelectedNodeHistory([]);
    }, [currentTree]);

    const popCoordinateToArray = (coordinate: CirclePositionInCanvas) => setCirclePositionsInCanvas((p) => [...p, coordinate]);

    const { touchHandler, horizontalScrollViewRef, verticalScrollViewRef } = useCanvasTouchHandler({
        selectedNodeState: [selectedNode, setSelectedNode],
        setSelectedNodeHistory,
        circlePositionsInCanvas,
        tree: currentTree,
    });

    useEffect(() => {
        if (!verticalScrollViewRef.current) return;
        if (!horizontalScrollViewRef.current) return;

        const x = 200;

        const HEIGHT_WITHOUT_NAV = height - NAV_HEGIHT;

        const y = 0.5 * (canvasDimentions.height - HEIGHT_WITHOUT_NAV);

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
                    <Canvas
                        onTouch={touchHandler}
                        style={{ width: canvasDimentions.width, height: canvasDimentions.height, backgroundColor: colors.background }}>
                        <CanvasTree
                            stateProps={{ selectedNode, popCoordinateToArray, showLabel, testCirlcePositions: circlePositionsCenteredInCanvas }}
                            tree={currentTree}
                            wholeTree={currentTree}
                            rootCoordinates={{ width: positionHorizontalPadding, height: positionVerticalPadding }}
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

    if (coordinates.length === 0) return { width, height, rootY: 0, rootX: 0 };

    const treeDepth = Math.max(...coordinates.map((t) => t.level));

    const treeHeight = (treeDepth - 1) * DISTANCE_BETWEEN_GENERATIONS;
    const treeWidth = getTreeWidth(coordinates);

    const canvasHorizontalPadding = 2 * (width - 10 - (CIRCLE_SIZE_SELECTED * 3) / 4);
    const canvasVerticalPadding = HEIGHT_WITHOUT_NAV;

    return {
        width: treeWidth + canvasHorizontalPadding,
        height: treeHeight + canvasVerticalPadding,
        rootY: HEIGHT_WITHOUT_NAV / 2 - DISTANCE_BETWEEN_GENERATIONS,
        rootX: width,
    };
}

export default TreeView;
