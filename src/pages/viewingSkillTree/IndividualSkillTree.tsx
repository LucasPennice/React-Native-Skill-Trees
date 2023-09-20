import useReturnNodeMenuFunctions from "@/components/treeRelated/useReturnNodeMenuFunctions";
import { removeUserTree } from "@/redux/slices/newUserTreesSlice";
import { removeNodes } from "@/redux/slices/nodesSlice";
import { Canvas, SkiaDomView, useFont } from "@shopify/react-native-skia";
import { SelectedNewNodePositionState, SelectedNodeCoordState } from "app/(tabs)/myTrees/[treeId]";
import { router } from "expo-router";
import { ReactNode, memo, useMemo, useState } from "react";
import { Alert, View } from "react-native";
import { Gesture, GestureDetector, SimultaneousGesture } from "react-native-gesture-handler";
import Animated, { useSharedValue } from "react-native-reanimated";
import NodeLongPressIndicator from "../../components/treeRelated/general/NodeLongPressIndicator";
import DragAndDropZones from "../../components/treeRelated/hierarchical/DragAndDropZones";
import HierarchicalSkillTree from "../../components/treeRelated/hierarchical/HierarchicalSkillTree";
import { DEFAULT_SCALE } from "../../components/treeRelated/hooks/gestures/params";
import useCanvasLongPress from "../../components/treeRelated/hooks/gestures/useCanvasLongPress";
import useCanvasScroll from "../../components/treeRelated/hooks/gestures/useCanvasScroll";
import useCanvasTap, { CanvasTapProps } from "../../components/treeRelated/hooks/gestures/useCanvasTap";
import useCanvasZoom from "../../components/treeRelated/hooks/gestures/useCanvasZoom";
import NodeMenu from "../../components/treeRelated/nodeMenu/NodeMenu";
import { findNodeById } from "../../functions/extractInformationFromTree";
import { handleTreeBuild } from "../../functions/treeCalculateCoordinates";
import { NODE_ICON_FONT_SIZE, centerFlex } from "../../parameters";
import { useAppDispatch, useAppSelector } from "../../redux/reduxHooks";
import { selectCanvasDisplaySettings } from "../../redux/slices/canvasDisplaySettingsSlice";
import { selectSafeScreenDimentions } from "../../redux/slices/screenDimentionsSlice";
import {
    CanvasDimensions,
    DnDZone,
    InteractiveTreeFunctions,
    NodeAction,
    NodeCoordinate,
    NormalizedNode,
    Skill,
    Tree,
    TreeCoordinateData,
} from "../../types";

type Props = {
    state: {
        selectedNewNodePositionState: SelectedNewNodePositionState;
        selectedNodeCoordState: SelectedNodeCoordState;
        addNodePositions: DnDZone[];
        showNewNodePositions: boolean;
    };
    functions: {
        openChildrenHoistSelector: (nodeToDelete: NormalizedNode) => void;
        openCanvasSettingsModal: () => void;
        openNewNodeModal: () => void;
    };
    canvasRef: React.RefObject<SkiaDomView>;
    tree: Tree<Skill>;
};

function useHomepageTreeState() {
    const screenDimensions = useAppSelector(selectSafeScreenDimentions);
    const canvasDisplaySettings = useAppSelector(selectCanvasDisplaySettings);

    return { screenDimensions, canvasDisplaySettings };
}

function useCreateTreeFunctions(
    addNodePositions: DnDZone[],
    functions: {
        openChildrenHoistSelector: (nodeToDelete: NormalizedNode) => void;
        openCanvasSettingsModal: () => void;
        openNewNodeModal: () => void;
        updateSelectedNodeCoord: SelectedNodeCoordState["1"]["updateSelectedNodeCoord"];
        updateSelectedNewNodePosition: SelectedNewNodePositionState["1"]["updateSelectedNewNodePosition"];
    }
) {
    const dispatch = useAppDispatch();

    const result: InteractiveTreeFunctions = {
        onNodeClick: (coordOfClickedNode: NormalizedNode) => {
            functions.updateSelectedNodeCoord(coordOfClickedNode, "VIEWING");
            return;
        },

        onDndZoneClick: (clickedZone?: DnDZone) => {
            if (clickedZone === undefined) return;

            functions.updateSelectedNewNodePosition(clickedZone);
            functions.openNewNodeModal();

            return undefined;
        },
        nodeMenu: {
            confirmDeleteTree: (treeId: string, nodesIdOfTree: string[]) => {
                Alert.alert(
                    "Delete this tree?",
                    "",
                    [
                        { text: "No", style: "cancel" },
                        {
                            text: "Yes",
                            onPress: () => {
                                router.push("/myTrees");
                                dispatch(removeUserTree({ treeId, nodes: nodesIdOfTree }));
                            },
                            style: "destructive",
                        },
                    ],
                    { cancelable: true }
                );
            },
            selectNode: functions.updateSelectedNodeCoord,

            confirmDeleteNode: (nodeToDelete: NormalizedNode) => {
                if (nodeToDelete.childrenIds.length !== 0) return functions.openChildrenHoistSelector(nodeToDelete);

                dispatch(removeNodes({ nodesToDelete: [nodeToDelete.nodeId], treeId: nodeToDelete.treeId }));
            },

            openAddSkillModal: (zoneType: DnDZone["type"], node: NormalizedNode) => {
                const dndZone = addNodePositions.find((zone) => zone.ofNode === node.nodeId && zone.type === zoneType);

                if (!dndZone) throw new Error("couldn't find dndZone in runOnTreeRender");

                functions.updateSelectedNewNodePosition(dndZone);
                functions.openNewNodeModal();
            },

            openCanvasSettingsModal: functions.openCanvasSettingsModal,
        },
    };

    return result;
}

