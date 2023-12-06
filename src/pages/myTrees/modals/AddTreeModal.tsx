import AppEmojiPicker, { Emoji } from "@/components/AppEmojiPicker";
import { generateMongoCompliantId, toggleEmoji } from "@/functions/misc";
import { TreeData, addUserTrees } from "@/redux/slices/userTreesSlice";
import analytics from "@react-native-firebase/analytics";
import { mixpanel } from "app/_layout";
import { useEffect, useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { useAnimatedStyle, withSpring } from "react-native-reanimated";
import AppText from "../../../components/AppText";
import AppTextInput from "../../../components/AppTextInput";
import ColorGradientSelector from "../../../components/ColorGradientSelector";
import FlingToDismissModal from "../../../components/FlingToDismissModal";
import { MENU_HIGH_DAMPENING, colors, nodeGradients } from "../../../parameters";
import { useAppDispatch, useAppSelector } from "../../../redux/reduxHooks";
import { close, selectAddTree } from "../../../redux/slices/addTreeModalSlice";
import { selectSafeScreenDimentions } from "../../../redux/slices/screenDimentionsSlice";
import { ColorGradient } from "../../../types";

const useClearStateOnOpen = (open: boolean, cleanup: () => void) => {
    useEffect(() => {
        cleanup();
    }, [open]);
};

function AddTreeModal() {
    // const { query } = useRequestProcessor();
    const screenDimensions = useAppSelector(selectSafeScreenDimentions);
    const { width } = screenDimensions;
    //Local State
    const [treeName, setTreeName] = useState("");
    // const [treeImportKey, setTreeImportKey] = useState("");
    const [selectedColorGradient, setSelectedColorGradient] = useState<ColorGradient | undefined>(undefined);
    const [mode, setMode] = useState<"CREATE_TREE" | "IMPORT_TREE">("CREATE_TREE");

    const [emoji, setEmoji] = useState<Emoji | undefined>(undefined);
    const [emojiSelectorOpen, setEmojiSelectorOpen] = useState(false);
    //Redux State
    const { open } = useAppSelector(selectAddTree);
    const dispatch = useAppDispatch();
    //
    // const importTreeQuery = query(["getTreeById", treeImportKey], () => axiosClient.get(`getTreeByKey/${treeImportKey}`).then((res) => res.data), {
    //     cacheTime: 0,
    //     enabled: false,
    // });

    useClearStateOnOpen(open, cleanup);

    // useEffect(() => {
    //     setTreeImportKey("");
    //     importTreeQuery.remove();
    // }, [mode]);

    const closeModal = () => dispatch(close());

    const createNewTree = async () => {
        if (treeName === "") return Alert.alert("Please give the tree a name");
        if (!selectedColorGradient) return Alert.alert("Please select a color");

        const isEmoji = emoji === undefined ? false : true;
        const iconText = emoji?.emoji ?? treeName[0];

        const rootNodeId = generateMongoCompliantId();

        const newUserTree: TreeData = {
            accentColor: selectedColorGradient,
            icon: { isEmoji, text: iconText },
            nodes: [rootNodeId],
            rootNodeId,
            treeId: generateMongoCompliantId(),
            treeName,
            showOnHomeScreen: true,
        };

        dispatch(addUserTrees([newUserTree]));

        await analytics().logEvent("createTree", { treeName, isEmoji });
        await mixpanel.track("userCreatedTree");

        closeModal();
    };

    const transform = useAnimatedStyle(() => {
        return { left: withSpring(mode === "CREATE_TREE" ? 0 : width / 2 - 10, MENU_HIGH_DAMPENING) };
    }, [mode]);

    return (
        <FlingToDismissModal
            closeModal={closeModal}
            open={open}
            rightHeaderButton={{ onPress: createNewTree, title: "Add" }}
            modalContainerStyles={{ backgroundColor: colors.background }}>
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

                {/* {mode === "CREATE_TREE" && ( */}
                {/* // <Animated.View entering={FadeInDown}> */}
                <AppText children={"Select your tree's name and icon"} fontSize={16} />
                <AppText children={"Icon is optional"} fontSize={14} style={{ color: `${colors.white}80`, marginTop: 5, marginBottom: 10 }} />
                <View style={{ flexDirection: "row", marginBottom: 20 }}>
                    <AppTextInput
                        placeholder={"Education"}
                        textState={[treeName, setTreeName]}
                        pattern={new RegExp(/^[^ ]/)}
                        containerStyles={{ flex: 1 }}
                    />
                    <Pressable onPress={() => setEmojiSelectorOpen(true)}>
                        <AppText
                            children={emoji ? emoji.emoji : "🧠"}
                            style={{
                                fontFamily: "emojisMono",
                                color: emoji ? (selectedColorGradient ? selectedColorGradient.color1 : colors.white) : colors.line,
                                width: 45,
                                paddingTop: 2,
                                height: 45,
                                backgroundColor: colors.darkGray,
                                borderRadius: 10,
                                marginLeft: 10,
                                textAlign: "center",
                                verticalAlign: "middle",
                            }}
                            fontSize={24}
                        />
                    </Pressable>
                </View>

                <AppText fontSize={16} style={{ color: colors.white }}>
                    Tree Color
                </AppText>

                <AppText fontSize={14} style={{ color: `${colors.white}80`, marginBottom: 10 }}>
                    Scroll to see more colors
                </AppText>

                <ColorGradientSelector
                    colorsArray={nodeGradients}
                    state={[selectedColorGradient, setSelectedColorGradient]}
                    containerStyle={{ backgroundColor: colors.darkGray, borderRadius: 10 }}
                />
                {/* // </Animated.View> */}
                {/* // )} */}
                {/* {mode === "IMPORT_TREE" && (
                    <Animated.View entering={FadeInDown}>
                        <ImportTree importTreeQuery={importTreeQuery} linkState={[treeImportKey, setTreeImportKey]} closeModal={closeModal} />
                    </Animated.View>
                )} */}
                <AppEmojiPicker
                    selectedEmojisName={emoji ? [emoji.name] : undefined}
                    onEmojiSelected={toggleEmoji(setEmoji, emoji)}
                    state={[emojiSelectorOpen, setEmojiSelectorOpen]}
                />
            </>
        </FlingToDismissModal>
    );

    function cleanup() {
        setTreeName("");
        setSelectedColorGradient(undefined);
        setEmojiSelectorOpen(false);
        setMode("CREATE_TREE");
        // setTreeImportKey("");
        setEmoji(undefined);
        // importTreeQuery.remove();
    }
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
