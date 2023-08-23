import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Canvas, SkiaDomView } from "@shopify/react-native-skia";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { Alert, View } from "react-native";
import { Gesture, GestureDetector, SimultaneousGesture } from "react-native-gesture-handler";
import Animated, { useSharedValue } from "react-native-reanimated";
import { StackNavigatorParams } from "../../../App";
import { InteractiveTreeConfig, InteractiveTreeFunctions } from "../../components/treeRelated/InteractiveTree";
import { InteractiveNodeState } from "../../components/treeRelated/InteractiveTree2H";
import RadialTreeLevelCircles from "../../components/treeRelated/RadialTreeLevelCircles";
import { removeTreeDataFromCoordinate } from "../../components/treeRelated/coordinateFunctions";
import NodeLongPressIndicator from "../../components/treeRelated/general/NodeLongPressIndicator";
import { DEFAULT_SCALE } from "../../components/treeRelated/hooks/gestures/params";
import useCanvasLongPress from "../../components/treeRelated/hooks/gestures/useCanvasLongPress";
import useCanvasScroll from "../../components/treeRelated/hooks/gestures/useCanvasScroll";
import useCanvasTap from "../../components/treeRelated/hooks/gestures/useCanvasTap";
import useCanvasZoom from "../../components/treeRelated/hooks/gestures/useCanvasZoom";
import NodeMenu from "../../components/treeRelated/nodeMenu/NodeMenu";
import returnNodeMenuFunctions from "../../components/treeRelated/returnNodeMenuFunctions";
import SelectedNodeMenu, { SelectedNodeMenuState } from "../../components/treeRelated/selectedNodeMenu/SelectedNodeMenu";
import { getMenuNonEditingFunctions } from "../../components/treeRelated/selectedNodeMenu/useGetMenuFunctions";
import { handleTreeBuild } from "../../functions/coordinateSystem";
import { findNodeById, findNodeByIdInHomeTree } from "../../functions/extractInformationFromTree";
import { updateNodeAndTreeCompletion } from "../../functions/mutateTree";
import { centerFlex } from "../../parameters";
import { useAppDispatch, useAppSelector } from "../../redux/reduxHooks";
import { selectCanvasDisplaySettings } from "../../redux/slices/canvasDisplaySettingsSlice";
import { selectSafeScreenDimentions } from "../../redux/slices/screenDimentionsSlice";
import { TreeCoordinateData, selectHomeTreeCoordinates } from "../../redux/slices/treesCoordinatesSlice";
import { removeUserTree, updateUserTrees } from "../../redux/slices/userTreesSlice";
import { CanvasDimensions, DnDZone, NodeCoordinate, Skill, Tree } from "../../types";
import RadialSkillTree from "./RadialSkillTree";

type Props = {
    lol: {
        selectedNodeIdState: readonly [
            {
                nodeId: string;
                treeId: string;
            } | null,
            {
                readonly clearSelectedNodeId: () => void;
                readonly updateSelectedNodeId: (value: { nodeId: string; treeId: string }) => void;
            }
        ];
        canvasRef: React.RefObject<SkiaDomView>;
        homepageTree: Tree<Skill>;
        navigation: NativeStackNavigationProp<StackNavigatorParams, "Home", undefined>;
        openCanvasSettingsModal: () => void;
    };
};

function useHomepageTreeState() {
    const screenDimensions = useAppSelector(selectSafeScreenDimentions);

    return { screenDimensions };
}

