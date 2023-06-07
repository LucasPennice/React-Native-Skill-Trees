import { Canvas } from "@shopify/react-native-skia";
import { UseQueryResult } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Alert, Dimensions, Pressable, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, { FadeInDown, FadeOutUp, useAnimatedStyle, withSpring } from "react-native-reanimated";
import axiosClient from "../../../../axiosClient";
import { useRequestProcessor } from "../../../../requestProcessor";
import AppText from "../../../components/AppText";
import AppTextInput from "../../../components/AppTextInput";
import ColorSelector from "../../../components/ColorsSelector";
import FlingToDismissModal from "../../../components/FlingToDismissModal";
import LoadingIcon from "../../../components/LoadingIcon";
import ShowHideEmojiSelector from "../../../components/ShowHideEmojiSelector";
import { createTree } from "../../../functions/misc";
import { MENU_HIGH_DAMPENING, centerFlex, colors, possibleTreeColors } from "../../../parameters";
import { close, selectAddTree } from "../../../redux/addTreeModalSlice";
import { selectCanvasDisplaySettings } from "../../../redux/canvasDisplaySettingsSlice";
import { useAppDispatch, useAppSelector } from "../../../redux/reduxHooks";
import { selectSafeScreenDimentions } from "../../../redux/screenDimentionsSlice";
import { appendToUserTree } from "../../../redux/userTreesSlice";
import { generalStyles } from "../../../styles";
import { Skill, Tree, getDefaultSkillValue } from "../../../types";
import HierarchicalSkillTree from "../../../components/treeRelated/hierarchical/HierarchicalSkillTree";
import {
    centerNodesInCanvas,
    getCanvasDimensions,
    getCoordinatedWithTreeData,
    getNodesCoordinates,
    removeTreeDataFromCoordinate,
} from "../../../components/treeRelated/coordinateFunctions";
import useHandleCanvasScroll from "../../../components/treeRelated/hooks/useHandleCanvasScroll";
import useHandleImportTree from "./useHandleImportTree";

function AddTreeModal() {
    const { query } = useRequestProcessor();
    const { width } = Dimensions.get("screen");
    //Local State
    const [treeName, setTreeName] = useState("");
    const [icon, setIcon] = useState<null | string>(null);
    const [treeImportKey, setTreeImportKey] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [mode, setMode] = useState<"CREATE_TREE" | "IMPORT_TREE">("CREATE_TREE");
    //Redux State
    const { open } = useAppSelector(selectAddTree);
    const dispatch = useAppDispatch();
    //
    const importTreeQuery = query(["getTreeById", treeImportKey], () => axiosClient.get(`getTreeByKey/${treeImportKey}`).then((res) => res.data), {
        cacheTime: 0,
        enabled: false,
    });

    useEffect(() => {
        setTreeName("");
        setSelectedColor("");
        setMode("CREATE_TREE");
        setTreeImportKey("");
        importTreeQuery.remove();
    }, [open]);

    useEffect(() => {
        setTreeImportKey("");
        importTreeQuery.remove();
    }, [mode]);

    const closeModal = () => dispatch(close());

    const createNewTree = () => {
        if (treeName === "" || selectedColor === "") return Alert.alert("Please fill all of the fields");

        const iconText = icon ?? treeName;
        const isEmoji = icon === null ? false : true;

        const newTree = createTree(treeName, selectedColor, true, "SKILL_TREE", getDefaultSkillValue(treeName, true, { isEmoji, text: iconText }));

        dispatch(appendToUserTree(newTree));
        closeModal();
    };

    const transform = useAnimatedStyle(() => {
        return { left: withSpring(mode === "CREATE_TREE" ? 0 : width / 2 - 10, MENU_HIGH_DAMPENING) };
    }, [mode]);

    return (
        <FlingToDismissModal closeModal={closeModal} open={open} leftHeaderButton={{ onPress: createNewTree, title: "Add Tree" }}>
            <>
                <View style={[centerFlex, { flexDirection: "row", backgroundColor: "#282A2C", height: 50, borderRadius: 10, position: "relative" }]}>
                    <Animated.View
                        style={[
                            { position: "absolute", height: 50, width: width / 2 - 10, borderRadius: 10, borderWidth: 1, borderColor: colors.accent },
                            transform,
                        ]}
                    />
                    <Pressable onPress={() => setMode("CREATE_TREE")} style={[centerFlex, { flex: 1, height: 50 }]}>
                        <AppText fontSize={16} style={{ color: colors.unmarkedText }}>
                            Create Tree
                        </AppText>
                    </Pressable>
                    <Pressable onPress={() => setMode("IMPORT_TREE")} style={[centerFlex, { height: 50, flex: 1 }]}>
                        <AppText fontSize={16} style={{ color: colors.unmarkedText }}>
                            Import Tree
                        </AppText>
                    </Pressable>
                </View>
                {mode === "CREATE_TREE" && (
                    <Animated.View entering={FadeInDown} exiting={FadeOutUp.duration(50)}>
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
                        <ColorSelector colorsArray={possibleTreeColors} state={[selectedColor, setSelectedColor]} style={{ marginBottom: 10 }} />

                        <ShowHideEmojiSelector emojiState={[icon, setIcon]} />
                    </Animated.View>
                )}
                {mode === "IMPORT_TREE" && (
                    <Animated.View entering={FadeInDown} exiting={FadeOutUp.duration(50)}>
                        <ImportTree importTreeQuery={importTreeQuery} linkState={[treeImportKey, setTreeImportKey]} closeModal={closeModal} />
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
    const [treeImportKey, setTreeImportKey] = linkState;
    const { showLabel } = useAppSelector(selectCanvasDisplaySettings);
    const { height, width } = useAppSelector(selectSafeScreenDimentions);

    const initialState = !isFetching && data === undefined;

    const handleImportTree = useHandleImportTree(data as Tree<Skill> | undefined, closeModal);

    const WIDTH = width - 20;
    const HEIGHT = height - 200;

    const coordinatesWithTreeData = getNodesCoordinates(data as Tree<Skill>, "hierarchy");
    const nodeCoordinates = removeTreeDataFromCoordinate(coordinatesWithTreeData);
    const canvasDimentions = getCanvasDimensions(nodeCoordinates, { width: WIDTH, height: HEIGHT });
    const nodeCoordinatesCentered = centerNodesInCanvas(nodeCoordinates, canvasDimentions);
    const centeredCoordinatedWithTreeData = getCoordinatedWithTreeData(coordinatesWithTreeData, nodeCoordinatesCentered);

    const { canvasGestures, transform } = useHandleCanvasScroll(canvasDimentions, undefined);

    if (initialState)
        return (
            <>
                {isError === true && (
                    <AppText fontSize={16} style={{ color: colors.accent }}>
                        There was an error fetching your tree. Please check if the id is correct and try again
                    </AppText>
                )}
                <AppTextInput placeholder={"Import Link"} textState={[treeImportKey, setTreeImportKey]} containerStyles={{ marginVertical: 20 }} />
                <Pressable
                    disabled={treeImportKey.length === 0}
                    onPress={() => fetchTreeFromImportLink()}
                    style={[generalStyles.btn, { backgroundColor: "#282A2C", opacity: treeImportKey.length === 0 ? 0.5 : 1 }]}>
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
                <Pressable onPress={handleImportTree} style={[generalStyles.btn, { backgroundColor: "#282A2C", marginTop: 15 }]}>
                    <AppText fontSize={16} style={{ color: colors.accent }}>
                        Import
                    </AppText>
                </Pressable>
            </View>
        </Animated.View>
    );
}

export default AddTreeModal;
