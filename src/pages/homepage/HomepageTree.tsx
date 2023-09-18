import { removeUserTree } from "@/redux/slices/newUserTreesSlice";
import { updateNode } from "@/redux/slices/nodesSlice";
import { Canvas, SkiaDomView, useFont } from "@shopify/react-native-skia";
import { router } from "expo-router";
import { ReactNode, memo, useEffect, useMemo, useState } from "react";
import { Alert, View } from "react-native";
import { Gesture, GestureDetector, SimultaneousGesture } from "react-native-gesture-handler";
import Animated, { useSharedValue } from "react-native-reanimated";
import { RoutesParams } from "routes";
import RadialTreeLevelCircles from "../../components/treeRelated/RadialTreeLevelCircles";
import NodeLongPressIndicator from "../../components/treeRelated/general/NodeLongPressIndicator";
import { DEFAULT_SCALE } from "../../components/treeRelated/hooks/gestures/params";
import useCanvasLongPress from "../../components/treeRelated/hooks/gestures/useCanvasLongPress";
import useCanvasScroll from "../../components/treeRelated/hooks/gestures/useCanvasScroll";
import useCanvasTap, { CanvasTapProps } from "../../components/treeRelated/hooks/gestures/useCanvasTap";
import useCanvasZoom from "../../components/treeRelated/hooks/gestures/useCanvasZoom";
import NodeMenu from "../../components/treeRelated/nodeMenu/NodeMenu";
import returnNodeMenuFunctions from "../../components/treeRelated/returnNodeMenuFunctions";
import { findNodeByIdInHomeTree } from "../../functions/extractInformationFromTree";
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
    SelectedNodeId,
    Skill,
    Tree,
    TreeCoordinateData,
} from "../../types";
import RadialSkillTree from "./RadialSkillTree";

type Props = {
    selectedNodeCoordState: readonly [
        NodeCoordinate | null,
        {
            readonly clearSelectedNodeCoord: () => void;
            readonly updateSelectedNodeCoord: (value: NodeCoordinate) => void;
        }
    ];
    canvasRef: React.RefObject<SkiaDomView>;
    homepageTree: Tree<Skill>;
    openCanvasSettingsModal: () => void;
};

function useHomepageTreeState() {
    const screenDimensions = useAppSelector(selectSafeScreenDimentions);
    const canvasDisplaySettings = useAppSelector(selectCanvasDisplaySettings);

    return { screenDimensions, canvasDisplaySettings };
}

function useCreateTreeFunctions(updateSelectedNodeCoord: (value: NodeCoordinate) => void, openCanvasSettingsModal: () => void) {
    const dispatch = useAppDispatch();

    const result: InteractiveTreeFunctions = {
        onNodeClick: (coordOfClickedNode: NodeCoordinate) => {
            updateSelectedNodeCoord(coordOfClickedNode);
            return;
        },
        nodeMenu: {
            confirmDeleteTree: (treeId: string, nodesIdOfTree: string[]) => {
                Alert.alert(
                    "Delete this tree?",
                    "",
                    [
                        { text: "No", style: "cancel" },
                        { text: "Yes", onPress: () => dispatch(removeUserTree({ treeId, nodes: nodesIdOfTree })), style: "destructive" },
                    ],
                    { cancelable: true }
                );
            },
            selectNode: () => {},
            confirmDeleteNode: () => {},
            toggleCompletionOfSkill: (node: Tree<Skill>) => {
                const updatedNodeData = { ...node.data, isCompleted: !node.data.isCompleted };

                dispatch(updateNode({ id: node.nodeId, changes: { data: updatedNodeData } }));
            },
            openAddSkillModal: (addNewNodePosition: DnDZone["type"], node: Tree<Skill>) => {
                const params: RoutesParams["myTrees_treeId"] = { nodeId: node.nodeId, treeId: node.treeId, addNewNodePosition };
                router.push({ pathname: `/myTrees/${node.treeId}`, params });
            },
            openCanvasSettingsModal,
        },
    };

    return result;
}

