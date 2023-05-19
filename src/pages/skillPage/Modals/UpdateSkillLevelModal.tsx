import { useEffect, useState } from "react";
import { Alert } from "react-native";
import AppText from "../../../components/AppText";
import AppTextInput from "../../../components/AppTextInput";
import FlingToDismissModal from "../../../components/FlingToDismissModal";
import { SkillLevel } from "../../../types";
import { SkillModal, getDefaultFns } from "../SkillPage";

type ModalProps = {
    state: SkillModal<SkillLevel>;
    closeModal: () => void;
    mutateSkillLevel: (newSkillLevel: SkillLevel | undefined) => void;
};

function UpdateSkillLevelModal({ closeModal, mutateSkillLevel, state }: ModalProps) {
    //Props
    const { data, open } = state;
    //Local State
    const [starting, setStarting] = useState<SkillLevel["starting"]>(data.starting);
    const [ideal, setIdeal] = useState<SkillLevel["ideal"]>(data.ideal);

    const newSkillLevel: SkillLevel = { ideal, starting };

    const updateSkillDetailsIfNewLogValid = (newSkillLevel: SkillLevel) => () => {
        const valid = starting !== "" && ideal !== "";

        if (!valid) return Alert.alert("Cannot be empty");

        overrideSkillLevel(newSkillLevel);

        function overrideSkillLevel(newSkillLevel: SkillLevel) {
            const result = { ...newSkillLevel };
            mutateSkillLevel(result);
            closeModal();
        }
    };

    useEffect(() => {
        if (state.open) {
            setStarting(state.data.starting);
            setIdeal(state.data.ideal);
            return;
        }

        const defaultResource = getDefaultFns.skillLevel();

        setStarting(defaultResource.starting);
        setIdeal(defaultResource.ideal);
    }, [state]);

    return (
        <FlingToDismissModal
            closeModal={closeModal}
            open={open}
            leftHeaderButton={{ onPress: updateSkillDetailsIfNewLogValid(newSkillLevel), title: "Save" }}>
            <>
                <AppText fontSize={20} style={{ color: "white", fontFamily: "helveticaBold" }}>
                    Starting
                </AppText>
                <AppTextInput placeholder={"Starting"} textState={[starting, setStarting]} onlyContainsLettersAndNumbers />
                <AppText fontSize={20} style={{ color: "white", fontFamily: "helveticaBold" }}>
                    Ideal
                </AppText>
                <AppTextInput placeholder={"Description"} textState={[ideal, setIdeal]} onlyContainsLettersAndNumbers />
            </>
        </FlingToDismissModal>
    );
}

export default UpdateSkillLevelModal;
