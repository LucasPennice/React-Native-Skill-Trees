import { Canvas, Circle, DashPathEffect } from "@shopify/react-native-skia";
import { View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { cartesianToPositivePolarCoordinates } from "../../functions/coordinateSystem";
import { NAV_HEGIHT, centerFlex, colors } from "../../parameters";
import { useAppSelector } from "../../redux/reduxHooks";
import { selectScreenDimentions } from "../../redux/screenDimentionsSlice";
import { Skill, Tree } from "../../types";
import CanvasTree from "../viewingSkillTree/canvas/CanvasTree";
import { BombasticToNormal, centerNodesInCanvas, getCanvasDimensions, getNodesCoordinates } from "../viewingSkillTree/canvas/coordinateFunctions";
import useHandleCanvasScroll from "../viewingSkillTree/canvas/hooks/useHandleCanvasScroll";

const mockInputTree: Tree<Skill> = {
    treeName: "Teat",
    accentColor: "#FED739",
    isRoot: true,
    parentId: null,
    treeId: "5TFyIFSOPdyWM4BTORuqmyjB",
    level: 0,
    nodeId: "OEYV9lGXxT9osAsdR0gbg0qx",
    children: [
        {
            treeName: "Teat",
            accentColor: "#FED739",
            isRoot: false,
            parentId: "OEYV9lGXxT9osAsdR0gbg0qx",
            treeId: "5TFyIFSOPdyWM4BTORuqmyjB",
            level: 1,
            nodeId: "S6OQ0keJsWq6ehPavkyuhYQc",
            children: [
                {
                    treeName: "Teat",
                    accentColor: "#FED739",
                    isRoot: false,
                    parentId: "S6OQ0keJsWq6ehPavkyuhYQc",
                    treeId: "5TFyIFSOPdyWM4BTORuqmyjB",
                    level: 2,
                    nodeId: "1",
                    children: [
                        {
                            treeName: "Teat",
                            accentColor: "#FED739",
                            isRoot: false,
                            parentId: "1",
                            treeId: "5TFyIFSOPdyWM4BTORuqmyjB",
                            level: 2,
                            nodeId: "1-1",
                            children: [],
                            x: 0,
                            y: 240,
                            data: { name: "3", isCompleted: false },
                        },
                        {
                            treeName: "Teat",
                            accentColor: "#FED739",
                            isRoot: false,
                            parentId: "1",
                            treeId: "5TFyIFSOPdyWM4BTORuqmyjB",
                            level: 2,
                            nodeId: "1-2",
                            children: [],
                            x: 0,
                            y: 240,
                            data: { name: "3", isCompleted: false },
                        },
                        {
                            treeName: "Teat",
                            accentColor: "#FED739",
                            isRoot: false,
                            parentId: "1",
                            treeId: "5TFyIFSOPdyWM4BTORuqmyjB",
                            level: 2,
                            nodeId: "1-3",
                            children: [],
                            x: 0,
                            y: 240,
                            data: { name: "3", isCompleted: false },
                        },
                    ],
                    x: 0,
                    y: 240,
                    data: { name: "3", isCompleted: false },
                },
                {
                    treeName: "Teat",
                    accentColor: "#FED739",
                    isRoot: false,
                    parentId: "S6OQ0keJsWq6ehPavkyuhYQc",
                    treeId: "5TFyIFSOPdyWM4BTORuqmyjB",
                    level: 2,
                    nodeId: "2",
                    children: [
                        {
                            treeName: "Teat",
                            accentColor: "#FED739",
                            isRoot: false,
                            parentId: "2",
                            treeId: "5TFyIFSOPdyWM4BTORuqmyjB",
                            level: 2,
                            nodeId: "2-1",
                            children: [],
                            x: 0,
                            y: 240,
                            data: { name: "3", isCompleted: false },
                        },
                        {
                            treeName: "Teat",
                            accentColor: "#FED739",
                            isRoot: false,
                            parentId: "2",
                            treeId: "5TFyIFSOPdyWM4BTORuqmyjB",
                            level: 2,
                            nodeId: "2-2",
                            children: [],
                            x: 0,
                            y: 240,
                            data: { name: "3", isCompleted: false },
                        },
                        {
                            treeName: "Teat",
                            accentColor: "#FED739",
                            isRoot: false,
                            parentId: "2",
                            treeId: "5TFyIFSOPdyWM4BTORuqmyjB",
                            level: 2,
                            nodeId: "2-3",
                            children: [],
                            x: 0,
                            y: 240,
                            data: { name: "3", isCompleted: false },
                        },
                        {
                            treeName: "Teat",
                            accentColor: "#FED739",
                            isRoot: false,
                            parentId: "2",
                            treeId: "5TFyIFSOPdyWM4BTORuqmyjB",
                            level: 2,
                            nodeId: "2-4",
                            children: [],
                            x: 0,
                            y: 240,
                            data: { name: "3", isCompleted: false },
                        },
                    ],
                    x: 0,
                    y: 240,
                    data: { name: "3", isCompleted: false },
                },
            ],
            x: 0,
            y: 120,
            data: { name: "Teat", isCompleted: false },
        },
        {
            treeName: "Teat",
            accentColor: "#FED739",
            isRoot: false,
            parentId: "OEYV9lGXxT9osAsdR0gbg0qx",
            treeId: "5TFyIFSOPdyWM4BTORuqmyjB",
            level: 1,
            nodeId: "S",
            children: [
                {
                    treeName: "Teat",
                    accentColor: "#FED739",
                    isRoot: false,
                    parentId: "S",
                    treeId: "5TFyIFSOPdyWM4BTORuqmyjB",
                    level: 2,
                    nodeId: "S-1",
                    children: [
                        {
                            treeName: "Teat",
                            accentColor: "#FED739",
                            isRoot: false,
                            parentId: "S-1",
                            treeId: "5TFyIFSOPdyWM4BTORuqmyjB",
                            level: 2,
                            nodeId: "S1-1",
                            children: [],
                            x: 0,
                            y: 240,
                            data: { name: "3", isCompleted: false },
                        },
                        {
                            treeName: "Teat",
                            accentColor: "#FED739",
                            isRoot: false,
                            parentId: "S-1",
                            treeId: "5TFyIFSOPdyWM4BTORuqmyjB",
                            level: 2,
                            nodeId: "S1-2",
                            children: [],
                            x: 0,
                            y: 240,
                            data: { name: "3", isCompleted: false },
                        },
                        {
                            treeName: "Teat",
                            accentColor: "#FED739",
                            isRoot: false,
                            parentId: "S-1",
                            treeId: "5TFyIFSOPdyWM4BTORuqmyjB",
                            level: 2,
                            nodeId: "S1-3",
                            children: [],
                            x: 0,
                            y: 240,
                            data: { name: "3", isCompleted: false },
                        },
                    ],
                    x: 0,
                    y: 240,
                    data: { name: "3", isCompleted: false },
                },
                {
                    treeName: "Teat",
                    accentColor: "#FED739",
                    isRoot: false,
                    parentId: "S",
                    treeId: "5TFyIFSOPdyWM4BTORuqmyjB",
                    level: 2,
                    nodeId: "S-2",
                    children: [
                        {
                            treeName: "Teat",
                            accentColor: "#FED739",
                            isRoot: false,
                            parentId: "2",
                            treeId: "5TFyIFSOPdyWM4BTORuqmyjB",
                            level: 2,
                            nodeId: "S2-1",
                            children: [],
                            x: 0,
                            y: 240,
                            data: { name: "3", isCompleted: false },
                        },
                        {
                            treeName: "Teat",
                            accentColor: "#FED739",
                            isRoot: false,
                            parentId: "2",
                            treeId: "5TFyIFSOPdyWM4BTORuqmyjB",
                            level: 2,
                            nodeId: "S2-2",
                            children: [],
                            x: 0,
                            y: 240,
                            data: { name: "3", isCompleted: false },
                        },
                        {
                            treeName: "Teat",
                            accentColor: "#FED739",
                            isRoot: false,
                            parentId: "2",
                            treeId: "5TFyIFSOPdyWM4BTORuqmyjB",
                            level: 2,
                            nodeId: "S2-3",
                            children: [],
                            x: 0,
                            y: 240,
                            data: { name: "3", isCompleted: false },
                        },
                        {
                            treeName: "Teat",
                            accentColor: "#FED739",
                            isRoot: false,
                            parentId: "2",
                            treeId: "5TFyIFSOPdyWM4BTORuqmyjB",
                            level: 2,
                            nodeId: "S2-4",
                            children: [],
                            x: 0,
                            y: 240,
                            data: { name: "3", isCompleted: false },
                        },
                    ],
                    x: 0,
                    y: 240,
                    data: { name: "3", isCompleted: false },
                },
            ],
            x: 0,
            y: 120,
            data: { name: "Teat", isCompleted: false },
        },
        {
            treeName: "Teat",
            accentColor: "#FED739",
            isRoot: false,
            parentId: "OEYV9lGXxT9osAsdR0gbg0qx",
            treeId: "5TFyIFSOPdyWM4BTORuqmyjB",
            level: 1,
            nodeId: "T",
            children: [
                {
                    treeName: "Teat",
                    accentColor: "#FED739",
                    isRoot: false,
                    parentId: "T",
                    treeId: "5TFyIFSOPdyWM4BTORuqmyjB",
                    level: 2,
                    nodeId: "T-1",
                    children: [
                        {
                            treeName: "Teat",
                            accentColor: "#FED739",
                            isRoot: false,
                            parentId: "T-1",
                            treeId: "5TFyIFSOPdyWM4BTORuqmyjB",
                            level: 2,
                            nodeId: "T1-1",
                            children: [],
                            x: 0,
                            y: 240,
                            data: { name: "3", isCompleted: false },
                        },
                        {
                            treeName: "Teat",
                            accentColor: "#FED739",
                            isRoot: false,
                            parentId: "T-1",
                            treeId: "5TFyIFSOPdyWM4BTORuqmyjB",
                            level: 2,
                            nodeId: "T1-2",
                            children: [],
                            x: 0,
                            y: 240,
                            data: { name: "3", isCompleted: false },
                        },
                        {
                            treeName: "Teat",
                            accentColor: "#FED739",
                            isRoot: false,
                            parentId: "T-1",
                            treeId: "5TFyIFSOPdyWM4BTORuqmyjB",
                            level: 2,
                            nodeId: "T1-3",
                            children: [],
                            x: 0,
                            y: 240,
                            data: { name: "3", isCompleted: false },
                        },
                    ],
                    x: 0,
                    y: 240,
                    data: { name: "3", isCompleted: false },
                },
                {
                    treeName: "Teat",
                    accentColor: "#FED739",
                    isRoot: false,
                    parentId: "T",
                    treeId: "5TFyIFSOPdyWM4BTORuqmyjB",
                    level: 2,
                    nodeId: "T-2",
                    children: [
                        {
                            treeName: "Teat",
                            accentColor: "#FED739",
                            isRoot: false,
                            parentId: "T-2",
                            treeId: "5TFyIFSOPdyWM4BTORuqmyjB",
                            level: 2,
                            nodeId: "T2-1",
                            children: [],
                            x: 0,
                            y: 240,
                            data: { name: "3", isCompleted: false },
                        },
                        {
                            treeName: "Teat",
                            accentColor: "#FED739",
                            isRoot: false,
                            parentId: "T-2",
                            treeId: "5TFyIFSOPdyWM4BTORuqmyjB",
                            level: 2,
                            nodeId: "T2-2",
                            children: [],
                            x: 0,
                            y: 240,
                            data: { name: "3", isCompleted: false },
                        },
                        {
                            treeName: "Teat",
                            accentColor: "#FED739",
                            isRoot: false,
                            parentId: "T-2",
                            treeId: "5TFyIFSOPdyWM4BTORuqmyjB",
                            level: 2,
                            nodeId: "T2-3",
                            children: [],
                            x: 0,
                            y: 240,
                            data: { name: "3", isCompleted: false },
                        },
                        {
                            treeName: "Teat",
                            accentColor: "#FED739",
                            isRoot: false,
                            parentId: "T-2",
                            treeId: "5TFyIFSOPdyWM4BTORuqmyjB",
                            level: 2,
                            nodeId: "T2-4",
                            children: [],
                            x: 0,
                            y: 240,
                            data: { name: "3", isCompleted: false },
                        },
                    ],
                    x: 0,
                    y: 240,
                    data: { name: "3", isCompleted: false },
                },
            ],
            x: 0,
            y: 120,
            data: { name: "Teat", isCompleted: false },
        },
    ],
    x: 0,
    y: 0,
    data: { name: "Root", isCompleted: true },
};

function Homepage() {
    //Redux State
    const screenDimentions = useAppSelector(selectScreenDimentions);
    //Derived State
    // const inputTree = getInputTree(userTrees);
    const BBnodeCoordinates = getNodesCoordinates(mockInputTree, "radial");
    const nodeCoordinates = BombasticToNormal(BBnodeCoordinates);
    const canvasDimentions = getCanvasDimensions(nodeCoordinates, screenDimentions);
    const { canvasHeight, canvasWidth } = canvasDimentions;
    const nodeCoordinatesCentered = centerNodesInCanvas(nodeCoordinates, canvasDimentions);

    const { canvasGestures, transform } = useHandleCanvasScroll(canvasDimentions);

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
