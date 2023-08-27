import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Canvas, SkiaDomView, useFont } from "@shopify/react-native-skia";
import { ReactNode, memo, useMemo, useState } from "react";
import { Alert, View } from "react-native";
import { Gesture, GestureDetector, SimultaneousGesture } from "react-native-gesture-handler";
import Animated, { useSharedValue } from "react-native-reanimated";
import { StackNavigatorParams } from "../../../App";
import NodeLongPressIndicator from "../../components/treeRelated/general/NodeLongPressIndicator";
import DragAndDropZones from "../../components/treeRelated/hierarchical/DragAndDropZones";
import HierarchicalSkillTree from "../../components/treeRelated/hierarchical/HierarchicalSkillTree";
import { DEFAULT_SCALE } from "../../components/treeRelated/hooks/gestures/params";
import useCanvasLongPress from "../../components/treeRelated/hooks/gestures/useCanvasLongPress";
import useCanvasScroll from "../../components/treeRelated/hooks/gestures/useCanvasScroll";
import useCanvasTap, { CanvasTapProps } from "../../components/treeRelated/hooks/gestures/useCanvasTap";
import useCanvasZoom from "../../components/treeRelated/hooks/gestures/useCanvasZoom";
import NodeMenu, { NodeMenuFunctions } from "../../components/treeRelated/nodeMenu/NodeMenu";
import returnNodeMenuFunctions from "../../components/treeRelated/returnNodeMenuFunctions";
import { handleTreeBuild } from "../../functions/coordinateSystem";
import { findNodeById } from "../../functions/extractInformationFromTree";
import { deleteNodeWithNoChildren, updateNodeAndTreeCompletion } from "../../functions/mutateTree";
import { NODE_ICON_FONT_SIZE, centerFlex } from "../../parameters";
import { useAppDispatch, useAppSelector } from "../../redux/reduxHooks";
import { selectCanvasDisplaySettings } from "../../redux/slices/canvasDisplaySettingsSlice";
import { selectSafeScreenDimentions } from "../../redux/slices/screenDimentionsSlice";
import { TreeCoordinateData } from "../../redux/slices/treesCoordinatesSlice";
import { removeUserTree, updateUserTrees } from "../../redux/slices/userTreesSlice";
import { CanvasDimensions, DnDZone, InteractiveTreeFunctions, NodeCoordinate, Skill, Tree } from "../../types";
import { SelectedNewNodePositionState, SelectedNodeCoordState } from "./IndividualSkillTreePage";

type Props = {
    state: {
        selectedNewNodePositionState: SelectedNewNodePositionState;
        selectedNodeCoordState: SelectedNodeCoordState;
        addNodePositions: DnDZone[];
        showNewNodePositions: boolean;
    };
    functions: {
        openChildrenHoistSelector: (nodeToDelete: Tree<Skill>) => void;
        openCanvasSettingsModal: () => void;
        openNewNodeModal: () => void;
    };
    canvasRef: React.RefObject<SkiaDomView>;
    tree: Tree<Skill>;
    navigation: NativeStackNavigationProp<StackNavigatorParams, "ViewingSkillTree", undefined>;
};

function useHomepageTreeState() {
    const screenDimensions = useAppSelector(selectSafeScreenDimentions);
    const canvasDisplaySettings = useAppSelector(selectCanvasDisplaySettings);

    return { screenDimensions, canvasDisplaySettings };
}

