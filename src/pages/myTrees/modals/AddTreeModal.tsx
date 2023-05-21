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
    const q = query(["users", treeImportLink], () => axiosClient.get(`getTreeById/${treeImportLink}`).then((res) => res.data), { enabled: false });

    useEffect(() => {
        setTreeName("");
        setSelectedColor("");
        setMode("CREATE_TREE");
        setTreeImportLink("");
        resetQuery(["users"]);
    }, [open]);

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
                        <ImportTree q={q} linkState={[treeImportLink, setTreeImportLink]} />
                    </Animated.View>
                )}
            </>
        </FlingToDismissModal>
    );
}

function ImportTree({ q, linkState }: { q: UseQueryResult<any, unknown>; linkState: [string, (v: string) => void] }) {
    const { data, isError, isFetching, refetch: fetchTreeFromImportLink } = q;
    const [treeImportLink, setTreeImportLink] = linkState;

    const initialState = !isFetching && data === undefined;

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
                        Import
                    </AppText>
                </Pressable>
            </>
        );

    if (isFetching)
        return (
            <AppText fontSize={16} style={{ color: colors.accent }}>
                Loading...
            </AppText>
        );

    return (
        <>
            <AppText fontSize={16} style={{ color: colors.accent }}>
                {JSON.stringify(data)}
            </AppText>
        </>
    );
}

export default AddTreeModal;
