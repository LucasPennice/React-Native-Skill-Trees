import { Canvas, Circle, DashPathEffect } from "@shopify/react-native-skia";
import { View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { mutateEveryTreeNode } from "../../functions/mutateTree";
import { DISTANCE_BETWEEN_GENERATIONS, NAV_HEGIHT, centerFlex, colors } from "../../parameters";
import { useAppSelector } from "../../redux/reduxHooks";
import { selectScreenDimentions } from "../../redux/screenDimentionsSlice";
import { selectTreeSlice } from "../../redux/userTreesSlice";
import { Skill, Tree } from "../../types";
import CanvasTree from "../viewingSkillTree/canvas/CanvasTree";
import { centerNodesInCanvas, getCanvasDimensions, getNodesCoordinates } from "../viewingSkillTree/canvas/coordinateFunctions";
import useHandleCanvasScroll from "../viewingSkillTree/canvas/hooks/useHandleCanvasScroll";

//@ts-ignore
const mockInputTree: any = {
    treeName: "sexo",
    accentColor: colors.teal,
    isRoot: true,
    treeId: "hhgtht",
    data: { id: "qwdqwd", name: "M", isCompleted: false },
    children: [
        {
            accentColor: "#FE453A",
            data: { id: "PwdDIQKgTd4thrrCIyAMvxba", name: "O", isCompleted: false },
            children: [
                {
                    data: { id: "GYgNwPsZUyZwSqqNGCifTu4j", name: "E", isCompleted: true },
                    parentId: "PwdDIQKgTd4thrrCIyAMvxba",
                    children: [
                        {
                            data: { id: "b0t8rwWhXRKvhWSOg63xxnjd", name: "A", isCompleted: true },
                            parentId: "GYgNwPsZUyZwSqqNGCifTu4j",
                            level: null,
                            children: [
                                {
                                    data: { name: "B", isCompleted: true, id: "nqTxqixG7lWykOBWZmHqD2TR" },
                                    parentId: "wMrtmYv6fZ5fwKWvBUYQSkjM",
                                    level: null,
                                },
                                {
                                    data: { name: "H", isCompleted: true, id: "xzji1gGlLlufkVtmxlmIUCpg" },
                                    parentId: "wMrtmYv6fZ5fwKWvBUYQSkjM",
                                    level: null,
                                },
                            ],
                        },
                        {
                            data: { id: "HeqGZJeHMQk6Wy4DXJ5SkRCN", name: "D", isCompleted: true },
                            parentId: "GYgNwPsZUyZwSqqNGCifTu4j",
                            children: [
                                {
                                    data: { id: "WBNuDHHyBSZ5oFFy9fGaxPi2", name: "B", isCompleted: true },
                                    parentId: "HeqGZJeHMQk6Wy4DXJ5SkRCN",
                                    level: 4,
                                },
                                {
                                    data: { id: "nC7CICKKNVqllGO39FtILT5J", name: "C", isCompleted: true },
                                    parentId: "HeqGZJeHMQk6Wy4DXJ5SkRCN",
                                    level: 4,
                                },
                                {
                                    data: { name: "H", isCompleted: false, id: "LDzB2dTftEh5MIgNXXXwI7Yh" },
                                    parentId: "HeqGZJeHMQk6Wy4DXJ5SkRCN",
                                    x: null,
                                    level: 4,
                                },
                                {
                                    data: { name: "N", isCompleted: false, id: "UTOhW3HYarlRJDtpUJ9eXJ8r" },
                                    parentId: "HeqGZJeHMQk6Wy4DXJ5SkRCN",
                                    x: 100,
                                    level: 4,
                                },
                                {
                                    data: { name: "U", isCompleted: false, id: "ZMWWB7XbbFn0ulNFE9JWafPv" },
                                    parentId: "HeqGZJeHMQk6Wy4DXJ5SkRCN",
                                    x: 200,
                                    level: 4,
                                },
                                {
                                    data: { name: "J", isCompleted: false, id: "azKldOVLAD8rBAtbG4bs02ui" },
                                    parentId: "HeqGZJeHMQk6Wy4DXJ5SkRCN",
                                    x: 300,
                                    level: 4,
                                },
                                {
                                    data: { name: "Gg", isCompleted: false, id: "RkpvgNMvtsrEIHPE4D3fYhUe" },
                                    parentId: "HeqGZJeHMQk6Wy4DXJ5SkRCN",
                                    x: 400,
                                    level: 4,
                                },
                            ],
                            level: 3,
                        },
                    ],
                    level: 2,
                },
            ],
            level: 1,
            parentId: "lol",
        },
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
