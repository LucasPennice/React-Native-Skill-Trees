import { ScrollView, View } from "react-native";
import { colors } from "../parameters";
import { selectCanvasDisplaySettings, setOneColorPerTree, setShowCircleGuide, setShowLabel } from "../redux/canvasDisplaySettingsSlice";
import { useAppDispatch, useAppSelector } from "../redux/reduxHooks";
import AppText from "./AppText";
import FlingToDismissModal from "./FlingToDismissModal";
import RadioInput from "./RadioInput";

type Props = {
    closeModal: () => void;
    open: boolean;
};

function CanvasSettingsModal({ closeModal, open }: Props) {
    const { oneColorPerTree, showCircleGuide, showLabel } = useAppSelector(selectCanvasDisplaySettings);
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

    return (
        <FlingToDismissModal closeModal={closeModal} open={open}>
            <View style={{ flex: 1, marginTop: 20 }}>
                <AppText style={{ color: "white", marginBottom: 10 }} fontSize={24}>
                    Tree Display Menu
                </AppText>
                <AppText style={{ color: colors.line, marginBottom: 25 }} fontSize={14}>
                    These settings affect how your tree looks when sharing
                </AppText>

                <ScrollView>
                    <RadioInput state={[showLabel, updateShowLabel]} text={"Show labels"} style={{ marginBottom: 15 }} />
                    <RadioInput state={[oneColorPerTree, updateOneColorPerTree]} text={"One color per tree"} style={{ marginBottom: 15 }} />
                    <RadioInput state={[showCircleGuide, updateShowCircleGuide]} text={"Show circle guide"} />
                </ScrollView>
            </View>
        </FlingToDismissModal>
    );
}

export default CanvasSettingsModal;
