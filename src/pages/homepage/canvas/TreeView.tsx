import { Blur, Canvas, Circle, Group, Path, runTiming, SkFont, Skia, Text, TouchHandler, useFont, useValue } from "@shopify/react-native-skia";
import { useEffect, useState } from "react";
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, View } from "react-native";
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
import useCenterCameraOnTreeChange from "./hooks/useCenterCameraOnTreeChange";
import useAnimateSkiaValue from "./hooks/useAnimateSkiaValue";

type TreeViewProps = {
    dragAndDropZones: DnDZone[];
    canvasDimentions: CanvasDimentions;
    circlePositionsInCanvas: CirclePositionInCanvasWithLevel[];
    tentativeCirlcePositionsInCanvas: CirclePositionInCanvasWithLevel[];
    canvasTouchHandler: CanvasTouchHandler;
    selectedNodeHistory: (string | null)[];
    selectedNodeState: [string | null, (v: string | null) => void];
    updateScrollOffset: (scrollViewType: "horizontal" | "vertical", newValue: number) => void;
    hasTreeChanged: boolean;
};

function TreeView({
    canvasDimentions,
    dragAndDropZones,
    tentativeCirlcePositionsInCanvas,
    circlePositionsInCanvas,
    canvasTouchHandler,
    selectedNodeHistory,
    updateScrollOffset,
    hasTreeChanged,
    selectedNodeState,
}: TreeViewProps) {
    //Props
    const [selectedNode] = selectedNodeState;
    //Redux State
    const { height, width } = useAppSelector(selectScreenDimentions);
    const currentTree = useAppSelector(selectCurrentTree);
    const { showLabel, showDragAndDropGuides } = useAppSelector(selectCanvasDisplaySettings);
    const newNode = useAppSelector(selectNewNode);
    //Derived State
    const { horizontalScrollViewRef, touchHandler, verticalScrollViewRef } = canvasTouchHandler;
    const { canvasHeight, canvasWidth, horizontalMargin, verticalMargin } = canvasDimentions;
    const foundNodeCoordinates = circlePositionsInCanvas.find((c) => c.id === selectedNode);
    //Local State
    const [initialBlur, setInitialBlur] = useState(10);

    useCenterCameraOnTreeChange(canvasTouchHandler, canvasDimentions, hasTreeChanged);

    const previewNode = tentativeCirlcePositionsInCanvas.length ? tentativeCirlcePositionsInCanvas.find((t) => t.id === newNode.id) : undefined;

    const previewNodeParent = previewNode ? tentativeCirlcePositionsInCanvas.find((t) => t.id === previewNode.parentId) : undefined;

    const treeAccentColor = currentTree && currentTree.accentColor ? currentTree.accentColor : colors.accent;

    useEffect(() => {
        setInitialBlur(0);
    }, [currentTree?.treeId]);

    const blur = useAnimateSkiaValue({ initialValue: 10, stateToAnimate: initialBlur });

    const updateVerticalScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => updateScrollOffset("vertical", e.nativeEvent.contentOffset.y);
    const updateHorizontalScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => updateScrollOffset("horizontal", e.nativeEvent.contentOffset.x);

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            ref={verticalScrollViewRef}
            style={{ height: height - NAV_HEGIHT }}
            bounces={false}
            // Updates on the automatic scroll on tree change (because is not animated we cannot use the other two event listeners)
            // The same goes for the horizontal scrolLView
            onScroll={updateVerticalScroll}
            scrollEventThrottle={0}
            onMomentumScrollEnd={updateVerticalScroll}
            onScrollEndDrag={updateVerticalScroll}>
            <ScrollView
                bounces={false}
                ref={horizontalScrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ position: "relative" }}
                onScroll={updateHorizontalScroll}
                scrollEventThrottle={0}
                onScrollEndDrag={updateHorizontalScroll}
                onMomentumScrollEnd={updateHorizontalScroll}>
                {currentTree !== undefined && (
                    <Canvas onTouch={touchHandler} style={{ width: canvasWidth, height: canvasHeight, backgroundColor: colors.background }}>
                        {showDragAndDropGuides && <DragAndDropZones data={dragAndDropZones} />}
                        {previewNode && <PreviewNode previewNode={previewNode} previewNodeParent={previewNodeParent} newNode={newNode} />}
                        <CanvasTree
                            stateProps={{ selectedNode, showLabel, circlePositionsInCanvas, tentativeCirlcePositionsInCanvas }}
                            tree={currentTree}
                            wholeTree={currentTree}
                            hasTreeChanged={hasTreeChanged}
                            treeAccentColor={treeAccentColor}
                            rootCoordinates={{ width: horizontalMargin, height: verticalMargin }}
                        />
                        <Blur blur={blur} />
                    </Canvas>
                )}

                {!currentTree && (
                    <View style={[centerFlex, { width, height }]}>
                        <AppText style={{ color: "white", fontSize: 24 }}>Pick a tree</AppText>
                    </View>
                )}

                {selectedNode && foundNodeCoordinates && currentTree && (
                    <PopUpMenu
                        foundNodeCoordinates={foundNodeCoordinates}
                        selectedNodeState={selectedNodeState}
                        selectedNodeHistory={selectedNodeHistory}
                    />
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
