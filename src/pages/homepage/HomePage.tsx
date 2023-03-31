import { ScrollView, View } from "react-native";
import TreeView from "./canvas/TreeView";
import ChildrenHoistSelectorModal from "./modals/ChildrenHoistSelector";
import ProgressIndicatorAndName from "./components/ProgressIndicatorAndName";
import SettingsMenu from "./components/SettingsMenu";
import TreeSelectorModal from "./modals/TreeSelectorModal";
import ChooseTree from "./ChooseTree";
import { CIRCLE_SIZE, colors } from "./canvas/parameters";
import { useAppSelector } from "../../redux/reduxHooks";
import { selectCurrentTree } from "../../redux/currentTreeSlice";
import { GestureDetector, PanGesture } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import AppText from "../../AppText";
import { CanvasDimentions, centerFlex, CirclePositionInCanvasWithLevel, DnDZone, Skill, Tree } from "../../types";
import { useEffect, useState } from "react";
import useHandleNewNode from "./canvas/hooks/useHandleNewNode";
import {
    calculateDimentionsAndRootCoordinates,
    calculateDragAndDropZones,
    centerNodesInCanvas,
    getCirclePositions,
} from "./canvas/coordinateFunctions";
import { selectScreenDimentions } from "../../redux/screenDimentionsSlice";
import useCanvasTouchHandler from "./canvas/hooks/useCanvasTouchHandler";

function HomePage() {
    //Redux State
    const { value: currentTree } = useAppSelector(selectCurrentTree);
    const screenDimentions = useAppSelector(selectScreenDimentions);
    //Local State
    const [selectedNode, setSelectedNode] = useState<null | string>(null);
    const [selectedNodeHistory, setSelectedNodeHistory] = useState<(null | string)[]>([null]);
    const [scrollOffset, setScrollOffset] = useState({ x: 0, y: 0 });
    //Derived State
    const circlePositions = getCirclePositions(currentTree);
    const canvasDimentions = calculateDimentionsAndRootCoordinates(circlePositions, screenDimentions);
    const circlePositionsInCanvas = centerNodesInCanvas(circlePositions, canvasDimentions);
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

    const dragAndDropNodeCanvasCoordinates = getOveringOverTriangle(handleNewNode.dragAndDropNodeCoord, scrollOffset);
    const rectangleUnderDragAndDropNode = getRectangleUnderDragAndDropNode(dragAndDropZones, dragAndDropNodeCanvasCoordinates);
    const tentativeModifiedTree = getTentativeModifiedTree(rectangleUnderDragAndDropNode, currentTree);

    useEffect(() => {
        setSelectedNode(null);
        setSelectedNodeHistory([]);
    }, [currentTree]);

    const updateScrollOffset = (scrollViewType: "horizontal" | "vertical", newValue: number) => {
        if (scrollViewType === "horizontal") {
            setScrollOffset((p) => {
                return { ...p, x: newValue };
            });
        } else {
            setScrollOffset((p) => {
                return { ...p, y: newValue };
            });
        }
    };
    // useEffect(() => {
    //     console.log(canvasTouchHandler.scrollOffset);
    // }, [canvasTouchHandler.scrollOffset.x, canvasTouchHandler.scrollOffset.y]);

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
                // SEPARAR EL TOUCH HANDLER PORQUE RERENDERIZA MUCHO TREEVIEW
                canvasTouchHandler={canvasTouchHandler}
                selectedNode={selectedNode}
                selectedNodeHistory={selectedNodeHistory}
                updateScrollOffset={updateScrollOffset}
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

function getTentativeModifiedTree(rectangleUnderDragAndDropNode: DnDZone | undefined, currentTree: Tree<Skill> | undefined) {
    if (!currentTree) return undefined;
    if (!rectangleUnderDragAndDropNode) return undefined;

    console.log(rectangleUnderDragAndDropNode);
}

function getOveringOverTriangle(dragAndDropNodeCoord: { x: number; y: number }, scrollOffset: { x: number; y: number }) {
    return { x: dragAndDropNodeCoord.x + scrollOffset.x, y: dragAndDropNodeCoord.y + scrollOffset.y };
}

function getRectangleUnderDragAndDropNode(
    dragAndDropZones: DnDZone[],
    dragAndDropNodeCanvasCoordinates: {
        x: number;
        y: number;
    }
) {
    const x = dragAndDropNodeCanvasCoordinates.x + CIRCLE_SIZE;
    const y = dragAndDropNodeCanvasCoordinates.y + CIRCLE_SIZE;

    const result = dragAndDropZones.find((rec) => {
        const inXBounds = x >= rec.x && x <= rec.x + rec.width;
        const inYBounds = y >= rec.y && y <= rec.y + rec.height;

        return inXBounds && inYBounds;
    });

    return result;
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
