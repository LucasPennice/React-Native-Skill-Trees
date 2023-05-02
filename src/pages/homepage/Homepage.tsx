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
import { cartesianToPositivePolarCoordinates } from "../../functions/coordinateSystem";

//@ts-ignore
const mockInputTree: any = {
    treeName: "sexo",
    accentColor: colors.teal,
    isRoot: true,
    treeId: "hhgtht",
    data: { id: "PADRE", name: "PADRE", isCompleted: false },
    children: [
        {
            accentColor: "#FE453A",
            data: { id: "FIRST", name: "FIRST", isCompleted: false },
            level: 1,
            parentId: "PADRE",
            children: [
                {
                    data: { name: "F-1", isCompleted: false, id: "F-1" },
                    parentId: "FIRST",
                    children: [
                        {
                            data: { name: "F-1-1", isCompleted: true, id: "F-1-1" },
                            parentId: "F-1",
                            level: null,
                        },
                        {
                            data: { name: "F-1-2", isCompleted: true, id: "F-1-2" },
                            parentId: "F-1",
                            level: null,
                        },
                        { data: { name: "F-1-3", isCompleted: true, id: "F-1-3" }, parentId: "F-1", level: null },
                        { data: { name: "F-1-4", isCompleted: true, id: "F-1-4" }, parentId: "F-1", level: null },
                    ],
                    level: null,
                },
                {
                    data: { name: "F-2", isCompleted: true, id: "F-2" },
                    parentId: "FIRST",
                    children: [
                        { data: { name: "F-2-1", isCompleted: true, id: "F-2-1" }, parentId: "F-2", level: null },
                        {
                            data: { name: "F-2-2", isCompleted: true, id: "F-2-2" },
                            parentId: "F-2",
                            level: null,
                        },
                        {
                            data: { name: "F-2-3", isCompleted: true, id: "F-2-3" },
                            parentId: "F-2",
                            level: null,
                        },
                    ],
                    level: null,
                },
            ],
        },
        {
            accentColor: "#FF9F23",
            isRoot: false,
            data: { id: "SECOND", name: "SECOND", isCompleted: true },
            children: [
                {
                    data: { name: "S-1", isCompleted: false, id: "S-1" },
                    parentId: "SECOND",
                    children: [
                        {
                            data: { name: "S-1-1", isCompleted: true, id: "S-1-1" },
                            parentId: "S-1",
                            level: null,
                        },
                        {
                            data: { name: "S-1-2", isCompleted: true, id: "S-1-2" },
                            parentId: "S-1",
                            level: null,
                        },
                        { data: { name: "S-1-3", isCompleted: true, id: "S-1-3" }, parentId: "S-1", level: null },
                        { data: { name: "S-1-4", isCompleted: true, id: "S-1-4" }, parentId: "S-1", level: null },
                    ],
                    level: null,
                },
                {
                    data: { name: "S-2", isCompleted: true, id: "S-2" },
                    parentId: "SECOND",
                    children: [
                        { data: { name: "S-2-1", isCompleted: true, id: "S-2-1" }, parentId: "S-2", level: null },
                        {
                            data: { name: "S-2-2", isCompleted: true, id: "S-2-2" },
                            parentId: "S-2",
                            level: null,
                        },
                        {
                            data: { name: "S-2-3", isCompleted: true, id: "S-2-3" },
                            parentId: "S-2",
                            level: null,
                        },
                    ],
                    level: null,
                },
            ],
            level: 1,
            parentId: "PADRE",
        },
        {
            accentColor: "#FF9F23",
            isRoot: false,
            data: { id: "THIRD", name: "THIRD", isCompleted: true },
            children: [
                {
                    data: { name: "T-1", isCompleted: false, id: "T-1" },
                    parentId: "THIRD",
                    children: [
                        {
                            data: { name: "T-1-1", isCompleted: true, id: "T-1-1" },
                            parentId: "T-1",
                            level: null,
                        },
                        {
                            data: { name: "T-1-2", isCompleted: true, id: "T-1-2" },
                            parentId: "T-1",
                            level: null,
                        },
                        { data: { name: "T-1-3", isCompleted: true, id: "T-1-3" }, parentId: "T-1", level: null },
                        { data: { name: "T-1-4", isCompleted: true, id: "T-1-4" }, parentId: "T-1", level: null },
                    ],
                    level: null,
                },
                {
                    data: { name: "T-2", isCompleted: true, id: "T-2" },
                    parentId: "THIRD",
                    children: [
                        { data: { name: "T-2-1", isCompleted: true, id: "T-2-1" }, parentId: "T-2", level: null },
                        {
                            data: { name: "T-2-2", isCompleted: true, id: "T-2-2" },
                            parentId: "T-2",
                            level: null,
                        },
                        {
                            data: { name: "T-2-3", isCompleted: true, id: "T-2-3" },
                            parentId: "T-2",
                            level: null,
                        },
                    ],
                    level: null,
                },
            ],
            level: 1,
            parentId: "PADRE",
        },
        {
            accentColor: "#FF9F23",
            isRoot: false,
            data: { id: "FOURTH", name: "FOURTH", isCompleted: true },
            children: [
                {
                    data: { name: "FF-1", isCompleted: false, id: "FF-1" },
                    parentId: "FOURTH",
                    children: [
                        {
                            data: { name: "FF-1-1", isCompleted: true, id: "FF-1-1" },
                            parentId: "FF-1",
                            level: null,
                        },
                        {
                            data: { name: "FF-1-2", isCompleted: true, id: "FF-1-2" },
                            parentId: "FF-1",
                            level: null,
                        },
                        { data: { name: "FF-1-3", isCompleted: true, id: "FF-1-3" }, parentId: "FF-1", level: null },
                        { data: { name: "FF-1-4", isCompleted: true, id: "FF-1-4" }, parentId: "FF-1", level: null },
                    ],
                    level: null,
                },
                {
                    data: { name: "FF-2", isCompleted: true, id: "FF-2" },
                    parentId: "FOURTH",
                    children: [
                        { data: { name: "FF-2-1", isCompleted: true, id: "FF-2-1" }, parentId: "FF-2", level: null },
                        {
                            data: { name: "FF-2-2", isCompleted: true, id: "FF-2-2" },
                            parentId: "FF-2",
                            level: null,
                        },
                        {
                            data: { name: "FF-2-3", isCompleted: true, id: "FF-2-3" },
                            parentId: "FF-2",
                            level: null,
                        },
                    ],
                    level: null,
                },
            ],
            level: 1,
            parentId: "PADRE",
        },
        {
            accentColor: "#FF9F23",
            isRoot: false,
            data: { id: "FIFTH", name: "FIFTH", isCompleted: true },
            children: [
                {
                    data: { name: "FFF-1", isCompleted: false, id: "FFF-1" },
                    parentId: "FIFTH",
                    children: [
                        {
                            data: { name: "FFF-1-1", isCompleted: true, id: "FFF-1-1" },
                            parentId: "FFF-1",
                            level: null,
                        },
                        {
                            data: { name: "FFF-1-2", isCompleted: true, id: "FFF-1-2" },
                            parentId: "FFF-1",
                            level: null,
                        },
                        { data: { name: "FFF-1-3", isCompleted: true, id: "FFF-1-3" }, parentId: "FFF-1", level: null },
                        { data: { name: "FFF-1-4", isCompleted: true, id: "FFF-1-4" }, parentId: "FFF-1", level: null },
                    ],
                    level: null,
                },
                {
                    data: { name: "FFF-2", isCompleted: true, id: "FFF-2" },
                    parentId: "FIFTH",
                    children: [
                        { data: { name: "FFF-2-1", isCompleted: true, id: "FFF-2-1" }, parentId: "FFF-2", level: null },
                        {
                            data: { name: "FFF-2-2", isCompleted: true, id: "FFF-2-2" },
                            parentId: "FFF-2",
                            level: null,
                        },
                        {
                            data: { name: "FFF-2-3", isCompleted: true, id: "FFF-2-3" },
                            parentId: "FFF-2",
                            level: null,
                        },
                    ],
                    level: null,
                },
            ],
            level: 1,
            parentId: "PADRE",
        },
        {
            accentColor: "#FF9F23",
            isRoot: false,
            data: { id: "SIXTH", name: "SIXTH", isCompleted: true },
            children: [
                {
                    data: { name: "SS-1", isCompleted: false, id: "SS-1" },
                    parentId: "SIXTH",
                    children: [
                        {
                            data: { name: "SS-1-1", isCompleted: true, id: "SS-1-1" },
                            parentId: "SS-1",
                            level: null,
                        },
                        {
                            data: { name: "SS-1-2", isCompleted: true, id: "SS-1-2" },
                            parentId: "SS-1",
                            level: null,
                        },
                        { data: { name: "SS-1-3", isCompleted: true, id: "SS-1-3" }, parentId: "SS-1", level: null },
                        { data: { name: "SS-1-4", isCompleted: true, id: "SS-1-4" }, parentId: "SS-1", level: null },
                    ],
                    level: null,
                },
                {
                    data: { name: "SS-2", isCompleted: true, id: "SS-2" },
                    parentId: "SIXTH",
                    children: [
                        { data: { name: "SS-2-1", isCompleted: true, id: "SS-2-1" }, parentId: "SS-2", level: null },
                        {
                            data: { name: "SS-2-2", isCompleted: true, id: "SS-2-2" },
                            parentId: "SS-2",
                            level: null,
                        },
                        {
                            data: { name: "SS-2-3", isCompleted: true, id: "SS-2-3" },
                            parentId: "SS-2",
                            level: null,
                        },
                    ],
                    level: null,
                },
            ],
            level: 1,
            parentId: "PADRE",
        },
        // {
        //     accentColor: "#FF9F23",
        //     isRoot: false,
        //     data: { id: "HOLA", name: "HOLA", isCompleted: true },
        //     level: 1,
        //     parentId: "PADRE",
        // },
        // {
        //     accentColor: "#FF9F23",
        //     isRoot: false,
        //     data: { id: "11", name: "11", isCompleted: true },
        //     level: 1,
        //     parentId: "PADRE",
        // },
        // {
        //     accentColor: "#FF9F23",
        //     isRoot: false,
        //     data: { id: "22", name: "22", isCompleted: true },
        //     level: 1,
        //     parentId: "PADRE",
        // },
        // {
        //     accentColor: "#FF9F23",
        //     isRoot: false,
        //     data: { id: "33", name: "33", isCompleted: true },
        //     level: 1,
        //     parentId: "PADRE",
        // },
        // {
        //     accentColor: "#FF9F23",
        //     isRoot: false,
        //     data: { id: "44", name: "44", isCompleted: true },
        //     level: 1,
        //     parentId: "PADRE",
        // },
        // {
        //     accentColor: "#FF9F23",
        //     isRoot: false,
        //     data: { id: "55", name: "55", isCompleted: true },
        //     level: 1,
        //     parentId: "PADRE",
        // },
    ],
};

