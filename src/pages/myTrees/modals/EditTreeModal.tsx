import AppButton from "@/components/AppButton";
import AppEmojiPicker, { Emoji, findEmoji } from "@/components/AppEmojiPicker";
import RadioInput from "@/components/RadioInput";
import Spacer from "@/components/Spacer";
import { toggleEmoji } from "@/functions/misc";
import { TreeData, removeUserTree, selectTreeById, updateUserTree } from "@/redux/slices/userTreesSlice";
import { useEffect, useState } from "react";
import { Alert, Pressable, View } from "react-native";
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
    const [showOnHomeScreen, setShowOnHomeScreen] = useState<boolean>(treeData.showOnHomeScreen);

    const [emoji, setEmoji] = useState<Emoji | undefined>(undefined);
    const [emojiSelectorOpen, setEmojiSelectorOpen] = useState(false);
    //

    useEffect(() => {
        setTreeName(treeData.treeName);
        setSelectedColor(treeData.accentColor);

        if (treeData.icon.isEmoji) {
            const selectedEmoji = findEmoji(treeData.icon.text);
            setEmoji(selectedEmoji);
        }
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

        const newIsEmoji = emoji !== undefined;
        const newIcon = newIsEmoji ? emoji.emoji : treeName[0];

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
                    <AppText style={{ color: colors.white, marginBottom: 15 }} fontSize={18}>
                        Editing {treeData.treeName} properties
                    </AppText>

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
                                    color: emoji ? (selectedColor ? selectedColor.color1 : colors.white) : colors.line,
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

                <AppEmojiPicker
                    selectedEmojisName={emoji ? [emoji.name] : undefined}
                    onEmojiSelected={toggleEmoji(setEmoji, emoji)}
                    state={[emojiSelectorOpen, setEmojiSelectorOpen]}
                />
            </>
        </FlingToDismissModal>
    );
}

export default EditTreeModal;
