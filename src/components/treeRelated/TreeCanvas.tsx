import { Canvas, SkiaDomView } from "@shopify/react-native-skia";
import { MutableRefObject, memo } from "react";
import { GestureDetector, SimultaneousGesture } from "react-native-gesture-handler";
import RadialSkillTree from "../../pages/homepage/RadialSkillTree";
import { CoordinatesWithTreeData, DnDZone } from "../../types";
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
};

function TreeCanvas({ canvasHeight, canvasRef, canvasWidth, config, renderStyle, state, canvasGestures, treeData }: Props) {
    return (
        <GestureDetector gesture={canvasGestures}>
            <Canvas style={{ width: canvasWidth, height: canvasHeight }} ref={canvasRef}>
                {renderStyle === "hierarchy" && <HierarchicalSkillTreeRender state={state} config={config} treeData={treeData} />}
                {renderStyle === "radial" && <RadialTreeRendererRender state={state} config={config} treeData={treeData} />}
            </Canvas>
        </GestureDetector>
    );
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

export default memo(TreeCanvas);
