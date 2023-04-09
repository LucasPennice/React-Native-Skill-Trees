import { Blur, Canvas, Circle, Group, Path, runTiming, SkFont, Skia, Text, TouchHandler, useFont, useValue } from "@shopify/react-native-skia";
import { useEffect } from "react";
import { ScrollView, View } from "react-native";
import PopUpMenu from "../components/PopUpMenu";
import { selectCanvasDisplaySettings } from "../../../redux/canvasDisplaySettingsSlice";
import { selectCurrentTree } from "../../../redux/userTreesSlice";
import { selectScreenDimentions } from "../../../redux/screenDimentionsSlice";
import CanvasTree from "./CanvasTree";
import { useAppSelector } from "../../../redux/reduxHooks";
import { CIRCLE_SIZE, colors, DISTANCE_BETWEEN_GENERATIONS, MAX_OFFSET, NAV_HEGIHT } from "./parameters";
import AppText from "../../../components/AppText";
import { CanvasDimentions, centerFlex, CirclePositionInCanvasWithLevel, DnDZone, Skill } from "../../../types";
import DragAndDropZones from "./DragAndDropZones";
import { CanvasTouchHandler } from "./hooks/useCanvasTouchHandler";
import { getHeightForFont } from "./functions";
import { selectNewNode } from "../../../redux/newNodeSlice";
import Node from "./Node";
import CanvasPath from "./CavnasPath";

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
    const currentTree = useAppSelector(selectCurrentTree);
    const { showLabel, showDragAndDropGuides } = useAppSelector(selectCanvasDisplaySettings);
    const newNode = useAppSelector(selectNewNode);
    //Derived State
    const { horizontalScrollViewRef, touchHandler, verticalScrollViewRef } = canvasTouchHandler;
    const { canvasHeight, canvasWidth, horizontalMargin, verticalMargin } = canvasDimentions;
    const foundNodeCoordinates = circlePositionsInCanvas.find((c) => c.id === selectedNode);
    //
    const nodeLetterFont = useFont(require("../../../../assets/Helvetica.ttf"), 20);

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

    const previewNode = tentativeCirlcePositionsInCanvas.length ? tentativeCirlcePositionsInCanvas.find((t) => t.id === newNode.id) : undefined;

    const previewNodeParent = previewNode ? tentativeCirlcePositionsInCanvas.find((t) => t.id === previewNode.parentId) : undefined;

    const treeAccentColor = currentTree && currentTree.accentColor ? currentTree.accentColor : colors.accent;

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
                        {showDragAndDropGuides && <DragAndDropZones data={dragAndDropZones} />}
                        {previewNode && <PreviewNode previewNode={previewNode} previewNodeParent={previewNodeParent} newNode={newNode} />}
                        <CanvasTree
                            stateProps={{ selectedNode, showLabel, circlePositionsInCanvas, tentativeCirlcePositionsInCanvas }}
                            tree={currentTree}
                            wholeTree={currentTree}
                            treeAccentColor={treeAccentColor}
                            rootCoordinates={{ width: horizontalMargin, height: verticalMargin }}
                        />
                        <Blur blur={0} />
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
    newNode,
}: {
    previewNode: CirclePositionInCanvasWithLevel;
    previewNodeParent: CirclePositionInCanvasWithLevel | undefined;
    newNode: Skill;
}) {
    const cx = previewNode.x;
    const cy = previewNode.y;

    const pathInitialPointX = previewNodeParent ? previewNodeParent.x : cx;
    const pathInitialPointY = previewNodeParent ? previewNodeParent.y : cy + DISTANCE_BETWEEN_GENERATIONS;

    const pathCoordinates = { cx, cy, pathInitialPoint: { x: pathInitialPointX, y: pathInitialPointY } };

    const letterToRender = newNode.name[0];

    const opacity = useValue(0);
    const changeOpacity = () => runTiming(opacity, 1, { duration: 250 });

    useEffect(() => {
        opacity.current = 0;

        changeOpacity();
    }, [previewNode]);

    return (
        <Group opacity={opacity}>
            <CanvasPath coordinates={pathCoordinates} pathColor={colors.line} />
            <Node treeAccentColor={colors.line} coord={{ cx, cy }} text={{ color: colors.unmarkedText, letter: letterToRender }} />
        </Group>
    );
}
