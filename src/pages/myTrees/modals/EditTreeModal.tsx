import { useEffect, useState } from "react";
import { Alert, Dimensions, TouchableOpacity, View } from "react-native";
import Animated, { Layout } from "react-native-reanimated";
import AppText from "../../../components/AppText";
import AppTextInput from "../../../components/AppTextInput";
import ColorGradientSelector from "../../../components/ColorGradientSelector";
import FlingToDismissModal from "../../../components/FlingToDismissModal";
import { mutateEveryTree } from "../../../functions/mutateTree";
import { WHITE_GRADIENT, colors, nodeGradients } from "../../../parameters";
import { selectTreeOptions, setTree } from "../../../redux/slices/editTreeSlice";
import { useAppDispatch, useAppSelector } from "../../../redux/reduxHooks";
import { removeUserTree, updateUserTrees } from "../../../redux/slices/userTreesSlice";
import { generalStyles } from "../../../styles";
import { ColorGradient, Skill, Tree } from "../../../types";
import { selectSafeScreenDimentions } from "../../../redux/slices/screenDimentionsSlice";

function EditTreeModal() {
    //Redux State
    const { tree } = useAppSelector(selectTreeOptions);
    const screenDimensions = useAppSelector(selectSafeScreenDimentions);
    const open = tree !== undefined;
    //Local State
    const [treeName, setTreeName] = useState<string>("");
    const [selectedColor, setSelectedColor] = useState<ColorGradient | undefined>(undefined);
    const [icon, setIcon] = useState<string>("");
    //
    const { width } = Dimensions.get("screen");

    useEffect(() => {
        const defaultTreeName = tree ? tree.treeName : "";
        setTreeName(defaultTreeName);
        const defaultAccentColor = tree ? tree.accentColor : WHITE_GRADIENT;
        setSelectedColor(defaultAccentColor);

        if (tree && tree.data.icon.isEmoji) setIcon(tree.data.icon.text);
    }, [open]);

    const dispatch = useAppDispatch();

    const closeModal = () => dispatch(setTree(undefined));

    const deleteTree = () => {
        if (!tree) return;

        dispatch(removeUserTree(tree.treeId));
        closeModal();
    };

    const confirmDeleteTree = () =>
        Alert.alert(
            "Delete this tree?",
            "",
            [
                { text: "No", style: "cancel" },
                { text: "Yes", onPress: deleteTree, style: "destructive" },
            ],
            { cancelable: true }
        );

    const updateTree = (selectedColor: ColorGradient | undefined, treeName: string) => () => {
        if (selectedColor === undefined) return Alert.alert("Please select a color");
        if (treeName === "") return Alert.alert("Please give the tree a name");

        let updatedTree = mutateEveryTree(tree, updateTree);

        if (updatedTree === undefined) return;

        const newIsEmoji = icon !== "";
        const newIcon = newIsEmoji ? icon : treeName[0];

        updatedTree = { ...updatedTree, data: { ...updatedTree.data, icon: { isEmoji: newIsEmoji, text: newIcon } } };

        dispatch(updateUserTrees({ updatedTree, screenDimensions }));
        closeModal();

        function updateTree(tree: Tree<Skill>): Tree<Skill> {
            if (tree.isRoot) return { ...tree, data: { ...tree.data, name: treeName }, accentColor: selectedColor!, treeName };

            return { ...tree, accentColor: selectedColor!, treeName };
        }
    };

    return (
        <FlingToDismissModal closeModal={closeModal} open={open} leftHeaderButton={{ onPress: updateTree(selectedColor, treeName), title: "Save" }}>
            <Animated.View style={{ flex: 1 }} layout={Layout.stiffness(300).damping(26)}>
                <AppTextInput placeholder={"Tree Name"} textState={[treeName, setTreeName]} containerStyles={{ marginVertical: 20 }} />
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
                            Your keyboard can switch to an emoji mode. To access it, look for a button located near the bottom left of your keyboard.
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

                <ColorGradientSelector colorsArray={nodeGradients} state={[selectedColor, setSelectedColor]} />

                <TouchableOpacity style={[generalStyles.btn, { backgroundColor: "#282A2C" }]} onPress={confirmDeleteTree}>
                    <AppText fontSize={16} style={{ color: colors.red }}>
                        Delete this tree
                    </AppText>
                </TouchableOpacity>
            </Animated.View>
        </FlingToDismissModal>
    );
}

export default EditTreeModal;
