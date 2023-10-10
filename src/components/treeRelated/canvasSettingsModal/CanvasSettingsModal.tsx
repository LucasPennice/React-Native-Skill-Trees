import { selectHomeTree, updateHomeAccentColor, updateHomeIcon, updateHomeName } from "@/redux/slices/homeTreeSlice";
import { memo, useEffect, useState } from "react";
import { Alert, Dimensions, ScrollView, View } from "react-native";
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

type Props = {
    closeModal: () => void;
    open: boolean;
};

function useSetInitialIconValue(treeDataIcon: SkillIcon, updateIconState: (v: string) => void) {
    useEffect(() => {
        if (treeDataIcon.isEmoji) updateIconState(treeDataIcon.text);
    }, []);
}

function CanvasSettingsModal({ closeModal, open }: Props) {
    const { oneColorPerTree, showCircleGuide, showLabel, showIcons } = useAppSelector(selectCanvasDisplaySettings);
    const { accentColor, icon, treeName } = useAppSelector(selectHomeTree);

    const { width } = Dimensions.get("screen");
    const dispatch = useAppDispatch();

    const closeModalOrWarning = () => {
        if (newHomeTreeName === "") return Alert.alert("Home tree name cannot be empty");
        return closeModal();
    };

    const [newHomeTreeName, setNewHomeTreeName] = useState(treeName);
    const [newIcon, setIcon] = useState<string>("");

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

    useSetInitialIconValue(icon, (v: string) => setIcon(v));

    useEffect(() => {
        if (newHomeTreeName === "") return;
        dispatch(updateHomeName(newHomeTreeName));

        if (newIcon === "") dispatch(updateHomeIcon({ isEmoji: false, text: newHomeTreeName[0] }));
    }, [newHomeTreeName]);

    useEffect(() => {
        if (newIcon !== "") {
            dispatch(updateHomeIcon({ isEmoji: true, text: newIcon }));
            return;
        }

        dispatch(updateHomeIcon({ isEmoji: false, text: newHomeTreeName[0] }));
    }, [newIcon]);

    const state = {
        showCircleGuide,
        showLabel,
        homepageTreeIcon: newIcon,
        homepageTreeColor: accentColor,
        oneColorPerTree,
        showIcons,
        homepageTreeName: newHomeTreeName,
    };

    return (
        <FlingToDismissModal closeModal={closeModalOrWarning} open={open}>
            <View style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <AppText style={{ color: "#FFFFFF", marginBottom: 10, fontFamily: "helveticaBold" }} fontSize={24}>
                        General Skill Tree Styles
                    </AppText>
                    <AppText style={{ color: colors.unmarkedText, marginBottom: 25 }} fontSize={16}>
                        These settings affect how every skill tree looks
                    </AppText>
                    <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
                        <GeneralTreeExample showIcons={showIcons} showLabel={showLabel} />
                        <View style={{ flex: 1 }}>
                            <RadioInput state={[showLabel, updateShowLabel]} text={"Show labels"} style={{ marginBottom: 15 }} />
                            <RadioInput state={[showIcons, updateShowIcons]} text={"Show Icons"} style={{ marginBottom: 15 }} />
                        </View>
                    </View>
                    <AppText style={{ color: "#FFFFFF", marginBottom: 10, fontFamily: "helveticaBold" }} fontSize={24}>
                        Home Skill Tree Styles
                    </AppText>
                    <AppText style={{ color: colors.unmarkedText, marginBottom: 15 }} fontSize={16}>
                        These settings affect how the home skill tree looks
                    </AppText>

                    <HomePageTreeExample state={state} />

                    <AppTextInput
                        placeholder="Home Tree Name"
                        textState={[newHomeTreeName, setNewHomeTreeName]}
                        pattern={new RegExp(/^[^ ]/)}
                        containerStyles={{ marginBottom: 15 }}
                        onBlur={() => {
                            if (newHomeTreeName === "") {
                                Alert.alert("Tree name cannot be empty");
                                setNewHomeTreeName(treeName);
                            }
                        }}
                    />

                    <View style={{ flexDirection: "row", marginBottom: 15, justifyContent: "space-between", alignItems: "center" }}>
                        <View style={{ width: width - 160 }}>
                            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                                <AppText style={{ color: "#FFFFFF", marginBottom: 5 }} fontSize={20}>
                                    Icon
                                </AppText>
                                <AppText style={{ color: colors.unmarkedText, marginLeft: 5, marginTop: 2 }} fontSize={16}>
                                    (optional)
                                </AppText>
                            </View>
                            <AppText style={{ color: colors.unmarkedText, marginBottom: 10 }} fontSize={14}>
                                Your keyboard can switch to an emoji mode. To access it, look for a button located near the bottom left of your
                                keyboard.
                            </AppText>
                        </View>
                        <AppTextInput
                            placeholder={"🧠"}
                            textStyle={{ fontFamily: "emojisMono", fontSize: 40 }}
                            textState={[newIcon, setIcon]}
                            pattern={new RegExp(/\p{Extended_Pictographic}/u)}
                            containerStyles={{ width: 130 }}
                        />
                    </View>

                    <RadioInput state={[oneColorPerTree, updateOneColorPerTree]} text={"Monochromatic"} style={{ marginBottom: 15 }} />
                    <RadioInput state={[showCircleGuide, updateShowCircleGuide]} text={"Show depth guides"} />
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 5 }}>
                        <AppText fontSize={18} style={{ color: "#FFFFFF" }}>
                            Tree Color
                        </AppText>
                        <AppText fontSize={14} style={{ color: colors.unmarkedText }}>
                            (Required)
                        </AppText>
                    </View>
                    <AppText fontSize={14} style={{ color: colors.unmarkedText, marginBottom: 5 }}>
                        Completed skills and progress bars will show with this color
                    </AppText>
                    <AppText fontSize={14} style={{ color: colors.unmarkedText, marginBottom: 10 }}>
                        Scroll to see more colors
                    </AppText>
                    <ColorGradientSelector colorsArray={nodeGradients} state={[accentColor, updateHomepageTreeColor]} />
                </ScrollView>
            </View>
        </FlingToDismissModal>
    );
}

export default memo(CanvasSettingsModal);