function useCreateTreeFunctions(
    navigation: NativeStackNavigationProp<StackNavigatorParams, "ViewingSkillTree", undefined>,
    addNodePositions: DnDZone[],
    functions: {
        openChildrenHoistSelector: (nodeToDelete: Tree<Skill>) => void;
        openCanvasSettingsModal: () => void;
        openNewNodeModal: () => void;
        updateSelectedNodeCoord: SelectedNodeCoordState["1"]["updateSelectedNodeCoord"];
        updateSelectedNewNodePosition: SelectedNewNodePositionState["1"]["updateSelectedNewNodePosition"];
    }
) {
    const dispatch = useAppDispatch();
    const screenDimensions = useAppSelector(selectSafeScreenDimentions);

    const result: InteractiveTreeFunctions = {
        onNodeClick: (coordOfClickedNode: NodeCoordinate) => {
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
            navigate: navigation.navigate,

            confirmDeleteTree: (treeId: string) => {
                Alert.alert(
                    "Delete this tree?",
                    "",
                    [
                        { text: "No", style: "cancel" },
                        {
                            text: "Yes",
                            onPress: () => {
                                navigation.navigate("MyTrees", {});
                                dispatch(removeUserTree(treeId));
                            },
                            style: "destructive",
                        },
                    ],
                    { cancelable: true }
                );
            },
            selectNode: functions.updateSelectedNodeCoord,

            confirmDeleteNode: (tree: Tree<Skill>, node: Tree<Skill>) => {
                if (node.children.length !== 0) return functions.openChildrenHoistSelector(node);

                const updatedTree = deleteNodeWithNoChildren(tree, node);

                dispatch(updateUserTrees({ updatedTree, screenDimensions }));
            },

            toggleCompletionOfSkill: (treeToUpdate: Tree<Skill>, node: Tree<Skill>) => {
                let updatedNode: Tree<Skill> = { ...node, data: { ...node.data, isCompleted: !node.data.isCompleted } };

                const updatedTree = updateNodeAndTreeCompletion(treeToUpdate, updatedNode);

                dispatch(updateUserTrees({ updatedTree, screenDimensions }));
            },
            openAddSkillModal: (zoneType: DnDZone["type"], node: Tree<Skill>) => {
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

function useGetTreeState(canvasRef: React.RefObject<SkiaDomView>, selectedNode: NodeCoordinate | null, selectedTree: Tree<Skill>) {
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

function useNodeMenuState() {
    const [openMenuOnNode, setOpenMenuOnNode] = useState<NodeCoordinate | undefined>(undefined);

    const closeNodeMenu = () => setOpenMenuOnNode(undefined);

    const openMenuOfNode = (clickedNode: NodeCoordinate) => setOpenMenuOnNode(clickedNode);

    return [openMenuOnNode, { closeNodeMenu, openMenuOfNode }] as const;
}

function useGetNodeMenuFns(
    node: NodeCoordinate | undefined,
    tree: Tree<Skill>,
    menuFunctions: InteractiveTreeFunctions["nodeMenu"]
): NodeMenuFunctions {
    const editTreeFromNodeMenu = true;
    return returnNodeMenuFunctions(node, tree, editTreeFromNodeMenu, menuFunctions);
}

function useSkiaFonts() {
    const labelFont = useFont(require("../../../assets/Helvetica.ttf"), 12);
    const nodeLetterFont = useFont(require("../../../assets/Helvetica.ttf"), NODE_ICON_FONT_SIZE);
    const emojiFont = useFont(require("../../../assets/NotoEmoji-Regular.ttf"), NODE_ICON_FONT_SIZE);

    if (!labelFont || !nodeLetterFont || !emojiFont) return undefined;

    return { labelFont, nodeLetterFont, emojiFont };
}

function IndividualSkillTree({ canvasRef, tree, navigation, functions, state }: Props) {
    const { openCanvasSettingsModal, openChildrenHoistSelector, openNewNodeModal } = functions;
    const { screenDimensions, canvasDisplaySettings } = useHomepageTreeState();

    const { selectedNewNodePositionState, selectedNodeCoordState, showNewNodePositions, addNodePositions } = state;
    const [selectedNewNodePosition, { updateSelectedNewNodePosition }] = selectedNewNodePositionState;
    const [selectedNodeCoord, { clearSelectedNodeCoord, updateSelectedNodeCoord }] = selectedNodeCoordState;

    const selectedNode = findNodeById(tree, selectedNodeCoord?.node?.nodeId ?? null);

    const treeState = useGetTreeState(canvasRef, selectedNodeCoord?.node ?? null, tree);

    const treeFunctions = useCreateTreeFunctions(navigation, state.addNodePositions, {
        openCanvasSettingsModal,
        openChildrenHoistSelector,
        openNewNodeModal,
        updateSelectedNewNodePosition,
        updateSelectedNodeCoord,
    });

    const [draggingNode, draggingNodeActions] = useDraggingNodeState();
    const { endDragging } = draggingNodeActions;

    const selectedNodeCoordinates = treeState.treeCoordinate.nodeCoordinates.find((c) => c.nodeId === selectedNodeCoord?.node?.nodeId ?? null);

    //Gesture Props 👇
    const nodeMenuState = useNodeMenuState();
    const [openMenuOnNode, { closeNodeMenu }] = nodeMenuState;

    const longPressState = useState<{ data: NodeCoordinate | undefined; state: "INTERRUPTED" | "PRESSING" | "IDLE" }>({
        data: undefined,
        state: "IDLE",
    });
    const [longPressIndicatorPosition] = longPressState;

    const canvasLongPressProps = {
        config: { blockDragAndDrop: false, blockLongPress: false },
        nodeCoordinates: treeState.treeCoordinate.nodeCoordinates,
        longPressState,
        nodeMenuState,
        draggingNodeActions,
    };

    const canvasTapProps: CanvasTapProps = {
        functions: {
            runOnTap: closeNodeMenu,
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

    const foundNodeOfMenu = openMenuOnNode ? treeState.treeCoordinate.nodeCoordinates.find((c) => c.nodeId === openMenuOnNode.nodeId) : undefined;
    const foundNodeOfMenuWithoutData = openMenuOnNode
        ? treeState.treeCoordinate.nodeCoordinates.find((c) => c.nodeId === openMenuOnNode.nodeId)
        : undefined;

    const offsetX = useSharedValue(0);
    const offsetY = useSharedValue(0);
    const scale = useSharedValue(DEFAULT_SCALE);

    const { canvasPan, dragDelta, scrollStyle } = useCanvasScroll(
        treeState.treeCoordinate.canvasDimensions,
        screenDimensions,
        selectedNodeCoordinates,
        foundNodeOfMenuWithoutData,
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

    const renderNodeMenu = foundNodeOfMenu && openMenuOnNode;

    const nodeMenuFunctions = useGetNodeMenuFns(foundNodeOfMenu, tree, treeFunctions.nodeMenu);

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
                    {/* Long press Node related 👇 */}
                    <NodeLongPressIndicator data={longPressIndicatorPosition} scale={scaleState} />
                    {renderNodeMenu && (
                        <NodeMenu functions={nodeMenuFunctions} data={foundNodeOfMenu} scale={scaleState} closeNodeMenu={closeNodeMenu} />
                    )}
                    {/* Long press Node related 👆 */}
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
