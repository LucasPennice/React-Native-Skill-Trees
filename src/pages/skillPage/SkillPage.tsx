import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { StackNavigatorParams } from "../../../App";
import AppText from "../../components/AppText";
import { SkillColorContext } from "../../context";
import { colors } from "../../parameters";
import { Milestone, MotiveToLearn, Skill, SkillLogs, SkillModal, SkillResource } from "../../types";
import Logs from "./DisplayDetails/Logs";
import MotivesToLearn from "./DisplayDetails/MotivesToLearn";
import SkillResources from "./DisplayDetails/SkillResources";
import Milestones from "./Milestones";
import UpdateLogsModal from "./Modals/UpdateLogsModal";
import UpdateMilestoneModal from "./Modals/UpdateMilestoneModal";
import UpdateMotivesToLearnModal from "./Modals/UpdateMotivesToLearnModal";
import UpdateResourcesModal from "./Modals/UpdateResourcesModal";
import { getDefaultFns } from "./functions";
import useCheckForUnsavedChanges from "./useCheckForUnsavedChanges";
import useConfirmLeaveScreenWithoutSaving from "./useConfirmLeaveScreenWithoutSaving";
import useSaveUpdatedSkillToAsyncStorage from "./useUpdateTreeWithNewSkillDetails";

type Props = NativeStackScreenProps<StackNavigatorParams, "SkillPage">;

