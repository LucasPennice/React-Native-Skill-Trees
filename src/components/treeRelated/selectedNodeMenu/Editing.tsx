import { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
import Animated, { FadeInDown, FadeOutUp, Layout } from "react-native-reanimated";
import AppText from "../../../components/AppText";
import AppTextInput from "../../../components/AppTextInput";
import RadioInput from "../../../components/RadioInput";
import ShowHideEmojiSelector from "../../../components/ShowHideEmojiSelector";
import { CIRCLE_SIZE_SELECTED, colors } from "../../../parameters";
import { useAppSelector } from "../../../redux/reduxHooks";
import { selectSafeScreenDimentions } from "../../../redux/screenDimentionsSlice";
import { generalStyles } from "../../../styles";
import { SkillPropertiesEditableOnPopMenu } from "../../../types";

function Editing({
    newSkillPropsState,
    handleDeleteSelectedNode,
}: {
    newSkillPropsState: [SkillPropertiesEditableOnPopMenu, React.Dispatch<React.SetStateAction<SkillPropertiesEditableOnPopMenu>>];
    handleDeleteSelectedNode: () => void;
}) {
    const { width } = useAppSelector(selectSafeScreenDimentions);
    const MENU_WIDTH = width - 3 * CIRCLE_SIZE_SELECTED;

    const [newSkillProps, setNewSkillProps] = newSkillPropsState;
    const [newName, setNewName] = useState(newSkillProps.name);
    const [icon, setIcon] = useState(newSkillProps.icon.isEmoji ? newSkillProps.icon.text : null);

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
        if (tentativeIcon === null) return setNewSkillProps({ ...newSkillProps, icon: { isEmoji: false, text: newSkillProps.name } });

        return setNewSkillProps({ ...newSkillProps, icon: { isEmoji: true, text: tentativeIcon } });
    };

    useEffect(() => {
        updateSkillName(newName);
    }, [newName]);
    useEffect(() => {
        updateSkillIcon(icon);
    }, [icon]);

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

            <TouchableOpacity style={[generalStyles.btn, { backgroundColor: "#282A2C" }]} onPress={handleDeleteSelectedNode}>
                <AppText style={{ color: colors.red }} fontSize={16}>
                    Delete Node
                </AppText>
            </TouchableOpacity>
        </Animated.View>
    );
}

export default Editing;
