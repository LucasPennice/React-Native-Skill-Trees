import { Canvas, SkiaDomView } from "@shopify/react-native-skia";
import { MutableRefObject, memo } from "react";
import { GestureDetector, SimultaneousGesture } from "react-native-gesture-handler";
import RadialSkillTree from "../../pages/homepage/RadialSkillTree";
import { CoordinatesWithTreeData, DnDZone } from "../../types";
import { InteractiveNodeState, InteractiveTreeConfig, TreeCoordinates } from "./InteractiveTree";
import RadialTreeLevelCircles from "./RadialTreeLevelCircles";
import DragAndDropZones from "./hierarchical/DragAndDropZones";
import HierarchicalSkillTree from "./hierarchical/HierarchicalSkillTree";
import { SharedValue } from "react-native-reanimated";

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
    drag: {
        x: SharedValue<number>;
        y: SharedValue<number>;
        nodesToDragId: string[];
    };
};

function TreeCanvas({ canvasHeight, canvasRef, canvasWidth, config, renderStyle, state, canvasGestures, treeData, drag }: Props) {
    return (
        <GestureDetector gesture={canvasGestures}>
            <Canvas style={{ width: canvasWidth, height: canvasHeight }} ref={canvasRef}>
                {renderStyle === "hierarchy" && <HierarchicalSkillTreeRender state={state} config={config} treeData={treeData} drag={drag} />}
                {renderStyle === "radial" && <RadialTreeRendererRender state={state} config={config} treeData={treeData} drag={drag} />}
            </Canvas>
        </GestureDetector>
    );
}

function HierarchicalSkillTreeRender({
    state,
    treeData,
    config,
    drag,
}: {
    state: InteractiveNodeState;
    treeData: TreeCoordinates;
    config: InteractiveTreeConfig;
    drag: {
        x: SharedValue<number>;
        y: SharedValue<number>;
        nodesToDragId: string[];
    };
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
                drag={drag}
            />
            {isInteractive && showDndZones && <DragAndDropZones data={dndZoneCoordinates} selectedDndZone={selectedDndZone} />}
        </>
    );
}

function RadialTreeRendererRender({
    treeData,
    config,
    state,
    drag,
}: {
    treeData: TreeCoordinates;
    config: InteractiveTreeConfig;
    state: InteractiveNodeState;
    drag: {
        x: SharedValue<number>;
        y: SharedValue<number>;
        nodesToDragId: string[];
    };
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
                drag={drag}
            />
        </>
    );
}

export default memo(TreeCanvas);
