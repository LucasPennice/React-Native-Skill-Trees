import { Blur, Canvas, Group, runTiming, useValue } from "@shopify/react-native-skia";
import { useEffect, useState } from "react";
import { selectCanvasDisplaySettings } from "../../../redux/canvasDisplaySettingsSlice";
import { selectTreeSlice } from "../../../redux/userTreesSlice";
import { selectScreenDimentions } from "../../../redux/screenDimentionsSlice";
import CanvasTree from "./CanvasTree";
import { useAppSelector } from "../../../redux/reduxHooks";
import { colors, DISTANCE_BETWEEN_GENERATIONS, NAV_HEGIHT } from "./parameters";
import { CirclePositionInCanvasWithLevel, DnDZone, Skill, Tree, centerFlex } from "../../../types";
import DragAndDropZones from "./DragAndDropZones";
import useCanvasTouchHandler from "./hooks/useCanvasTouchHandler";
import { selectNewNode } from "../../../redux/newNodeSlice";
import useAnimateSkiaValue from "./hooks/useAnimateSkiaValue";
import {
    calculateDimentionsAndRootCoordinates,
    calculateDragAndDropZones,
    centerNodeCoordinatesInCanvas,
    getCirclePositions,
} from "./coordinateFunctions";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import useHandleCanvasScroll from "./hooks/useHandleCanvasScroll";
import { View } from "react-native";
import PopUpMenu from "../components/PopUpMenu";

type TreeViewProps = {
    tree: Tree<Skill>;
    onNodeClick?: (nodeId: string) => void;
    showDndZones?: boolean;
    onDndZoneClick?: (clickedZone?: DnDZone) => void;
};

function TreeView({ tree, onNodeClick, showDndZones, onDndZoneClick }: TreeViewProps) {
    //Redux State
    const screenDimentions = useAppSelector(selectScreenDimentions);
    const { selectedNode, selectedDndZone } = useAppSelector(selectTreeSlice);
    const { showLabel } = useAppSelector(selectCanvasDisplaySettings);
    const newNode = useAppSelector(selectNewNode);
    //Derived State
    const nodeCoordinates = getCirclePositions(tree);
    const canvasDimentions = calculateDimentionsAndRootCoordinates(nodeCoordinates, screenDimentions);
    const nodeCoordinatesCentered = centerNodeCoordinatesInCanvas(nodeCoordinates, canvasDimentions);
    const dragAndDropZones = calculateDragAndDropZones(nodeCoordinatesCentered);
    const foundNodeCoordinates = nodeCoordinates.find((c) => c.id === selectedNode);
    //Hooks
    const { touchHandler } = useCanvasTouchHandler({ tree, nodeCoordinatesCentered, onNodeClick, onDndZoneClick, showDndZones, dragAndDropZones });
    const { canvasHeight, canvasWidth } = canvasDimentions;
    const { canvasGestures, transform } = useHandleCanvasScroll(canvasDimentions, foundNodeCoordinates);
    //
    //Local State
    const [initialBlur, setInitialBlur] = useState(10);

    // useCenterCameraOnTreeChange(canvasTouchHandler, canvasDimentions);

    const treeAccentColor = tree.accentColor ? tree.accentColor : colors.accent;

    // useEffect(() => {
    //     setInitialBlur(0);
    // }, [currentTreeId]);

    const blur = useAnimateSkiaValue({ initialValue: 0, stateToAnimate: initialBlur });

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
                            }}
                            mode="continuous">
                            {/* {previewNode && <PreviewNode previewNode={previewNode} previewNodeParent={previewNodeParent} newNode={newNode} />} */}
                            <CanvasTree
                                stateProps={{
                                    selectedNode,
                                    showLabel,
                                    circlePositionsInCanvas: nodeCoordinatesCentered,
                                    tentativeCirlcePositionsInCanvas: [],
                                }}
                                // stateProps={{ selectedNode, showLabel, circlePositionsInCanvas, tentativeCirlcePositionsInCanvas }}
                                tree={tree}
                                wholeTree={tree}
                                treeAccentColor={treeAccentColor}
                                rootCoordinates={{ width: 0, height: 0 }}
                            />
                            {showDndZones && <DragAndDropZones data={dragAndDropZones} selectedDndZone={selectedDndZone} />}
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
