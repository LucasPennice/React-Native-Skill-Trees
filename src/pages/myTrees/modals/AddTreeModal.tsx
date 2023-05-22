import { useEffect, useState } from "react";
import { Alert, Dimensions, Pressable, View } from "react-native";
import Animated, { FadeInDown, useAnimatedStyle, withSpring } from "react-native-reanimated";
import axiosClient from "../../../../axiosClient";
import { useRequestProcessor } from "../../../../requestProcessor";
import AppText from "../../../components/AppText";
import AppTextInput from "../../../components/AppTextInput";
import ColorSelector from "../../../components/ColorsSelector";
import FlingToDismissModal from "../../../components/FlingToDismissModal";
import { createTree } from "../../../functions/misc";
import { MENU_HIGH_DAMPENING, centerFlex, colors, possibleTreeColors } from "../../../parameters";
import { close, selectAddTree } from "../../../redux/addTreeModalSlice";
import { useAppDispatch, useAppSelector } from "../../../redux/reduxHooks";
import { appendToUserTree } from "../../../redux/userTreesSlice";
import { generalStyles } from "../../../styles";
import { Skill, Tree, getDefaultSkillValue } from "../../../types";
import { UseQueryResult } from "@tanstack/react-query";
import { Canvas } from "@shopify/react-native-skia";
import HierarchicalSkillTree from "../../viewingSkillTree/canvas/HierarchicalSkillTree";
import {
    centerNodesInCanvas,
    getCanvasDimensions,
    getCoordinatedWithTreeData,
    getNodesCoordinates,
    removeTreeDataFromCoordinate,
} from "../../viewingSkillTree/canvas/coordinateFunctions";
import { selectCanvasDisplaySettings } from "../../../redux/canvasDisplaySettingsSlice";
import { selectScreenDimentions } from "../../../redux/screenDimentionsSlice";
import useHandleImportTree from "./useHandleImportTree";
import useHandleCanvasScroll from "../../viewingSkillTree/canvas/hooks/useHandleCanvasScroll";
import { GestureDetector } from "react-native-gesture-handler";
import LoadingIcon from "../../../components/LoadingIcon";

function AddTreeModal() {
    const { query, resetQuery } = useRequestProcessor();
    const { width } = Dimensions.get("screen");
    //Local State
    const [treeName, setTreeName] = useState("");
    const [treeImportLink, setTreeImportLink] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [mode, setMode] = useState<"CREATE_TREE" | "IMPORT_TREE">("CREATE_TREE");
    //Redux State
    const { open } = useAppSelector(selectAddTree);
    const dispatch = useAppDispatch();
    //
    const importTreeQuery = query(["getTreeById", treeImportLink], () => axiosClient.get(`getTreeById/${treeImportLink}`).then((res) => res.data), {
        enabled: false,
    });

    useEffect(() => {
        setTreeName("");
        setSelectedColor("");
        setMode("CREATE_TREE");
        setTreeImportLink("");
        resetQuery(["getTreeById"]);
    }, [open]);

    useEffect(() => {
        setTreeImportLink("");
        resetQuery(["getTreeById"]);
    }, [mode]);

    const closeModal = () => dispatch(close());

    const createNewTree = () => {
        if (treeName === "" || selectedColor === "") return Alert.alert("Please fill all of the fields");

        const newTree = createTree(treeName, selectedColor, true, "SKILL_TREE", getDefaultSkillValue(treeName, true));

        dispatch(appendToUserTree(newTree));
        closeModal();
    };

    const transform = useAnimatedStyle(() => {
        return { left: withSpring(mode === "CREATE_TREE" ? 0 : width / 2 - 10, MENU_HIGH_DAMPENING) };
    }, [mode]);

    return (
        <FlingToDismissModal closeModal={closeModal} open={open} leftHeaderButton={{ onPress: createNewTree, title: "Add Tree" }}>
            <>
                <View
                    style={[
                        centerFlex,
                        { flexDirection: "row", backgroundColor: `${colors.line}4D`, height: 50, borderRadius: 10, position: "relative" },
                    ]}>
                    <Animated.View
                        style={[
                            { backgroundColor: `${colors.line}3D`, position: "absolute", height: 50, width: width / 2 - 10, borderRadius: 10 },
                            transform,
                        ]}
                    />
                    <Pressable onPress={() => setMode("CREATE_TREE")} style={[centerFlex, { flex: 1, height: 50 }]}>
                        <AppText fontSize={16} style={{ color: mode === "CREATE_TREE" ? colors.accent : colors.unmarkedText }}>
                            Create Tree
                        </AppText>
                    </Pressable>
                    <Pressable onPress={() => setMode("IMPORT_TREE")} style={[centerFlex, { height: 50, flex: 1 }]}>
                        <AppText fontSize={16} style={{ color: mode === "IMPORT_TREE" ? colors.accent : colors.unmarkedText }}>
                            Import Tree
                        </AppText>
                    </Pressable>
                </View>
                {mode === "CREATE_TREE" && (
                    <Animated.View entering={FadeInDown}>
                        <AppTextInput
                            placeholder={"Tree Name"}
                            textState={[treeName, setTreeName]}
                            onlyContainsLettersAndNumbers
                            containerStyles={{ marginVertical: 20 }}
                        />
                        <AppText fontSize={16} style={{ color: colors.unmarkedText }}>
                            Select an accent color for your new tree
                        </AppText>
                        <AppText fontSize={16} style={{ color: colors.unmarkedText, marginBottom: 10 }}>
                            Completed skills and progress bars will show with this color
                        </AppText>
                        <AppText fontSize={16} style={{ color: colors.unmarkedText, marginBottom: 10 }}>
                            Scroll to see more colors
                        </AppText>
                        <ColorSelector colorsArray={possibleTreeColors} state={[selectedColor, setSelectedColor]} />
                    </Animated.View>
                )}
                {mode === "IMPORT_TREE" && (
                    <Animated.View entering={FadeInDown}>
                        <ImportTree importTreeQuery={importTreeQuery} linkState={[treeImportLink, setTreeImportLink]} closeModal={closeModal} />
                    </Animated.View>
                )}
            </>
        </FlingToDismissModal>
    );
}

