import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SkiaDomView } from "@shopify/react-native-skia";
import { MutableRefObject, memo, useEffect, useState } from "react";
import { View } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import Animated, { useSharedValue } from "react-native-reanimated";
import { StackNavigatorParams } from "../../../App";
import { findNodeById } from "../../functions/extractInformationFromTree";
import { centerFlex } from "../../parameters";
import { CanvasDisplaySettings } from "../../redux/slices/canvasDisplaySettingsSlice";
import { ScreenDimentions } from "../../redux/slices/screenDimentionsSlice";
import { TreeCoordinateData } from "../../redux/slices/treesCoordinatesSlice";
import { CoordinatesWithTreeData, DnDZone, NodeCoordinate, SelectedDnDZone, SelectedNodeId, Skill, Tree } from "../../types";
import TreeCanvas from "./TreeCanvas";
import { removeTreeDataFromCoordinate } from "./coordinateFunctions";
import NodeLongPressIndicator from "./general/NodeLongPressIndicator";
import { DEFAULT_SCALE } from "./hooks/gestures/params";
import useCanvasLongPress from "./hooks/gestures/useCanvasLongPress";
import useCanvasScroll from "./hooks/gestures/useCanvasScroll";
import useCanvasTap from "./hooks/gestures/useCanvasTap";
import useCanvasZoom from "./hooks/gestures/useCanvasZoom";
import NodeMenu from "./nodeMenu/NodeMenu";
import returnNodeMenuFunctions from "./returnNodeMenuFunctions";

type NavigateFunction =
    | NativeStackNavigationProp<StackNavigatorParams, "Home", undefined>["navigate"]
    | NativeStackNavigationProp<StackNavigatorParams, "ViewingSkillTree", undefined>["navigate"];

