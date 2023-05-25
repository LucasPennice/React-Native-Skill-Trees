import { Canvas, Circle, DashPathEffect, Path, useCanvasRef } from "@shopify/react-native-skia";
import { useMemo, useState } from "react";
import { Dimensions, FlatList, Pressable, SafeAreaView, ScrollView, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import CanvasSettingsModal from "../../components/CanvasSettingsModal";
import OpenSettingsMenu from "../../components/OpenSettingsMenu";
import ProgressIndicatorAndName from "../../components/ProgressIndicatorAndName";
import ShareTreeLayout from "../../components/takingScreenshot/ShareTreeLayout";
import { cartesianToPositivePolarCoordinates } from "../../functions/coordinateSystem";
import { mutateEveryTreeNode } from "../../functions/mutateTree";
import { NAV_HEGIHT, centerFlex, colors } from "../../parameters";
import { selectCanvasDisplaySettings } from "../../redux/canvasDisplaySettingsSlice";
import { useAppSelector } from "../../redux/reduxHooks";
import { selectSafeScreenDimentions } from "../../redux/screenDimentionsSlice";
import { selectTreeSlice } from "../../redux/userTreesSlice";
import { Skill, Tree, getDefaultSkillValue } from "../../types";
import {
    centerNodesInCanvas,
    getCanvasDimensions,
    getCoordinatedWithTreeData,
    getNodesCoordinates,
    removeTreeDataFromCoordinate,
} from "../viewingSkillTree/canvas/coordinateFunctions";
import useHandleCanvasScroll from "../viewingSkillTree/canvas/hooks/useHandleCanvasScroll";
import RadialSkillTree from "./RadialSkillTree";
import AppText from "../../components/AppText";
import { generalStyles } from "../../styles";

function Homepage() {
    //Redux State
    const screenDimentions = useAppSelector(selectSafeScreenDimentions);
    const { showLabel, oneColorPerTree, showCircleGuide, homepageTreeColor } = useAppSelector(selectCanvasDisplaySettings);
    const { userTrees } = useAppSelector(selectTreeSlice);
    //State
    const [isTakingScreenshot, setIsTakingScreenshot] = useState(false);
    const [canvasSettings, setCanvasSettings] = useState(false);
    //Derived State
    const homepageTree = buildHomepageTree(userTrees, homepageTreeColor);
    const cachedTreeBuild = useMemo(() => handleTreeBuild(homepageTree, screenDimentions), [homepageTree, screenDimentions]);
    const { canvasDimentions, centeredCoordinatedWithTreeData, nodeCoordinatesCentered } = cachedTreeBuild;
    const { canvasHeight, canvasWidth } = canvasDimentions;

    const { canvasGestures, transform } = useHandleCanvasScroll(canvasDimentions, undefined);

    const canvasRef = useCanvasRef();

    return (
        <View style={{ position: "relative", backgroundColor: colors.background, overflow: "hidden" }}>
            <>
                <GestureDetector gesture={canvasGestures}>
                    <View style={[centerFlex, { height: screenDimentions.height - NAV_HEGIHT, width: screenDimentions.width }]}>
                        <Animated.View style={[transform]}>
                            <Canvas style={{ width: canvasWidth, height: canvasHeight }} ref={canvasRef}>
                                {showCircleGuide && <Circles />}
                                <RadialSkillTree
                                    nodeCoordinatesCentered={centeredCoordinatedWithTreeData}
                                    selectedNode={null}
                                    settings={{ showLabel, oneColorPerTree }}
                                />
                            </Canvas>
                        </Animated.View>
                    </View>
                </GestureDetector>
                <ProgressIndicatorAndName tree={homepageTree} />
                <OpenSettingsMenu openModal={() => setCanvasSettings(true)} />
                <ShareTreeLayout
                    canvasRef={canvasRef}
                    shouldShare
                    takingScreenShotState={[isTakingScreenshot, setIsTakingScreenshot]}
                    tree={homepageTree}
                />
                <CanvasSettingsModal open={canvasSettings} closeModal={() => setCanvasSettings(false)} />
            </>
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

function buildHomepageTree(userTrees: Tree<Skill>[], homepageTreeColor: string) {
    const ROOT_ID = "homepageRoot";

    const modifiedUserTrees = userTrees.map((uT) => {
        const treeWithUpdatedLevel = mutateEveryTreeNode(uT, increaseLevelByOne);

        if (!treeWithUpdatedLevel) throw "buildHomepageTree not treeWithUpdatedLevel";

        return { ...treeWithUpdatedLevel, isRoot: false, parentId: ROOT_ID };
    });

    const result: Tree<Skill> = {
        accentColor: homepageTreeColor,
        nodeId: ROOT_ID,
        isRoot: true,
        children: modifiedUserTrees,
        data: getDefaultSkillValue("Skill", false, { isEmoji: false, text: "S" }),
        level: 0,
        parentId: null,
        treeId: "HomepageTree",
        treeName: "Life Skills",
        x: 0,
        y: 0,
        category: "USER",
    };

    return result;

    function increaseLevelByOne(tree: Tree<Skill>): Tree<Skill> {
        return { ...tree, level: tree.level + 1 };
    }
}

function handleTreeBuild(homepageTree: Tree<Skill>, screenDimentions: { width: number; height: number }) {
    const coordinatesWithTreeData = getNodesCoordinates(homepageTree, "radial");
    //
    const nodeCoordinates = removeTreeDataFromCoordinate(coordinatesWithTreeData);
    const canvasDimentions = getCanvasDimensions(nodeCoordinates, screenDimentions);
    const nodeCoordinatesCentered = centerNodesInCanvas(nodeCoordinates, canvasDimentions);
    //
    const centeredCoordinatedWithTreeData = getCoordinatedWithTreeData(coordinatesWithTreeData, nodeCoordinatesCentered);

    return { canvasDimentions, centeredCoordinatedWithTreeData, nodeCoordinatesCentered };
}
