import { Blur, Canvas, SkiaDomView, runTiming, useValue } from "@shopify/react-native-skia";
import { MutableRefObject, useEffect } from "react";
import { View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { centerFlex } from "../../../parameters";
import { selectCanvasDisplaySettings } from "../../../redux/canvasDisplaySettingsSlice";
import { useAppSelector } from "../../../redux/reduxHooks";
import { selectSafeScreenDimentions } from "../../../redux/screenDimentionsSlice";
import { selectTreeSlice } from "../../../redux/userTreesSlice";
import { DnDZone, Skill, Tree } from "../../../types";
import useCurrentTree from "../../../useCurrentTree";
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
    const screenDimentions = useAppSelector(selectSafeScreenDimentions);
    const currentTree = useCurrentTree();
    const { selectedNode, selectedDndZone, currentTreeId } = useAppSelector(selectTreeSlice);
    const { showLabel } = useAppSelector(selectCanvasDisplaySettings);
    //Derived State
    const { centeredCoordinatedWithTreeData, dragAndDropZones, nodeCoordinatesCentered, coordinatesWithTreeData, canvasDimentions } = handleTreeBuild(
        tree,
        screenDimentions
    );

    const foundNodeCoordinates = nodeCoordinatesCentered.find((c) => c.id === selectedNode);

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
                <View style={[centerFlex, { width: screenDimentions.width, flex: 1 }]}>
                    <Animated.View style={[transform, { flex: 1 }]}>
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
            {foundNodeCoordinates && currentTree && <PopUpMenu selectedTree={currentTree} openChildrenHoistSelector={openChildrenHoistSelector} />}
        </>
    );
}

InteractiveTree.whyDidYouRender = true;

export default InteractiveTree;

function handleTreeBuild(tree: Tree<Skill>, screenDimentions: { width: number; height: number }) {
    const coordinatesWithTreeData = getNodesCoordinates(tree, "hierarchy");
    //
    const nodeCoordinates = removeTreeDataFromCoordinate(coordinatesWithTreeData);
    const canvasDimentions = getCanvasDimensions(nodeCoordinates, screenDimentions);
    const nodeCoordinatesCentered = centerNodesInCanvas(nodeCoordinates, canvasDimentions);
    const dragAndDropZones = calculateDragAndDropZones(nodeCoordinatesCentered);
    //
    const centeredCoordinatedWithTreeData = getCoordinatedWithTreeData(coordinatesWithTreeData, nodeCoordinatesCentered);

    return { nodeCoordinatesCentered, centeredCoordinatedWithTreeData, dragAndDropZones, coordinatesWithTreeData, canvasDimentions };
}
