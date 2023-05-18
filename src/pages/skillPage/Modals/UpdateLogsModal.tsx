import { useEffect, useState } from "react";
import { SkillLogs } from "../../../types";
import { SkillModal, getDefaultLog } from "../SkillPage";
import { Alert } from "react-native";
import FlingToDismissModal from "../../../components/FlingToDismissModal";
import AppText from "../../../components/AppText";
import AppTextInput from "../../../components/AppTextInput";

type ModalProps = {
    state: SkillModal<SkillLogs>;
    closeModal: () => void;
    mutateLogs: (newLogs: SkillLogs[] | undefined) => void;
    logs: SkillLogs[];
};

function UpdateLogsModal({ closeModal, logs, mutateLogs, state }: ModalProps) {
    //Props
    const { data, open } = state;
    //Local State
    const [text, setText] = useState<SkillLogs["text"]>(data.text);
    const [date, setDate] = useState<SkillLogs["date"]>(data.date);

    const newLog: SkillLogs = { text, date, id: state.data.id };

    const isEditing = checkIfEditing();

    const updateSkillDetailsIfNewLogValid = (newLog: SkillLogs, editing: boolean) => () => {
        const valid = text !== "";

        if (!valid) return Alert.alert("Title cannot be empty");

        if (editing) return updateMilestone(newLog);

        addMilestone(newLog);

        function addMilestone(newLog: SkillLogs) {
            const result = [...logs, newLog];
            mutateLogs(result);
            closeModal();
        }
        function updateMilestone(newLog: SkillLogs) {
            const result = logs.map((milestone) => {
                if (milestone.id === newLog.id) return newLog;

                return milestone;
            });
            mutateLogs(result);
            closeModal();
        }
    };

    useEffect(() => {
        if (state.open) {
            setText(state.data.text);
            setDate(state.data.date);
            return;
        }

        setText("");
        setDate(new Date());
    }, [state]);

    return (
        <FlingToDismissModal
            closeModal={closeModal}
            open={open}
            leftHeaderButton={{ onPress: updateSkillDetailsIfNewLogValid(newLog, isEditing), title: isEditing ? "Edit" : "Add" }}>
            <>
                <AppText fontSize={20} style={{ color: "white", fontFamily: "helveticaBold" }}>
                    Text
                </AppText>
                <AppTextInput placeholder={"Text"} textState={[text, setText]} onlyContainsLettersAndNumbers />
            </>
        </FlingToDismissModal>
    );

    function checkIfEditing() {
        let defaultLog = getDefaultLog();
        let defaultLogWithNoId = {
            text: defaultLog.text,
            date: defaultLog.date,
        };

        let stateLog = state.data;
        let stateLogWithNoId = {
            text: stateLog.text,
            date: stateLog.date,
        };

        if (stateLog.text === "") return false;

        return JSON.stringify(defaultLogWithNoId) !== JSON.stringify(stateLogWithNoId);
    }
}

export default UpdateLogsModal;
