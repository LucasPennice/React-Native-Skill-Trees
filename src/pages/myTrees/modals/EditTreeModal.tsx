import { TreeData, removeUserTree, selectTreeById, updateUserTree } from "@/redux/slices/userTreesSlice";
import { useEffect, useState } from "react";
import { Alert, Dimensions, TouchableOpacity, View } from "react-native";
import Animated, { Layout } from "react-native-reanimated";
import AppText from "../../../components/AppText";
import AppTextInput from "../../../components/AppTextInput";
import ColorGradientSelector from "../../../components/ColorGradientSelector";
import FlingToDismissModal from "../../../components/FlingToDismissModal";
import { colors, nodeGradients } from "../../../parameters";
import { useAppDispatch, useAppSelector } from "../../../redux/reduxHooks";
import { generalStyles } from "../../../styles";
import { ColorGradient } from "../../../types";

function EditTreeModal({ editingTreeId, closeModal }: { editingTreeId: string; closeModal: () => void }) {
    //Redux State
    //We can guarantee here that the type is TreeData because we will never pass the home tree id to the selector
    const treeData = useAppSelector(selectTreeById(editingTreeId)) as TreeData;
    //Local State
    const [treeName, setTreeName] = useState<string>("");
    const [selectedColor, setSelectedColor] = useState<ColorGradient | undefined>(undefined);
    const [icon, setIcon] = useState<string>("");
    //
    const { width } = Dimensions.get("screen");

    useEffect(() => {
        setTreeName(treeData.treeName);
        setSelectedColor(treeData.accentColor);

        if (treeData.icon.isEmoji) setIcon(treeData.icon.text);
    }, []);

    const dispatch = useAppDispatch();

    const deleteTree = () => {
        closeModal();
        dispatch(removeUserTree({ treeId: treeData.treeId, nodes: treeData.nodes }));
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

        const newIsEmoji = icon !== "";
        const newIcon = newIsEmoji ? icon : treeName[0];

        dispatch(
            updateUserTree({
                rootNodeId: treeData.rootNodeId,
                update: { id: treeData.treeId, changes: { accentColor: selectedColor, icon: { isEmoji: newIsEmoji, text: newIcon }, treeName } },
            })
        );
        closeModal();
    };

    return (
        <FlingToDismissModal closeModal={closeModal} open={true} leftHeaderButton={{ onPress: updateTree(selectedColor, treeName), title: "Save" }}>
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
