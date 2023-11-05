import SelectedNodeView from "@/components/treeRelated/general/SelectedNodeView";
import useReturnNodeMenuFunctions from "@/components/treeRelated/useReturnNodeMenuFunctions";
import { selectHomeTree } from "@/redux/slices/homeTreeSlice";
import { selectNodeById, selectNodesTable } from "@/redux/slices/nodesSlice";
import { TreeData, removeUserTree, selectAllTreesEntities } from "@/redux/slices/userTreesSlice";
import { Dictionary } from "@reduxjs/toolkit";
import { Canvas, SkiaDomView } from "@shopify/react-native-skia";
import { SkiaFontContext } from "app/_layout";
import { router } from "expo-router";
import { ReactNode, memo, useContext, useEffect, useMemo, useState } from "react";
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
import { handleTreeBuild } from "../../functions/treeCalculateCoordinates";
import { HOMETREE_ROOT_ID, centerFlex } from "../../parameters";
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
    SelectedNodeId,
    TreeCoordinateData,
} from "../../types";
import RadialStaticSkillTree from "./HomepageSkillTree";

type Props = {
    selectedNodeCoordState: readonly [
        NormalizedNode | null,
        {
            readonly clearSelectedNodeCoord: () => void;
            readonly updateSelectedNodeCoord: (value: NormalizedNode) => void;
        }
    ];
    canvasRef: React.RefObject<SkiaDomView>;
    openCanvasSettingsModal: () => void;
};

function useHomepageTreeState(selectedNodeId?: string) {
    const screenDimensions = useAppSelector(selectSafeScreenDimentions);
    const canvasDisplaySettings = useAppSelector(selectCanvasDisplaySettings);
    const selectedNode = useAppSelector(selectNodeById(selectedNodeId));
    const homeTreeData = useAppSelector(selectHomeTree);

    return { screenDimensions, canvasDisplaySettings, selectedNode, homeTreeData };
}

function useCreateTreeFunctions(updateSelectedNodeCoord: (value: NormalizedNode) => void, openCanvasSettingsModal: () => void) {
    const dispatch = useAppDispatch();

    const result: InteractiveTreeFunctions = {
        onNodeClick: (coordOfClickedNode: NormalizedNode) => {
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
            openAddSkillModal: (addNewNodePosition: DnDZone["type"], node: NormalizedNode) => {
                const params: RoutesParams["myTrees_treeId"] = { nodeId: node.nodeId, treeId: node.treeId, addNewNodePosition };
                //@ts-ignore
                router.push({ pathname: `/myTrees/${node.treeId}`, params });
            },
            openCanvasSettingsModal,
        },
    };

    return result;
}

function useGetTreeState(canvasRef: React.RefObject<SkiaDomView>, selectedNode: NormalizedNode | null) {
    const screenDimensions = useAppSelector(selectSafeScreenDimentions);

    const allNodes = useAppSelector(selectNodesTable);

    const homeTreeData = useAppSelector(selectHomeTree);
    const subTreesData = useAppSelector(selectAllTreesEntities);

    const {
        dndZoneCoordinates,
        canvasDimentions: canvasDimensions,
        nodeCoordinatesCentered,
    } = useMemo(() => {
        const { filteredNodes, filteredTrees } = getNodesOfTreesToDisplay(allNodes, subTreesData);

        const homeTreeNodes = prepareNodesForHomeTreeBuild(filteredNodes, homeTreeData.rootNodeId);

        const result = handleTreeBuild({
            nodes: homeTreeNodes,
            treeData: homeTreeData,
            screenDimensions,
            renderStyle: "radial",
            subTreesData: filteredTrees,
        });
        return result;
    }, [allNodes, homeTreeData, screenDimensions, subTreesData]);

    const treeCoordinate: TreeCoordinateData = {
        canvasDimensions,
        addNodePositions: dndZoneCoordinates,
        nodeCoordinates: nodeCoordinatesCentered,
    };

    const selectedNodeId = selectedNode ? selectedNode.nodeId : null;

    return { screenDimensions, selectedNodeId, treeCoordinate, canvasRef, selectedDndZone: undefined };
}

