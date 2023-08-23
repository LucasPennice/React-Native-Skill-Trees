import { useEffect, useState } from "react";
import { Alert, TouchableOpacity } from "react-native";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";
import AppText from "../../../components/AppText";
import AppTextInput from "../../../components/AppTextInput";
import RadioInput from "../../../components/RadioInput";
import { colors } from "../../../parameters";
import { generalStyles } from "../../../styles";
import { SkillIcon, SkillPropertiesEditableOnPopMenu } from "../../../types";

function Editing({
    skillPropsState,
    handleDeleteSelectedNode,
    checkToggleCompletionPermissions,
}: {
    skillPropsState: readonly [
        SkillPropertiesEditableOnPopMenu,
        {
            readonly setInitialSkillProps: () => void;
            readonly updateSkillCompletion: (isCompleted: boolean) => void;
            readonly updateSkillIcon: (icon: SkillIcon) => void;
            readonly updateSkillName: (name: string) => void;
        }
    ];
    handleDeleteSelectedNode: () => void;
    checkToggleCompletionPermissions: {
        checkComplete: () => boolean;
        checkUnComplete: () => boolean;
    };
}) {
    const { checkComplete, checkUnComplete } = checkToggleCompletionPermissions;

    const [newSkillProps, { updateSkillCompletion, updateSkillIcon, updateSkillName }] = skillPropsState;
    const [newName, setNewName] = useState(newSkillProps.name);
    const [icon, setIcon] = useState("");

    useEffect(() => {
        if (newSkillProps.icon.isEmoji) setIcon(newSkillProps.icon.text);
    }, []);

    const handleUpdateSkillName = (newName: string) => updateSkillName(newName);

    const handleUpdateSkillCompletion = (isCompleted: boolean) => () => {
        if (isCompleted && !checkComplete()) return Alert.alert(`Cannot learn ${newName} because the parent skill is not learned`);
        if (!isCompleted && !checkUnComplete()) return Alert.alert(`Cannot unlearn ${newName}, please unlearn it's children skills first`);

        updateSkillCompletion(isCompleted);
    };

    const handleUpdateSkillIcon = (tentativeIcon: string) => {
        let updatedIcon: SkillIcon = { isEmoji: true, text: tentativeIcon };

        if (tentativeIcon === "") updatedIcon = { isEmoji: false, text: newSkillProps.name[0] };

        return updateSkillIcon(updatedIcon);
    };

    useEffect(() => {
        handleUpdateSkillName(newName);
    }, [newName]);
    useEffect(() => {
        handleUpdateSkillIcon(icon);
    }, [icon]);

    return (
        <Animated.View layout={Layout.stiffness(300).damping(26)} entering={FadeInDown}>
            <AppTextInput
                placeholder="Skill Name"
                textState={[newName, setNewName]}
                pattern={new RegExp(/^[^ ]/)}
                containerStyles={{ marginBottom: 10 }}
            />

            <RadioInput
                text="Complete"
                state={[newSkillProps.isCompleted, handleUpdateSkillCompletion]}
                onPress={handleUpdateSkillCompletion(!newSkillProps.isCompleted)}
                style={{ marginBottom: 0 }}
            />

            <AppTextInput
                placeholder={"🧠"}
                textStyle={{ fontFamily: "emojisMono", fontSize: 40 }}
                textState={[icon, setIcon]}
                pattern={new RegExp(/\p{Extended_Pictographic}/u)}
                containerStyles={{ width: "100%", marginVertical: 10 }}
            />

            <TouchableOpacity style={[generalStyles.btn, { backgroundColor: "#282A2C", width: "100%" }]} onPress={handleDeleteSelectedNode}>
                <AppText style={{ color: colors.red }} fontSize={16}>
                    Delete Node
                </AppText>
            </TouchableOpacity>
        </Animated.View>
    );
}

export default Editing;
