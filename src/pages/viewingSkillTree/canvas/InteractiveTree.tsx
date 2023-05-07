import { Blur, Canvas, SkiaDomView, runTiming, useValue } from "@shopify/react-native-skia";
import { MutableRefObject, useEffect } from "react";
import { View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { NAV_HEGIHT, centerFlex } from "../../../parameters";
import { useAppSelector } from "../../../redux/reduxHooks";
import { selectScreenDimentions } from "../../../redux/screenDimentionsSlice";
import { selectTreeSlice } from "../../../redux/userTreesSlice";
import { CoordinatesWithTreeData, DnDZone, ParentId, Skill, Tree } from "../../../types";
import PopUpMenu from "../components/PopUpMenu";
import DragAndDropZones from "./DragAndDropZones";
import { BombasticToNormal, calculateDragAndDropZones, centerNodesInCanvas, getCanvasDimensions, getNodesCoordinates } from "./coordinateFunctions";
import useCanvasTouchHandler from "./hooks/useCanvasTouchHandler";
import useHandleCanvasScroll from "./hooks/useHandleCanvasScroll";
import HierarchicalSkillTree from "./HierarchicalSkillTree";

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
    //Derived State
    const coordinatesWithTreeData = getNodesCoordinates(tree, "hierarchy");
    //
    const nodeCoordinates = BombasticToNormal(coordinatesWithTreeData);
    const canvasDimentions = getCanvasDimensions(nodeCoordinates, screenDimentions);
    const nodeCoordinatesCentered = centerNodesInCanvas(nodeCoordinates, canvasDimentions);
    const dragAndDropZones = calculateDragAndDropZones(nodeCoordinatesCentered);
    const foundNodeCoordinates = nodeCoordinates.find((c) => c.id === selectedNode);
    //
    const centeredCoordinatedWithTreeData = getCoordinatedWithTreeData(coordinatesWithTreeData, nodeCoordinatesCentered);

    //Hooks
    const { touchHandler } = useCanvasTouchHandler({ tree, nodeCoordinatesCentered, onNodeClick, onDndZoneClick, showDndZones, dragAndDropZones });
    const { canvasHeight, canvasWidth } = canvasDimentions;
    const { canvasGestures, transform } = useHandleCanvasScroll(canvasDimentions, foundNodeCoordinates, isTakingScreenshot);
    //

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
                            <HierarchicalSkillTree nodeCoordinatesCentered={centeredCoordinatedWithTreeData} selectedNode={selectedNode} />
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

//The animations break for some reason when using CoordinatesWithTreeData
//It seems to be a bug of reanimated 2
function getCoordinatedWithTreeData(
    coordinatesWithTreeData: CoordinatesWithTreeData[],
    nodeCoordinatesCentered: {
        x: number;
        y: number;
        id: string;
        level: number;
        parentId: ParentId;
    }[]
): CoordinatesWithTreeData[] {
    return nodeCoordinatesCentered.map((centeredCoord, i) => {
        const currentBombastic = coordinatesWithTreeData[i];

        return {
            accentColor: currentBombastic.accentColor,
            data: currentBombastic.data,
            isRoot: currentBombastic.isRoot,
            level: currentBombastic.level,
            nodeId: currentBombastic.nodeId,
            parentId: currentBombastic.parentId,
            treeId: currentBombastic.treeId,
            treeName: currentBombastic.treeName,
            x: centeredCoord.x,
            y: centeredCoord.y,
        };
    });
}

export default InteractiveTree;