export type InteractiveTreeConfig = {
    renderStyle: "hierarchy" | "radial";
    canvasDisplaySettings: CanvasDisplaySettings;
    showDndZones?: boolean;
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
    treeCoordinate: TreeCoordinateData;
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

function useDraggingNodeState() {
    const [draggingNode, setDraggingNode] = useState(false);
    const endDragging = () => setDraggingNode(false);
    const startDragging = () => setDraggingNode(false);

    return [draggingNode, { endDragging, startDragging }] as const;
}

function useRunOnTreeUpdate(tree: Tree<Skill>, functions: InteractiveTreeFunctions | undefined, addNodePositions: DnDZone[]) {
    useEffect(() => {
        if (!functions || !functions.runOnTreeUpdate) return;

        functions.runOnTreeUpdate(addNodePositions);
        //eslint-disable-next-line
    }, [tree]);
}

function useNodeMenuState() {
    const [openMenuOnNode, setOpenMenuOnNode] = useState<NodeCoordinate | undefined>(undefined);

    const closeNodeMenu = () => setOpenMenuOnNode(undefined);

    const openMenuOfNode = (clickedNode: NodeCoordinate) => setOpenMenuOnNode(clickedNode);

    return [openMenuOnNode, { closeNodeMenu, openMenuOfNode }] as const;
}

function InteractiveTree2({ tree, config, functions, state, renderOnSelectedNodeId }: InteractiveTreeProps) {
    //Props
    const { screenDimensions, selectedNodeId, canvasRef, treeCoordinate } = state;
    const { isInteractive, renderStyle, showDndZones, blockLongPress, blockDragAndDrop, editTreeFromNodeMenu } = config;

    //Local State
    const [draggingNode, draggingNodeActions] = useDraggingNodeState();
    const { endDragging } = draggingNodeActions;
    //Derived State
    const { addNodePositions, canvasDimensions, nodeCoordinates } = treeCoordinate;
    const nodeCoordinatesDummy = removeTreeDataFromCoordinate(nodeCoordinates);

    const { canvasHeight, canvasWidth } = canvasDimensions;

    const selectedNodeCoordinates = nodeCoordinatesDummy.find((c) => c.id === selectedNodeId);

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

    useRunOnTreeUpdate(tree, functions, addNodePositions);

    //Gesture Props 👇
    const nodeMenuState = useNodeMenuState();
    const [openMenuOnNode, { closeNodeMenu }] = nodeMenuState;

    //eslint-disable-next-line
    const longPressState = useState<{ data: NodeCoordinate | undefined; state: "INTERRUPTED" | "PRESSING" | "IDLE" }>({
        data: undefined,
        state: "IDLE",
    });
    const [longPressIndicatorPosition] = longPressState;

    const canvasLongPressProps = {
        config: { blockDragAndDrop, blockLongPress },
        nodeCoordinatesCentered: nodeCoordinatesDummy,
        longPressState,
        nodeMenuState,
        draggingNodeActions,
    };

    const canvasTapProps = {
        functions: { runOnTap: closeNodeMenu, onDndZoneClick: onDndZoneClickAdapter, onNodeClick: onNodeClickAdapter },
        state: { dragAndDropZones: addNodePositions, nodeCoordinates: nodeCoordinatesDummy, selectedNodeId, showDndZones },
    };

    //Gesture Props

    const { canvasLongPress, runOnScroll } = useCanvasLongPress(canvasLongPressProps);
    const canvasTap = useCanvasTap(canvasTapProps);

    const canvasPressAndLongPress = Gesture.Exclusive(canvasLongPress, canvasTap);

    const foundNodeOfMenu = openMenuOnNode ? nodeCoordinates.find((c) => c.nodeId === openMenuOnNode.id) : undefined;
    const foundNodeOfMenuWithoutData = openMenuOnNode ? nodeCoordinatesDummy.find((c) => c.id === openMenuOnNode.id) : undefined;

    const offsetX = useSharedValue(0);
    const offsetY = useSharedValue(0);
    const scale = useSharedValue(DEFAULT_SCALE);

    const { canvasPan, dragDelta, scrollStyle } = useCanvasScroll(
        canvasDimensions,
        screenDimensions,
        selectedNodeCoordinates,
        foundNodeOfMenuWithoutData,
        runOnScroll,
        { state: draggingNode, endDragging },
        { offsetX, offsetY, scale }
    );

    const { canvasZoom, scaleState } = useCanvasZoom(canvasDimensions, screenDimensions, selectedNodeCoordinates, { offsetX, offsetY, scale });

    const canvasScrollAndZoom = Gesture.Simultaneous(canvasPan, canvasZoom);

    const treeData = { nodeCoordinates, dndZoneCoordinates: addNodePositions };

    const renderSelectedNodeMenu = selectedNodeCoordinates && selectedNodeId && isInteractive;
    const renderNodeMenu = foundNodeOfMenu && openMenuOnNode && isInteractive;

    const nodeMenuFunctions = returnNodeMenuFunctions(foundNodeOfMenu, nodeCoordinates, tree, editTreeFromNodeMenu, functions?.nodeMenu);

    const canvasGestures = Gesture.Simultaneous(canvasScrollAndZoom, canvasPressAndLongPress);

    const drag = { ...dragDelta, nodesToDragId: ["bm2W4LgdatpqWFgnmJwBRVY1"] };

    return (
        <>
            <View style={[centerFlex, { width: screenDimensions.width, flex: 1, position: "relative" }]}>
                <Animated.View style={[scrollStyle, { flex: 1 }]}>
                    <TreeCanvas
                        canvasHeight={canvasHeight}
                        canvasRef={canvasRef}
                        canvasWidth={canvasWidth}
                        drag={drag}
                        config={config}
                        renderStyle={renderStyle}
                        state={state}
                        canvasGestures={canvasGestures}
                        treeData={treeData}
                    />
                    {/* Long press Node related 👇 */}
                    <NodeLongPressIndicator data={longPressIndicatorPosition} scale={scaleState} />
                    {renderNodeMenu && (
                        <NodeMenu functions={nodeMenuFunctions} data={foundNodeOfMenu} scale={scaleState} closeNodeMenu={closeNodeMenu} />
                    )}
                    {/* Long press Node related 👆 */}
                </Animated.View>
            </View>

            {renderSelectedNodeMenu && renderOnSelectedNodeId}
        </>
    );
}

export default memo(InteractiveTree2);
