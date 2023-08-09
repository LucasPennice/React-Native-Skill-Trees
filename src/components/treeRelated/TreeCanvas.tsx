import { Canvas, SkiaDomView } from "@shopify/react-native-skia";
import { MutableRefObject, memo, useState } from "react";
import { GestureDetector, SimultaneousGesture } from "react-native-gesture-handler";
import { runOnJS, useAnimatedReaction, useSharedValue } from "react-native-reanimated";
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
    const { isInteractive, showAddNodeDndZones, canvasDisplaySettings } = config;
    const { showLabel, showIcons } = canvasDisplaySettings;

    const showDragAndDropZones = dragObject.state.isOutsideNodeMenuZone;

    const [hoveringOverDndZone, setHoveringOverDndZone] = useState<DnDZone | undefined>(undefined);
    const prevHoveringOverDndZone = useSharedValue<DnDZone | undefined>(undefined);

    const { dndZones, sharedValues: dragValues, state: dragState } = dragObject;

    useAnimatedReaction(
        () => {
            return [dragState.node, dragValues, dndZones, prevHoveringOverDndZone] as const;
        },
        (arr, _) => {
            const [draggingNode, dragValues, treeInsertPositions, prevHoveringOverDndZone] = arr;

            const { x: dragX, y: dragY } = dragValues;

            if (draggingNode === null) return;

            const x = draggingNode.x + dragX.value;
            const y = draggingNode.y + dragY.value;
            const dragCoord = { x, y };

            const hoveringZone = getHoveringOverDndZone(dragCoord, treeInsertPositions);

            const notUndefined = prevHoveringOverDndZone.value !== undefined && hoveringZone !== undefined;

            const sameNodeId = notUndefined && prevHoveringOverDndZone.value!.ofNode === hoveringZone.ofNode;
            const sameType = notUndefined && prevHoveringOverDndZone.value!.type === hoveringZone.type;

            if (sameNodeId && sameType) return;

            prevHoveringOverDndZone.value = hoveringZone;

            runOnJS(setHoveringOverDndZone)(hoveringZone);
        },
        [dragState.node, dragValues, dndZones, prevHoveringOverDndZone]
    );

    return (
        <>
            <HierarchicalSkillTree
                nodeCoordinatesCentered={nodeCoordinates}
                selectedNode={selectedNodeId ?? null}
                settings={{ showIcons, showLabel }}
                dragObject={dragObject}
            />
            {isInteractive && showAddNodeDndZones && <DragAndDropZones data={dndZoneCoordinates} selectedDndZone={selectedDndZone} />}
            {isInteractive && showDragAndDropZones && <DragAndDropZones data={dragObject.dndZones} selectedDndZone={hoveringOverDndZone} />}
        </>
    );
}

function getHoveringOverDndZone(dragCoord: { x: number; y: number }, treeInsertPositions: DnDZone[]) {
    "worklet";
    for (let i = 0; i < treeInsertPositions.length; i++) {
        const position = treeInsertPositions[i];

        const isWithinXBounds = dragCoord.x >= position.x && dragCoord.x <= position.x + position.width;

        if (!isWithinXBounds) continue;

        const isWithinYBounds = dragCoord.y >= position.y && dragCoord.y <= position.y + position.height;

        if (isWithinXBounds && isWithinYBounds) return position;
    }

    return undefined;
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
