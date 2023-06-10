import { useEffect, useState } from "react";
import { Alert } from "react-native";
import AppText from "../../../components/AppText";
import AppTextInput from "../../../components/AppTextInput";
import FlingToDismissModal from "../../../components/FlingToDismissModal";
import { MotiveToLearn, SkillModal } from "../../../types";
import { getDefaultFns } from "../functions";

type ModalProps = {
    state: SkillModal<MotiveToLearn>;
    closeModal: () => void;
    mutateMotivesToLearn: (newMotiveToLearns: MotiveToLearn[]) => void;
    motivesToLearn: MotiveToLearn[];
};
function UpdateMotivesToLearnModal({ closeModal, motivesToLearn, mutateMotivesToLearn, state }: ModalProps) {
    //Props
    const { data, open } = state;
    //Local State
    const [text, setText] = useState<MotiveToLearn["text"]>(data.text);

    const newMotiveToLearn: MotiveToLearn = { text, id: state.data.id };

    const isEditing = checkIfEditing();

    const updateSkillMotiveToLearnIfNewMotiveValid = (newMotiveToLearn: MotiveToLearn, editing: boolean) => () => {
        const valid = text !== "";

        if (!valid) return Alert.alert("Text cannot be empty");

        if (editing) return updateMotiveToLearn(newMotiveToLearn);

        addMotive(newMotiveToLearn);

        function addMotive(newMotiveToLearn: MotiveToLearn) {
            const result = [...motivesToLearn, newMotiveToLearn];
            mutateMotivesToLearn(result);
            closeModal();
        }
        function updateMotiveToLearn(newMotiveToLearn: MotiveToLearn) {
            const result = motivesToLearn.map((motive) => {
                if (motive.id === newMotiveToLearn.id) return newMotiveToLearn;

                return motive;
            });
            mutateMotivesToLearn(result);
            closeModal();
        }
    };

    useEffect(() => {
        if (state.open) {
            setText(state.data.text);
            return;
        }

        const defaultResource = getDefaultFns.motivesToLearn();

        setText(defaultResource.text);
    }, [state]);

    return (
        <FlingToDismissModal
            closeModal={closeModal}
            open={open}
            leftHeaderButton={{ onPress: updateSkillMotiveToLearnIfNewMotiveValid(newMotiveToLearn, isEditing), title: isEditing ? "Edit" : "Add" }}>
            <>
                <AppText fontSize={24} style={{ color: "#FFFFFF", fontFamily: "helveticaBold", marginBottom: 5 }}>
                    Motive To Learn
                </AppText>
                <AppTextInput placeholder={"Why is this worth doing?"} textState={[text, setText]} />
            </>
        </FlingToDismissModal>
    );

    function checkIfEditing() {
        let defaultMotive = getDefaultFns.motivesToLearn();
        let defaultMotiveWithNoId = {
            text: defaultMotive.text,
        };

        let stateMotive = state.data;
        let stateMotiveWithNoId = {
            text: stateMotive.text,
        };

        if (stateMotive.text === "") return false;

        return JSON.stringify(defaultMotiveWithNoId) !== JSON.stringify(stateMotiveWithNoId);
    }
}

export default UpdateMotivesToLearnModal;
