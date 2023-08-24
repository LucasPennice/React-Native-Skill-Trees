import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Canvas, SkiaDomView, useFont } from "@shopify/react-native-skia";
import { ReactNode, memo, useEffect, useMemo, useState } from "react";
import { Alert, View } from "react-native";
import { Gesture, GestureDetector, SimultaneousGesture } from "react-native-gesture-handler";
import Animated, { SharedValue, useSharedValue } from "react-native-reanimated";
import { StackNavigatorParams } from "../../../App";
import { InteractiveTreeConfig, InteractiveTreeFunctions } from "../../components/treeRelated/InteractiveTree";
import RadialTreeLevelCircles from "../../components/treeRelated/RadialTreeLevelCircles";
import NodeLongPressIndicator from "../../components/treeRelated/general/NodeLongPressIndicator";
import { DEFAULT_SCALE } from "../../components/treeRelated/hooks/gestures/params";
import useCanvasLongPress from "../../components/treeRelated/hooks/gestures/useCanvasLongPress";
import useCanvasScroll from "../../components/treeRelated/hooks/gestures/useCanvasScroll";
import useCanvasTap, { CanvasTapProps } from "../../components/treeRelated/hooks/gestures/useCanvasTap";
import useCanvasZoom from "../../components/treeRelated/hooks/gestures/useCanvasZoom";
import NodeMenu from "../../components/treeRelated/nodeMenu/NodeMenu";
import returnNodeMenuFunctions from "../../components/treeRelated/returnNodeMenuFunctions";
import SelectedNodeMenu, { SelectedNodeMenuState } from "../../components/treeRelated/selectedNodeMenu/SelectedNodeMenu";
import { getMenuNonEditingFunctions } from "../../components/treeRelated/selectedNodeMenu/useGetMenuFunctions";
import { handleTreeBuild } from "../../functions/coordinateSystem";
import { findNodeByIdInHomeTree } from "../../functions/extractInformationFromTree";
import { updateNodeAndTreeCompletion } from "../../functions/mutateTree";
import { NODE_ICON_FONT_SIZE, centerFlex } from "../../parameters";
import { useAppDispatch, useAppSelector } from "../../redux/reduxHooks";
import { selectCanvasDisplaySettings } from "../../redux/slices/canvasDisplaySettingsSlice";
import { selectSafeScreenDimentions } from "../../redux/slices/screenDimentionsSlice";
import { TreeCoordinateData } from "../../redux/slices/treesCoordinatesSlice";
import { removeUserTree, updateUserTrees } from "../../redux/slices/userTreesSlice";
import { CanvasDimensions, CoordinatesWithTreeData, DnDZone, SelectedNodeId, Skill, Tree } from "../../types";
import RadialSkillTree from "./RadialSkillTree";

type Props = {
    selectedNodeCoordState: readonly [
        {
            readonly selectedNodeCoord: CoordinatesWithTreeData | null;
            readonly svSelectedNodeCoord: SharedValue<CoordinatesWithTreeData | null>;
        },
        {
            readonly clearSelectedNodeCoord: () => void;
            readonly updateSelectedNodeCoord: (value: CoordinatesWithTreeData) => void;
        }
    ];
    canvasRef: React.RefObject<SkiaDomView>;
    homepageTree: Tree<Skill>;
    navigation: NativeStackNavigationProp<StackNavigatorParams, "Home", undefined>;
    openCanvasSettingsModal: () => void;
};

function useHomepageTreeState() {
    const screenDimensions = useAppSelector(selectSafeScreenDimentions);

    return { screenDimensions };
}

function useCreateTreeFunctions(
    updateSelectedNodeCoord: (value: CoordinatesWithTreeData) => void,
    navigation: NativeStackNavigationProp<StackNavigatorParams, "Home", undefined>,
    openCanvasSettingsModal: () => void
) {
    const dispatch = useAppDispatch();
    const screenDimensions = useAppSelector(selectSafeScreenDimentions);

    const result: InteractiveTreeFunctions = {
        onNodeClick: (coordOfClickedNode: CoordinatesWithTreeData) => {
            updateSelectedNodeCoord(coordOfClickedNode);
            return;
        },
        nodeMenu: {
            navigate: navigation.navigate,
            confirmDeleteTree: (treeId: string) => {
                Alert.alert(
                    "Delete this tree?",
                    "",
                    [
                        { text: "No", style: "cancel" },
                        { text: "Yes", onPress: () => dispatch(removeUserTree(treeId)), style: "destructive" },
                    ],
                    { cancelable: true }
                );
            },
            selectNode: () => {},
            confirmDeleteNode: () => {},
            toggleCompletionOfSkill: (treeToUpdate: Tree<Skill>, node: Tree<Skill>) => {
                let updatedNode: Tree<Skill> = { ...node, data: { ...node.data, isCompleted: !node.data.isCompleted } };

                const updatedTree = updateNodeAndTreeCompletion(treeToUpdate, updatedNode);

                dispatch(updateUserTrees({ updatedTree, screenDimensions }));
            },
            openAddSkillModal: (dnDZoneType: DnDZone["type"], node: Tree<Skill>) => {
                navigation.navigate("ViewingSkillTree", { treeId: node.treeId, addNodeModal: { dnDZoneType, nodeId: node.nodeId } });
            },
            openCanvasSettingsModal,
        },
    };

    return result;
}