function Homepage() {
    //Redux State
    const screenDimentions = useAppSelector(selectScreenDimentions);
    //Derived State
    // const inputTree = getInputTree(userTrees);
    const nodeCoordinates = getNodesCoordinates(mockInputTree, "radial");
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
                                tree={mockInputTree}
                                wholeTree={mockInputTree}
                                treeAccentColor={mockInputTree.accentColor!}
                                rootCoordinates={{ width: 0, height: 0 }}
                                isRadial
                            />
                            <Circles />
                        </Canvas>
                    </Animated.View>
                </View>
            </GestureDetector>
        </View>
    );
    function Circles() {
        const rootNode = nodeCoordinatesCentered.find((n) => n.level === 0);

        if (!rootNode) return <></>;

        const levelDistances = getLevelDistances();

        const rootNodeCoord = { x: rootNode.x, y: rootNode.y };

        return (
            <>
                {levelDistances.map((r, idx) => {
                    return (
                        <Circle key={idx} cx={rootNodeCoord.x} cy={rootNodeCoord.y} r={r} color="gray" style={"stroke"} opacity={0.7}>
                            <DashPathEffect intervals={[10, 10]} />
                        </Circle>
                    );
                })}
            </>
        );

        function getLevelDistances() {
            const result: number[] = [];

            for (let i = 0; i < nodeCoordinatesCentered.length; i++) {
                const element = nodeCoordinatesCentered[i];

                if (result[element.level] === undefined) {
                    const polarCoord = cartesianToPositivePolarCoordinates({ x: element.x, y: element.y }, { x: rootNode!.x, y: rootNode!.y });

                    result[element.level] = polarCoord.distanceToCenter;
                }
            }

            return result;
        }
    }
}

export default Homepage;
