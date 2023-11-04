import AppButton from "@/components/AppButton";
import AppEmojiPicker, { Emoji, findEmoji } from "@/components/AppEmojiPicker";
import { useEffect, useState } from "react";
import { Alert, Pressable, View } from "react-native";
import Animated, { FadeInDown, FadeOutDown, Layout } from "react-native-reanimated";
import AppText from "../../../components/AppText";
import AppTextInput from "../../../components/AppTextInput";
import RadioInput from "../../../components/RadioInput";
import { colors } from "../../../parameters";
import { SkillIcon, SkillPropertiesEditableOnPopMenu } from "../../../types";
import { toggleEmoji } from "@/functions/misc";

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
    const [emoji, setEmoji] = useState<Emoji | undefined>(undefined);
    const [emojiSelectorOpen, setEmojiSelectorOpen] = useState(false);

    useEffect(() => {
        if (newSkillProps.icon.isEmoji) {
            const selectedEmoji = findEmoji(newSkillProps.icon.text);
            setEmoji(selectedEmoji);
        }
    }, []);

    const handleUpdateSkillName = (newName: string) => updateSkillName(newName);

    const handleUpdateSkillCompletion = (isCompleted: boolean) => () => {
        if (isCompleted && !checkComplete()) return Alert.alert(`Cannot learn ${newName} because the parent skill is not learned`);
        if (!isCompleted && !checkUnComplete()) return Alert.alert(`Cannot unlearn ${newName}, please unlearn it's children skills first`);

        updateSkillCompletion(isCompleted);
    };

    const handleUpdateSkillIcon = (emoji?: Emoji) => {
        if (emoji === undefined) return updateSkillIcon({ isEmoji: false, text: newSkillProps.name[0] });

        return updateSkillIcon({ isEmoji: true, text: emoji.emoji });
    };

    useEffect(() => {
        handleUpdateSkillName(newName);
    }, [newName]);
    useEffect(() => {
        handleUpdateSkillIcon(emoji);
    }, [emoji]);

    return (
        <Animated.View layout={Layout.stiffness(300).damping(26)} entering={FadeInDown} exiting={FadeOutDown}>
            <View style={{ flexDirection: "row", marginBottom: 10 }}>
                <AppTextInput
                    placeholder={"Skill name"}
                    textState={[newName, setNewName]}
                    pattern={new RegExp(/^[^ ]/)}
                    containerStyles={{ flex: 1, backgroundColor: "#282A2C" }}
                />
                <Pressable onPress={() => setEmojiSelectorOpen(true)}>
                    <AppText
                        children={emoji ? emoji.emoji : "🧠"}
                        style={{
                            fontFamily: "emojisMono",
                            color: emoji ? colors.white : colors.line,
                            width: 45,
                            paddingTop: 2,
                            height: 45,
                            backgroundColor: "#282A2C",
                            borderRadius: 10,
                            marginLeft: 10,
                            textAlign: "center",
                            verticalAlign: "middle",
                        }}
                        fontSize={24}
                    />
                </Pressable>
            </View>

            <RadioInput
                text="Complete"
                state={[newSkillProps.isCompleted, handleUpdateSkillCompletion]}
                onPress={handleUpdateSkillCompletion(!newSkillProps.isCompleted)}
                style={{ marginBottom: 10, height: 45, borderRadius: 10 }}
                textProps={{ fontSize: 14, height: 45, verticalAlign: "middle", paddingTop: 4 }}
            />

            <AppButton color={{ idle: colors.red }} onPress={handleDeleteSelectedNode} text={{ idle: "Delete Node" }} />

            <AppEmojiPicker
                selectedEmojisName={emoji ? [emoji.name] : undefined}
                onEmojiSelected={toggleEmoji(setEmoji, emoji)}
                state={[emojiSelectorOpen, setEmojiSelectorOpen]}
            />
        </Animated.View>
    );
}

export default Editing;