function useGetTreeState(canvasRef: React.RefObject<SkiaDomView>, selectedNode: NormalizedNode | null, selectedTree: Tree<Skill>) {
    const screenDimensions = useAppSelector(selectSafeScreenDimentions);

    const {
        dndZoneCoordinates,
        canvasDimentions: canvasDimensions,
        nodeCoordinatesCentered,
    } = useMemo(() => handleTreeBuild(selectedTree, screenDimensions, "hierarchy"), [selectedTree, screenDimensions]);

    const treeCoordinate: TreeCoordinateData = {
        canvasDimensions,
        addNodePositions: dndZoneCoordinates,
        nodeCoordinates: nodeCoordinatesCentered,
    };

    const selectedNodeId = selectedNode ? selectedNode.nodeId : null;

    return { screenDimensions, selectedNodeId, treeCoordinate, canvasRef, selectedDndZone: undefined };
}

function useDraggingNodeState() {
    const [draggingNode, setDraggingNode] = useState(false);
    const endDragging = () => setDraggingNode(false);
    const startDragging = () => setDraggingNode(false);

    return [draggingNode, { endDragging, startDragging }] as const;
}

function useNodeActionState() {
    const defaultNodeAction: NodeAction = { node: undefined, state: "Idle" };
    const [nodeAction, setNodeAction] = useState<NodeAction>(defaultNodeAction);

    const resetNodeAction = () =>
        setNodeAction((prev) => {
            if (prev.state === defaultNodeAction.state && prev.node === defaultNodeAction.node) return prev;

            return defaultNodeAction;
        });
    const beginLongPress = (node: NodeCoordinate) => setNodeAction({ node, state: "LongPressing" });
    const openMenuAfterLongPress = () =>
        setNodeAction((prev) => {
            if (prev.node === undefined) return defaultNodeAction;

            return { node: prev.node, state: "MenuOpen" };
        });

    return [nodeAction, { resetNodeAction, beginLongPress, openMenuAfterLongPress }] as const;
}

function useSkiaFonts() {
    const labelFont = useFont(require("../../../assets/Helvetica.ttf"), 12);
    const nodeLetterFont = useFont(require("../../../assets/Helvetica.ttf"), NODE_ICON_FONT_SIZE);
    const emojiFont = useFont(require("../../../assets/NotoEmoji-Regular.ttf"), NODE_ICON_FONT_SIZE);

    if (!labelFont || !nodeLetterFont || !emojiFont) return undefined;

    return { labelFont, nodeLetterFont, emojiFont };
}

