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
import { centerFlex } from "../../types";
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
    const handleNewNode = useHandleNewNode(scrollOffset, dragAndDropZones, currentTree);

    const { tentativeModifiedTree } = handleNewNode;

    const tentativeCirclePositions = getCirclePositions(tentativeModifiedTree);
    const tentativeCirlcePositionsInCanvas = centerNodesInCanvas(tentativeCirclePositions, canvasDimentions);

    const canvasTouchHandler = useCanvasTouchHandler({
        selectedNodeState: [selectedNode, setSelectedNode],
        setSelectedNodeHistory,
        circlePositionsInCanvas,
        tree: currentTree,
    });
    //

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

    //Hay un bug cuando se arma un arbol de 4 borrando coding del arbol de IQ ->Tiene que ver con no meter los CIRCLESIZE al tree width

    return (
        <View style={{ position: "relative", backgroundColor: colors.background }}>
            <TreeView
                dragAndDropZones={dragAndDropZones}
                canvasDimentions={canvasDimentions}
                circlePositionsInCanvas={circlePositionsInCanvas}
                tentativeCirlcePositionsInCanvas={tentativeCirlcePositionsInCanvas}
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

function DragAndDropNewNode({ handleNewNode }: { handleNewNode: { panGesture: PanGesture; animatedStyle: { left: number; top: number } } }) {
    const { animatedStyle, panGesture } = handleNewNode;

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
