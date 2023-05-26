import { useEffect, useState } from "react";
import { Alert, TouchableOpacity } from "react-native";
import Animated, { Layout } from "react-native-reanimated";
import AppText from "../../../components/AppText";
import AppTextInput from "../../../components/AppTextInput";
import ColorSelector from "../../../components/ColorsSelector";
import FlingToDismissModal from "../../../components/FlingToDismissModal";
import ShowHideEmojiSelector from "../../../components/ShowHideEmojiSelector";
import { mutateEveryTree } from "../../../functions/mutateTree";
import { colors, possibleTreeColors } from "../../../parameters";
import { selectTreeOptions, setTree } from "../../../redux/editTreeSlice";
import { useAppDispatch, useAppSelector } from "../../../redux/reduxHooks";
import { removeUserTree, updateUserTrees } from "../../../redux/userTreesSlice";
import { generalStyles } from "../../../styles";
import { Skill, Tree } from "../../../types";

function EditTreeModal() {
    //Redux State
    const { tree } = useAppSelector(selectTreeOptions);
    const open = tree !== undefined;
    //Local State
    const [treeName, setTreeName] = useState<string>("");
    const [selectedColor, setSelectedColor] = useState<string>("");
    const [icon, setIcon] = useState<null | string>(null);

    useEffect(() => {
        const defaultTreeName = tree ? tree.treeName : "";
        setTreeName(defaultTreeName);
        const defaultAccentColor = tree ? tree.accentColor : "";
        setSelectedColor(defaultAccentColor);
        const defaultIcon = tree && tree.data.icon.isEmoji ? tree.data.icon.text : null;
        setIcon(defaultIcon);
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

    const updateTree = (selectedColor: string, treeName: string) => () => {
        if (selectedColor === "") return Alert.alert("Please select a color");
        if (treeName === "") return Alert.alert("Please give the tree a name");

        let updatedTree = mutateEveryTree(tree, updateTree);

        if (updatedTree === undefined) return;

        const newIcon = icon ?? treeName[0];
        const newIsEmoji = icon ? true : false;

        updatedTree = { ...updatedTree, data: { ...updatedTree.data, icon: { isEmoji: newIsEmoji, text: newIcon } } };

        dispatch(updateUserTrees(updatedTree));
        closeModal();

        function updateTree(tree: Tree<Skill>): Tree<Skill> {
            if (tree.isRoot) return { ...tree, data: { ...tree.data, name: treeName }, accentColor: selectedColor, treeName };

            return { ...tree, accentColor: selectedColor, treeName };
        }
    };

    return (
        <FlingToDismissModal closeModal={closeModal} open={open} leftHeaderButton={{ onPress: updateTree(selectedColor, treeName), title: "Save" }}>
            <Animated.View style={{ flex: 1 }} layout={Layout.stiffness(300).damping(26)}>
                <AppTextInput placeholder={"Tree Name"} textState={[treeName, setTreeName]} containerStyles={{ marginVertical: 20 }} />
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

                <ShowHideEmojiSelector emojiState={[icon, setIcon]} />

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
