import { Alert, TouchableOpacity, View } from "react-native";
import { useAppDispatch, useAppSelector } from "../../../redux/reduxHooks";
import { useEffect, useState } from "react";
import AppTextInput from "../../../components/AppTextInput";
import FlingToDismissModal from "../../../components/FlingToDismissModal";
import AppText from "../../../components/AppText";
import ColorSelector from "../../../components/ColorsSelector";
import { selectTreeOptions, setTree } from "../../../redux/editTreeSlice";
import { mutateUserTree, removeUserTree } from "../../../redux/userTreesSlice";
import { Skill, Tree } from "../../../types";
import { colors, possibleTreeColors } from "../../../parameters";
import { mutateEveryTree } from "../../../functions/mutateTree";

function EditTreeModal() {
    //Redux State
    const { tree } = useAppSelector(selectTreeOptions);
    const open = tree !== undefined;
    //Local State
    const [treeName, setTreeName] = useState<string>("");
    const [selectedColor, setSelectedColor] = useState<string>("");

    useEffect(() => {
        const defaultTreeName = tree ? tree.treeName : "";
        setTreeName(defaultTreeName);
        const defaultAccentColor = tree ? tree.accentColor : "";
        setSelectedColor(defaultAccentColor);
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

    const updateTreeNameAndColor = (selectedColor: string, treeName: string) => () => {
        if (selectedColor === "") return Alert.alert("Please select a color");
        if (treeName === "") return Alert.alert("Please give the tree a name");

        const updatedTree = mutateEveryTree(tree, updateTreeNameAndColor);

        if (updatedTree === undefined) return;

        dispatch(mutateUserTree(updatedTree));
        closeModal();

        function updateTreeNameAndColor(tree: Tree<Skill>): Tree<Skill> {
            return { ...tree, accentColor: selectedColor, treeName };
        }
    };

    return (
        <FlingToDismissModal
            closeModal={closeModal}
            open={open}
            leftHeaderButton={{ onPress: updateTreeNameAndColor(selectedColor, treeName), title: "Save" }}>
            <View style={{ flex: 1 }}>
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
                <TouchableOpacity style={{ backgroundColor: `${colors.line}4D`, borderRadius: 15, padding: 15 }} onPress={confirmDeleteTree}>
                    <AppText fontSize={16} style={{ color: colors.accent }}>
                        Delete this tree
                    </AppText>
                </TouchableOpacity>
            </View>
        </FlingToDismissModal>
    );
}

export default EditTreeModal;
