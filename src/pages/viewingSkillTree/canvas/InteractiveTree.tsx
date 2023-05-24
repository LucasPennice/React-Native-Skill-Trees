import { Blur, Canvas, SkiaDomView, runTiming, useValue } from "@shopify/react-native-skia";
import { MutableRefObject, useEffect, useRef } from "react";
import { View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { NAV_HEGIHT, centerFlex } from "../../../parameters";
import { useAppSelector } from "../../../redux/reduxHooks";
import { selectScreenDimentions } from "../../../redux/screenDimentionsSlice";
import { selectTreeSlice } from "../../../redux/userTreesSlice";
import { CanvasDimensions, DnDZone, Skill, Tree } from "../../../types";
import PopUpMenu from "../components/PopUpMenu";
import DragAndDropZones from "./DragAndDropZones";
import HierarchicalSkillTree from "./HierarchicalSkillTree";
import {
    calculateDragAndDropZones,
    centerNodesInCanvas,
    getCanvasDimensions,
    getCoordinatedWithTreeData,
    getNodesCoordinates,
    removeTreeDataFromCoordinate,
} from "./coordinateFunctions";
import useCanvasTouchHandler from "./hooks/useCanvasTouchHandler";
import useHandleCanvasScroll from "./hooks/useHandleCanvasScroll";
import { selectCanvasDisplaySettings } from "../../../redux/canvasDisplaySettingsSlice";

type InteractiveTreeProps = {
    tree: Tree<Skill>;
    onNodeClick?: (nodeId: string) => void;
    showDndZones?: boolean;
    onDndZoneClick?: (clickedZone?: DnDZone) => void;
    canvasRef: MutableRefObject<SkiaDomView | null>;
    openChildrenHoistSelector: (candidatesToHoist: Tree<Skill>[]) => void;
};

function InteractiveTree({ tree, onNodeClick, showDndZones, onDndZoneClick, canvasRef, openChildrenHoistSelector }: InteractiveTreeProps) {
    //Redux State
    const screenDimentions = useAppSelector(selectScreenDimentions);
    const { selectedNode, selectedDndZone, currentTreeId } = useAppSelector(selectTreeSlice);
    const { showLabel } = useAppSelector(selectCanvasDisplaySettings);
    //Derived State
    const coordinatesWithTreeData = getNodesCoordinates(tree, "hierarchy");
    //
    const nodeCoordinates = removeTreeDataFromCoordinate(coordinatesWithTreeData);
    const canvasDimentions = getCanvasDimensions(nodeCoordinates, screenDimentions);
    const nodeCoordinatesCentered = centerNodesInCanvas(nodeCoordinates, canvasDimentions);
    const dragAndDropZones = calculateDragAndDropZones(nodeCoordinatesCentered);
    const foundNodeCoordinates = nodeCoordinatesCentered.find((c) => c.id === selectedNode);
    //
    const centeredCoordinatedWithTreeData = getCoordinatedWithTreeData(coordinatesWithTreeData, nodeCoordinatesCentered);

    const ifSkillNodeRunNodeClick = (nodeId: string) => {
        const node = coordinatesWithTreeData.find((c) => c.nodeId === nodeId && c.category === "SKILL");

        const isSkillNode = node !== undefined;

        if (isSkillNode && onNodeClick) return onNodeClick(nodeId);

        return;
    };

    //Hooks
    const { touchHandler } = useCanvasTouchHandler({
        tree,
        nodeCoordinatesCentered,
        onNodeClick: ifSkillNodeRunNodeClick,
        onDndZoneClick,
        showDndZones,
        dragAndDropZones,
    });
    const { canvasHeight, canvasWidth } = canvasDimentions;
    const { canvasGestures, transform } = useHandleCanvasScroll(canvasDimentions, foundNodeCoordinates);
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
                        <Canvas onTouch={touchHandler} style={{ width: canvasWidth, height: canvasHeight }} ref={canvasRef}>
                            <HierarchicalSkillTree
                                nodeCoordinatesCentered={centeredCoordinatedWithTreeData}
                                selectedNode={selectedNode}
                                showLabel={showLabel}
                            />
                            {showDndZones && <DragAndDropZones data={dragAndDropZones} selectedDndZone={selectedDndZone} />}
                            <Blur blur={blur} />
                        </Canvas>
                    </Animated.View>
                </View>
            </GestureDetector>
            {foundNodeCoordinates && <PopUpMenu openChildrenHoistSelector={openChildrenHoistSelector} />}
        </>
    );
}

InteractiveTree.whyDidYouRender = true;

export default InteractiveTree;