function ImportTree({
    importTreeQuery,
    linkState,
    closeModal,
}: {
    importTreeQuery: UseQueryResult<any, unknown>;
    linkState: [string, (v: string) => void];
    closeModal: () => void;
}) {
    const { data, isError, isFetching, refetch: fetchTreeFromImportLink } = importTreeQuery;
    const [treeImportLink, setTreeImportLink] = linkState;
    const { showLabel } = useAppSelector(selectCanvasDisplaySettings);
    const { height, width } = useAppSelector(selectScreenDimentions);

    const initialState = !isFetching && data === undefined;

    const handleImportTree = useHandleImportTree(data as Tree<Skill> | undefined, closeModal);

    const WIDTH = width - 20;
    const HEIGHT = height - 200;

    const coordinatesWithTreeData = getNodesCoordinates(data as Tree<Skill>, "hierarchy");
    const nodeCoordinates = removeTreeDataFromCoordinate(coordinatesWithTreeData);
    const canvasDimentions = getCanvasDimensions(nodeCoordinates, { width: WIDTH, height: HEIGHT });
    const nodeCoordinatesCentered = centerNodesInCanvas(nodeCoordinates, canvasDimentions);
    const centeredCoordinatedWithTreeData = getCoordinatedWithTreeData(coordinatesWithTreeData, nodeCoordinatesCentered);

    const { canvasGestures, transform } = useHandleCanvasScroll(canvasDimentions, null, undefined);

    if (initialState)
        return (
            <>
                {isError === true && (
                    <AppText fontSize={16} style={{ color: colors.accent }}>
                        There was an error fetching your tree. Please check if the id is correct and try again
                    </AppText>
                )}
                <AppTextInput
                    placeholder={"Import Link"}
                    textState={[treeImportLink, setTreeImportLink]}
                    onlyContainsLettersAndNumbers
                    containerStyles={{ marginVertical: 20 }}
                />
                <Pressable
                    disabled={treeImportLink.length === 0}
                    onPress={() => fetchTreeFromImportLink()}
                    style={[generalStyles.btn, { backgroundColor: `${colors.line}4D`, opacity: treeImportLink.length === 0 ? 0.5 : 1 }]}>
                    <AppText fontSize={16} style={{ color: colors.accent }}>
                        Search
                    </AppText>
                </Pressable>
            </>
        );

    if (isFetching)
        return (
            <Animated.View entering={FadeInDown} style={[centerFlex, { width: WIDTH, height: HEIGHT }]}>
                <LoadingIcon />
            </Animated.View>
        );

    return (
        <Animated.View entering={FadeInDown} style={[centerFlex, { marginTop: 15, justifyContent: "space-between" }]}>
            <GestureDetector gesture={canvasGestures}>
                <View style={[{ width: WIDTH, height: HEIGHT, overflow: "hidden", borderRadius: 10, backgroundColor: colors.background }]}>
                    <Animated.View style={[transform]}>
                        <Canvas
                            style={{
                                width: canvasDimentions.canvasWidth,
                                height: canvasDimentions.canvasHeight,
                            }}>
                            <HierarchicalSkillTree
                                nodeCoordinatesCentered={centeredCoordinatedWithTreeData}
                                selectedNode={null}
                                showLabel={showLabel}
                            />
                        </Canvas>
                    </Animated.View>
                </View>
            </GestureDetector>
            <View>
                <Pressable onPress={handleImportTree} style={[generalStyles.btn, { backgroundColor: `${colors.line}4D`, marginTop: 15 }]}>
                    <AppText fontSize={16} style={{ color: colors.accent }}>
                        Import
                    </AppText>
                </Pressable>
            </View>
        </Animated.View>
    );
}

export default AddTreeModal;
