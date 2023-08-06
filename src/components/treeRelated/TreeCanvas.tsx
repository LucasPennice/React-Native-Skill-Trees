import { Canvas, SkiaDomView } from "@shopify/react-native-skia";
import { MutableRefObject, memo } from "react";
import { GestureDetector, SimultaneousGesture } from "react-native-gesture-handler";
import RadialSkillTree from "../../pages/homepage/RadialSkillTree";
import { CoordinatesWithTreeData, DnDZone, DragObject } from "../../types";
import { InteractiveNodeState, InteractiveTreeConfig, TreeCoordinates } from "./InteractiveTree";
import RadialTreeLevelCircles from "./RadialTreeLevelCircles";
import DragAndDropZones from "./hierarchical/DragAndDropZones";
import HierarchicalSkillTree from "./hierarchical/HierarchicalSkillTree";

type Props = {
    canvasGestures: SimultaneousGesture;
    canvasWidth: number;
    canvasHeight: number;
    renderStyle: "hierarchy" | "radial";
    canvasRef: MutableRefObject<SkiaDomView | null> | undefined;
    state: InteractiveNodeState;
    config: InteractiveTreeConfig;
    treeData: {
        nodeCoordinates: CoordinatesWithTreeData[];
        dndZoneCoordinates: DnDZone[];
    };
    dragObject: DragObject;
};

function TreeCanvas({ canvasHeight, canvasRef, canvasWidth, config, renderStyle, state, canvasGestures, treeData, dragObject }: Props) {
    return (
        <GestureDetector gesture={canvasGestures}>
            <Canvas style={{ width: canvasWidth, height: canvasHeight }} ref={canvasRef}>
                {renderStyle === "hierarchy" && (
                    <HierarchicalSkillTreeRender state={state} config={config} treeData={treeData} dragObject={dragObject} />
                )}
                {renderStyle === "radial" && <RadialTreeRendererRender state={state} config={config} treeData={treeData} dragObject={dragObject} />}
            </Canvas>
        </GestureDetector>
    );
}

function HierarchicalSkillTreeRender({
    state,
    treeData,
    config,
    dragObject,
}: {
    state: InteractiveNodeState;
    treeData: TreeCoordinates;
    config: InteractiveTreeConfig;
    dragObject: DragObject;
}) {
    const { selectedNodeId, selectedDndZone } = state;
    const { dndZoneCoordinates, nodeCoordinates } = treeData;
    const { isInteractive, showDndZones, canvasDisplaySettings } = config;
    const { showLabel, showIcons } = canvasDisplaySettings;

    return (
        <>
            <HierarchicalSkillTree
                nodeCoordinatesCentered={nodeCoordinates}
                selectedNode={selectedNodeId ?? null}
                settings={{ showIcons, showLabel }}
                dragObject={dragObject}
            />
            {isInteractive && showDndZones && <DragAndDropZones data={dndZoneCoordinates} selectedDndZone={selectedDndZone} />}
        </>
    );
}

function RadialTreeRendererRender({
    treeData,
    config,
    state,
    dragObject,
}: {
    treeData: TreeCoordinates;
    config: InteractiveTreeConfig;
    state: InteractiveNodeState;
    dragObject: DragObject;
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
                dragObject={dragObject}
            />
        </>
    );
}

export default memo(TreeCanvas);
