import AppButton from "@/components/AppButton";
import RadioInput from "@/components/RadioInput";
import Spacer from "@/components/Spacer";
import { TreeData, removeUserTree, selectTreeById, updateUserTree } from "@/redux/slices/userTreesSlice";
import { useEffect, useState } from "react";
import { Alert, Dimensions, View } from "react-native";
import AppText from "../../../components/AppText";
import AppTextInput from "../../../components/AppTextInput";
import ColorGradientSelector from "../../../components/ColorGradientSelector";
import FlingToDismissModal from "../../../components/FlingToDismissModal";
import { colors, nodeGradients } from "../../../parameters";
import { useAppDispatch, useAppSelector } from "../../../redux/reduxHooks";
import { ColorGradient } from "../../../types";

function EditTreeModal({ editingTreeId, closeModal }: { editingTreeId: string; closeModal: () => void }) {
    //Redux State
    //We can guarantee here that the type is TreeData because we will never pass the home tree id to the selector
    const treeData = useAppSelector(selectTreeById(editingTreeId)) as TreeData;
    //Local State
    const [treeName, setTreeName] = useState<string>("");
    const [selectedColor, setSelectedColor] = useState<ColorGradient | undefined>(undefined);
    const [icon, setIcon] = useState<string>("");
    const [showOnHomeScreen, setShowOnHomeScreen] = useState<boolean>(treeData.showOnHomeScreen);
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
                update: {
                    id: treeData.treeId,
                    changes: { accentColor: selectedColor, icon: { isEmoji: newIsEmoji, text: newIcon }, treeName, showOnHomeScreen },
                },
            })
        );
        closeModal();
    };

    return (
        <FlingToDismissModal
            closeModal={closeModal}
            open={true}
            leftHeaderButton={{ onPress: updateTree(selectedColor, treeName), title: "Save" }}
            modalContainerStyles={{ backgroundColor: colors.background }}>
            <>
                <View style={{ flex: 1 }}>
                    <AppText style={{ color: colors.white, marginBottom: 10 }} fontSize={18}>
                        Editing {treeData.treeName} properties
                    </AppText>

                    <AppText style={{ color: colors.white, marginBottom: 5 }} fontSize={16}>
                        Tree name
                    </AppText>
                    <AppTextInput
                        placeholder={"Tree Name"}
                        textState={[treeName, setTreeName]}
                        textStyle={{ fontSize: 16 }}
                        containerStyles={{ backgroundColor: colors.darkGray, marginBottom: 15 }}
                    />
                    <View style={{ flexDirection: "row", marginBottom: 15, justifyContent: "space-between", alignItems: "center" }}>
                        <View style={{ width: width - 160 }}>
                            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                                <AppText style={{ color: colors.white, marginBottom: 5 }} fontSize={16}>
                                    Icon
                                </AppText>
                                <AppText style={{ color: colors.unmarkedText, marginLeft: 5, marginTop: 2 }} fontSize={16}>
                                    (optional)
                                </AppText>
                            </View>
                            <AppText style={{ color: `${colors.white}80`, marginBottom: 10 }} fontSize={14}>
                                Your keyboard can switch to an emoji mode. To access it, look for a button located near the bottom left of your
                                keyboard.
                            </AppText>
                        </View>
                        <AppTextInput
                            placeholder={"🧠"}
                            textStyle={{ fontFamily: "emojisMono", fontSize: 40 }}
                            textState={[icon, setIcon]}
                            pattern={new RegExp(/\p{Extended_Pictographic}/u)}
                            inputProps={{ placeholderTextColor: `${colors.white}80` }}
                            containerStyles={{ width: 130, backgroundColor: colors.darkGray }}
                        />
                    </View>
                    <AppText fontSize={16} style={{ color: colors.white }}>
                        Tree Color
                    </AppText>

                    <AppText fontSize={14} style={{ color: `${colors.white}80`, marginBottom: 10 }}>
                        Scroll to see more colors
                    </AppText>

                    <ColorGradientSelector
                        colorsArray={nodeGradients}
                        state={[selectedColor, setSelectedColor]}
                        containerStyle={{ backgroundColor: colors.darkGray, borderRadius: 10 }}
                    />

                    <Spacer style={{ marginVertical: 10 }} />

                    <RadioInput
                        iconProps={{ name: "eye-slash", color: colors.white, size: 20 }}
                        state={[showOnHomeScreen, setShowOnHomeScreen]}
                        text={"Show on homescreen"}
                        style={{ backgroundColor: colors.background }}
                    />
                </View>

                <View>
                    <View
                        style={{
                            flexDirection: "row",
                            marginVertical: 10,
                            alignItems: "center",
                        }}>
                        <Spacer style={{ flex: 1 }} />
                        <AppText
                            children={`or`}
                            fontSize={18}
                            style={{ color: `${colors.white}80`, marginBottom: 5, width: 50, textAlign: "center" }}
                        />
                        <Spacer style={{ flex: 1 }} />
                    </View>

                    <AppButton
                        onPress={confirmDeleteTree}
                        text={{ idle: "Delete tree" }}
                        style={{ backgroundColor: colors.background }}
                        color={{ idle: colors.pink }}
                    />
                </View>
            </>
        </FlingToDismissModal>
    );
}

export default EditTreeModal;
