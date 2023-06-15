import { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import AppText from "../../../components/AppText";
import AppTextInput from "../../../components/AppTextInput";
import FlingToDismissModal from "../../../components/FlingToDismissModal";
import RadioInput from "../../../components/RadioInput";
import ShowHideEmojiSelector from "../../../components/ShowHideEmojiSelector";
import { createTree } from "../../../functions/misc";
import { colors } from "../../../parameters";
import { useAppDispatch } from "../../../redux/reduxHooks";
import { setNewNode, setSelectedNode } from "../../../redux/userTreesSlice";
import { getDefaultSkillValue } from "../../../types";
import useCurrentTree from "../../../useCurrentTree";

type Props = {
    closeModal: () => void;
    confirmAddNewNode: () => void;
    open: boolean;
};

function AddNodeModal({ closeModal, open, confirmAddNewNode }: Props) {
    const currentTree = useCurrentTree();
    const dispatch = useAppDispatch();

    const [text, onChangeText] = useState("");
    const [icon, setIcon] = useState<null | string>(null);
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        if (open === false) {
            onChangeText("");
            setIsCompleted(false);
            setIcon(null);
        }
    }, [open]);

    const addNewNode = () => {
        if (!currentTree) return;

        if (text === "") return Alert.alert("Please enter a name for the new skill");

        const iconText = icon ?? text;
        const isEmoji = icon === null ? false : true;

        const newNode = createTree(
            currentTree.treeName,
            currentTree.accentColor,
            false,
            "SKILL",
            getDefaultSkillValue(text.trim(), isCompleted, { isEmoji, text: iconText })
        );

        dispatch(setNewNode(newNode));
        confirmAddNewNode();
        dispatch(setSelectedNode(null));
    };

    return (
        <FlingToDismissModal closeModal={closeModal} open={open} leftHeaderButton={{ onPress: addNewNode, title: "Confirm" }}>
            <View style={{ flex: 1, marginTop: 20 }}>
                <AppText style={{ color: colors.unmarkedText, marginBottom: 10 }} fontSize={18}>
                    Enter the name of the new skill you'll add to the roadmap
                </AppText>

                <AppTextInput
                    placeholder={"Skill Name"}
                    textState={[text, onChangeText]}
                    pattern={new RegExp(/^[^ ]/)}
                    containerStyles={{ marginBottom: 10 }}
                />
                <RadioInput state={[isCompleted, setIsCompleted]} text={"I Mastered This Skill"} style={{ marginBottom: 10 }} />

                <AppText style={{ color: colors.unmarkedText, marginVertical: 10 }} fontSize={16}>
                    If you don't select an icon the first letter of the skill name will be used
                </AppText>

                <ShowHideEmojiSelector emojiState={[icon, setIcon]} />
            </View>
        </FlingToDismissModal>
    );
}

export default AddNodeModal;