export function prepareNodesForHomeTreeBuild(nodes: Dictionary<NormalizedNode>, rootId: string) {
    let result = getNodesWithUpdatedLevel(nodes);

    updateSubTreeRoot(result);

    return result;

    function updateSubTreeRoot(result: Dictionary<NormalizedNode>) {
        const rootNode = nodes[rootId];
        if (!rootNode) throw new Error("rootNode undefined at updateSubTreeRoot");

        for (const subTreeId of rootNode.childrenIds) {
            const subTreeRoot = result[subTreeId];

            if (!subTreeRoot) throw new Error("subTreeRoot undefined at updateSubTreeRoot");

            const updatedSubTreeRoot: NormalizedNode = { ...subTreeRoot, isRoot: false, parentId: rootId };

            result[subTreeId] = updatedSubTreeRoot;
        }
    }

    function getNodesWithUpdatedLevel(nodes: Dictionary<NormalizedNode>) {
        const result: Dictionary<NormalizedNode> = {};

        const nodeIds = Object.keys(nodes);

        for (const nodeId of nodeIds) {
            const node = nodes[nodeId];

            if (!node) throw new Error("node undefined at getNodesWithUpdatedLevel");

            if (node.nodeId === rootId) {
                result[rootId] = { ...node };
                continue;
            }

            const nodeWithUpdatedLevel = {
                level: node.level + 1,
                category: node.category,
                childrenIds: node.childrenIds,
                data: node.data,
                isRoot: node.isRoot,
                nodeId: node.nodeId,
                parentId: node.parentId,
                treeId: node.treeId,
                x: node.x,
                y: node.y,
            };

            result[nodeId] = nodeWithUpdatedLevel;
        }

        return result;
    }
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

function useRunOnTreeUpdate(treeCoordinate: TreeCoordinateData, functions: InteractiveTreeFunctions | undefined, addNodePositions: DnDZone[]) {
    useEffect(() => {
        if (!functions || !functions.runOnTreeUpdate) return;

        functions.runOnTreeUpdate(addNodePositions);
        //eslint-disable-next-line
    }, [treeCoordinate]);
}

function HomepageTree({ canvasRef, openCanvasSettingsModal, selectedNodeCoordState }: Props) {
    const [selectedNodeCoord, { clearSelectedNodeCoord, updateSelectedNodeCoord }] = selectedNodeCoordState;
    const { screenDimensions, canvasDisplaySettings, selectedNode, homeTreeData } = useHomepageTreeState(selectedNodeCoord?.nodeId ?? undefined);

    const treeState = useGetTreeState(canvasRef, selectedNodeCoord);

    const treeFunctions = useCreateTreeFunctions(updateSelectedNodeCoord, openCanvasSettingsModal);

    const [draggingNode, draggingNodeActions] = useDraggingNodeState();
    const { endDragging } = draggingNodeActions;

    const selectedNodeCoordinates = treeState.treeCoordinate.nodeCoordinates.find((c) => c.nodeId === selectedNodeCoord?.nodeId);

    useRunOnTreeUpdate(treeState.treeCoordinate, treeFunctions, treeState.treeCoordinate.addNodePositions);

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

    const nodeMenuFunctions = useReturnNodeMenuFunctions(nodeActionState[0].node, nodeActionState[0].node?.treeId, false, treeFunctions.nodeMenu);

    const canvasGestures = Gesture.Simultaneous(canvasScrollAndZoom, canvasPressAndLongPress);

    const drag = { ...dragDelta, nodesToDragId: ["bm2W4LgdatpqWFgnmJwBRVY1"] };
    //Interactive Tree Props - SelectedNodeMenu

    const fonts = useContext(SkiaFontContext);

    return (
        <View style={[centerFlex, { width: screenDimensions.width, flex: 1, position: "relative" }]}>
            <Animated.View style={[scrollStyle, { flex: 1 }]}>
                <CanvasView canvasDimensions={treeState.treeCoordinate.canvasDimensions} canvasGestures={canvasGestures} canvasRef={canvasRef}>
                    {canvasDisplaySettings.showCircleGuide && <RadialTreeLevelCircles nodeCoordinates={treeState.treeCoordinate.nodeCoordinates} />}
                    {fonts && (
                        <RadialStaticSkillTree
                            canvasDimensions={treeState.treeCoordinate.canvasDimensions}
                            allNodes={treeState.treeCoordinate.nodeCoordinates}
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

                {selectedNodeCoordinates && (
                    <SelectedNodeView
                        rootColor={homeTreeData.accentColor}
                        settings={{ showIcons: canvasDisplaySettings.showIcons, oneColorPerTree: canvasDisplaySettings.oneColorPerTree }}
                        selectedNodeCoordinates={selectedNodeCoordinates}
                        scale={scaleState}
                        allNodes={treeState.treeCoordinate.nodeCoordinates}
                    />
                )}
                {/* Node Action Related 👆 */}
            </Animated.View>
        </View>
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

export function getNodesOfTreesToDisplay(allNodes: Dictionary<NormalizedNode>, subTreesData: Dictionary<TreeData>) {
    const filteredNodes: Dictionary<NormalizedNode> = {};
    const filteredTrees: Dictionary<TreeData> = {};
    const filteredTreeRootIds: string[] = [];

    const treeIds = Object.keys(subTreesData);

    for (let i = 0; i < treeIds.length; i++) {
        const treeId = treeIds[i];

        if (subTreesData[treeId]!.showOnHomeScreen) {
            filteredTrees[treeId] = subTreesData[treeId]!;
            filteredTreeRootIds.push(subTreesData[treeId]!.rootNodeId);
        }
    }

    const nodeIds = Object.keys(allNodes);

    for (let i = 0; i < nodeIds.length; i++) {
        const nodeId = nodeIds[i];

        const node = allNodes[nodeId]!;

        if (nodeId === HOMETREE_ROOT_ID) {
            filteredNodes[node.nodeId] = { ...node, childrenIds: node.childrenIds.filter((nodeId) => filteredTreeRootIds.includes(nodeId)) };
            continue;
        }

        if (subTreesData[node.treeId]!.showOnHomeScreen) filteredNodes[node.nodeId] = node;
    }

    return { filteredNodes, filteredTrees };
}
