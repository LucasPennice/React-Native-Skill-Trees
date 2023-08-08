import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SkiaDomView } from "@shopify/react-native-skia";
import { MutableRefObject, memo, useEffect } from "react";
import { View } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { StackNavigatorParams } from "../../../App";
import { findNodeById } from "../../functions/extractInformationFromTree";
import { centerFlex } from "../../parameters";
import { CanvasDisplaySettings } from "../../redux/canvasDisplaySettingsSlice";
import { ScreenDimentions } from "../../redux/screenDimentionsSlice";
import { CoordinatesWithTreeData, DnDZone, DragObject, SelectedDnDZone, SelectedNodeId, Skill, Tree } from "../../types";
import TreeCanvas from "./TreeCanvas";
import {
    calculateDragAndDropZones,
    centerNodesInCanvas,
    getCanvasDimensions,
    getCoordinatedWithTreeData,
    getNodesCoordinates,
    minifyDragAndDropZones,
    removeTreeDataFromCoordinate,
} from "./coordinateFunctions";
import NodeLongPressIndicator from "./general/NodeLongPressIndicator";
import useCanvasPressAndLongPress from "./hooks/useCanvasPressAndLongPress";
import useHandleCanvasScrollAndZoom from "./hooks/useHandleCanvasScrollAndZoom";
import NodeMenu from "./nodeMenu/NodeMenu";
import returnNodeMenuFunctions from "./returnNodeMenuFunctions";
import useDragState from "./useDragState";
import useCalculateDnDZonesWhenDraggingNode from "./hooks/useCalculateDnDZonesWhenDraggingNode";

type NavigateFunction =
    | NativeStackNavigationProp<StackNavigatorParams, "Home", undefined>["navigate"]
    | NativeStackNavigationProp<StackNavigatorParams, "ViewingSkillTree", undefined>["navigate"];