function useGetTreeState(canvasRef: React.RefObject<SkiaDomView>, selectedNode: CoordinatesWithTreeData | null, homeTree: Tree<Skill>) {
    const screenDimensions = useAppSelector(selectSafeScreenDimentions);

    const {
        dndZoneCoordinates,
        canvasDimentions: canvasDimensions,
        centeredCoordinatedWithTreeData,
    } = useMemo(() => handleTreeBuild(homeTree, screenDimensions, "radial"), [homeTree, screenDimensions]);

    const treeCoordinate: TreeCoordinateData = {
        canvasDimensions,
        addNodePositions: dndZoneCoordinates,
        nodeCoordinates: centeredCoordinatedWithTreeData,
    };

    const selectedNodeId = selectedNode ? selectedNode.nodeId : null;

    return { screenDimensions, selectedNodeId, treeCoordinate, canvasRef, selectedDndZone: undefined };
}

function useGetTreeConfig() {
    const canvasDisplaySettings = useAppSelector(selectCanvasDisplaySettings);

    const result: InteractiveTreeConfig = useMemo(() => {
        return { canvasDisplaySettings, isInteractive: true, renderStyle: "radial", editTreeFromNodeMenu: false, blockDragAndDrop: true };
    }, [canvasDisplaySettings]);

    return result;
}

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
    const [openMenuOnNode, setOpenMenuOnNode] = useState<CoordinatesWithTreeData | undefined>(undefined);

    const closeNodeMenu = () => setOpenMenuOnNode(undefined);

    const openMenuOfNode = (clickedNode: CoordinatesWithTreeData) => setOpenMenuOnNode(clickedNode);

    return [openMenuOnNode, { closeNodeMenu, openMenuOfNode }] as const;
}

function useSkiaFonts() {
    const labelFont = useFont(require("../../../assets/Helvetica.ttf"), 12);
    const nodeLetterFont = useFont(require("../../../assets/Helvetica.ttf"), NODE_ICON_FONT_SIZE);
    const emojiFont = useFont(require("../../../assets/NotoEmoji-Regular.ttf"), NODE_ICON_FONT_SIZE);

    if (!labelFont || !nodeLetterFont || !emojiFont) return undefined;

    return { labelFont, nodeLetterFont, emojiFont };
}

