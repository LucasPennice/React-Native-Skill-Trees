import { memo, useEffect, useState } from "react";
import { Dimensions, ScrollView, View } from "react-native";
import { colors, nodeGradients } from "../../../parameters";
import {
    selectCanvasDisplaySettings,
    setHomepageTreeColor,
    setHomepageTreeIcon,
    setHomepageTreeName,
    setOneColorPerTree,
    setShowCircleGuide,
    setShowIcons,
    setShowLabel,
} from "../../../redux/canvasDisplaySettingsSlice";
import { useAppDispatch, useAppSelector } from "../../../redux/reduxHooks";
import { ColorGradient } from "../../../types";
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

function CanvasSettingsModal({ closeModal, open }: Props) {
    const { oneColorPerTree, showCircleGuide, showLabel, homepageTreeColor, showIcons, homepageTreeName } =
        useAppSelector(selectCanvasDisplaySettings);
    const { width } = Dimensions.get("screen");
    const dispatch = useAppDispatch();

    const [homeTreeName, setHomeTreeName] = useState(homepageTreeName);
    const [icon, setIcon] = useState("");

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
        dispatch(setHomepageTreeColor(v));
    };
    const updateShowIcons = (v: boolean) => {
        dispatch(setShowIcons(v));
    };

    useEffect(() => {
        if (homeTreeName === "") return;
        dispatch(setHomepageTreeName(homeTreeName));
    }, [homeTreeName]);

    useEffect(() => {
        dispatch(setHomepageTreeIcon(icon));
    }, [icon]);

    const state = {
        showCircleGuide,
        showLabel,
        homepageTreeIcon: icon,
        homepageTreeColor,
        oneColorPerTree,
        showIcons,
        homepageTreeName: homeTreeName,
    };

    return (
        <FlingToDismissModal closeModal={closeModal} open={open}>
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
                        textState={[homeTreeName, setHomeTreeName]}
                        pattern={new RegExp(/^[^ ]/)}
                        containerStyles={{ marginBottom: 15 }}
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
                            textState={[icon, setIcon]}
                            pattern={new RegExp(/\p{Extended_Pictographic}/u)}
                            containerStyles={{ width: 130 }}
                        />
                    </View>

                    <RadioInput state={[oneColorPerTree, updateOneColorPerTree]} text={"Monochromatic"} style={{ marginBottom: 15 }} />
                    <RadioInput state={[showCircleGuide, updateShowCircleGuide]} text={"Show depth guides"} />
                    <AppText fontSize={18} style={{ color: "#FFFFFF", marginBottom: 10 }}>
                        Tree Color
                    </AppText>
                    <AppText fontSize={14} style={{ color: colors.unmarkedText, marginBottom: 5 }}>
                        Completed skills and progress bars will show with this color
                    </AppText>
                    <AppText fontSize={14} style={{ color: colors.unmarkedText, marginBottom: 10 }}>
                        Scroll to see more colors
                    </AppText>
                    <ColorGradientSelector colorsArray={nodeGradients} state={[homepageTreeColor, updateHomepageTreeColor]} />
                </ScrollView>
            </View>
        </FlingToDismissModal>
    );
}

export default memo(CanvasSettingsModal);
