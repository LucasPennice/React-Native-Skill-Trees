import { Canvas } from "@shopify/react-native-skia";
import { View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { NAV_HEGIHT, centerFlex, colors } from "../../parameters";
import { useAppSelector } from "../../redux/reduxHooks";
import { selectScreenDimentions } from "../../redux/screenDimentionsSlice";
import CanvasTree from "../viewingSkillTree/canvas/CanvasTree";
import { centerNodesInCanvas, getCanvasDimensions, getNodesCoordinates } from "../viewingSkillTree/canvas/coordinateFunctions";
import useHandleCanvasScroll from "../viewingSkillTree/canvas/hooks/useHandleCanvasScroll";
import { useState } from "react";

//@ts-ignore
const mockInputTree: any = {
    treeName: "Yeyey",
    accentColor: "#FE453A",
    isRoot: true,
    treeId: "aA2KoIy5MPJGjpowpIhW2nAG",
    data: { id: "PwdDIQKgTd4thrrCIyAMvxba", name: "O", isCompleted: true },
    children: [
        {
            data: { id: "GYgNwPsZUyZwSqqNGCifTu4j", name: "E", isCompleted: true },
            parentId: "PwdDIQKgTd4thrrCIyAMvxba",
            children: [
                { data: { id: "b0t8rwWhXRKvhWSOg63xxnjd", name: "A", isCompleted: true }, parentId: "GYgNwPsZUyZwSqqNGCifTu4j" },
                {
                    data: { id: "HeqGZJeHMQk6Wy4DXJ5SkRCN", name: "D", isCompleted: true },
                    parentId: "GYgNwPsZUyZwSqqNGCifTu4j",
                    children: [
                        { data: { id: "WBNuDHHyBSZ5oFFy9fGaxPi2", name: "B", isCompleted: true }, parentId: "HeqGZJeHMQk6Wy4DXJ5SkRCN" },
                        { data: { id: "nC7CICKKNVqllGO39FtILT5J", name: "C", isCompleted: true }, parentId: "HeqGZJeHMQk6Wy4DXJ5SkRCN" },
                    ],
                },
            ],
        },
        {
            data: { name: "V", isCompleted: true, id: "NFD4JLxMd49ZalvJy0hPInZs" },
            parentId: "PwdDIQKgTd4thrrCIyAMvxba",
            children: [
                { data: { id: "deVbVxx7zrtQ1LEGjIQvoC1c", name: "Ccc", isCompleted: true }, parentId: "NFD4JLxMd49ZalvJy0hPInZs", isRoot: false },
                { data: { name: "Brain", isCompleted: true, id: "hdcnmNstaaoE2B67Y2PcFaXe" }, parentId: "NFD4JLxMd49ZalvJy0hPInZs" },
            ],
        },
        {
            data: { id: "YyzrFR5TdsMQWS1VqnTwoiBo", name: "Olis", isCompleted: true },
            parentId: "PwdDIQKgTd4thrrCIyAMvxba",
            children: [
                {
                    data: { id: "mFSXLb8hkeQ1b1Ad8qmkQL2b", name: "M", isCompleted: true },
                    parentId: "YyzrFR5TdsMQWS1VqnTwoiBo",
                    children: [
                        { data: { id: "CcQEJSA9enqrO6IagnNJlVs7", name: "I", isCompleted: true }, parentId: "mFSXLb8hkeQ1b1Ad8qmkQL2b" },
                        { data: { name: "Peter", isCompleted: true, id: "FBhcwbiHwmKglqbrk9V2mv5r" }, parentId: "mFSXLb8hkeQ1b1Ad8qmkQL2b" },
                        { data: { id: "ylinc2QVj5NejYnkBHGQsqFS", name: "K", isCompleted: true }, parentId: "mFSXLb8hkeQ1b1Ad8qmkQL2b" },
                        { data: { id: "OUWea3GMfqGiq5a3D855MLZA", name: "L", isCompleted: true }, parentId: "mFSXLb8hkeQ1b1Ad8qmkQL2b" },
                    ],
                },
            ],
        },
        {
            data: { id: "2fHFHxAJBuznIYcXnpuvdfzZ", name: "Vbn", isCompleted: true },
            parentId: "PwdDIQKgTd4thrrCIyAMvxba",
            children: [
                { data: { id: "8NEyfvkhvO2okEtWbozmvqlT", name: "V", isCompleted: true }, parentId: "2fHFHxAJBuznIYcXnpuvdfzZ" },
                { data: { id: "Mh4sD4ZA3hITFlHVfI83CTAL", name: "J", isCompleted: true }, parentId: "2fHFHxAJBuznIYcXnpuvdfzZ" },
            ],
        },
    ],
};

function Homepage() {
    const [inputTree] = useState(mockInputTree);
    //Redux State
    const screenDimentions = useAppSelector(selectScreenDimentions);

    //Derived State
    const nodeCoordinates = getNodesCoordinates(inputTree, "radial");
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
                                stateProps={{ selectedNode: null, showLabel: false, circlePositionsInCanvas: nodeCoordinatesCentered }}
                                tree={inputTree}
                                wholeTree={inputTree}
                                treeAccentColor={inputTree.accentColor!}
                                rootCoordinates={{ width: 0, height: 0 }}
                            />
                        </Canvas>
                    </Animated.View>
                </View>
            </GestureDetector>
        </View>
    );
}

export default Homepage;
