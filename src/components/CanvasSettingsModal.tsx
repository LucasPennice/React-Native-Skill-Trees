import { memo, useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { colors, nodeGradients } from "../parameters";
import {
    selectCanvasDisplaySettings,
    setHomepageTreeColor,
    setOneColorPerTree,
    setShowCircleGuide,
    setShowIcons,
    setShowLabel,
    setHomepageTreeName,
} from "../redux/canvasDisplaySettingsSlice";
import { useAppDispatch, useAppSelector } from "../redux/reduxHooks";
import { ColorGradient } from "../types";
import AppText from "./AppText";
import AppTextInput from "./AppTextInput";
import ColorGradientSelector from "./ColorGradientSelector";
import FlingToDismissModal from "./FlingToDismissModal";
import RadioInput from "./RadioInput";

type Props = {
    closeModal: () => void;
    open: boolean;
};

function CanvasSettingsModal({ closeModal, open }: Props) {
    const { oneColorPerTree, showCircleGuide, showLabel, homepageTreeColor, showIcons, homepageTreeName } =
        useAppSelector(selectCanvasDisplaySettings);
    const dispatch = useAppDispatch();

    const [homeTreeName, setHomeTreeName] = useState(homepageTreeName);

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

    return (
        <FlingToDismissModal closeModal={closeModal} open={open}>
            <View style={{ flex: 1 }}>
                <ScrollView>
                    <AppText style={{ color: "#FFFFFF", marginBottom: 10, fontFamily: "helveticaBold" }} fontSize={24}>
                        General Skill Tree Styles
                    </AppText>
                    <AppText style={{ color: colors.unmarkedText, marginBottom: 25 }} fontSize={16}>
                        These settings affect how every skill tree looks
                    </AppText>
                    <RadioInput state={[showLabel, updateShowLabel]} text={"Show labels"} style={{ marginBottom: 15 }} />
                    <RadioInput state={[showIcons, updateShowIcons]} text={"Show Icons"} style={{ marginBottom: 15 }} />
                    <AppText style={{ color: "#FFFFFF", marginBottom: 10, fontFamily: "helveticaBold" }} fontSize={24}>
                        Home Skill Tree Styles
                    </AppText>
                    <AppText style={{ color: colors.unmarkedText, marginBottom: 15 }} fontSize={16}>
                        These settings affect how the home skill tree looks
                    </AppText>
                    <AppTextInput
                        placeholder="Home Tree Name"
                        textState={[homeTreeName, setHomeTreeName]}
                        onlyContainsLettersAndNumbers
                        containerStyles={{ marginBottom: 15 }}
                    />

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
