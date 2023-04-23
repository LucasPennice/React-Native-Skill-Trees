import { Blur, Canvas, SkiaDomView, runTiming, useValue } from "@shopify/react-native-skia";
import { MutableRefObject, useEffect } from "react";
import { View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { NAV_HEGIHT, centerFlex, colors } from "../../../parameters";
import { selectCanvasDisplaySettings } from "../../../redux/canvasDisplaySettingsSlice";
import { useAppSelector } from "../../../redux/reduxHooks";
import { selectScreenDimentions } from "../../../redux/screenDimentionsSlice";
import { selectTreeSlice } from "../../../redux/userTreesSlice";
import { DnDZone, Skill, Tree } from "../../../types";
import PopUpMenu from "../components/PopUpMenu";
import CanvasTree from "./CanvasTree";
import DragAndDropZones from "./DragAndDropZones";
import { calculateDragAndDropZones, centerNodesInCanvas, getCanvasDimensions, getNodesCoordinates } from "./coordinateFunctions";
import useCanvasTouchHandler from "./hooks/useCanvasTouchHandler";
import useHandleCanvasScroll from "./hooks/useHandleCanvasScroll";

type InteractiveTreeProps = {
    tree: Tree<Skill>;
    onNodeClick?: (nodeId: string) => void;
    showDndZones?: boolean;
    isTakingScreenshot?: boolean;
    onDndZoneClick?: (clickedZone?: DnDZone) => void;
    canvasRef: MutableRefObject<SkiaDomView | null>;
};

function InteractiveTree({ tree, onNodeClick, showDndZones, onDndZoneClick, canvasRef, isTakingScreenshot }: InteractiveTreeProps) {
    //Redux State
    const screenDimentions = useAppSelector(selectScreenDimentions);
    const { selectedNode, selectedDndZone, currentTreeId } = useAppSelector(selectTreeSlice);
    const { showLabel } = useAppSelector(selectCanvasDisplaySettings);
    //Derived State
    const nodeCoordinates = getNodesCoordinates(tree, "hierarchy");
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

InteractiveTree.whyDidYouRender = true;

export default InteractiveTree;
