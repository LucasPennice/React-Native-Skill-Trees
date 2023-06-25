import { Blur, Canvas, SkiaDomView, runTiming, useValue } from "@shopify/react-native-skia";
import { MutableRefObject, memo, useEffect } from "react";
import { View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { findNodeById } from "../../functions/extractInformationFromTree";
import RadialSkillTree from "../../pages/homepage/RadialSkillTree";
import { centerFlex } from "../../parameters";
import { CanvasDisplaySettings } from "../../redux/canvasDisplaySettingsSlice";
import { ScreenDimentions } from "../../redux/screenDimentionsSlice";
import { CoordinatesWithTreeData, DnDZone, SelectedDnDZone, SelectedNodeId, Skill, Tree } from "../../types";
import RadialTreeLevelCircles from "./RadialTreeLevelCircles";
import {
    calculateDragAndDropZones,
    centerNodesInCanvas,
    getCanvasDimensions,
    getCoordinatedWithTreeData,
    getNodesCoordinates,
    removeTreeDataFromCoordinate,
} from "./coordinateFunctions";
import DragAndDropZones from "./hierarchical/DragAndDropZones";
import HierarchicalSkillTree from "./hierarchical/HierarchicalSkillTree";
import useCanvasTouchHandler from "./hooks/useCanvasTouchHandler";
import useHandleCanvasScroll from "./hooks/useHandleCanvasScroll";
import NodeMenu from "./nodeMenu/NodeMenu";
import NodeLongPressIndicator from "./general/NodeLongPressIndicator";

export type InteractiveTreeConfig = {
    renderStyle: "hierarchy" | "radial";
    canvasDisplaySettings: CanvasDisplaySettings;
    showDndZones?: boolean;
    isInteractive: boolean;
};

export type InteractiveNodeState = {
    selectedNodeId: SelectedNodeId;
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

export type InteractiveTreeProps = {
    tree: Tree<Skill>;
    config: InteractiveTreeConfig;
    state: InteractiveNodeState;
    functions?: InteractiveTreeFunctions;
    renderOnSelectedNodeId?: JSX.Element;
};

function InteractiveTree({ tree, config, functions, state, renderOnSelectedNodeId }: InteractiveTreeProps) {
    const { screenDimensions, selectedNodeId, canvasRef } = state;
    const { isInteractive, renderStyle, showDndZones, canvasDisplaySettings } = config;
    const { showCircleGuide } = canvasDisplaySettings;

    //Derived State
    const { centeredCoordinatedWithTreeData, dndZoneCoordinates, nodeCoordinatesCentered, canvasDimentions } = handleTreeBuild(
        tree,
        screenDimensions,
        renderStyle,
        showCircleGuide
    );
    const { canvasHeight, canvasWidth } = canvasDimentions;

    const selectedNodeCoordinates = nodeCoordinatesCentered.find((c) => c.id === selectedNodeId);

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
    const touchHandlerState = {
        selectedNodeId,
        nodeCoordinatesCentered,
        dragAndDropZones: dndZoneCoordinates,
        canvasWidth,
        screenWidth: screenDimensions.width,
    };
    const touchHandlerFunctions = { onNodeClick: onNodeClickAdapter, onDndZoneClick: onDndZoneClickAdapter };
    const { touchHandler, openMenuOnNode, longPressIndicatorPosition, closeNodeMenu, longPressFn } = useCanvasTouchHandler({
        functions: touchHandlerFunctions,
        state: touchHandlerState,
        config: { showDndZones },
    });
    //

    const foundNodeOfMenu = openMenuOnNode ? centeredCoordinatedWithTreeData.find((c) => c.nodeId === openMenuOnNode.id) : undefined;
    const foundNodeOfMenuWithoutData = openMenuOnNode ? nodeCoordinatesCentered.find((c) => c.id === openMenuOnNode.id) : undefined;

    const { canvasGestures, transform, offset } = useHandleCanvasScroll(
        canvasDimentions,
        screenDimensions,
        selectedNodeCoordinates,
        foundNodeOfMenuWithoutData,
        longPressFn
    );
    const blur = useHandleBlurAnimation(tree.treeId);
    //

    const treeData = { nodeCoordinates: centeredCoordinatedWithTreeData, dndZoneCoordinates };

    const renderSelectedNodeMenu = selectedNodeCoordinates && selectedNodeId && isInteractive;
    const renderNodeMenu = foundNodeOfMenu && openMenuOnNode && isInteractive;

    return (
        <>
            <GestureDetector gesture={canvasGestures}>
                <View style={[centerFlex, { width: screenDimensions.width, flex: 1 }]}>
                    <Animated.View style={[transform, { flex: 1 }]}>
                        <Canvas onTouch={touchHandler} style={{ width: canvasWidth, height: canvasHeight }} ref={canvasRef}>
                            {renderStyle === "hierarchy" && <HierarchicalSkillTreeRender state={state} config={config} treeData={treeData} />}
                            {renderStyle === "radial" && <RadialTreeRendererRender state={state} config={config} treeData={treeData} />}
                            <Blur blur={blur} />
                        </Canvas>
                    </Animated.View>
                </View>
            </GestureDetector>
            {/* Long press Node related 👇 */}
            <NodeLongPressIndicator
                data={longPressIndicatorPosition}
                offset={offset}
                canvasDimentions={canvasDimentions}
                screenDimensions={screenDimensions}
            />
            {renderNodeMenu && (
                <NodeMenu
                    data={foundNodeOfMenu}
                    offset={offset}
                    canvasDimentions={canvasDimentions}
                    screenDimensions={screenDimensions}
                    closeNodeMenu={closeNodeMenu}
                />
            )}

            {/* Long press Node related 👆 */}
            {renderSelectedNodeMenu && renderOnSelectedNodeId}
        </>
    );
}

export default memo(InteractiveTree);

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
    const { showLabel, showIcons } = canvasDisplaySettings;

    return (
        <>
            <HierarchicalSkillTree
                nodeCoordinatesCentered={nodeCoordinates}
                selectedNode={selectedNodeId ?? null}
                settings={{ showIcons, showLabel }}
            />
            {isInteractive && showDndZones && <DragAndDropZones data={dndZoneCoordinates} selectedDndZone={selectedDndZone} />}
        </>
    );
}

function RadialTreeRendererRender({
    treeData,
    config,
    state,
}: {
    treeData: TreeCoordinates;
    config: InteractiveTreeConfig;
    state: InteractiveNodeState;
}) {
    const { nodeCoordinates } = treeData;
    const { canvasDisplaySettings } = config;
    const { showLabel, oneColorPerTree, showCircleGuide, showIcons } = canvasDisplaySettings;
    const { selectedNodeId } = state;

    return (
        <>
            {showCircleGuide && <RadialTreeLevelCircles nodeCoordinates={nodeCoordinates} />}
            <RadialSkillTree
                nodeCoordinatesCentered={nodeCoordinates}
                selectedNode={selectedNodeId ?? null}
                settings={{ showLabel, oneColorPerTree, showIcons }}
            />
        </>
    );
}

function handleTreeBuild(
    tree: Tree<Skill>,
    screenDimentions: ScreenDimentions,
    renderStyle: InteractiveTreeConfig["renderStyle"],
    showDepthGuides?: boolean
) {
    const coordinatesWithTreeData = getNodesCoordinates(tree, renderStyle);
    //
    const nodeCoordinates = removeTreeDataFromCoordinate(coordinatesWithTreeData);
    const canvasDimentions = getCanvasDimensions(nodeCoordinates, screenDimentions, showDepthGuides);
    const nodeCoordinatesCentered = centerNodesInCanvas(nodeCoordinates, canvasDimentions, renderStyle);
    const dndZoneCoordinates = calculateDragAndDropZones(nodeCoordinatesCentered);
    //
    const centeredCoordinatedWithTreeData = getCoordinatedWithTreeData(coordinatesWithTreeData, nodeCoordinatesCentered);

    return { nodeCoordinatesCentered, centeredCoordinatedWithTreeData, dndZoneCoordinates, coordinatesWithTreeData, canvasDimentions };
}
