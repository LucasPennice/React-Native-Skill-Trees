import { Canvas, Circle, DashPathEffect } from "@shopify/react-native-skia";
import { View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { cartesianToPositivePolarCoordinates } from "../../functions/coordinateSystem";
import { NAV_HEGIHT, centerFlex, colors } from "../../parameters";
import { useAppSelector } from "../../redux/reduxHooks";
import { selectScreenDimentions } from "../../redux/screenDimentionsSlice";
import CanvasTree from "../viewingSkillTree/canvas/CanvasTree";
import { centerNodesInCanvas, getCanvasDimensions, getNodesCoordinates } from "../viewingSkillTree/canvas/coordinateFunctions";
import useHandleCanvasScroll from "../viewingSkillTree/canvas/hooks/useHandleCanvasScroll";

function Homepage() {
    return <></>;
    // //Redux State
    // const screenDimentions = useAppSelector(selectScreenDimentions);
    // //Derived State
    // // const inputTree = getInputTree(userTrees);
    // const nodeCoordinates = getNodesCoordinates(mockInputTree, "radial");
    // const canvasDimentions = getCanvasDimensions(nodeCoordinates, screenDimentions);
    // const { canvasHeight, canvasWidth } = canvasDimentions;
    // const nodeCoordinatesCentered = centerNodesInCanvas(nodeCoordinates, canvasDimentions);

    // const { canvasGestures, transform } = useHandleCanvasScroll(canvasDimentions);

    // return (
    //     <View style={{ position: "relative", backgroundColor: colors.background, overflow: "hidden" }}>
    //         <GestureDetector gesture={canvasGestures}>
    //             <View style={[centerFlex, { height: screenDimentions.height - NAV_HEGIHT, width: screenDimentions.width }]}>
    //                 <Animated.View style={[transform]}>
    //                     <Canvas style={{ width: canvasWidth, height: canvasHeight }} mode="continuous">
    //                         <CanvasTree
    //                             stateProps={{ selectedNode: null, showLabel: true, nodeCoordinatesCentered: nodeCoordinatesCentered }}
    //                             tree={mockInputTree}
    //                             wholeTree={mockInputTree}
    //                             treeAccentColor={mockInputTree.accentColor!}
    //                             rootCoordinates={{ width: 0, height: 0 }}
    //                             isRadial
    //                         />
    //                         <Circles />
    //                     </Canvas>
    //                 </Animated.View>
    //             </View>
    //         </GestureDetector>
    //     </View>
    // );
    // function Circles() {
    //     const rootNode = nodeCoordinatesCentered.find((n) => n.level === 0);

    //     if (!rootNode) return <></>;

    //     const levelDistances = getLevelDistances();

    //     const rootNodeCoord = { x: rootNode.x, y: rootNode.y };

    //     return (
    //         <>
    //             {levelDistances.map((r, idx) => {
    //                 return (
    //                     <Circle key={idx} cx={rootNodeCoord.x} cy={rootNodeCoord.y} r={r} color="gray" style={"stroke"} opacity={0.7}>
    //                         <DashPathEffect intervals={[10, 10]} />
    //                     </Circle>
    //                 );
    //             })}
    //         </>
    //     );

    //     function getLevelDistances() {
    //         const result: number[] = [];

    //         for (let i = 0; i < nodeCoordinatesCentered.length; i++) {
    //             const element = nodeCoordinatesCentered[i];

    //             if (result[element.level] === undefined) {
    //                 const polarCoord = cartesianToPositivePolarCoordinates({ x: element.x, y: element.y }, { x: rootNode!.x, y: rootNode!.y });

    //                 result[element.level] = polarCoord.distanceToCenter;
    //             }
    //         }

    //         return result;
    //     }
    // }
}

export default Homepage;
