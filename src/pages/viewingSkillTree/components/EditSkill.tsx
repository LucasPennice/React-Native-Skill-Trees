import { useNavigation } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { Alert, Pressable, TouchableOpacity } from "react-native";
import { StackNavigatorParams } from "../../../../App";
import AppText from "../../../components/AppText";
import AppTextInput from "../../../components/AppTextInput";
import EmojiSelector from "../../../components/EmojiSelector";
import RadioInput from "../../../components/RadioInput";
import { countSkillNodes } from "../../../functions/extractInformationFromTree";
import { deleteNodeWithNoChildren } from "../../../functions/mutateTree";
import { colors } from "../../../parameters";
import { useAppDispatch } from "../../../redux/reduxHooks";
import { removeUserTree, setSelectedNode, updateUserTrees } from "../../../redux/userTreesSlice";
import { generalStyles } from "../../../styles";
import { Skill, Tree } from "../../../types";
import { SkillPropertiesEditableOnPopMenu } from "./PopUpMenu";

function EditSkill({
    newSkillPropsState,
    selectedNode,
    selectedTree,
    openChildrenHoistSelector,
}: {
    newSkillPropsState: [SkillPropertiesEditableOnPopMenu, React.Dispatch<React.SetStateAction<SkillPropertiesEditableOnPopMenu>>];
    selectedNode: Tree<Skill>;
    selectedTree: Tree<Skill>;
    openChildrenHoistSelector: (candidatesToHoist: Tree<Skill>[]) => void;
}) {
    const [showEmojiSelector, setShowEmojiSelector] = useState(false);
    const [newSkillProps, setNewSkillProps] = newSkillPropsState;
    const [newName, setNewName] = useState(newSkillProps.name);

    const navigation = useNavigation<NativeStackScreenProps<StackNavigatorParams>["navigation"]>();
    const dispatch = useAppDispatch();

    const goToSkillPage = () => {
        navigation.navigate("SkillPage", selectedNode);
    };

    const updateSkillName = (newName: string) => {
        setNewSkillProps((prev: SkillPropertiesEditableOnPopMenu) => {
            return { ...prev, name: newName };
        });
    };

    useEffect(() => {
        updateSkillName(newName);
    }, [newName]);

    const updateSkillCompletion = (isCompleted: boolean) => () => {
        setNewSkillProps((prev: SkillPropertiesEditableOnPopMenu) => {
            return { ...prev, isCompleted };
        });
    };

    const updateSkillIcon = (tentativeIcon: string) => {
        const skillFirstLetter = newSkillProps.name[0] ?? "-";

        if (newSkillProps.icon.text === tentativeIcon)
            return setNewSkillProps({ ...newSkillProps, icon: { isEmoji: false, text: skillFirstLetter } });

        return setNewSkillProps({ ...newSkillProps, icon: { isEmoji: true, text: tentativeIcon } });
    };

    const deleteTree = () => {
        dispatch(removeUserTree(selectedTree.treeId));
        navigation.navigate("MyTrees");
    };

    const confirmDeleteTree = () =>
        Alert.alert(
            `Deleting ${selectedNode.data.name} will also delete ${selectedTree.treeName}`,
            "Are you sure you want to continue?",
            [
                { text: "No", style: "cancel" },
                { text: "Yes", onPress: deleteTree, style: "destructive" },
            ],
            { cancelable: true }
        );

    const deleteNode = () => {
        const isLastChildrenRemaining = countSkillNodes(selectedTree) === 1;

        if (isLastChildrenRemaining) return confirmDeleteTree();

        const result = deleteNodeWithNoChildren(selectedTree, selectedNode);
        dispatch(updateUserTrees(result));
        dispatch(setSelectedNode(null));
    };

    return (
        <>
            <AppTextInput
                placeholder="Skill Name"
                textState={[newName, setNewName]}
                onlyContainsLettersAndNumbers
                containerStyles={{ marginBottom: 10 }}
            />

            <RadioInput
                text="Mastered"
                state={[newSkillProps.isCompleted, updateSkillCompletion]}
                onPress={updateSkillCompletion(!newSkillProps.isCompleted)}
                style={{ marginBottom: 0 }}
            />

            <Pressable
                style={[generalStyles.btn, { backgroundColor: "#282A2C", marginVertical: 10 }]}
                onPress={() => setShowEmojiSelector(!showEmojiSelector)}>
                <AppText style={{ color: colors.accent }} fontSize={18}>
                    {showEmojiSelector ? "Close" : "Edit Skill Icon"}
                </AppText>
            </Pressable>

            {showEmojiSelector && <EmojiSelector selectedEmoji={newSkillProps.icon.text} onEmojiClick={updateSkillIcon} />}
            <TouchableOpacity style={[generalStyles.btn, { backgroundColor: "#282A2C", marginBottom: 10 }]} onPress={goToSkillPage}>
                <AppText style={{ color: colors.accent }} fontSize={18}>
                    Go To Skill Page
                </AppText>
            </TouchableOpacity>
            {selectedNode.children.length === 0 && (
                <TouchableOpacity style={[generalStyles.btn, { backgroundColor: "#282A2C" }]} onPress={deleteNode}>
                    <AppText style={{ color: colors.red }} fontSize={18}>
                        Delete Node
                    </AppText>
                </TouchableOpacity>
            )}

            {selectedNode.children.length != 0 && (
                <TouchableOpacity
                    style={[generalStyles.btn, { backgroundColor: "#282A2C" }]}
                    onPress={() => openChildrenHoistSelector(selectedNode.children)}>
                    <AppText style={{ color: colors.red }} fontSize={18}>
                        Delete Node
                    </AppText>
                </TouchableOpacity>
            )}
        </>
    );
}

export default EditSkill;
