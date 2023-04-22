import { Blur, Canvas, DiffRect, Group, Rect, SkiaDomView, rect, runSpring, runTiming, useComputedValue, useValue } from "@shopify/react-native-skia";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { selectCanvasDisplaySettings } from "../../../redux/canvasDisplaySettingsSlice";
import { selectCurrentTree, selectTreeSlice } from "../../../redux/userTreesSlice";
import { selectScreenDimentions } from "../../../redux/screenDimentionsSlice";
import CanvasTree from "./CanvasTree";
import { useAppSelector } from "../../../redux/reduxHooks";
import { centerFlex, colors, NAV_HEGIHT } from "../../../parameters";
import { CirclePositionInCanvasWithLevel, DnDZone, Skill, Tree } from "../../../types";
import DragAndDropZones from "./DragAndDropZones";
import useCanvasTouchHandler from "./hooks/useCanvasTouchHandler";
import { getCanvasDimensions, calculateDragAndDropZones, centerNodesInCanvas, getNodesCoordinates } from "./coordinateFunctions";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import useHandleCanvasScroll from "./hooks/useHandleCanvasScroll";
import { View } from "react-native";
import PopUpMenu from "../components/PopUpMenu";

type TreeViewProps = {
    tree: Tree<Skill>;
    onNodeClick?: (nodeId: string) => void;
    showDndZones?: boolean;
    isTakingScreenshot?: boolean;
    onDndZoneClick?: (clickedZone?: DnDZone) => void;
    canvasRef: MutableRefObject<SkiaDomView | null>;
};

function TreeView({ tree, onNodeClick, showDndZones, onDndZoneClick, canvasRef, isTakingScreenshot }: TreeViewProps) {
    //Redux State
    const screenDimentions = useAppSelector(selectScreenDimentions);
    const { selectedNode, selectedDndZone, currentTreeId } = useAppSelector(selectTreeSlice);
    const { showLabel } = useAppSelector(selectCanvasDisplaySettings);
    //Derived State
    const nodeCoordinates = getNodesCoordinates(tree);
    const canvasDimentions = getCanvasDimensions(nodeCoordinates, screenDimentions);
    const nodeCoordinatesCentered = centerNodesInCanvas(nodeCoordinates, canvasDimentions);
    const dragAndDropZones = calculateDragAndDropZones(nodeCoordinatesCentered);
    const foundNodeCoordinates = nodeCoordinates.find((c) => c.id === selectedNode);

    //Hooks
    const { touchHandler } = useCanvasTouchHandler({ tree, nodeCoordinatesCentered, onNodeClick, onDndZoneClick, showDndZones, dragAndDropZones });
    const { canvasHeight, canvasWidth } = canvasDimentions;
    const { canvasGestures, transform } = useHandleCanvasScroll(canvasDimentions, foundNodeCoordinates, isTakingScreenshot);
    //

    const treeAccentColor = tree.accentColor ? tree.accentColor : colors.accent;

    //Handles the blur animation on tree change
    useEffect(() => {
        runBlurAnimation();
    }, [currentTreeId]);

    const blur = useValue(4);

    const runBlurAnimation = () => runTiming(blur, { from: 4, to: 0 }, { duration: 600 });

    return (
        <>
            <GestureDetector gesture={canvasGestures}>
                <View style={[centerFlex, { height: screenDimentions.height - NAV_HEGIHT, width: screenDimentions.width }]}>
                    <Animated.View style={[transform]}>
                        <Canvas
                            onTouch={touchHandler}
                            style={{
                                width: canvasWidth,
                                height: canvasHeight,
                                transform: [{ scale: isTakingScreenshot ? screenDimentions.width / canvasWidth : 1 }],
                            }}
                            mode="continuous"
                            ref={canvasRef}>
                            <CanvasTree
                                stateProps={{ selectedNode, showLabel, circlePositionsInCanvas: nodeCoordinatesCentered }}
                                tree={tree}
                                wholeTree={tree}
                                treeAccentColor={treeAccentColor}
                                rootCoordinates={{ width: 0, height: 0 }}
                            />
                            {showDndZones && <DragAndDropZones data={dragAndDropZones} selectedDndZone={selectedDndZone} />}
                            <Blur blur={blur} />
                        </Canvas>
                    </Animated.View>
                </View>
            </GestureDetector>
            {foundNodeCoordinates && <PopUpMenu foundNodeCoordinates={foundNodeCoordinates} canvasWidth={canvasWidth} />}
        </>
    );
}

TreeView.whyDidYouRender = true;

export default TreeView;
