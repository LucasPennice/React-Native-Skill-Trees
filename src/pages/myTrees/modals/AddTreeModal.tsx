import { Button, Modal, Pressable, SafeAreaView, ScrollView, View } from "react-native";
import { centerFlex } from "../../../types";
import { useAppDispatch, useAppSelector } from "../../../redux/reduxHooks";
import { close, selectAddTree } from "../../../redux/addTreeSlice";
import { colors, possibleTreeColors } from "../../homepage/canvas/parameters";
import { useState } from "react";
import AppTextInput from "../../../AppTextInput";
import FlingToDismissModal from "../../../FlingToDismissModal";
import AppText from "../../../AppText";
import ColorSelector from "../../../ColorsSelector";

function AddTreeModal() {
    //Local State
    const [treeName, setTreeName] = useState("");

    //Redux State
    const { open } = useAppSelector(selectAddTree);

    const dispatch = useAppDispatch();

    const closeModal = () => dispatch(close());

    return (
        <FlingToDismissModal closeModal={closeModal} open={open}>
            <ScrollView>
                <AppTextInput placeholder={"Tree Name"} textState={[treeName, setTreeName]} containerStyles={{ marginVertical: 20 }} />
                <AppText style={{ color: colors.unmarkedText }}>Select an accent color for your new tree</AppText>
                <AppText style={{ color: colors.unmarkedText, marginBottom: 10 }}>
                    Completed skills and progress bars will show with this color
                </AppText>
                <AppText style={{ color: colors.unmarkedText, marginBottom: 10 }}>Scroll to see more colors</AppText>
                <ColorSelector colorsArray={possibleTreeColors} />
                <AppText style={{ color: colors.unmarkedText, marginTop: 10 }}>Enter the name of the first skill your tree will have</AppText>
                <AppText style={{ color: colors.unmarkedText }}>Every other skill will stem from it</AppText>
                <AppTextInput
                    placeholder={"First Skill Name"}
                    textState={[treeName, setTreeName]}
                    containerStyles={{ marginTop: 10, marginBottom: 20 }}
                />
                <AppText style={{ color: colors.unmarkedText }}>Enter the name of the first skill your tree will have</AppText>
                <AppText style={{ color: colors.unmarkedText }}>Every other skill will stem from it</AppText>
                <AppTextInput
                    placeholder={"First Skill Name"}
                    textState={[treeName, setTreeName]}
                    containerStyles={{ marginTop: 10, marginBottom: 20 }}
                />
            </ScrollView>
        </FlingToDismissModal>
    );
}

export default AddTreeModal;
