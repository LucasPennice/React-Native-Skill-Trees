import { Canvas, Circle, Group, Path, runTiming, Skia, Text, TouchHandler, useFont, useValue } from "@shopify/react-native-skia";
import { useEffect } from "react";
import { ScrollView, View } from "react-native";
import PopUpMenu from "../components/PopUpMenu";
import { selectCanvasDisplaySettings } from "../../../redux/canvasDisplaySettingsSlice";
import { selectCurrentTree } from "../../../redux/currentTreeSlice";
import { selectScreenDimentions } from "../../../redux/screenDimentionsSlice";
import CanvasTree from "./CanvasTree";
import { useAppSelector } from "../../../redux/reduxHooks";
import { CIRCLE_SIZE, colors, DISTANCE_BETWEEN_GENERATIONS, MAX_OFFSET, NAV_HEGIHT } from "./parameters";
import AppText from "../../../AppText";
import { CanvasDimentions, centerFlex, CirclePositionInCanvasWithLevel, DnDZone, mockNewNodeData } from "../../../types";
import DragAndDropZones from "./DragAndDropZones";
import { CanvasTouchHandler } from "./hooks/useCanvasTouchHandler";
import { getHeightForFont } from "./functions";

type TreeViewProps = {
    dragAndDropZones: DnDZone[];
    canvasDimentions: CanvasDimentions;
    circlePositionsInCanvas: CirclePositionInCanvasWithLevel[];
    tentativeCirlcePositionsInCanvas: CirclePositionInCanvasWithLevel[];
    canvasTouchHandler: CanvasTouchHandler;
    selectedNode: string | null;
    selectedNodeHistory: (string | null)[];
    updateScrollOffset: (scrollViewType: "horizontal" | "vertical", newValue: number) => void;
};

function TreeView({
    canvasDimentions,
    dragAndDropZones,
    tentativeCirlcePositionsInCanvas,
    circlePositionsInCanvas,
    canvasTouchHandler,
    selectedNode,
    selectedNodeHistory,
    updateScrollOffset,
}: TreeViewProps) {
    //Redux State
    const { height, width } = useAppSelector(selectScreenDimentions);
    const { value: currentTree } = useAppSelector(selectCurrentTree);
    const { showLabel } = useAppSelector(selectCanvasDisplaySettings);
    //Derived State
    const { horizontalScrollViewRef, touchHandler, verticalScrollViewRef } = canvasTouchHandler;
    const { canvasHeight, canvasWidth, horizontalMargin, verticalMargin } = canvasDimentions;
    const foundNodeCoordinates = circlePositionsInCanvas.find((c) => c.id === selectedNode);
    //
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

    const previewNode = tentativeCirlcePositionsInCanvas.length
        ? tentativeCirlcePositionsInCanvas.find((t) => t.id === mockNewNodeData.id)
        : undefined;

    const previewNodeParent = previewNode ? tentativeCirlcePositionsInCanvas.find((t) => t.id === previewNode.parentId) : undefined;

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            ref={verticalScrollViewRef}
            style={{ height: height - NAV_HEGIHT }}
            bounces={false}
            onMomentumScrollEnd={(e) => updateScrollOffset("vertical", e.nativeEvent.contentOffset.y)}
            onScrollEndDrag={(e) => updateScrollOffset("vertical", e.nativeEvent.contentOffset.y)}>
            <ScrollView
                bounces={false}
                ref={horizontalScrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ position: "relative" }}
                onScrollEndDrag={(e) => updateScrollOffset("horizontal", e.nativeEvent.contentOffset.x)}
                onMomentumScrollEnd={(e) => updateScrollOffset("horizontal", e.nativeEvent.contentOffset.x)}>
                {currentTree !== undefined && (
                    <Canvas onTouch={touchHandler} style={{ width: canvasWidth, height: canvasHeight, backgroundColor: colors.background }}>
                        <DragAndDropZones data={dragAndDropZones} />
                        {previewNode && <PreviewNode previewNode={previewNode} previewNodeParent={previewNodeParent} />}
                        <CanvasTree
                            stateProps={{ selectedNode, showLabel, circlePositionsInCanvas, tentativeCirlcePositionsInCanvas }}
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

export default TreeView;

function PreviewNode({
    previewNode,
    previewNodeParent,
}: {
    previewNode: CirclePositionInCanvasWithLevel;
    previewNodeParent: CirclePositionInCanvasWithLevel | undefined;
}) {
    const nodeLetterFont = useFont(require("../../../../assets/Helvetica.ttf"), 20);

    const p1x = previewNode.x;
    const p1y = previewNode.y;

    const p2x = previewNodeParent ? previewNodeParent.x : p1x;
    const p2y = previewNodeParent ? previewNodeParent.y : p1y + DISTANCE_BETWEEN_GENERATIONS;

    const p = Skia.Path.Make();

    p.moveTo(p1x, p1y);

    // mid-point of line:
    var mpx = (p2x + p1x) * 0.5;
    var mpy = (p2y + p1y) * 0.5;

    // angle of perpendicular to line:
    var theta = Math.atan2(p2y - p1y, p2x - p1x) - Math.PI / 2;

    let deltaX = p2x - p1x;

    // distance of control point from mid-point of line:
    var offset = deltaX > MAX_OFFSET ? MAX_OFFSET : deltaX < -MAX_OFFSET ? -MAX_OFFSET : deltaX;

    // location of control point:
    var c1x = mpx + offset * 1.5 * Math.cos(theta);
    var c1y = mpy + offset * 1.5 * Math.sin(theta);

    p.quadTo(c1x, c1y, p2x, p2y);

    const strokeWidth = 2;
    const radius = CIRCLE_SIZE + strokeWidth / 2;
    const c = Skia.Path.Make();

    c.moveTo(p1x, p1y);
    c.addCircle(p1x, p1y, radius);

    const { x, y } = previewNode;

    const letterToRender = mockNewNodeData.name[0];

    const position = useValue(0);
    const changePosition = () => runTiming(position, 1, { duration: 250 });

    useEffect(() => {
        position.current = 0;

        changePosition();
    }, [previewNode.x, previewNode.y]);

    if (!nodeLetterFont) return <></>;

    const textWidth = nodeLetterFont.getTextWidth(letterToRender);

    const textX = x - textWidth / 2;
    const textY = y + getHeightForFont(20) / 4 + 1;

    return (
        <Group opacity={position}>
            <Path path={p} style="stroke" strokeWidth={3} color={colors.line} end={position} />
            <Path path={c} style="stroke" strokeWidth={2} color={colors.line} />
            <Circle cx={x} cy={y} r={CIRCLE_SIZE} color={colors.background} />

            <Text x={textX} y={textY} text={mockNewNodeData.name[0]} font={nodeLetterFont} color={colors.unmarkedText} />
        </Group>
    );
}
