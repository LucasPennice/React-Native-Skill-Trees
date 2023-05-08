import { Canvas, Circle, DashPathEffect } from "@shopify/react-native-skia";
import { View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { cartesianToPositivePolarCoordinates } from "../../functions/coordinateSystem";
import { mutateEveryTreeNode } from "../../functions/mutateTree";
import { NAV_HEGIHT, centerFlex, colors } from "../../parameters";
import { useAppSelector } from "../../redux/reduxHooks";
import { selectScreenDimentions } from "../../redux/screenDimentionsSlice";
import { selectTreeSlice } from "../../redux/userTreesSlice";
import { Skill, Tree } from "../../types";
import {
    centerNodesInCanvas,
    getCanvasDimensions,
    getCoordinatedWithTreeData,
    getNodesCoordinates,
    removeTreeDataFromCoordinate,
} from "../viewingSkillTree/canvas/coordinateFunctions";
import useHandleCanvasScroll from "../viewingSkillTree/canvas/hooks/useHandleCanvasScroll";
import RadialSkillTree from "./RadialSkillTree";
import ProgressIndicatorAndName from "../../components/ProgressIndicatorAndName";

function Homepage() {
    //Redux State
    const screenDimentions = useAppSelector(selectScreenDimentions);
    const { userTrees } = useAppSelector(selectTreeSlice);
    //Derived State
    const homepageTree = buildHomepageTree(userTrees);
    const coordinatesWithTreeData = getNodesCoordinates(homepageTree, "radial");
    //
    const nodeCoordinates = removeTreeDataFromCoordinate(coordinatesWithTreeData);
    const canvasDimentions = getCanvasDimensions(nodeCoordinates, screenDimentions);
    const { canvasHeight, canvasWidth } = canvasDimentions;
    const nodeCoordinatesCentered = centerNodesInCanvas(nodeCoordinates, canvasDimentions);
    //
    const centeredCoordinatedWithTreeData = getCoordinatedWithTreeData(coordinatesWithTreeData, nodeCoordinatesCentered);

    const { canvasGestures, transform } = useHandleCanvasScroll(canvasDimentions);

    return (
        <View style={{ position: "relative", backgroundColor: colors.background, overflow: "hidden" }}>
            {homepageTree.children.length != 0 && (
                <>
                    <GestureDetector gesture={canvasGestures}>
                        <View style={[centerFlex, { height: screenDimentions.height - NAV_HEGIHT, width: screenDimentions.width }]}>
                            <Animated.View style={[transform]}>
                                <Canvas style={{ width: canvasWidth, height: canvasHeight }} mode="continuous">
                                    <Circles />
                                    <RadialSkillTree nodeCoordinatesCentered={centeredCoordinatedWithTreeData} selectedNode={null} />
                                </Canvas>
                            </Animated.View>
                        </View>
                    </GestureDetector>
                    <ProgressIndicatorAndName tree={homepageTree} />
                </>
            )}
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

function buildHomepageTree(userTrees: Tree<Skill>[]) {
    const ROOT_ID = "homepageRoot";

    const modifiedUserTrees = userTrees.map((uT) => {
        const treeWithUpdatedLevel = mutateEveryTreeNode(uT, increaseLevelByOne);

        if (!treeWithUpdatedLevel) throw "buildHomepageTree not treeWithUpdatedLevel";

        return { ...treeWithUpdatedLevel, isRoot: false, parentId: ROOT_ID };
    });

    const result: Tree<Skill> = {
        accentColor: "#FFFFFF",
        nodeId: ROOT_ID,
        isRoot: true,
        children: modifiedUserTrees,
        data: { name: "Root", isCompleted: false },
        level: 0,
        parentId: null,
        treeId: "HomepageTree",
        treeName: "Your Skill Tree",
        x: 0,
        y: 0,
    };

    return result;

    function increaseLevelByOne(tree: Tree<Skill>): Tree<Skill> {
        return { ...tree, level: tree.level + 1 };
    }
}
