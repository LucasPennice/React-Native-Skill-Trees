import { useEffect, useState } from "react";
import { Alert, TouchableOpacity } from "react-native";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";
import AppText from "../../../components/AppText";
import AppTextInput from "../../../components/AppTextInput";
import RadioInput from "../../../components/RadioInput";
import { colors } from "../../../parameters";
import { generalStyles } from "../../../styles";
import { SkillPropertiesEditableOnPopMenu } from "../../../types";

function Editing({
    newSkillPropsState,
    handleDeleteSelectedNode,
    checkToggleCompletionPermissions,
}: {
    newSkillPropsState: [SkillPropertiesEditableOnPopMenu, React.Dispatch<React.SetStateAction<SkillPropertiesEditableOnPopMenu>>];
    handleDeleteSelectedNode: () => void;
    checkToggleCompletionPermissions: {
        checkComplete: () => boolean;
        checkUnComplete: () => boolean;
    };
}) {
    const { checkComplete, checkUnComplete } = checkToggleCompletionPermissions;

    const [newSkillProps, setNewSkillProps] = newSkillPropsState;
    const [newName, setNewName] = useState(newSkillProps.name);
    const [icon, setIcon] = useState("");

    useEffect(() => {
        if (newSkillProps.icon.isEmoji) setIcon(newSkillProps.icon.text);
    }, []);

    const updateSkillName = (newName: string) => {
        setNewSkillProps((prev: SkillPropertiesEditableOnPopMenu) => {
            return { ...prev, name: newName };
        });
    };

    const updateSkillCompletion = (isCompleted: boolean) => () => {
        if (isCompleted && !checkComplete()) return Alert.alert(`Cannot learn ${newName} because the parent skill is not learned`);
        if (!isCompleted && !checkUnComplete()) return Alert.alert(`Cannot unlearn ${newName}, please unlearn it's children skills first`);

        setNewSkillProps((prev: SkillPropertiesEditableOnPopMenu) => {
            return { ...prev, isCompleted };
        });
    };

    const updateSkillIcon = (tentativeIcon: string) => {
        if (tentativeIcon === "") return setNewSkillProps({ ...newSkillProps, icon: { isEmoji: false, text: newSkillProps.name[0] } });

        return setNewSkillProps({ ...newSkillProps, icon: { isEmoji: true, text: tentativeIcon } });
    };

    useEffect(() => {
        updateSkillName(newName);
    }, [newName]);
    useEffect(() => {
        updateSkillIcon(icon);
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
                state={[newSkillProps.isCompleted, updateSkillCompletion]}
                onPress={updateSkillCompletion(!newSkillProps.isCompleted)}
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