function useGetTreeState(canvasRef: React.RefObject<SkiaDomView>, selectedNode: NodeCoordinate | null, homeTree: Tree<Skill>) {
    const screenDimensions = useAppSelector(selectSafeScreenDimentions);

    const {
        dndZoneCoordinates,
        canvasDimentions: canvasDimensions,
        nodeCoordinatesCentered,
    } = useMemo(() => handleTreeBuild(homeTree, screenDimensions, "radial"), [homeTree, screenDimensions]);

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

function useRunOnTreeUpdate(tree: Tree<Skill>, functions: InteractiveTreeFunctions | undefined, addNodePositions: DnDZone[]) {
    useEffect(() => {
        if (!functions || !functions.runOnTreeUpdate) return;

        functions.runOnTreeUpdate(addNodePositions);
        //eslint-disable-next-line
    }, [tree]);
}

function useSkiaFonts() {
    const labelFont = useFont(require("../../../assets/Helvetica.ttf"), 12);
    const nodeLetterFont = useFont(require("../../../assets/Helvetica.ttf"), NODE_ICON_FONT_SIZE);
    const emojiFont = useFont(require("../../../assets/NotoEmoji-Regular.ttf"), NODE_ICON_FONT_SIZE);

    if (!labelFont || !nodeLetterFont || !emojiFont) return undefined;

    return { labelFont, nodeLetterFont, emojiFont };
}

function HomepageTree({ canvasRef, homepageTree, openCanvasSettingsModal, selectedNodeCoordState }: Props) {
    const { screenDimensions, canvasDisplaySettings } = useHomepageTreeState();

    const [selectedNodeCoord, { clearSelectedNodeCoord, updateSelectedNodeCoord }] = selectedNodeCoordState;

    const selectedNode = findNodeByIdInHomeTree(homepageTree, selectedNodeCoord);

    const treeState = useGetTreeState(canvasRef, selectedNodeCoord, homepageTree);

    const treeFunctions = useCreateTreeFunctions(updateSelectedNodeCoord, openCanvasSettingsModal);

    const [draggingNode, draggingNodeActions] = useDraggingNodeState();
    const { endDragging } = draggingNodeActions;

    const selectedNodeCoordinates = treeState.treeCoordinate.nodeCoordinates.find((c) => c.nodeId === selectedNodeCoord?.nodeId);

    useRunOnTreeUpdate(homepageTree, treeFunctions, treeState.treeCoordinate.addNodePositions);

    const nodeActionState = useNodeActionState();
    const [nodeAction, { resetNodeAction }] = nodeActionState;

    const canvasLongPressProps = {
        config: { blockDragAndDrop: true, blockLongPress: selectedNodeCoord !== null },
        nodeCoordinates: treeState.treeCoordinate.nodeCoordinates,
        nodeActionState,
        draggingNodeActions,
    };

    const canvasTapProps: CanvasTapProps = {
        functions: { runOnTap: resetNodeAction, onNodeClick: treeFunctions.onNodeClick, clearSelectedNodeCoord },
        state: {
            dragAndDropZones: treeState.treeCoordinate.addNodePositions,
            nodeCoordinates: treeState.treeCoordinate.nodeCoordinates,
            selectedNodeId: selectedNodeCoord?.nodeId as SelectedNodeId,
            showNewNodePositions: false,
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

    const nodeMenuFunctions = returnNodeMenuFunctions(nodeActionState[0].node, homepageTree, false, treeFunctions.nodeMenu);

    const canvasGestures = Gesture.Simultaneous(canvasScrollAndZoom, canvasPressAndLongPress);

    const drag = { ...dragDelta, nodesToDragId: ["bm2W4LgdatpqWFgnmJwBRVY1"] };
    //Interactive Tree Props - SelectedNodeMenu

    const fonts = useSkiaFonts();

    return (
        <>
            <View style={[centerFlex, { width: screenDimensions.width, flex: 1, position: "relative" }]}>
                <Animated.View style={[scrollStyle, { flex: 1 }]}>
                    <CanvasView canvasDimensions={treeState.treeCoordinate.canvasDimensions} canvasGestures={canvasGestures} canvasRef={canvasRef}>
                        {canvasDisplaySettings.showCircleGuide && (
                            <RadialTreeLevelCircles nodeCoordinates={treeState.treeCoordinate.nodeCoordinates} />
                        )}
                        {fonts && (
                            <RadialSkillTree
                                nodeCoordinatesCentered={treeState.treeCoordinate.nodeCoordinates}
                                selectedNode={selectedNode?.nodeId ?? null}
                                fonts={fonts}
                                settings={{
                                    showLabel: canvasDisplaySettings.showLabel,
                                    oneColorPerTree: canvasDisplaySettings.oneColorPerTree,
                                    showIcons: canvasDisplaySettings.showIcons,
                                }}
                                drag={drag}
                            />
                        )}
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

export default memo(HomepageTree);
