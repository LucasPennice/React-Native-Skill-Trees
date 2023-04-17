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
import Node from "./Node";
import CanvasPath from "./CavnasPath";
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
    onDndZoneClick?: (clickedZone: DnDZone) => void;
};

function TreeView({ tree, onNodeClick, showDndZones, onDndZoneClick }: TreeViewProps) {
    //Redux State
    const screenDimentions = useAppSelector(selectScreenDimentions);
    const { selectedNode } = useAppSelector(selectTreeSlice);
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

    // const previewNode = tentativeCirlcePositionsInCanvas.length ? tentativeCirlcePositionsInCanvas.find((t) => t.id === newNode.id) : undefined;

    // const previewNodeParent = previewNode ? tentativeCirlcePositionsInCanvas.find((t) => t.id === previewNode.parentId) : undefined;

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
                            {showDndZones && <DragAndDropZones data={dragAndDropZones} />}
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
