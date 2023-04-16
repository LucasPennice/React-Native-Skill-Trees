import { View } from "react-native";
import TreeView from "./canvas/TreeView";
import ChildrenHoistSelectorModal from "./modals/ChildrenHoistSelector";
import ProgressIndicatorAndName from "./components/ProgressIndicatorAndName";
import SettingsMenu from "./components/SettingsMenu";
import { CIRCLE_SIZE, colors } from "./canvas/parameters";
import { useAppSelector } from "../../redux/reduxHooks";
import { selectCurrentTree, selectTreeSlice } from "../../redux/userTreesSlice";
import { GestureDetector, PanGesture } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import AppText from "../../components/AppText";
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
import AddNode from "./AddNode";
import NewNodeModal from "./modals/NewNodeModal";
import { selectNewNode } from "../../redux/newNodeSlice";
import useRunHomepageCleanup from "./useRunHomepageCleanup";

function HomePage() {
    //Redux State
    const currentTree = useAppSelector(selectCurrentTree);
    const { currentTreeId } = useAppSelector(selectTreeSlice);
    const screenDimentions = useAppSelector(selectScreenDimentions);
    //Local State
    const [scrollOffset, setScrollOffset] = useState({ x: 0, y: 0 });
    //Derived State
    const circlePositions = getCirclePositions(currentTree);
    const canvasDimentions = calculateDimentionsAndRootCoordinates(circlePositions, screenDimentions);
    const circlePositionsInCanvas = centerNodesInCanvas(circlePositions, canvasDimentions);
    const dragAndDropZones = calculateDragAndDropZones(circlePositionsInCanvas);
    //Hooks
    const handleNewNode = useHandleNewNode(scrollOffset, dragAndDropZones, currentTree);
    const canvasTouchHandler = useCanvasTouchHandler({ circlePositionsInCanvas, tree: currentTree });

    const { tentativeModifiedTree } = handleNewNode;

    const tentativeCirclePositions = getCirclePositions(tentativeModifiedTree);
    const tentativeCirlcePositionsInCanvas = centerNodesInCanvas(tentativeCirclePositions, canvasDimentions);

    //

    useRunHomepageCleanup();

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

    return (
        <View style={{ position: "relative", backgroundColor: colors.background }}>
            <TreeView
                dragAndDropZones={dragAndDropZones}
                canvasDimentions={canvasDimentions}
                circlePositionsInCanvas={circlePositionsInCanvas}
                tentativeCirlcePositionsInCanvas={tentativeCirlcePositionsInCanvas}
                canvasTouchHandler={canvasTouchHandler}
                updateScrollOffset={updateScrollOffset}
            />

            <DragAndDropNewNode handleNewNode={handleNewNode} treeAccent={currentTree?.accentColor} />
            <ProgressIndicatorAndName />
            <AddNode />
            {currentTree !== undefined && <SettingsMenu />}

            <ChildrenHoistSelectorModal />
            <NewNodeModal />
        </View>
    );
}

function DragAndDropNewNode({
    handleNewNode,
    treeAccent,
}: {
    handleNewNode: { panGesture: PanGesture; animatedStyle: { left: number; top: number } };
    treeAccent: string | undefined;
}) {
    const { animatedStyle, panGesture } = handleNewNode;

    const newNode = useAppSelector(selectNewNode);
    const currentTree = useAppSelector(selectCurrentTree);

    const isOpen = useSharedValue(false);

    useEffect(() => {
        const result = !(newNode.id === "" || newNode.name === "" || currentTree === undefined);
        isOpen.value = result;
    }, [newNode, currentTree]);

    const showTool = !(newNode.id === "" || newNode.name === "" || currentTree === undefined);

    const hideShow = useAnimatedStyle(() => {
        return { transform: [{ translateX: withTiming(isOpen.value ? 0 : -65) }] };
    }, [isOpen]);
    const hideShowOpacity = useAnimatedStyle(() => {
        return {
            opacity: withDelay(150, withTiming(isOpen.value ? 1 : 0)),
        };
    }, [isOpen]);

    const color = newNode.isCompleted ? treeAccent ?? colors.accent : colors.unmarkedText;

    if (!showTool) return <></>;

    return (
        <>
            <Animated.View
                style={[
                    hideShow,
                    {
                        backgroundColor: colors.darkGray,
                        position: "absolute",
                        left: 0,
                        top: 80,
                        height: 65,
                        width: 65,
                        borderBottomEndRadius: 10,
                        borderTopEndRadius: 10,
                    },
                ]}
            />
            <GestureDetector gesture={panGesture}>
                <Animated.View
                    style={[
                        animatedStyle,
                        hideShowOpacity,
                        centerFlex,
                        {
                            position: "absolute",
                            width: 3 * CIRCLE_SIZE,
                            height: 3 * CIRCLE_SIZE,
                            backgroundColor: colors.background,
                            borderWidth: 2,
                            borderRadius: 1.5 * CIRCLE_SIZE,
                            borderColor: color,
                        },
                    ]}>
                    <AppText style={{ color: color }} fontSize={22}>
                        {newNode.name ? newNode.name[0] : "+"}
                    </AppText>
                </Animated.View>
            </GestureDetector>
        </>
    );
}

HomePage.whyDidYouRender = false;
// HomePage.whyDidYouRender = {
//     logOnDifferentValues: true,
//     customName: "Homeapge",
// };

export default HomePage;
