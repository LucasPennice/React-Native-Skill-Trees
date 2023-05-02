import { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import AppText from "../../../components/AppText";
import AppTextInput from "../../../components/AppTextInput";
import FlingToDismissModal from "../../../components/FlingToDismissModal";
import RadioInput from "../../../components/RadioInput";
import { createTree } from "../../../functions/misc";
import { colors } from "../../../parameters";
import { selectCanvasDisplaySettings, toggleNewNode } from "../../../redux/canvasDisplaySettingsSlice";
import { useAppDispatch, useAppSelector } from "../../../redux/reduxHooks";
import { selectCurrentTree, setNewNode, setSelectedNode } from "../../../redux/userTreesSlice";

function NewNodeModal() {
    const { openMenu } = useAppSelector(selectCanvasDisplaySettings);
    const currentTree = useAppSelector(selectCurrentTree);
    const dispatch = useAppDispatch();

    const [text, onChangeText] = useState("");
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        onChangeText("");
        setIsCompleted(false);
    }, [openMenu]);

    const closeModal = () => dispatch(toggleNewNode());

    const addNewNode = () => {
        if (!currentTree) return;

        if (text === "") return Alert.alert("Please enter a name for the new skill");

        const newNode = createTree(currentTree.treeName, currentTree.accentColor, false, { name: text.trim(), isCompleted });

        dispatch(setNewNode(newNode));
        dispatch(toggleNewNode());
        dispatch(setSelectedNode(null));
    };

    return (
        <FlingToDismissModal closeModal={closeModal} open={openMenu == "newNode"} leftHeaderButton={{ onPress: addNewNode, title: "Confirm" }}>
            <View style={{ flex: 1, marginTop: 20 }}>
                <AppText style={{ color: colors.unmarkedText, marginBottom: 10 }} fontSize={16}>
                    Enter the name of the new skill you'll add to the roadmap
                </AppText>

                <AppTextInput
                    placeholder={"Skill Name"}
                    textState={[text, onChangeText]}
                    onlyContainsLettersAndNumbers
                    containerStyles={{ marginBottom: 15 }}
                />
                <RadioInput state={[isCompleted, setIsCompleted]} text={"I Mastered This Skill"} />
            </View>
        </FlingToDismissModal>
    );
}

export default NewNodeModal;
