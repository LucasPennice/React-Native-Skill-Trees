import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { Linking, ScrollView } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { StackNavigatorParams } from "../../../App";
import AppText from "../../components/AppText";
import { colors } from "../../parameters";
import { Milestone, MotiveToLearn, ObjectWithId, Skill, SkillDetails, SkillLogs, SkillModal, SkillResource } from "../../types";
import { LogCard, LogHeader } from "./DisplayDetails/Logs";
import { MotivesToLearnCard, MotivesToLearnHeader } from "./DisplayDetails/MotivesToLearn";
import { ResourceCard, ResourceHeader } from "./DisplayDetails/SkillResources";
import { MilestoneCard, MilestoneHeader } from "./Milestones";
import UpdateLogsModal from "./Modals/UpdateLogsModal";
import UpdateMilestoneModal from "./Modals/UpdateMilestoneModal";
import UpdateMotivesToLearnModal from "./Modals/UpdateMotivesToLearnModal";
import UpdateResourcesModal from "./Modals/UpdateResourcesModal";
import RenderSkillDetails from "./RenderSkillDetails";
import { getDefaultFns } from "./functions";
import useSaveUpdatedSkillToAsyncStorage from "./useUpdateTreeWithNewSkillDetails";

type Props = NativeStackScreenProps<StackNavigatorParams, "SkillPage">;

function SkillPage({ route, navigation }: Props) {
    const treeNode = route.params;
    const { data: skill } = treeNode;
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
    const updateSkillDetails = useSaveUpdatedSkillToAsyncStorage(skillState, treeNode);

    const openModal =
        <T,>(setModalState: React.Dispatch<React.SetStateAction<SkillModal<T | undefined>>>, key: keyof SkillDetails) =>
        (refToSwippeable: Swipeable | null, data?: T) =>
        () => {
            //@ts-ignore
            setModalState(() => {
                const dataToEdit = data as T | undefined;

                if (dataToEdit !== undefined) return { data: dataToEdit, open: true, ref: refToSwippeable } as SkillModal<T>;

                return { data: getDefaultFns[key](), open: true, ref: null };
            });
        };

    useEffect(() => {
        updateSkillDetails();
    }, [skillState]);

    const updateDetails =
        <T,>(key: keyof SkillDetails) =>
        (newState: T[]) => {
            setSkillState((p) => {
                let result = { ...p };
                //@ts-ignore
                result[key] = newState;
                return result;
            });
        };

    const closeDetailModal =
        <T,>(modalState: [SkillModal<T | undefined>, React.Dispatch<React.SetStateAction<SkillModal<T | undefined>>>]) =>
        () => {
            const [state, setState] = modalState;

            if (state.ref !== null) state.ref.close();

            setState((p) => {
                return { ...p, open: false, ref: null };
            });
        };

    const toggleMilestone = (idToToggle: string) => {
        const result = skillState.milestones.map((milestone) => {
            if (milestone.id === idToToggle) return { ...milestone, complete: !milestone.complete, completedOn: new Date().toLocaleDateString() };
            return milestone;
        });
        updateDetails("milestones")(result);
    };
    //

    const deleteDetail =
        <T extends ObjectWithId>(updateDetail: (v: T[]) => void, detail: T[]) =>
        (idToDelete: string) => {
            const result = detail.filter((detail) => detail.id !== idToDelete);
            updateDetail(result);
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

            <RenderSkillDetails<Milestone>
                data={skillState.milestones}
                RenderData={MilestoneCard}
                functions={{
                    openModal: openModal<Milestone>(setEditMilestoneModal, "milestones"),
                    deleteData: deleteDetail(updateDetails<Milestone>("milestones"), skillState.milestones),
                    onPress: toggleMilestone,
                }}
                Header={<MilestoneHeader openModal={() => openModal<Milestone>(setEditMilestoneModal, "milestones")(null, undefined)()} />}
            />

            <RenderSkillDetails<MotiveToLearn>
                data={skillState.motivesToLearn}
                RenderData={MotivesToLearnCard}
                functions={{
                    openModal: openModal<MotiveToLearn>(setEditMotivesToLearnModal, "motivesToLearn"),
                    deleteData: deleteDetail(updateDetails<MotiveToLearn>("motivesToLearn"), skillState.motivesToLearn),
                }}
                Header={
                    <MotivesToLearnHeader
                        openModal={() => openModal<MotiveToLearn>(setEditMotivesToLearnModal, "motivesToLearn")(null, undefined)()}
                    />
                }
            />

            <RenderSkillDetails<SkillResource>
                data={skillState.usefulResources}
                RenderData={ResourceCard}
                functions={{
                    openModal: openModal<SkillResource>(setEditResourcesModal, "usefulResources"),
                    deleteData: deleteDetail(updateDetails<SkillResource>("usefulResources"), skillState.usefulResources),
                    onPress: (link: string) => Linking.openURL(link),
                }}
                Header={<ResourceHeader openModal={() => openModal<SkillResource>(setEditResourcesModal, "usefulResources")(null, undefined)()} />}
            />

            <RenderSkillDetails<SkillLogs>
                data={skillState.logs}
                RenderData={LogCard}
                functions={{
                    openModal: openModal<SkillLogs>(setEditLogsModal, "logs"),
                    deleteData: deleteDetail(updateDetails<SkillLogs>("logs"), skillState.logs),
                }}
                Header={<LogHeader openModal={() => openModal<SkillLogs>(setEditLogsModal, "logs")(null, undefined)()} />}
            />

            {/* Detail Modal to Edit or Add New Entry */}

            {editMilestoneModal.data !== undefined && (
                <UpdateMilestoneModal
                    closeModal={closeDetailModal<Milestone>([editMilestoneModal, setEditMilestoneModal])}
                    state={editMilestoneModal as SkillModal<Milestone>}
                    milestones={skillState.milestones}
                    updateMilestonesArray={updateDetails<Milestone>("milestones")}
                />
            )}
            {editLogsModal.data !== undefined && (
                <UpdateLogsModal
                    closeModal={closeDetailModal<SkillLogs>([editLogsModal, setEditLogsModal])}
                    logs={skillState.logs}
                    mutateLogs={updateDetails<SkillLogs>("logs")}
                    state={editLogsModal as SkillModal<SkillLogs>}
                />
            )}

            {editMotivesToLearnModal.data !== undefined && (
                <UpdateMotivesToLearnModal
                    closeModal={closeDetailModal<MotiveToLearn>([editMotivesToLearnModal, setEditMotivesToLearnModal])}
                    motivesToLearn={skillState.motivesToLearn}
                    mutateMotivesToLearn={updateDetails<MotiveToLearn>("motivesToLearn")}
                    state={editMotivesToLearnModal as SkillModal<MotiveToLearn>}
                />
            )}

            {editResourcesModal.data !== undefined && (
                <UpdateResourcesModal
                    closeModal={closeDetailModal<SkillResource>([editResourcesModal, setEditResourcesModal])}
                    resources={skillState.usefulResources}
                    mutateSkillResources={updateDetails<SkillResource>("usefulResources")}
                    state={editResourcesModal as SkillModal<SkillResource>}
                />
            )}
        </ScrollView>
    );
}

export default SkillPage;
