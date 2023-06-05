import { useNavigation } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { Alert, TouchableOpacity } from "react-native";
import Animated, { FadeInDown, FadeOutUp, Layout } from "react-native-reanimated";
import { StackNavigatorParams } from "../../../../App";
import AppText from "../../../components/AppText";
import AppTextInput from "../../../components/AppTextInput";
import RadioInput from "../../../components/RadioInput";
import ShowHideEmojiSelector from "../../../components/ShowHideEmojiSelector";
import { countSkillNodes } from "../../../functions/extractInformationFromTree";
import { deleteNodeWithNoChildren } from "../../../functions/mutateTree";
import { CIRCLE_SIZE_SELECTED, colors } from "../../../parameters";
import { useAppDispatch, useAppSelector } from "../../../redux/reduxHooks";
import { selectSafeScreenDimentions } from "../../../redux/screenDimentionsSlice";
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
    const navigation = useNavigation<NativeStackScreenProps<StackNavigatorParams>["navigation"]>();
    const { width } = useAppSelector(selectSafeScreenDimentions);
    const MENU_WIDTH = width - 3 * CIRCLE_SIZE_SELECTED;

    const [newSkillProps, setNewSkillProps] = newSkillPropsState;
    const [newName, setNewName] = useState(newSkillProps.name);
    const [icon, setIcon] = useState(newSkillProps.icon.isEmoji ? newSkillProps.icon.text : null);

    const dispatch = useAppDispatch();

    const updateSkillName = (newName: string) => {
        setNewSkillProps((prev: SkillPropertiesEditableOnPopMenu) => {
            return { ...prev, name: newName };
        });
    };

    const updateSkillCompletion = (isCompleted: boolean) => () => {
        setNewSkillProps((prev: SkillPropertiesEditableOnPopMenu) => {
            return { ...prev, isCompleted };
        });
    };

    const updateSkillIcon = (tentativeIcon: string | null) => {
        const skillFirstLetter = newSkillProps.name[0] ?? "-";

        if (tentativeIcon === null) return setNewSkillProps({ ...newSkillProps, icon: { isEmoji: false, text: skillFirstLetter } });

        return setNewSkillProps({ ...newSkillProps, icon: { isEmoji: true, text: tentativeIcon } });
    };

    useEffect(() => {
        updateSkillName(newName);
    }, [newName]);
    useEffect(() => {
        updateSkillIcon(icon);
    }, [icon]);

    const deleteTree = () => {
        dispatch(removeUserTree(selectedTree.treeId));
        navigation.navigate("MyTrees", {});
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
        <Animated.View layout={Layout.stiffness(300).damping(26)} entering={FadeInDown} exiting={FadeOutUp}>
            <AppTextInput
                placeholder="Skill Name"
                textState={[newName, setNewName]}
                onlyContainsLettersAndNumbers
                containerStyles={{ marginBottom: 10 }}
            />

            <RadioInput
                text="Complete"
                state={[newSkillProps.isCompleted, updateSkillCompletion]}
                onPress={updateSkillCompletion(!newSkillProps.isCompleted)}
                style={{ marginBottom: 0 }}
            />

            <ShowHideEmojiSelector emojiState={[icon, setIcon]} containerWidth={MENU_WIDTH - 20} />

            {selectedNode.children.length === 0 && (
                <TouchableOpacity style={[generalStyles.btn, { backgroundColor: "#282A2C" }]} onPress={deleteNode}>
                    <AppText style={{ color: colors.red }} fontSize={16}>
                        Delete Node
                    </AppText>
                </TouchableOpacity>
            )}

            {selectedNode.children.length !== 0 && (
                <TouchableOpacity
                    style={[generalStyles.btn, { backgroundColor: "#282A2C" }]}
                    onPress={() => openChildrenHoistSelector(selectedNode.children)}>
                    <AppText style={{ color: colors.red }} fontSize={18}>
                        Delete Node
                    </AppText>
                </TouchableOpacity>
            )}
        </Animated.View>
    );
}

export default EditSkill;