export type InteractiveTreeConfig = {
    renderStyle: "hierarchy" | "radial";
    canvasDisplaySettings: CanvasDisplaySettings;
    showAddNodeDndZones?: boolean;
    isInteractive: boolean;
    blockLongPress?: boolean;
    blockDragAndDrop?: boolean;
    editTreeFromNodeMenu?: boolean;
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
    nodeMenu: {
        navigate: NavigateFunction;
        openCanvasSettingsModal?: () => void;
        confirmDeleteTree: (treeId: string) => void;
        confirmDeleteNode: (tree: Tree<Skill>, node: Tree<Skill>) => void;
        selectNode: (nodeId: string, menuMode: "EDITING" | "VIEWING") => void;
        openAddSkillModal: (zoneType: DnDZone["type"], node: Tree<Skill>) => void;
        toggleCompletionOfSkill: (tree: Tree<Skill>, node: Tree<Skill>) => void;
    };
    runOnTreeUpdate?: (dndZoneCoordinates: DnDZone[]) => void;
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
    //Props
    const { screenDimensions, selectedNodeId, canvasRef } = state;
    const { isInteractive, renderStyle, showAddNodeDndZones, canvasDisplaySettings, blockLongPress, blockDragAndDrop, editTreeFromNodeMenu } = config;
    const { showCircleGuide } = canvasDisplaySettings;

    //Local State
    const [dragState, dispatchDragState, dragValues] = useDragState(tree);

    //Derived State
    const { centeredCoordinatedWithTreeData, dndZoneCoordinates, nodeCoordinatesCentered, canvasDimentions } = handleTreeBuild(
        tree,
        screenDimensions,
        renderStyle,
        showCircleGuide
    );
    const { canvasHeight, canvasWidth } = canvasDimentions;

    const draggingNodeSubtreeIds = config.renderStyle === "radial" ? null : dragState.subtreeIds;
    const dragDndZones = useCalculateDnDZonesWhenDraggingNode(draggingNodeSubtreeIds, nodeCoordinatesCentered);

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

    useEffect(() => {
        if (!functions || !functions.runOnTreeUpdate) return;

        functions.runOnTreeUpdate(dndZoneCoordinates);
        //eslint-disable-next-line
    }, [tree]);

    //Hooks
    const touchHandlerState = { selectedNodeId, nodeCoordinatesCentered, dragAndDropZones: dndZoneCoordinates };
    const touchHandlerFunctions = {
        onNodeClick: onNodeClickAdapter,
        onDndZoneClick: onDndZoneClickAdapter,
        dispatchDragState,
        resetDragValues: dragValues.resetDragValues,
    };
    const { canvasPressAndLongPress, openMenuOnNode, longPressIndicatorPosition, closeNodeMenu, onScroll } = useCanvasPressAndLongPress({
        functions: touchHandlerFunctions,
        state: touchHandlerState,
        config: { showAddNodeDndZones, blockLongPress, blockDragAndDrop },
    });
    //

    const foundNodeOfMenu = openMenuOnNode ? centeredCoordinatedWithTreeData.find((c) => c.nodeId === openMenuOnNode.id) : undefined;
    const foundNodeOfMenuWithoutData = openMenuOnNode ? nodeCoordinatesCentered.find((c) => c.id === openMenuOnNode.id) : undefined;

    const { canvasScrollAndZoom, transform, scale, dragDelta } = useHandleCanvasScrollAndZoom(
        canvasDimentions,
        screenDimensions,
        selectedNodeCoordinates,
        foundNodeOfMenuWithoutData,
        onScroll,
        [dragState, dispatchDragState, dragValues]
    );

    const treeData = { nodeCoordinates: centeredCoordinatedWithTreeData, dndZoneCoordinates };

    const renderSelectedNodeMenu = selectedNodeCoordinates && selectedNodeId && isInteractive;
    const renderNodeMenu = foundNodeOfMenu && openMenuOnNode && isInteractive;

    const nodeMenuFunctions = returnNodeMenuFunctions(
        foundNodeOfMenu,
        centeredCoordinatedWithTreeData,
        tree,
        editTreeFromNodeMenu,
        functions?.nodeMenu
    );

    const canvasGestures = Gesture.Simultaneous(canvasScrollAndZoom, canvasPressAndLongPress);

    const dragObject: DragObject = {
        state: dragState,
        dndZones: dragDndZones,
        sharedValues: dragDelta,
    };

    return (
        <>
            <View style={[centerFlex, { width: screenDimensions.width, flex: 1, position: "relative" }]}>
                <Animated.View style={[transform, { flex: 1 }]}>
                    <TreeCanvas
                        canvasHeight={canvasHeight}
                        canvasRef={canvasRef}
                        canvasWidth={canvasWidth}
                        dragObject={dragObject}
                        config={config}
                        renderStyle={renderStyle}
                        state={state}
                        canvasGestures={canvasGestures}
                        treeData={treeData}
                    />
                    {/* Long press Node related 👇 */}
                    <NodeLongPressIndicator data={longPressIndicatorPosition} scale={scale} />
                    {renderNodeMenu && <NodeMenu functions={nodeMenuFunctions} data={foundNodeOfMenu} scale={scale} closeNodeMenu={closeNodeMenu} />}
                    {/* Long press Node related 👆 */}
                </Animated.View>
            </View>

            {renderSelectedNodeMenu && renderOnSelectedNodeId}
        </>
    );
}

export default memo(InteractiveTree);

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
    const nodeCoordinatesCentered = centerNodesInCanvas(nodeCoordinates, canvasDimentions);
    //
    let minifiedDndZones: DnDZone[] = [];
    if (renderStyle === "hierarchy") {
        //The homepage does not allow adding or moving nodes
        const dndZones = calculateDragAndDropZones(nodeCoordinatesCentered);
        minifiedDndZones = minifyDragAndDropZones(dndZones, nodeCoordinatesCentered);
    }
    //
    const centeredCoordinatedWithTreeData = getCoordinatedWithTreeData(coordinatesWithTreeData, nodeCoordinatesCentered);

    return {
        nodeCoordinatesCentered,
        centeredCoordinatedWithTreeData,
        dndZoneCoordinates: minifiedDndZones,
        coordinatesWithTreeData,
        canvasDimentions,
    };
}
