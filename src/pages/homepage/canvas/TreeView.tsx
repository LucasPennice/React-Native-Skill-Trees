import { Canvas } from "@shopify/react-native-skia";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import useCanvasTouchHandler from "./hooks/useCanvasTouchHandler";
import PopUpMenu from "../components/PopUpMenu";
import { NAV_HEGIHT } from "../HomePage";
import { selectCanvasDisplaySettings } from "../../../redux/canvasDisplaySettingsSlice";
import { selectCurrentTree } from "../../../redux/currentTreeSlice";
import { selectScreenDimentions } from "../../../redux/screenDimentionsSlice";
import CanvasTree from "./CanvasTree";
import { useAppSelector } from "../../../redux/reduxHooks";
import { CIRCLE_SIZE, CIRCLE_SIZE_SELECTED, colors, DISTANCE_BETWEEN_CHILDREN, DISTANCE_BETWEEN_GENERATIONS } from "./parameters";
import { getCirclePositions, getTreeWidth } from "./coordinateFunctions";
import AppText from "../../../AppText";
import { centerFlex, DnDZone } from "../../../types";
import DragAndDropZones from "./DragAndDropZones";
import { returnCoordinatesByLevel } from "../treeFunctions";

export type CirclePositionInCanvas = { x: number; y: number; id: string };
export type CirclePositionInCanvasWithLevel = { x: number; y: number; id: string; level: number; parentId: string | null };

function TreeView() {
    const { height, width } = useAppSelector(selectScreenDimentions);

    const { value: currentTree } = useAppSelector(selectCurrentTree);

    const circlePositions = getCirclePositions(currentTree);

    const canvasDimentions = calculateDimentionsAndRootCoordinates(circlePositions);

    const { canvasHeight, canvasWidth, horizontalMargin, verticalMargin } = canvasDimentions;

    //These sets of coordinates are centered in the canvas opposite to being rendered on the top left corner of the canvas
    const circlePositionsInCanvas = circlePositions.map((p) => {
        return { ...p, y: p.y + verticalMargin, x: p.x + horizontalMargin } as CirclePositionInCanvasWithLevel;
    });

    const dragAndDropZones = calculateDragAndDropZones(circlePositionsInCanvas);

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
                        <DragAndDropZones data={dragAndDropZones} />
                        <CanvasTree
                            stateProps={{ selectedNode, showLabel, circlePositionsInCanvas }}
                            tree={currentTree}
                            wholeTree={currentTree}
                            rootCoordinates={{ width: horizontalMargin, height: verticalMargin }}
                        />
                    </Canvas>
                )}

                {!currentTree && (
                    <View style={[centerFlex, { width, height }]}>
                        <AppText style={{ color: "white", fontSize: 24 }}>Pick a tree</AppText>
                    </View>
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

function calculateDragAndDropZones(circlePositionsInCanvas: CirclePositionInCanvasWithLevel[]) {
    const result: DnDZone[] = [];

    const coordinatesByLevel = returnCoordinatesByLevel(circlePositionsInCanvas);

    console.log(coordinatesByLevel);

    for (let idx = 0; idx < circlePositionsInCanvas.length; idx++) {
        const pos = circlePositionsInCanvas[idx];

        const isRoot = pos.level === 0;

        const height = DISTANCE_BETWEEN_GENERATIONS - 3 * CIRCLE_SIZE;
        const width = 4 * CIRCLE_SIZE;
        result.push({ height, width, x: pos.x - width / 2, y: pos.y - height - 1.5 * CIRCLE_SIZE, type: "PARENT" });

        if (!isRoot) {
            const minWidth = DISTANCE_BETWEEN_CHILDREN / 2;
            const height = 3 * CIRCLE_SIZE;
            const width = isNotFirstNode(pos) ? getLevelNodeDistance(pos) - 1 * CIRCLE_SIZE + CIRCLE_SIZE : minWidth;
            result.push({ height, width, x: pos.x - width, y: pos.y - height / 2, type: "BROTHER" });

            if (isLastNodeOfCluster(pos)) {
                result.push({
                    height,
                    width: minWidth,
                    x: pos.x,
                    y: pos.y - height / 2,
                    type: "BROTHER",
                });
            }
        }

        if (doesntHaveChildren(pos)) {
            const height = DISTANCE_BETWEEN_GENERATIONS;
            result.push({ height, width: 4 * CIRCLE_SIZE, x: pos.x - 2 * CIRCLE_SIZE, y: pos.y + 1.5 * CIRCLE_SIZE, type: "CHILDREN" });
        }
    }

    return result;

    function getLevelNodeDistance(pos: CirclePositionInCanvasWithLevel) {
        //@ts-ignore
        const levelCoordinates = coordinatesByLevel[pos.level] as CirclePositionInCanvasWithLevel[];

        if (levelCoordinates.length === 1) return DISTANCE_BETWEEN_CHILDREN;

        return Math.abs(levelCoordinates[1].x - levelCoordinates[0].x);
    }

    function isLastNodeOfCluster(pos: CirclePositionInCanvasWithLevel) {
        //@ts-ignore
        const levelCoordinates = coordinatesByLevel[pos.level] as CirclePositionInCanvasWithLevel[];

        const foo = levelCoordinates.filter((x) => x.parentId === pos.parentId);

        return foo[foo.length - 1].id === pos.id;
    }

    function doesntHaveChildren(pos: CirclePositionInCanvasWithLevel) {
        const foo = circlePositionsInCanvas.find((x) => x.parentId === pos.id);

        return foo === undefined;
    }

    function isNotFirstNode(pos: CirclePositionInCanvasWithLevel) {
        //@ts-ignore
        const levelCoordinates = coordinatesByLevel[pos.level] as CirclePositionInCanvasWithLevel[];

        const foo = levelCoordinates.filter((x) => x.parentId === pos.parentId);

        return foo[0].id !== pos.id && foo.length > 1;
    }
}

export default TreeView;