function useCreateTreeFunctions(
    updateSelectedNodeId: (value: { nodeId: string; treeId: string }) => void,
    navigation: NativeStackNavigationProp<StackNavigatorParams, "Home", undefined>,
    openCanvasSettingsModal: () => void
) {
    const dispatch = useAppDispatch();
    const screenDimensions = useAppSelector(selectSafeScreenDimentions);

    const result: InteractiveTreeFunctions = useMemo(() => {
        return {
            onNodeClick: (node: Tree<Skill>) => {
                const nodeId = node.nodeId;
                updateSelectedNodeId({ nodeId, treeId: node.treeId });
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
    }, [dispatch, navigation, openCanvasSettingsModal, screenDimensions]);

    return result;
}

function useGetTreeState(canvasRef: React.RefObject<SkiaDomView>, selectedNode: { nodeId: string; treeId: string } | null, homeTree: Tree<Skill>) {
    const homeTreeCoordinate = useAppSelector(selectHomeTreeCoordinates);
    const screenDimensions = useAppSelector(selectSafeScreenDimentions);

    const result: InteractiveNodeState = useMemo(() => {
        const {
            dndZoneCoordinates,
            canvasDimentions: canvasDimensions,
            centeredCoordinatedWithTreeData,
        } = handleTreeBuild(homeTree, screenDimensions, "radial");

        const treeCoordinate: TreeCoordinateData = {
            canvasDimensions,
            addNodePositions: dndZoneCoordinates,
            nodeCoordinates: centeredCoordinatedWithTreeData,
        };

        const selectedNodeId = selectedNode ? selectedNode.nodeId : null;

        return { screenDimensions, selectedNodeId, treeCoordinate, canvasRef, selectedDndZone: undefined };
    }, [screenDimensions, canvasRef, selectedNode, homeTreeCoordinate]);

    return result;
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
    const [openMenuOnNode, setOpenMenuOnNode] = useState<NodeCoordinate | undefined>(undefined);

    const closeNodeMenu = () => setOpenMenuOnNode(undefined);

    const openMenuOfNode = (clickedNode: NodeCoordinate) => setOpenMenuOnNode(clickedNode);

    return [openMenuOnNode, { closeNodeMenu, openMenuOfNode }] as const;
}

function HomepageTree({ lol }: Props) {
    const { screenDimensions } = useHomepageTreeState();

    const { canvasRef, homepageTree, navigation, openCanvasSettingsModal, selectedNodeIdState } = lol;

    const [selectedNodeId, { clearSelectedNodeId, updateSelectedNodeId }] = selectedNodeIdState;

    const selectedNode = findNodeByIdInHomeTree(homepageTree, selectedNodeId);

    const treeConfig = useGetTreeConfig();
    const treeState = useGetTreeState(canvasRef, selectedNodeId, homepageTree);
    const treeFunctions = useCreateTreeFunctions(updateSelectedNodeId, navigation, openCanvasSettingsModal);

    const [draggingNode, draggingNodeActions] = useDraggingNodeState();
    const { endDragging } = draggingNodeActions;

    const nodeCoordinatesNoData = removeTreeDataFromCoordinate(treeState.treeCoordinate.nodeCoordinates);

    const selectedNodeCoordinates = nodeCoordinatesNoData.find((c) => c.id === selectedNodeId?.nodeId);

    const onNodeClickAdapter = (nodeId: string) => {
        if (!treeFunctions || !treeFunctions.onNodeClick) return;

        console.log(new Date().getTime());
        const node = findNodeById(homepageTree, nodeId);

        if (!node) return;

        treeFunctions.onNodeClick(node);
        console.log(new Date().getTime());
    };

    const onDndZoneClickAdapter = (zone?: DnDZone) => {
        if (!treeFunctions || !treeFunctions.onDndZoneClick) return;

        if (!zone) return;

        treeFunctions.onDndZoneClick(zone);
    };

    useRunOnTreeUpdate(homepageTree, treeFunctions, treeState.treeCoordinate.addNodePositions);

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
        config: { blockDragAndDrop: treeConfig.blockDragAndDrop, blockLongPress: treeConfig.blockLongPress },
        nodeCoordinatesCentered: nodeCoordinatesNoData,
        longPressState,
        nodeMenuState,
        draggingNodeActions,
    };

    const canvasTapProps = {
        functions: { runOnTap: closeNodeMenu, onDndZoneClick: onDndZoneClickAdapter, onNodeClick: onNodeClickAdapter },
        state: {
            dragAndDropZones: treeState.treeCoordinate.addNodePositions,
            nodeCoordinates: nodeCoordinatesNoData,
            selectedNodeId: selectedNodeId === null ? selectedNodeId : selectedNodeId.nodeId,
            showDndZones: treeConfig.showDndZones,
        },
    };

    const { canvasLongPress, runOnScroll } = useCanvasLongPress(canvasLongPressProps);
    const canvasTap = useCanvasTap(canvasTapProps);

    const canvasPressAndLongPress = Gesture.Exclusive(canvasLongPress, canvasTap);

    const foundNodeOfMenu = openMenuOnNode ? treeState.treeCoordinate.nodeCoordinates.find((c) => c.nodeId === openMenuOnNode.id) : undefined;
    const foundNodeOfMenuWithoutData = openMenuOnNode ? nodeCoordinatesNoData.find((c) => c.id === openMenuOnNode.id) : undefined;

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

    const renderSelectedNodeMenu = selectedNodeCoordinates && selectedNodeId && treeConfig.isInteractive;
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
    const RenderOnSelectedNodeId = useMemo(() => {
        const nonEditingMenuFunctions = getMenuNonEditingFunctions(selectedNode, navigation, clearSelectedNodeId);

        const selectedNodeMenuState: SelectedNodeMenuState = {
            screenDimensions,
            selectedNode: selectedNode!,
            selectedTree: homepageTree,
            initialMode: "VIEWING",
        };

        return <SelectedNodeMenu functions={nonEditingMenuFunctions} state={selectedNodeMenuState} />;
        //eslint-disable-next-line
    }, [homepageTree, navigation, screenDimensions, selectedNode]);

    // VER CUANTO TARDA EN ACTUALIZARSE EL SELECTED NODE FUERA DE ESTE COMPONENTE VS DENTRO DE ESTE COMPONENTE
    // O SEA VER DONDE ESTA EL BOTTLENECK DESDE QUE YO HAGO CLICK HASTA QUE EL ESTADO EN ESTE COMPONENTE SE ACTUALIZA

    useEffect(() => {
        console.log(selectedNode);
    }, [selectedNode]);

    return (
        <>
            <View style={[centerFlex, { width: screenDimensions.width, flex: 1, position: "relative" }]}>
                <Animated.View style={[scrollStyle, { flex: 1 }]}>
                    <CanvasView canvasDimensions={treeState.treeCoordinate.canvasDimensions} canvasGestures={canvasGestures} canvasRef={canvasRef}>
                        {treeConfig.canvasDisplaySettings.showCircleGuide && (
                            <RadialTreeLevelCircles nodeCoordinates={treeState.treeCoordinate.nodeCoordinates} />
                        )}
                        <RadialSkillTree
                            nodeCoordinatesCentered={treeState.treeCoordinate.nodeCoordinates}
                            selectedNode={selectedNodeId?.nodeId ?? null}
                            settings={{
                                showLabel: treeConfig.canvasDisplaySettings.showLabel,
                                oneColorPerTree: treeConfig.canvasDisplaySettings.oneColorPerTree,
                                showIcons: treeConfig.canvasDisplaySettings.showIcons,
                            }}
                            drag={drag}
                        />
                    </CanvasView>
                    {/* Long press Node related 👇 */}
                    <NodeLongPressIndicator data={longPressIndicatorPosition} scale={scaleState} />
                    {renderNodeMenu && (
                        <NodeMenu functions={nodeMenuFunctions} data={foundNodeOfMenu} scale={scaleState} closeNodeMenu={closeNodeMenu} />
                    )}
                    {/* Long press Node related 👆 */}
                </Animated.View>
            </View>

            {renderSelectedNodeMenu && RenderOnSelectedNodeId}
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

export default HomepageTree;
