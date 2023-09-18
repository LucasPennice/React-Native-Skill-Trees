import { Canvas } from "@shopify/react-native-skia";
import { UseQueryResult } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import axiosClient from "../../../../axiosClient";
import { useRequestProcessor } from "../../../../requestProcessor";
import AppText from "../../../components/AppText";
import AppTextInput from "../../../components/AppTextInput";
import ColorGradientSelector from "../../../components/ColorGradientSelector";
import FlingToDismissModal from "../../../components/FlingToDismissModal";
import LoadingIcon from "../../../components/LoadingIcon";

import HierarchicalSkillTree from "../../../components/treeRelated/hierarchical/HierarchicalSkillTree";
import useHandleCanvasScroll from "../../../components/treeRelated/hooks/useHandleCanvasScrollAndZoom";
import { createTree, makeid } from "../../../functions/misc";
import { MENU_HIGH_DAMPENING, centerFlex, colors, nodeGradients } from "../../../parameters";
import { useAppDispatch, useAppSelector } from "../../../redux/reduxHooks";
import { close, selectAddTree } from "../../../redux/slices/addTreeModalSlice";
import { selectCanvasDisplaySettings } from "../../../redux/slices/canvasDisplaySettingsSlice";
import { selectSafeScreenDimentions } from "../../../redux/slices/screenDimentionsSlice";
import { generalStyles } from "../../../styles";
import { ColorGradient, Skill, Tree, getDefaultSkillValue } from "../../../types";
import useHandleImportTree from "./useHandleImportTree";
import { TreeData, addUserTree } from "@/redux/slices/newUserTreesSlice";

function AddTreeModal() {
    const { query } = useRequestProcessor();
    const screenDimensions = useAppSelector(selectSafeScreenDimentions);
    const { width } = screenDimensions;
    //Local State
    const [treeName, setTreeName] = useState("");
    const [icon, setIcon] = useState<string>("");
    const [treeImportKey, setTreeImportKey] = useState("");
    const [selectedColorGradient, setSelectedColorGradient] = useState<ColorGradient | undefined>(undefined);
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
        setSelectedColorGradient(undefined);
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
        if (treeName === "") return Alert.alert("Please give the tree a name");
        if (!selectedColorGradient) return Alert.alert("Please select a color");

        const isEmoji = icon === "" ? false : true;
        const iconText = isEmoji ? icon : treeName[0];

        const rootNodeId = makeid(24);

        const newUserTree: TreeData = {
            accentColor: selectedColorGradient,
            icon: { isEmoji, text: iconText },
            nodes: [rootNodeId],
            rootNodeId,
            treeId: makeid(24),
            treeName,
        };

        dispatch(addUserTree(newUserTree));
        closeModal();
    };

    const transform = useAnimatedStyle(() => {
        return { left: withSpring(mode === "CREATE_TREE" ? 0 : width / 2 - 10, MENU_HIGH_DAMPENING) };
    }, [mode]);

    return (
        <FlingToDismissModal closeModal={closeModal} open={open} leftHeaderButton={{ onPress: createNewTree, title: "Confirm" }}>
            <>
                {/* <View style={[centerFlex, { flexDirection: "row", backgroundColor: "#282A2C", height: 50, borderRadius: 10, position: "relative" }]}>
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
                </View> */}
                {mode === "CREATE_TREE" && (
                    <Animated.View entering={FadeInDown}>
                        <AppTextInput
                            placeholder={"Tree Name"}
                            textState={[treeName, setTreeName]}
                            pattern={new RegExp(/^[^ ]/)}
                            containerStyles={{ marginVertical: 20 }}
                        />
                        <View style={{ flexDirection: "row", marginBottom: 15, justifyContent: "space-between", alignItems: "center" }}>
                            <View style={{ width: width - 160 }}>
                                <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                                    <AppText style={{ color: "#FFFFFF", marginBottom: 5 }} fontSize={20}>
                                        Icon
                                    </AppText>
                                    <AppText style={{ color: colors.unmarkedText, marginLeft: 5, marginTop: 2 }} fontSize={16}>
                                        (optional)
                                    </AppText>
                                </View>
                                <AppText style={{ color: colors.unmarkedText, marginBottom: 10 }} fontSize={14}>
                                    Your keyboard can switch to an emoji mode. To access it, look for a button located near the bottom left of your
                                    keyboard.
                                </AppText>
                            </View>
                            <AppTextInput
                                placeholder={"🧠"}
                                textStyle={{ fontFamily: "emojisMono", fontSize: 40 }}
                                textState={[icon, setIcon]}
                                pattern={new RegExp(/\p{Extended_Pictographic}/u)}
                                containerStyles={{ width: 130 }}
                            />
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 5 }}>
                            <AppText fontSize={18} style={{ color: "#FFFFFF" }}>
                                Tree Color
                            </AppText>
                            <AppText fontSize={14} style={{ color: colors.unmarkedText }}>
                                (Required)
                            </AppText>
                        </View>
                        <AppText fontSize={14} style={{ color: colors.unmarkedText, marginBottom: 5 }}>
                            Completed skills and progress bars will show with this color
                        </AppText>
                        <AppText fontSize={14} style={{ color: colors.unmarkedText, marginBottom: 10 }}>
                            Scroll to see more colors
                        </AppText>

                        <ColorGradientSelector colorsArray={nodeGradients} state={[selectedColorGradient, setSelectedColorGradient]} />
                    </Animated.View>
                )}
                {/* {mode === "IMPORT_TREE" && (
                    <Animated.View entering={FadeInDown}>
                        <ImportTree importTreeQuery={importTreeQuery} linkState={[treeImportKey, setTreeImportKey]} closeModal={closeModal} />
                    </Animated.View>
                )} */}
            </>
        </FlingToDismissModal>
    );
}

