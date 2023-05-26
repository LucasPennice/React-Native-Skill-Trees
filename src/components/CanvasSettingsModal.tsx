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

type Props = {
    closeModal: () => void;
    open: boolean;
};

function CanvasSettingsModal({ closeModal, open }: Props) {
    const { oneColorPerTree, showCircleGuide, showLabel, homepageTreeColor } = useAppSelector(selectCanvasDisplaySettings);
    const dispatch = useAppDispatch();

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
            <View style={{ flex: 1, marginTop: 20 }}>
                <AppText style={{ color: "white", marginBottom: 10 }} fontSize={24}>
                    Tree Display Menu
                </AppText>
                <AppText style={{ color: colors.unmarkedText, marginBottom: 25 }} fontSize={14}>
                    These settings affect how your tree looks when sharing
                </AppText>

                <ScrollView>
                    <RadioInput state={[showLabel, updateShowLabel]} text={"Show labels"} style={{ marginBottom: 15 }} />
                    <RadioInput state={[oneColorPerTree, updateOneColorPerTree]} text={"One color per tree"} style={{ marginBottom: 15 }} />
                    <RadioInput state={[showCircleGuide, updateShowCircleGuide]} text={"Show circle guide"} />
                    <AppText fontSize={18} style={{ color: "#FFFFFF", marginBottom: 10 }}>
                        Homepage Tree Color
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