function SkillPage({ route, navigation }: Props) {
    const treeNode = route.params;
    const { data: skill, accentColor: color } = treeNode;
    //Local State
    const [skillState, setSkillState] = useState<Skill>(skill);
    //Local State - Modal
    const [editMilestoneModal, setEditMilestoneModal] = useState<SkillModal<Milestone | undefined>>({ open: false, data: undefined, ref: null });
    const [editLogsModal, setEditLogsModal] = useState<SkillModal<SkillLogs | undefined>>({ open: false, data: undefined, ref: null });
    const [editMotivesToLearnModal, setEditMotivesToLearnModal] = useState<SkillModal<MotiveToLearn | undefined>>({
        open: false,
        data: undefined,
        ref: null,
    });
    const [editResourcesModal, setEditResourcesModal] = useState<SkillModal<SkillResource | undefined>>({ open: false, data: undefined, ref: null });
    //Hooks
    const unsavedChanges = useCheckForUnsavedChanges(skillState, treeNode);
    useConfirmLeaveScreenWithoutSaving(navigation, unsavedChanges);
    const updateSkillDetails = useSaveUpdatedSkillToAsyncStorage(skillState, treeNode);

    //THIS 👇 object must have a function per key in SKILL_DETAILS_KEYS
    const openModalFns: { [key: string]: any } = {
        milestones: (refToSwippeable: Swipeable | null, data?: Milestone) => () => {
            setEditMilestoneModal((p) => {
                const dataToEdit = data as Milestone | undefined;

                if (dataToEdit !== undefined) return { data: dataToEdit, open: true, ref: refToSwippeable };

                return { data: getDefaultFns.milestone(), open: true, ref: null };
            });
        },
        logs: (refToSwippeable: Swipeable | null, data?: SkillLogs) => () => {
            setEditLogsModal((p) => {
                const dataToEdit = data as SkillLogs | undefined;

                if (dataToEdit !== undefined) return { data: dataToEdit, open: true, ref: refToSwippeable };

                return { data: getDefaultFns.logs(), open: true, ref: null };
            });
        },
        motivesToLearn: (refToSwippeable: Swipeable | null, data?: MotiveToLearn) => () => {
            setEditMotivesToLearnModal((p) => {
                const dataToEdit = data as MotiveToLearn | undefined;

                if (dataToEdit !== undefined) return { data: dataToEdit, open: true, ref: refToSwippeable };

                return { data: getDefaultFns.motivesToLearn(), open: true, ref: null };
            });
        },

        usefulResources: (refToSwippeable: Swipeable | null, data?: SkillResource) => () => {
            setEditResourcesModal((p) => {
                const dataToEdit = data as SkillResource | undefined;

                if (dataToEdit !== undefined) return { data: dataToEdit, open: true, ref: refToSwippeable };

                return { data: getDefaultFns.usefulResources(), open: true, ref: null };
            });
        },
    };

    useEffect(() => {
        updateSkillDetails();
    }, [skillState]);

    const updateFns = {
        milestones: (newMilestones: Milestone[]) =>
            setSkillState((p) => {
                return { ...p, milestones: newMilestones };
            }),
        logs: (newSkillLogs: SkillLogs[]) =>
            setSkillState((p) => {
                return { ...p, logs: newSkillLogs };
            }),
        motivesToLearn: (newMotivesToLearn: MotiveToLearn[]) =>
            setSkillState((p) => {
                return { ...p, motivesToLearn: newMotivesToLearn };
            }),

        usefulResources: (newSkillResources: SkillResource[]) =>
            setSkillState((p) => {
                return { ...p, usefulResources: newSkillResources };
            }),
    };

    const closeModalFns = {
        milestones: () => {
            if (editMilestoneModal.ref !== null) editMilestoneModal.ref.close();
            setEditMilestoneModal((p) => {
                return { ...p, open: false, ref: null };
            });
        },
        logs: () => {
            if (editLogsModal.ref !== null) editLogsModal.ref.close();
            setEditLogsModal((p) => {
                return { ...p, open: false, ref: null };
            });
        },
        motivesToLearn: () => {
            if (editMotivesToLearnModal.ref !== null) editMotivesToLearnModal.ref.close();
            setEditMotivesToLearnModal((p) => {
                return { ...p, open: false, ref: null };
            });
        },

        usefulResources: () => {
            if (editResourcesModal.ref !== null) editResourcesModal.ref.close();
            setEditResourcesModal((p) => {
                return { ...p, open: false, ref: null };
            });
        },
    };

    return (
        <ScrollView style={{ backgroundColor: colors.background, flex: 1, paddingHorizontal: 10 }}>
            <AppText fontSize={32} style={{ color: "#FFFFFF", fontFamily: "helveticaBold", marginBottom: 5 }}>
                {skillState.name}
            </AppText>

            <AppText fontSize={18} style={{ color: colors.unmarkedText, fontFamily: "helvetica", marginBottom: 5 }}>
                {skillState.isCompleted ? "Mastered" : "Not Mastered"}
            </AppText>
            <AppText style={{ color: `${colors.unmarkedText}8D`, marginBottom: 15 }} fontSize={16}>
                Swipe on an entry to edit or delete
            </AppText>

            {/* Display And Add Details */}

            <SkillColorContext.Provider value={color.color1}>
                <Milestones milestones={skillState.milestones} openModal={openModalFns.milestones} mutateMilestones={updateFns.milestones} />
                <MotivesToLearn
                    motivesToLearn={skillState.motivesToLearn}
                    mutateMotivesToLearn={updateFns.motivesToLearn}
                    openModal={openModalFns.motivesToLearn}
                />
                <SkillResources
                    mutateResources={updateFns.usefulResources}
                    skillResources={skillState.usefulResources}
                    openModal={openModalFns.usefulResources}
                />
                <Logs logs={skillState.logs} mutateLogs={updateFns.logs} openModal={openModalFns.logs} />
            </SkillColorContext.Provider>

            {/* Detail Modal to Edit or Add New Entry */}

            {editMilestoneModal.data !== undefined && (
                <UpdateMilestoneModal
                    closeModal={closeModalFns.milestones}
                    state={editMilestoneModal as SkillModal<Milestone>}
                    milestones={skillState.milestones}
                    updateMilestonesArray={updateFns.milestones}
                />
            )}
            {editLogsModal.data !== undefined && (
                <UpdateLogsModal
                    closeModal={closeModalFns.logs}
                    logs={skillState.logs}
                    mutateLogs={updateFns.logs}
                    state={editLogsModal as SkillModal<SkillLogs>}
                />
            )}

            {editMotivesToLearnModal.data !== undefined && (
                <UpdateMotivesToLearnModal
                    motivesToLearn={skillState.motivesToLearn}
                    mutateMotivesToLearn={updateFns.motivesToLearn}
                    state={editMotivesToLearnModal as SkillModal<MotiveToLearn>}
                    closeModal={closeModalFns.motivesToLearn}
                />
            )}

            {editResourcesModal.data !== undefined && (
                <UpdateResourcesModal
                    closeModal={closeModalFns.usefulResources}
                    mutateSkillResources={updateFns.usefulResources}
                    resources={skillState.usefulResources}
                    state={editResourcesModal as SkillModal<SkillResource>}
                />
            )}
        </ScrollView>
    );
}

export default SkillPage;
