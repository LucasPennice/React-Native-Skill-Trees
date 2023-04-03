import { Canvas, TouchHandler } from "@shopify/react-native-skia";
import { useEffect } from "react";
import { ScrollView, View } from "react-native";
import PopUpMenu from "../components/PopUpMenu";
import { selectCanvasDisplaySettings } from "../../../redux/canvasDisplaySettingsSlice";
import { selectCurrentTree } from "../../../redux/currentTreeSlice";
import { selectScreenDimentions } from "../../../redux/screenDimentionsSlice";
import CanvasTree from "./CanvasTree";
import { useAppSelector } from "../../../redux/reduxHooks";
import { colors, NAV_HEGIHT } from "./parameters";
import AppText from "../../../AppText";
import { CanvasDimentions, centerFlex, CirclePositionInCanvasWithLevel, DnDZone } from "../../../types";
import DragAndDropZones from "./DragAndDropZones";
import { CanvasTouchHandler } from "./hooks/useCanvasTouchHandler";

type TreeViewProps = {
    dragAndDropZones: DnDZone[];
    canvasDimentions: CanvasDimentions;
    circlePositionsInCanvas: CirclePositionInCanvasWithLevel[];
    tentativeCirlcePositionsInCanvas: CirclePositionInCanvasWithLevel[];
    canvasTouchHandler: CanvasTouchHandler;
    selectedNode: string | null;
    selectedNodeHistory: (string | null)[];
    updateScrollOffset: (scrollViewType: "horizontal" | "vertical", newValue: number) => void;
};

function TreeView({
    canvasDimentions,
    dragAndDropZones,
    tentativeCirlcePositionsInCanvas,
    circlePositionsInCanvas,
    canvasTouchHandler,
    selectedNode,
    selectedNodeHistory,
    updateScrollOffset,
}: TreeViewProps) {
    //Redux State
    const { height, width } = useAppSelector(selectScreenDimentions);
    const { value: currentTree } = useAppSelector(selectCurrentTree);
    const { showLabel } = useAppSelector(selectCanvasDisplaySettings);
    //Derived State
    const { horizontalScrollViewRef, touchHandler, verticalScrollViewRef } = canvasTouchHandler;
    const { canvasHeight, canvasWidth, horizontalMargin, verticalMargin } = canvasDimentions;
    const foundNodeCoordinates = circlePositionsInCanvas.find((c) => c.id === selectedNode);
    //
    useEffect(() => {
        if (!verticalScrollViewRef.current) return;
        if (!horizontalScrollViewRef.current) return;

        const x = horizontalMargin / 2;

        const HEIGHT_WITHOUT_NAV = height - NAV_HEGIHT;

        const y = 0.5 * (canvasHeight - HEIGHT_WITHOUT_NAV);

        let timerId = setTimeout(() => {
            horizontalScrollViewRef.current!.scrollTo({ x, y, animated: true });
            verticalScrollViewRef.current!.scrollTo({ x, y, animated: true });
        }, 50);

        return () => {
            clearTimeout(timerId);
        };
    }, [verticalScrollViewRef, horizontalScrollViewRef, currentTree]);

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            ref={verticalScrollViewRef}
            style={{ height: height - NAV_HEGIHT }}
            bounces={false}
            onMomentumScrollEnd={(e) => updateScrollOffset("vertical", e.nativeEvent.contentOffset.y)}
            onScrollEndDrag={(e) => updateScrollOffset("vertical", e.nativeEvent.contentOffset.y)}>
            <ScrollView
                bounces={false}
                ref={horizontalScrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ position: "relative" }}
                onScrollEndDrag={(e) => updateScrollOffset("horizontal", e.nativeEvent.contentOffset.x)}
                onMomentumScrollEnd={(e) => updateScrollOffset("horizontal", e.nativeEvent.contentOffset.x)}>
                {currentTree !== undefined && (
                    <Canvas onTouch={touchHandler} style={{ width: canvasWidth, height: canvasHeight, backgroundColor: colors.background }}>
                        <DragAndDropZones data={dragAndDropZones} />
                        <CanvasTree
                            stateProps={{ selectedNode, showLabel, circlePositionsInCanvas, tentativeCirlcePositionsInCanvas }}
                            tree={currentTree}
                            wholeTree={currentTree}
                            rootCoordinates={{ width: horizontalMargin, height: verticalMargin }}
                        />
                    </Canvas>
                )}

                {!currentTree && (
                    <View style={[centerFlex, { width, height }]}>
                        <AppText style={{ color: "white", fontSize: 24 }}>Pick a tree</AppText>
                    </View>
                )}

                {selectedNode && foundNodeCoordinates && currentTree && (
                    <PopUpMenu foundNodeCoordinates={foundNodeCoordinates} selectedNode={selectedNode} selectedNodeHistory={selectedNodeHistory} />
                )}
            </ScrollView>
        </ScrollView>
    );
}

export default TreeView;