function IndividualSkillTree({ canvasRef, tree, functions, state }: Props) {
    const { openCanvasSettingsModal, openChildrenHoistSelector, openNewNodeModal } = functions;
    const { screenDimensions, canvasDisplaySettings } = useHomepageTreeState();

    const { selectedNewNodePositionState, selectedNodeCoordState, showNewNodePositions, addNodePositions } = state;
    const [selectedNewNodePosition, { updateSelectedNewNodePosition }] = selectedNewNodePositionState;
    const [selectedNodeCoord, { clearSelectedNodeCoord, updateSelectedNodeCoord }] = selectedNodeCoordState;

    const selectedNode = findNodeById(tree, selectedNodeCoord?.node?.nodeId ?? null);

    const treeState = useGetTreeState(canvasRef, selectedNodeCoord?.node ?? null, tree);

    const treeFunctions = useCreateTreeFunctions(state.addNodePositions, {
        openCanvasSettingsModal,
        openChildrenHoistSelector,
        openNewNodeModal,
        updateSelectedNewNodePosition,
        updateSelectedNodeCoord,
    });

    const [draggingNode, draggingNodeActions] = useDraggingNodeState();
    const { endDragging } = draggingNodeActions;

    const selectedNodeCoordinates = treeState.treeCoordinate.nodeCoordinates.find((c) => c.nodeId === selectedNodeCoord?.node?.nodeId ?? null);

    const nodeActionState = useNodeActionState();
    const [nodeAction, { resetNodeAction }] = nodeActionState;

    const canvasLongPressProps = {
        config: { blockDragAndDrop: false, blockLongPress: selectedNodeCoord !== null },
        nodeCoordinates: treeState.treeCoordinate.nodeCoordinates,
        nodeActionState,
        draggingNodeActions,
    };

    const canvasTapProps: CanvasTapProps = {
        functions: {
            runOnTap: resetNodeAction,
            onNodeClick: treeFunctions.onNodeClick,
            clearSelectedNodeCoord,
            onDndZoneClick: treeFunctions.onDndZoneClick,
        },
        state: {
            dragAndDropZones: treeState.treeCoordinate.addNodePositions,
            nodeCoordinates: treeState.treeCoordinate.nodeCoordinates,
            selectedNodeId: selectedNodeCoord?.node?.nodeId ?? null,
            showNewNodePositions,
        },
    };

    const { canvasLongPress, runOnScroll } = useCanvasLongPress(canvasLongPressProps);

    const canvasTap = useCanvasTap(canvasTapProps);

    const canvasPressAndLongPress = Gesture.Exclusive(canvasLongPress, canvasTap);

    const offsetX = useSharedValue(0);
    const offsetY = useSharedValue(0);
    const scale = useSharedValue(DEFAULT_SCALE);

    const { canvasPan, dragDelta, scrollStyle } = useCanvasScroll(
        treeState.treeCoordinate,
        screenDimensions,
        selectedNodeCoordinates,
        runOnScroll,
        { state: draggingNode, endDragging },
        { offsetX, offsetY, scale }
    );

    const { canvasZoom, scaleState } = useCanvasZoom(treeState.treeCoordinate.canvasDimensions, screenDimensions, selectedNodeCoordinates, {
        offsetX,
        offsetY,
        scale,
    });

    const canvasScrollAndZoom = Gesture.Simultaneous(canvasPan, canvasZoom);

    const editTreeFromNodeMenu = true;
    const nodeMenuFunctions = useReturnNodeMenuFunctions(nodeActionState[0].node, tree.treeId, editTreeFromNodeMenu, treeFunctions.nodeMenu);

    const canvasGestures = Gesture.Simultaneous(canvasScrollAndZoom, canvasPressAndLongPress);

    const drag = { ...dragDelta, nodesToDragId: ["bm2W4LgdatpqWFgnmJwBRVY1"] };
    //Interactive Tree Props - SelectedNodeMenu

    const fonts = useSkiaFonts();

    return (
        <>
            <View style={[centerFlex, { width: screenDimensions.width, flex: 1, position: "relative" }]}>
                <Animated.View style={[scrollStyle, { flex: 1 }]}>
                    <CanvasView canvasDimensions={treeState.treeCoordinate.canvasDimensions} canvasGestures={canvasGestures} canvasRef={canvasRef}>
                        {fonts && (
                            <HierarchicalSkillTree
                                nodeCoordinatesCentered={treeState.treeCoordinate.nodeCoordinates}
                                selectedNode={selectedNode?.nodeId ?? null}
                                fonts={fonts}
                                settings={{
                                    showLabel: canvasDisplaySettings.showLabel,
                                    showIcons: canvasDisplaySettings.showIcons,
                                }}
                                drag={drag}
                            />
                        )}
                        {showNewNodePositions && <DragAndDropZones data={addNodePositions} selectedDndZone={selectedNewNodePosition} />}
                    </CanvasView>
                    {/* Node Action Related 👇 */}
                    {nodeAction.node && nodeAction.state === "LongPressing" && <NodeLongPressIndicator data={nodeAction.node} scale={scaleState} />}
                    {nodeAction.node && nodeAction.state === "MenuOpen" && (
                        <NodeMenu functions={nodeMenuFunctions} data={nodeAction.node} scale={scaleState} closeNodeMenu={resetNodeAction} />
                    )}
                    {/* Node Action Related 👆 */}
                </Animated.View>
            </View>
        </>
    );
}

function CanvasView({
    children,
    canvasGestures,
    canvasRef,
    canvasDimensions,
}: {
    canvasDimensions: CanvasDimensions;
    children: ReactNode;
    canvasGestures: SimultaneousGesture;
    canvasRef: React.RefObject<SkiaDomView>;
}) {
    const { canvasHeight, canvasWidth } = canvasDimensions;
    return (
        <GestureDetector gesture={canvasGestures}>
            <Canvas style={{ width: canvasWidth, height: canvasHeight }} ref={canvasRef}>
                {children}
            </Canvas>
        </GestureDetector>
    );
}

export default memo(IndividualSkillTree);
