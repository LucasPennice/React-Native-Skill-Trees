import { ScrollView, View } from "react-native";
import { colors, possibleTreeColors } from "../parameters";
import {
    selectCanvasDisplaySettings,
    setHomepageTreeColor,
    setOneColorPerTree,
    setShowCircleGuide,
    setShowLabel,
} from "../redux/canvasDisplaySettingsSlice";
import { useAppDispatch, useAppSelector } from "../redux/reduxHooks";
import AppText from "./AppText";
import FlingToDismissModal from "./FlingToDismissModal";
import RadioInput from "./RadioInput";
import ColorSelector from "./ColorsSelector";
import AppTextInput from "./AppTextInput";
import { useEffect, useState } from "react";

type Props = {
    closeModal: () => void;
    open: boolean;
};

function CanvasSettingsModal({ closeModal, open }: Props) {
    const { oneColorPerTree, showCircleGuide, showLabel, homepageTreeColor } = useAppSelector(selectCanvasDisplaySettings);
    const dispatch = useAppDispatch();

    const [homeTreeName, setHomeTreeName] = useState("");

    useEffect(() => {}, []);

    const updateOneColorPerTree = (v: boolean) => {
        dispatch(setOneColorPerTree(v));
    };
    const updateShowCircleGuide = (v: boolean) => {
        dispatch(setShowCircleGuide(v));
    };
    const updateShowLabel = (v: boolean) => {
        dispatch(setShowLabel(v));
    };
    const updateHomepageTreeColor = (v: string) => {
        dispatch(setHomepageTreeColor(v));
    };

    return (
        <FlingToDismissModal closeModal={closeModal} open={open}>
            <View style={{ flex: 1 }}>
                <ScrollView>
                    <AppText style={{ color: "white", marginBottom: 10, fontFamily: "helveticaBold" }} fontSize={24}>
                        General Skill Tree Styles
                    </AppText>
                    <AppText style={{ color: colors.unmarkedText, marginBottom: 25 }} fontSize={16}>
                        These settings affect how every skill tree looks
                    </AppText>
                    <RadioInput state={[showLabel, updateShowLabel]} text={"Show labels"} style={{ marginBottom: 15 }} />
                    <AppText style={{ color: "white", marginBottom: 10, fontFamily: "helveticaBold" }} fontSize={24}>
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
                    <ColorSelector colorsArray={possibleTreeColors} state={[homepageTreeColor, updateHomepageTreeColor]} />
                </ScrollView>
            </View>
        </FlingToDismissModal>
    );
}

export default CanvasSettingsModal;