function HomepageTree({ canvasRef, homepageTree, navigation, openCanvasSettingsModal, selectedNodeCoordState }: Props) {
    const { screenDimensions } = useHomepageTreeState();

    const [{ selectedNodeCoord, svSelectedNodeCoord }, { clearSelectedNodeCoord, updateSelectedNodeCoord }] = selectedNodeCoordState;

    const selectedNode = findNodeByIdInHomeTree(homepageTree, selectedNodeCoord);

    const treeConfig = useGetTreeConfig();

    const treeState = useGetTreeState(canvasRef, selectedNodeCoord, homepageTree);

    const treeFunctions = useCreateTreeFunctions(updateSelectedNodeCoord, navigation, openCanvasSettingsModal);

    const [draggingNode, draggingNodeActions] = useDraggingNodeState();
    const { endDragging } = draggingNodeActions;

    // const nodeCoordinatesNoData = removeTreeDataFromCoordinate(treeState.treeCoordinate.nodeCoordinates);

    const selectedNodeCoordinates = treeState.treeCoordinate.nodeCoordinates.find((c) => c.nodeId === selectedNodeCoord?.nodeId);

    useRunOnTreeUpdate(homepageTree, treeFunctions, treeState.treeCoordinate.addNodePositions);

    //Gesture Props 👇
    const nodeMenuState = useNodeMenuState();
    const [openMenuOnNode, { closeNodeMenu }] = nodeMenuState;

    //eslint-disable-next-line
    const longPressState = useState<{ data: CoordinatesWithTreeData | undefined; state: "INTERRUPTED" | "PRESSING" | "IDLE" }>({
        data: undefined,
        state: "IDLE",
    });
    const [longPressIndicatorPosition] = longPressState;

    const canvasLongPressProps = {
        config: { blockDragAndDrop: treeConfig.blockDragAndDrop, blockLongPress: treeConfig.blockLongPress },
        nodeCoordinates: treeState.treeCoordinate.nodeCoordinates,
        longPressState,
        nodeMenuState,
        draggingNodeActions,
    };

    const canvasTapProps: CanvasTapProps = {
        functions: { runOnTap: closeNodeMenu, onNodeClick: treeFunctions.onNodeClick },
        state: {
            dragAndDropZones: treeState.treeCoordinate.addNodePositions,
            nodeCoordinates: treeState.treeCoordinate.nodeCoordinates,
            selectedNodeId: selectedNodeCoord?.nodeId as SelectedNodeId,
            showDndZones: treeConfig.showDndZones,
        },
    };

    const { canvasLongPress, runOnScroll } = useCanvasLongPress(canvasLongPressProps);

    //✅👆

    const canvasTap = useCanvasTap(canvasTapProps);

    const canvasPressAndLongPress = Gesture.Exclusive(canvasLongPress, canvasTap);

    const foundNodeOfMenu = openMenuOnNode ? treeState.treeCoordinate.nodeCoordinates.find((c) => c.nodeId === openMenuOnNode.nodeId) : undefined;
    const foundNodeOfMenuWithoutData = openMenuOnNode
        ? treeState.treeCoordinate.nodeCoordinates.find((c) => c.nodeId === openMenuOnNode.nodeId)
        : undefined;

    const offsetX = useSharedValue(0);
    const offsetY = useSharedValue(0);
    const scale = useSharedValue(DEFAULT_SCALE);

    //🟡👇
    const { canvasPan, dragDelta, scrollStyle } = useCanvasScroll(
        treeState.treeCoordinate.canvasDimensions,
        screenDimensions,
        selectedNodeCoordinates,
        foundNodeOfMenuWithoutData,
        runOnScroll,
        { state: draggingNode, endDragging },
        { offsetX, offsetY, scale, selectedNode: svSelectedNodeCoord }
    );
    //🟡👆

    const { canvasZoom, scaleState } = useCanvasZoom(treeState.treeCoordinate.canvasDimensions, screenDimensions, selectedNodeCoordinates, {
        offsetX,
        offsetY,
        scale,
    });

    const canvasScrollAndZoom = Gesture.Simultaneous(canvasPan, canvasZoom);

    const renderSelectedNodeMenu = selectedNodeCoordinates && selectedNode?.nodeId && treeConfig.isInteractive;
    const renderNodeMenu = foundNodeOfMenu && openMenuOnNode && treeConfig.isInteractive;

    const nodeMenuFunctions = returnNodeMenuFunctions(
        foundNodeOfMenu,
        treeState.treeCoordinate.nodeCoordinates,
        homepageTree,
        treeConfig.editTreeFromNodeMenu,
        treeFunctions.nodeMenu
    );

    const canvasGestures = Gesture.Simultaneous(canvasScrollAndZoom, canvasPressAndLongPress);

    const drag = { ...dragDelta, nodesToDragId: ["bm2W4LgdatpqWFgnmJwBRVY1"] };
    //Interactive Tree Props - SelectedNodeMenu
    const nonEditingMenuFunctions = getMenuNonEditingFunctions(selectedNode, navigation, clearSelectedNodeCoord);

    const selectedNodeMenuState: SelectedNodeMenuState = {
        screenDimensions,
        selectedNode: selectedNode!,
        selectedTree: homepageTree,
        initialMode: "VIEWING",
    };

    const fonts = useSkiaFonts();

    return (
        <>
            <View style={[centerFlex, { width: screenDimensions.width, flex: 1, position: "relative" }]}>
                <Animated.View style={[scrollStyle, { flex: 1 }]}>
                    <CanvasView canvasDimensions={treeState.treeCoordinate.canvasDimensions} canvasGestures={canvasGestures} canvasRef={canvasRef}>
                        {treeConfig.canvasDisplaySettings.showCircleGuide && (
                            <RadialTreeLevelCircles nodeCoordinates={treeState.treeCoordinate.nodeCoordinates} />
                        )}
                        {fonts && (
                            <RadialSkillTree
                                nodeCoordinatesCentered={treeState.treeCoordinate.nodeCoordinates}
                                selectedNode={selectedNode?.nodeId ?? null}
                                fonts={fonts}
                                settings={{
                                    showLabel: treeConfig.canvasDisplaySettings.showLabel,
                                    oneColorPerTree: treeConfig.canvasDisplaySettings.oneColorPerTree,
                                    showIcons: treeConfig.canvasDisplaySettings.showIcons,
                                }}
                                drag={drag}
                            />
                        )}
                    </CanvasView>
                    {/* Long press Node related 👇 */}
                    <NodeLongPressIndicator data={longPressIndicatorPosition} scale={scaleState} />
                    {renderNodeMenu && (
                        <NodeMenu functions={nodeMenuFunctions} data={foundNodeOfMenu} scale={scaleState} closeNodeMenu={closeNodeMenu} />
                    )}
                    {/* Long press Node related 👆 */}
                </Animated.View>
            </View>

            {renderSelectedNodeMenu && <SelectedNodeMenu functions={nonEditingMenuFunctions} state={selectedNodeMenuState} />}
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
