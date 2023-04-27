import { Canvas, Circle, DashPathEffect } from "@shopify/react-native-skia";
import { View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { mutateEveryTreeNode } from "../../functions/mutateTree";
import { DISTANCE_BETWEEN_GENERATIONS, NAV_HEGIHT, bigasstree, centerFlex, colors } from "../../parameters";
import { useAppSelector } from "../../redux/reduxHooks";
import { selectScreenDimentions } from "../../redux/screenDimentionsSlice";
import { selectTreeSlice } from "../../redux/userTreesSlice";
import { Skill, Tree } from "../../types";
import CanvasTree from "../viewingSkillTree/canvas/CanvasTree";
import { centerNodesInCanvas, getCanvasDimensions, getNodesCoordinates } from "../viewingSkillTree/canvas/coordinateFunctions";
import useHandleCanvasScroll from "../viewingSkillTree/canvas/hooks/useHandleCanvasScroll";

//@ts-ignore
// const mockInputTree: any = {
//     treeName: "sexo",
//     accentColor: colors.teal,
//     isRoot: true,
//     treeId: "hhgtht",
//     data: { id: "PADRE", name: "PADRE", isCompleted: false },
//     children: [
//         {
//             accentColor: "#FE453A",
//             data: { id: "FIRST", name: "FIRST", isCompleted: false },
//             level: 1,
//             parentId: "PADRE",
//             children: [
//                 {
//                     data: { name: "F-1", isCompleted: false, id: "F-1" },
//                     parentId: "FIRST",
//                     children: [
//                         {
//                             data: { name: "F-1-1", isCompleted: true, id: "F-1-1" },
//                             parentId: "F-1",
//                             level: null,
//                         },
//                         {
//                             data: { name: "F-1-2", isCompleted: true, id: "F-1-2" },
//                             parentId: "F-1",
//                             level: null,
//                         },
//                         { data: { name: "F-1-3", isCompleted: true, id: "F-1-3" }, parentId: "F-1", level: null },
//                         { data: { name: "F-1-4", isCompleted: true, id: "F-1-4" }, parentId: "F-1", level: null },
//                     ],
//                     level: null,
//                 },
//                 {
//                     data: { name: "F-2", isCompleted: true, id: "F-2" },
//                     parentId: "FIRST",
//                     children: [
//                         { data: { name: "F-2-1", isCompleted: true, id: "F-2-1" }, parentId: "F-2", level: null },
//                         {
//                             data: { name: "F-2-2", isCompleted: true, id: "F-2-2" },
//                             parentId: "F-2",
//                             level: null,
//                         },
//                         {
//                             data: { name: "F-2-3", isCompleted: true, id: "F-2-3" },
//                             parentId: "F-2",
//                             level: null,
//                         },
//                     ],
//                     level: null,
//                 },
//             ],
//         },
//         {
//             accentColor: "#FF9F23",
//             isRoot: false,
//             data: { id: "SECOND", name: "SECOND", isCompleted: true },
//             children: [
//                 {
//                     data: { name: "S-1", isCompleted: false, id: "S-1" },
//                     parentId: "SECOND",
//                     children: [
//                         {
//                             data: { name: "S-1-1", isCompleted: true, id: "S-1-1" },
//                             parentId: "S-1",
//                             level: null,
//                         },
//                         {
//                             data: { name: "S-1-2", isCompleted: true, id: "S-1-2" },
//                             parentId: "S-1",
//                             level: null,
//                         },
//                         { data: { name: "S-1-3", isCompleted: true, id: "S-1-3" }, parentId: "S-1", level: null },
//                         { data: { name: "S-1-4", isCompleted: true, id: "S-1-4" }, parentId: "S-1", level: null },
//                     ],
//                     level: null,
//                 },
//                 {
//                     data: { name: "S-2", isCompleted: true, id: "S-2" },
//                     parentId: "SECOND",
//                     children: [
//                         { data: { name: "S-2-1", isCompleted: true, id: "S-2-1" }, parentId: "S-2", level: null },
//                         {
//                             data: { name: "S-2-2", isCompleted: true, id: "S-2-2" },
//                             parentId: "S-2",
//                             level: null,
//                         },
//                         {
//                             data: { name: "S-2-3", isCompleted: true, id: "S-2-3" },
//                             parentId: "S-2",
//                             level: null,
//                         },
//                     ],
//                     level: null,
//                 },
//             ],
//             level: 1,
//             parentId: "PADRE",
//         },
//     ],
// };

function Homepage() {
    //Redux State
    const screenDimentions = useAppSelector(selectScreenDimentions);
    //Derived State
    // const inputTree = getInputTree(userTrees);
    const nodeCoordinates = getNodesCoordinates(bigasstree, "radial");
    const canvasDimentions = getCanvasDimensions(nodeCoordinates, screenDimentions);
    const { canvasHeight, canvasWidth } = canvasDimentions;
    const nodeCoordinatesCentered = centerNodesInCanvas(nodeCoordinates, canvasDimentions);

    const { canvasGestures, transform } = useHandleCanvasScroll(canvasDimentions);

    function getInputTree(userTrees: Tree<Skill>[]) {
        let result: undefined | Tree<Skill> = undefined;

        if (userTrees.length === 0) return result;

        const rootNode: Tree<Skill> = {
            data: { id: "lol", name: "Me", isCompleted: false },
            level: 0,
            x: 0,
            y: 0,
            parentId: undefined,
            accentColor: colors.purple,
        };

        const children: Tree<Skill>["children"] = [];

        for (let i = 0; i < userTrees.length; i++) {
            const userTree = userTrees[i];

            const copy = { ...userTree };
            const increaseLevel = (tree: Tree<Skill>) => {
                return { ...tree, level: tree.level + 1 } as Tree<Skill>;
            };

            const foo = mutateEveryTreeNode(copy, increaseLevel);

            if (foo) {
                foo.isRoot = false;
                foo.parentId = rootNode.data.id;
                foo.treeId = undefined;
                foo.treeName = undefined;

                children.push(foo);
            }
        }

        result = { ...rootNode, children };

        return result;
    }

    return (
        <View style={{ position: "relative", backgroundColor: colors.background, overflow: "hidden" }}>
            <GestureDetector gesture={canvasGestures}>
                <View style={[centerFlex, { height: screenDimentions.height - NAV_HEGIHT, width: screenDimentions.width }]}>
                    <Animated.View style={[transform]}>
                        <Canvas style={{ width: canvasWidth, height: canvasHeight }} mode="continuous">
                            <CanvasTree
                                stateProps={{ selectedNode: null, showLabel: true, nodeCoordinatesCentered: nodeCoordinatesCentered }}
                                tree={bigasstree}
                                wholeTree={bigasstree}
                                treeAccentColor={bigasstree.accentColor!}
                                rootCoordinates={{ width: 0, height: 0 }}
                                isRadial
                            />
                            {Circles()}
                        </Canvas>
                    </Animated.View>
                </View>
            </GestureDetector>
        </View>
    );
    function Circles() {
        const rootNode = nodeCoordinatesCentered.find((n) => n.level === 0);

        if (!rootNode) return <></>;

        const rootNodeCoord = { x: rootNode.x, y: rootNode.y };

        const levels = Math.max(...nodeCoordinatesCentered.map((c) => c.level));

        const levelsArray = [...Array(levels + 1).keys()];

        return levelsArray.map((level, idx) => {
            return (
                <Circle
                    key={idx}
                    cx={rootNodeCoord.x}
                    cy={rootNodeCoord.y}
                    r={level * DISTANCE_BETWEEN_GENERATIONS}
                    color="lightblue"
                    style={"stroke"}
                    opacity={0.5}>
                    <DashPathEffect intervals={[20, 20]} />
                </Circle>
            );
        });
    }
}

export default Homepage;
