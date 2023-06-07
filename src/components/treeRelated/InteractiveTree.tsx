import { Blur, Canvas, SkiaDomView, runTiming, useValue } from "@shopify/react-native-skia";
import { MutableRefObject, useEffect } from "react";
import { View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { centerFlex } from "../../parameters";
import { CanvasDisplaySettings } from "../../redux/canvasDisplaySettingsSlice";
import { ScreenDimentions } from "../../redux/screenDimentionsSlice";
import { CoordinatesWithTreeData, DnDZone, SelectedDnDZone, SelectedNodeId, Skill, Tree } from "../../types";
import DragAndDropZones from "./hierarchical/DragAndDropZones";
import HierarchicalSkillTree from "./hierarchical/HierarchicalSkillTree";
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
import { findNodeById } from "../../functions/extractInformationFromTree";
import RadialSkillTree from "../../pages/homepage/RadialSkillTree";
import RadialTreeLevelCircles from "./RadialTreeLevelCircles";

export type InteractiveTreeConfig = {
    renderStyle: "hierarchy" | "radial";
    canvasDisplaySettings: CanvasDisplaySettings;
    showDndZones?: boolean;
    isInteractive: boolean;
};

export type InteractiveNodeState = {
    selectedNodeId?: SelectedNodeId;
    selectedDndZone?: SelectedDnDZone;
    screenDimensions: ScreenDimentions;
    canvasRef?: MutableRefObject<SkiaDomView | null>;
};

export type InteractiveTreeFunctions = {
    onNodeClick?: (node: Tree<Skill>) => void;
    onDndZoneClick?: (zone: DnDZone) => void;
};

export type TreeCoordinates = {
    nodeCoordinates: CoordinatesWithTreeData[];
    dndZoneCoordinates: DnDZone[];
};

export type InteractiveTree2Props = {
    tree: Tree<Skill>;
    config: InteractiveTreeConfig;
    state: InteractiveNodeState;
    functions?: InteractiveTreeFunctions;
    renderOnSelectedNodeId?: JSX.Element;
};

function InteractiveTree({ tree, config, functions, state, renderOnSelectedNodeId }: InteractiveTree2Props) {
    const { screenDimensions, selectedNodeId, canvasRef } = state;
    const { isInteractive, renderStyle, showDndZones } = config;

    //Derived State
    const { centeredCoordinatedWithTreeData, dndZoneCoordinates, nodeCoordinatesCentered, canvasDimentions } = handleTreeBuild(
        tree,
        screenDimensions,
        renderStyle
    );

    const foundNodeCoordinates = nodeCoordinatesCentered.find((c) => c.id === selectedNodeId);

    const onNodeClickAdapter = (nodeId: string) => {
        if (!functions || !functions.onNodeClick) return;

        const node = findNodeById(tree, nodeId);

        if (!node) return;

        functions.onNodeClick(node);
    };

    const onDndZoneClickAdapter = (zone?: DnDZone) => {
        if (!functions || !functions.onDndZoneClick) return;

        if (!zone) return;

        functions.onDndZoneClick(zone);
    };

    //Hooks
    const { touchHandler } = useCanvasTouchHandler({
        tree,
        nodeCoordinatesCentered,
        onNodeClick: onNodeClickAdapter,
        onDndZoneClick: onDndZoneClickAdapter,
        showDndZones,
        dragAndDropZones: dndZoneCoordinates,
    });
    const { canvasHeight, canvasWidth } = canvasDimentions;
    const { canvasGestures, transform } = useHandleCanvasScroll(canvasDimentions, foundNodeCoordinates);
    const blur = useHandleBlurAnimation(tree.treeId);
    //

    const treeData = { nodeCoordinates: centeredCoordinatedWithTreeData, dndZoneCoordinates };

    const renderSelectedNodeMenu = foundNodeCoordinates && selectedNodeId && isInteractive;

    return (
        <>
            <GestureDetector gesture={canvasGestures}>
                <View style={[centerFlex, { width: screenDimensions.width, flex: 1 }]}>
                    <Animated.View style={[transform, { flex: 1 }]}>
                        <Canvas onTouch={touchHandler} style={{ width: canvasWidth, height: canvasHeight }} ref={canvasRef}>
                            {renderStyle === "hierarchy" && <HierarchicalSkillTreeRender state={state} config={config} treeData={treeData} />}
                            {renderStyle === "radial" && <RadialTreeRendererRender config={config} treeData={treeData} />}
                            <Blur blur={blur} />
                        </Canvas>
                    </Animated.View>
                </View>
            </GestureDetector>
            {renderSelectedNodeMenu && renderOnSelectedNodeId}
        </>
    );
}

export default InteractiveTree;

function useHandleBlurAnimation(treeId: string) {
    useEffect(() => {
        runBlurAnimation();
        //eslint-disable-next-line
    }, [treeId]);

    const blur = useValue(4);

    const runBlurAnimation = () => runTiming(blur, { from: 4, to: 0 }, { duration: 600 });

    return blur;
}

function HierarchicalSkillTreeRender({
    state,
    treeData,
    config,
}: {
    state: InteractiveNodeState;
    treeData: TreeCoordinates;
    config: InteractiveTreeConfig;
}) {
    const { selectedDndZone, selectedNodeId } = state;
    const { dndZoneCoordinates, nodeCoordinates } = treeData;
    const { isInteractive, showDndZones, canvasDisplaySettings } = config;
    const { showLabel } = canvasDisplaySettings;

    return (
        <>
            <HierarchicalSkillTree nodeCoordinatesCentered={nodeCoordinates} selectedNode={selectedNodeId ?? null} showLabel={showLabel} />
            {isInteractive && showDndZones && <DragAndDropZones data={dndZoneCoordinates} selectedDndZone={selectedDndZone} />}
        </>
    );
}

function RadialTreeRendererRender({ treeData, config }: { treeData: TreeCoordinates; config: InteractiveTreeConfig }) {
    const { nodeCoordinates } = treeData;
    const { canvasDisplaySettings } = config;
    const { showLabel, oneColorPerTree, showCircleGuide } = canvasDisplaySettings;

    return (
        <>
            {showCircleGuide && <RadialTreeLevelCircles nodeCoordinates={nodeCoordinates} />}
            <RadialSkillTree nodeCoordinatesCentered={nodeCoordinates} selectedNode={null} settings={{ showLabel, oneColorPerTree }} />
        </>
    );
}

function handleTreeBuild(tree: Tree<Skill>, screenDimentions: ScreenDimentions, renderStyle: InteractiveTreeConfig["renderStyle"]) {
    const coordinatesWithTreeData = getNodesCoordinates(tree, renderStyle);
    //
    const nodeCoordinates = removeTreeDataFromCoordinate(coordinatesWithTreeData);
    const canvasDimentions = getCanvasDimensions(nodeCoordinates, screenDimentions);
    const nodeCoordinatesCentered = centerNodesInCanvas(nodeCoordinates, canvasDimentions);
    const dndZoneCoordinates = calculateDragAndDropZones(nodeCoordinatesCentered);
    //
    const centeredCoordinatedWithTreeData = getCoordinatedWithTreeData(coordinatesWithTreeData, nodeCoordinatesCentered);

    return { nodeCoordinatesCentered, centeredCoordinatedWithTreeData, dndZoneCoordinates, coordinatesWithTreeData, canvasDimentions };
}