// function ImportTree({
//     importTreeQuery,
//     linkState,
//     closeModal,
// }: {
//     importTreeQuery: UseQueryResult<any, unknown>;
//     linkState: [string, (v: string) => void];
//     closeModal: () => void;
// }) {
//     const { data, isError, isFetching, refetch: fetchTreeFromImportLink } = importTreeQuery;
//     const [treeImportKey, setTreeImportKey] = linkState;
//     const { showLabel, showIcons } = useAppSelector(selectCanvasDisplaySettings);
//     const screenDimensions = useAppSelector(selectSafeScreenDimentions);
//     const { height, width } = screenDimensions;

//     const initialState = !isFetching && data === undefined;

//     const handleImportTree = useHandleImportTree(data as Tree<Skill> | undefined, closeModal);

//     const WIDTH = width - 20;
//     const HEIGHT = height - 200;

//     const coordinatesWithTreeData = getNodesCoordinates(data as Tree<Skill>, "hierarchy");
//     const nodeCoordinates = removeTreeDataFromCoordinate(coordinatesWithTreeData);
//     const canvasDimentions = getCanvasDimensions(nodeCoordinates, { width: WIDTH, height: HEIGHT });
//     const nodeCoordinatesCentered = centerNodesInCanvas(nodeCoordinates, canvasDimentions);
//     const centeredCoordinatedWithTreeData = getCoordinatedWithTreeData(coordinatesWithTreeData, nodeCoordinatesCentered);

//     const { canvasScrollAndZoom, transform } = useHandleCanvasScroll(canvasDimentions, screenDimensions, undefined, undefined, () => {}, {
//         state: false,
//         endDragging: () => {},
//     });

//     const mockDrag = {
//         x: useSharedValue(0),
//         y: useSharedValue(0),
//         nodesToDragId: [],
//     };

//     if (initialState)
//         return (
//             <>
//                 {isError === true && (
//                     <AppText fontSize={16} style={{ color: colors.accent }}>
//                         There was an error fetching your tree. Please check if the id is correct and try again
//                     </AppText>
//                 )}
//                 <AppTextInput placeholder={"Import Link"} textState={[treeImportKey, setTreeImportKey]} containerStyles={{ marginVertical: 20 }} />
//                 <Pressable
//                     disabled={treeImportKey.length === 0}
//                     onPress={() => fetchTreeFromImportLink()}
//                     style={[generalStyles.btn, { backgroundColor: "#282A2C", opacity: treeImportKey.length === 0 ? 0.5 : 1 }]}>
//                     <AppText fontSize={16} style={{ color: colors.accent }}>
//                         Search
//                     </AppText>
//                 </Pressable>
//             </>
//         );

//     if (isFetching)
//         return (
//             <Animated.View entering={FadeInDown} style={[centerFlex, { width: WIDTH, height: HEIGHT }]}>
//                 <LoadingIcon />
//             </Animated.View>
//         );

//     return (
//         <Animated.View entering={FadeInDown} style={[centerFlex, { marginTop: 15, justifyContent: "space-between" }]}>
//             <GestureDetector gesture={canvasScrollAndZoom}>
//                 <View style={[{ width: WIDTH, height: HEIGHT, overflow: "hidden", borderRadius: 10, backgroundColor: colors.background }]}>
//                     <Animated.View style={[transform]}>
//                         <Canvas
//                             style={{
//                                 width: canvasDimentions.canvasWidth,
//                                 height: canvasDimentions.canvasHeight,
//                             }}>
//                             <HierarchicalSkillTree
//                                 nodeCoordinatesCentered={centeredCoordinatedWithTreeData}
//                                 selectedNode={null}
//                                 settings={{ showIcons, showLabel }}
//                                 drag={mockDrag}
//                             />
//                         </Canvas>
//                     </Animated.View>
//                 </View>
//             </GestureDetector>
//             <View>
//                 <Pressable onPress={handleImportTree} style={[generalStyles.btn, { backgroundColor: "#282A2C", marginTop: 15 }]}>
//                     <AppText fontSize={16} style={{ color: colors.accent }}>
//                         Import
//                     </AppText>
//                 </Pressable>
//             </View>
//         </Animated.View>
//     );
// }

export default AddTreeModal;
