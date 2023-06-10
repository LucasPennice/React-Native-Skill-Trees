import { useEffect, useState } from "react";
import AppText from "../../../components/AppText";
import AppTextInput from "../../../components/AppTextInput";
import RadioInput from "../../../components/RadioInput";
import { Milestone, SkillModal } from "../../../types";
import FlingToDismissModal from "../../../components/FlingToDismissModal";
import { Alert } from "react-native";
import { getDefaultFns } from "../functions";
import { colors } from "../../../parameters";

type ModalProps = {
    state: SkillModal<Milestone>;
    closeModal: () => void;
    updateMilestonesArray: (newMilestones: Milestone[]) => void;
    milestones: Milestone[];
};

function UpdateMilestoneModal({ closeModal, updateMilestonesArray, milestones, state }: ModalProps) {
    //Props
    const { data, open } = state;
    //Local State
    const [complete, setComplete] = useState<Milestone["complete"]>(data.complete);
    // const [completedOn, setCompletedOn] = useState<Milestone["completedOn"]>(undefined);
    const [description, setDescription] = useState<Milestone["description"]>(data.description);
    const [title, setTitle] = useState<Milestone["title"]>(data.title);

    const newMilestone: Milestone = { complete, completedOn: new Date().toLocaleDateString(), description, title, id: state.data.id };

    const isEditing = checkIfEditing();

    const updateSkillDetailsIfNewMilestoneValid = (newMilestone: Milestone, editing: boolean) => () => {
        const valid = title !== "";

        if (!valid) return Alert.alert("Milestone title cannot be empty");

        if (editing) return updateMilestone(newMilestone);

        addMilestone(newMilestone);

        function addMilestone(newMilestone: Milestone) {
            const result = [newMilestone, ...milestones];
            updateMilestonesArray(result);
            closeModal();
        }
        function updateMilestone(newMilestone: Milestone) {
            const result = milestones.map((milestone) => {
                if (milestone.id === newMilestone.id) return newMilestone;

                return milestone;
            });
            updateMilestonesArray(result);
            closeModal();
        }
    };

    useEffect(() => {
        if (state.open) {
            setTitle(state.data.title);
            setComplete(state.data.complete);
            setDescription(state.data.description);
            return;
        }

        let defaultMilestone = getDefaultFns.milestones();

        setTitle(defaultMilestone.title);
        setComplete(defaultMilestone.complete);
        setDescription(defaultMilestone.description);
    }, [state]);

    return (
        <FlingToDismissModal
            closeModal={closeModal}
            open={open}
            leftHeaderButton={{ onPress: updateSkillDetailsIfNewMilestoneValid(newMilestone, isEditing), title: isEditing ? "Edit" : "Add" }}>
            <>
                <AppText fontSize={24} style={{ color: "#FFFFFF", fontFamily: "helveticaBold", marginBottom: 5 }}>
                    Milestone
                </AppText>

                <AppTextInput placeholder={"Title"} textState={[title, setTitle]} />
                <AppText fontSize={24} style={{ color: "#FFFFFF", fontFamily: "helveticaBold", marginBottom: 5, marginTop: 10 }}>
                    Description
                </AppText>
                <AppText fontSize={16} style={{ color: colors.unmarkedText, marginBottom: 20 }}>
                    Optional
                </AppText>
                <AppTextInput placeholder={"Description"} textState={[description, setDescription]} />
                <RadioInput text="Complete" state={[complete, setComplete]} style={{ marginVertical: 15 }} />
            </>
        </FlingToDismissModal>
    );

    function checkIfEditing() {
        let defaultMilestone = getDefaultFns.milestones();
        let defaultMilestoneWithNoId = {
            complete: defaultMilestone.complete,
            completedOn: defaultMilestone.completedOn,
            description: defaultMilestone.description,
            title: defaultMilestone.title,
        };

        let stateMilestone = state.data;
        let stateMilestoneWithNoId = {
            complete: stateMilestone.complete,
            completedOn: stateMilestone.completedOn,
            description: stateMilestone.description,
            title: stateMilestone.title,
        };

        return JSON.stringify(defaultMilestoneWithNoId) !== JSON.stringify(stateMilestoneWithNoId);
    }
}

export default UpdateMilestoneModal;
