import { View } from "react-native";
import TreeView from "./canvas/TreeView";
import ChildrenHoistSelectorModal from "./modals/ChildrenHoistSelector";
import ProgressIndicatorAndName from "./components/ProgressIndicatorAndName";
import SettingsMenu from "./components/SettingsMenu";
import TreeSelectorModal from "./modals/TreeSelectorModal";
import ChooseTree from "./ChooseTree";
import { CIRCLE_SIZE, colors, DISTANCE_BETWEEN_GENERATIONS } from "./canvas/parameters";
import { useAppSelector } from "../../redux/reduxHooks";
import { selectCurrentTree } from "../../redux/currentTreeSlice";
import { GestureDetector, Gesture, PanGesture } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import AppText from "../../AppText";
import { centerFlex, CirclePositionInCanvasWithLevel } from "../../types";
import { useEffect, useState } from "react";
import useHandleNewNode from "./canvas/hooks/useHandleNewNode";
import { calculateDimentionsAndRootCoordinates, calculateDragAndDropZones, getCirclePositions, getTreeWidth } from "./canvas/coordinateFunctions";
import { ScreenDimentions, selectScreenDimentions } from "../../redux/screenDimentionsSlice";
import useCanvasTouchHandler from "./canvas/hooks/useCanvasTouchHandler";

function HomePage() {
    //Redux State
    const { value: currentTree } = useAppSelector(selectCurrentTree);
    const screenDimentions = useAppSelector(selectScreenDimentions);
    //Local State
    const [selectedNode, setSelectedNode] = useState<null | string>(null);
    const [selectedNodeHistory, setSelectedNodeHistory] = useState<(null | string)[]>([null]);
    //Derived State
    const circlePositions = getCirclePositions(currentTree);
    const canvasDimentions = calculateDimentionsAndRootCoordinates(circlePositions, screenDimentions);
    const circlePositionsInCanvas = circlePositions.map((p) => {
        return { ...p, y: p.y + verticalMargin, x: p.x + horizontalMargin } as CirclePositionInCanvasWithLevel;
    });
    const dragAndDropZones = calculateDragAndDropZones(circlePositionsInCanvas);
    //Hooks
    const handleNewNode = useHandleNewNode();

    const canvasTouchHandler = useCanvasTouchHandler({
        selectedNodeState: [selectedNode, setSelectedNode],
        setSelectedNodeHistory,
        circlePositionsInCanvas,
        tree: currentTree,
    });
    //

    const { canvasHeight, canvasWidth, horizontalMargin, verticalMargin } = canvasDimentions;

    const hoveringOverTriangle = getOveringOverTriangle(handleNewNode.dragAndDropNodeCoord);
    // const tentativeModifiedTree = getTentativeModifiedTree(hoveringOverTriangle);

    useEffect(() => {
        setSelectedNode(null);
        setSelectedNodeHistory([]);
    }, [currentTree]);

    //Para evitar tantos rerenders de tree view
    //Le voy a pasar un prop que sea que sea sobre que rectangulo esta el new node (o directamente el arbol al q animar y a la goma)
    //Para eso probablemente tenga que hoistear bastantes giladas de TreeView
    //Antes de hacer eso tengo que refactorizar HomePage

    //Hay un bug cuando se arma un arbol de 4 borrando coding del arbol de IQ ->Tiene que ver con no meter los CIRCLESIZE al tree width

    return (
        <View style={{ position: "relative", backgroundColor: colors.background }}>
            <TreeView
                dragAndDropZones={dragAndDropZones}
                canvasDimentions={canvasDimentions}
                circlePositionsInCanvas={circlePositionsInCanvas}
                canvasTouchHandler={canvasTouchHandler}
                selectedNode={selectedNode}
                selectedNodeHistory={selectedNodeHistory}
            />
            <DragAndDropNewNode handleNewNode={handleNewNode} />
            <ProgressIndicatorAndName />
            <ChooseTree />
            {currentTree !== undefined && <SettingsMenu />}

            <TreeSelectorModal />
            <ChildrenHoistSelectorModal />
        </View>
    );
}

function getOveringOverTriangle(dragAndDropNodeCoord: { x: number; y: number }) {
    console.log(dragAndDropNodeCoord);
}

function DragAndDropNewNode({
    handleNewNode,
}: {
    handleNewNode: { panGesture: PanGesture; animatedStyle: { left: number; top: number }; dragAndDropNodeCoord: { x: number; y: number } };
}) {
    const { animatedStyle, dragAndDropNodeCoord, panGesture } = handleNewNode;

    return (
        <GestureDetector gesture={panGesture}>
            <Animated.View
                style={[
                    animatedStyle,
                    centerFlex,
                    {
                        position: "absolute",
                        width: 2 * CIRCLE_SIZE,
                        height: 2 * CIRCLE_SIZE,
                        backgroundColor: colors.background,
                        borderWidth: 2,
                        borderRadius: CIRCLE_SIZE,
                        borderColor: colors.accent,
                    },
                ]}>
                <AppText style={{ fontSize: 22, color: "white", transform: [{ translateY: -2 }] }}>+</AppText>
            </Animated.View>
        </GestureDetector>
    );
}

export default HomePage;
