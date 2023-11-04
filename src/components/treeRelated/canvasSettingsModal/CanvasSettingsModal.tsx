import AppEmojiPicker, { Emoji, findEmoji } from "@/components/AppEmojiPicker";
import { toggleEmoji } from "@/functions/misc";
import { selectHomeTree, updateHomeAccentColor, updateHomeIcon, updateHomeName } from "@/redux/slices/homeTreeSlice";
import { memo, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { colors, nodeGradients } from "../../../parameters";
import { useAppDispatch, useAppSelector } from "../../../redux/reduxHooks";
import {
    selectCanvasDisplaySettings,
    setOneColorPerTree,
    setShowCircleGuide,
    setShowIcons,
    setShowLabel,
} from "../../../redux/slices/canvasDisplaySettingsSlice";
import { ColorGradient, SkillIcon } from "../../../types";
import AppText from "../../AppText";
import AppTextInput from "../../AppTextInput";
import ColorGradientSelector from "../../ColorGradientSelector";
import FlingToDismissModal from "../../FlingToDismissModal";
import RadioInput from "../../RadioInput";
import GeneralTreeExample from "./GeneralTreeExample";
import HomePageTreeExample from "./HomePageTreeExample";
import Spacer from "@/components/Spacer";

type Props = {
    closeModal: () => void;
    open: boolean;
};

function useSetInitialIconValue(treeDataIcon: SkillIcon, setEmoji: (v: Emoji) => void) {
    useEffect(() => {
        if (treeDataIcon.isEmoji) {
            const selectedEmoji = findEmoji(treeDataIcon.text);
            setEmoji(selectedEmoji);
        }
    }, []);
}

function CanvasSettingsModal({ closeModal, open }: Props) {
    const { oneColorPerTree, showCircleGuide, showLabel, showIcons } = useAppSelector(selectCanvasDisplaySettings);
    const { accentColor, icon, treeName } = useAppSelector(selectHomeTree);

    const dispatch = useAppDispatch();

    const closeModalOrWarning = () => {
        if (newHomeTreeName === "") return Alert.alert("Home tree name cannot be empty");
        return closeModal();
    };

    const [newHomeTreeName, setNewHomeTreeName] = useState(treeName);
    const [emoji, setEmoji] = useState<Emoji | undefined>(undefined);
    const [emojiSelectorOpen, setEmojiSelectorOpen] = useState(false);

    const updateOneColorPerTree = (v: boolean) => {
        dispatch(setOneColorPerTree(v));
    };
    const updateShowCircleGuide = (v: boolean) => {
        dispatch(setShowCircleGuide(v));
    };
    const updateShowLabel = (v: boolean) => {
        dispatch(setShowLabel(v));
    };
    const updateHomepageTreeColor = (v: ColorGradient) => {
        dispatch(updateHomeAccentColor(v));
    };
    const updateShowIcons = (v: boolean) => {
        dispatch(setShowIcons(v));
    };

    useSetInitialIconValue(icon, setEmoji);

    useEffect(() => {
        if (newHomeTreeName === "") return;
        dispatch(updateHomeName(newHomeTreeName));

        if (emoji === undefined) dispatch(updateHomeIcon({ isEmoji: false, text: newHomeTreeName[0] }));
    }, [newHomeTreeName]);

    useEffect(() => {
        if (emoji) {
            dispatch(updateHomeIcon({ isEmoji: true, text: emoji.emoji }));
            return;
        }

        dispatch(updateHomeIcon({ isEmoji: false, text: newHomeTreeName[0] }));
    }, [emoji]);

    const state = {
        showCircleGuide,
        showLabel,
        homepageTreeIcon: emoji ? emoji.emoji : newHomeTreeName[0],
        homepageTreeColor: accentColor,
        oneColorPerTree,
        showIcons,
        homepageTreeName: newHomeTreeName,
    };

    return (
        <FlingToDismissModal closeModal={closeModalOrWarning} open={open} modalContainerStyles={{ backgroundColor: colors.background }}>
            <View style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <AppText style={{ marginBottom: 5 }} fontSize={18}>
                        General Skill Tree Styles
                    </AppText>
                    <AppText style={{ color: `${colors.white}80`, marginBottom: 10 }} fontSize={16}>
                        These settings affect how every skill tree looks
                    </AppText>
                    <View style={{ flexDirection: "row", gap: 10 }}>
                        <GeneralTreeExample showIcons={showIcons} showLabel={showLabel} />
                        <View style={{ flex: 1 }}>
                            <RadioInput
                                state={[showLabel, updateShowLabel]}
                                text={"Show labels"}
                                iconProps={{ name: "pencil", size: 18, color: `${colors.white}80` }}
                                textProps={{ fontSize: 16, paddingTop: 3 }}
                                style={{ height: 45, backgroundColor: colors.darkGray, marginBottom: 10 }}
                            />
                            <RadioInput
                                state={[showIcons, updateShowIcons]}
                                textProps={{ fontSize: 16, paddingTop: 3 }}
                                iconProps={{ name: "gamepad", size: 20, color: `${colors.white}80` }}
                                text={"Show Icons"}
                                style={{ height: 45, backgroundColor: colors.darkGray, marginBottom: 10 }}
                            />
                        </View>
                    </View>

                    <Spacer style={{ marginVertical: 10 }} />

                    <AppText style={{ marginTop: 10, marginBottom: 5 }} fontSize={18}>
                        Home Skill Tree Styles
                    </AppText>
                    <AppText style={{ color: `${colors.white}80`, marginBottom: 10 }} fontSize={16}>
                        These settings affect how the home skill tree looks
                    </AppText>

                    <HomePageTreeExample state={state} />

                    <View style={{ flexDirection: "row", marginBottom: 10 }}>
                        <AppTextInput
                            placeholder={"Education"}
                            textState={[newHomeTreeName, setNewHomeTreeName]}
                            pattern={new RegExp(/^[^ ]/)}
                            containerStyles={{ flex: 1 }}
                            onBlur={() => {
                                if (newHomeTreeName === "") {
                                    Alert.alert("Tree name cannot be empty");
                                    setNewHomeTreeName(treeName);
                                }
                            }}
                        />
                        <Pressable onPress={() => setEmojiSelectorOpen(true)}>
                            <AppText
                                children={emoji ? emoji.emoji : "🧠"}
                                style={{
                                    fontFamily: "emojisMono",
                                    color: emoji ? accentColor.color1 : colors.line,
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

                    <RadioInput
                        state={[oneColorPerTree, updateOneColorPerTree]}
                        text={"Use only root color"}
                        iconProps={{ name: "paint-brush", size: 18, color: `${colors.white}80` }}
                        textProps={{ fontSize: 16, paddingTop: 3 }}
                        style={{ marginBottom: 10, height: 45, backgroundColor: colors.darkGray, borderRadius: 10 }}
                    />
                    <RadioInput
                        state={[showCircleGuide, updateShowCircleGuide]}
                        text={"Depth guides"}
                        iconProps={{ name: "dot-circle-o", size: 20, color: `${colors.white}80` }}
                        textProps={{ fontSize: 16, paddingTop: 3 }}
                        style={{ marginBottom: 15, height: 45, backgroundColor: colors.darkGray, borderRadius: 10 }}
                    />

                    <AppText fontSize={18} style={{ color: colors.white }}>
                        Tree Color
                    </AppText>

                    <AppText fontSize={14} style={{ color: `${colors.white}80`, marginBottom: 10 }}>
                        Scroll to see more colors
                    </AppText>

                    <ColorGradientSelector
                        colorsArray={nodeGradients}
                        state={[accentColor, updateHomepageTreeColor]}
                        containerStyle={{ backgroundColor: colors.darkGray, borderRadius: 10 }}
                    />
                </ScrollView>
                <AppEmojiPicker
                    selectedEmojisName={emoji ? [emoji.name] : undefined}
                    onEmojiSelected={toggleEmoji(setEmoji, emoji)}
                    state={[emojiSelectorOpen, setEmojiSelectorOpen]}
                />
            </View>
        </FlingToDismissModal>
    );
}

export default memo(CanvasSettingsModal);
