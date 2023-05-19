import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Fragment, createContext, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { StackNavigatorParams } from "../../../App";
import AppText from "../../components/AppText";
import { makeid } from "../../functions/misc";
import { centerFlex, colors } from "../../parameters";
import { Milestone, MotiveToLearn, Skill, SkillLevel, SkillLogs, SkillResource } from "../../types";
import Logs from "./DisplayDetails/Logs";
import MotivesToLearn from "./DisplayDetails/MotivesToLearn";
import SkillLevels from "./DisplayDetails/SkillLevels";
import SkillResources from "./DisplayDetails/SkillResources";
import Milestones from "./Milestones";
import UpdateLogsModal from "./Modals/UpdateLogsModal";
import UpdateMilestoneModal from "./Modals/UpdateMilestoneModal";
import UpdateMotivesToLearnModal from "./Modals/UpdateMotivesToLearnModal";
import UpdateResourcesModal from "./Modals/UpdateResourcesModal";
import UpdateSkillLevelModal from "./Modals/UpdateSkillLevelModal";
import useCheckForUnsavedChanges from "./useCheckForUnsavedChanges";
import useConfirmLeaveScreenWithoutSaving from "./useConfirmLeaveScreenWithoutSaving";
import useSaveUpdatedSkillToAsyncStorage from "./useUpdateTreeWithNewSkillDetails";

type Props = NativeStackScreenProps<StackNavigatorParams, "SkillPage">;
const SKILL_DETAILS_KEYS: (keyof Skill)[] = ["logs", "motivesToLearn", "isCompleted", "milestones", "skillLevel", "usefulResources"];

export const getDefaultFns = {
    milestone: (): Milestone => {
        return { complete: false, completedOn: undefined, description: "", title: "", id: makeid(24) };
    },
    logs: (): SkillLogs => {
        return { date: new Date().toLocaleDateString(), text: "", id: makeid(24) };
    },
    motivesToLearn: (): MotiveToLearn => {
        return { text: "", id: makeid(24) };
    },
    skillLevel: (): SkillLevel => {
        return { ideal: "", starting: "" };
    },
    usefulResources: (): SkillResource => {
        return { description: "", title: "", url: undefined, id: makeid(24) };
    },
};

export const SkillColorContext = createContext("#FFFFFF");

export type SkillModal<T> = { open: boolean; data: T; ref: Swipeable | null };

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
    const [editSkillLevelModal, setEditSkillLevelModal] = useState<SkillModal<SkillLevel | undefined>>({ open: false, data: undefined, ref: null });
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
        skillLevel: (refToSwippeable: Swipeable | null, data?: SkillLevel) => () => {
            setEditSkillLevelModal((p) => {
                const dataToEdit = data as SkillLevel | undefined;

                if (dataToEdit !== undefined) return { data: dataToEdit, open: true, ref: refToSwippeable };

                return { data: getDefaultFns.skillLevel(), open: true, ref: null };
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

    const updateFns = {
        milestones: (newMilestones: Milestone[] | undefined) =>
            setSkillState((p) => {
                return { ...p, milestones: newMilestones };
            }),
        logs: (newSkillLogs: SkillLogs[] | undefined) =>
            setSkillState((p) => {
                return { ...p, logs: newSkillLogs };
            }),
        motivesToLearn: (newMotivesToLearn: MotiveToLearn[] | undefined) =>
            setSkillState((p) => {
                return { ...p, motivesToLearn: newMotivesToLearn };
            }),
        skillLevel: (newSkillLevel: SkillLevel | undefined) =>
            setSkillState((p) => {
                return { ...p, skillLevel: newSkillLevel };
            }),
        usefulResources: (newSkillResources: SkillResource[] | undefined) =>
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
        skillLevel: () => {
            if (editSkillLevelModal.ref !== null) editSkillLevelModal.ref.close();
            setEditSkillLevelModal((p) => {
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
            <View style={[centerFlex, { flexDirection: "row", justifyContent: "space-between" }]}>
                <AppText fontSize={32} style={{ color: "white", fontFamily: "helveticaBold", marginBottom: 5 }}>
                    {skillState.name}
                </AppText>
                {unsavedChanges && (
                    <Pressable onPress={updateSkillDetails} style={styles.btn}>
                        <AppText style={{ color: color }} fontSize={16}>
                            Save
                        </AppText>
                    </Pressable>
                )}
            </View>
            <AppText fontSize={16} style={{ color: colors.unmarkedText, fontFamily: "helvetica", marginBottom: 5 }}>
                {skillState.isCompleted ? "Mastered" : "Not Mastered"}
            </AppText>

            {/* Display And Add Details */}

            <SkillColorContext.Provider value={color}>
                {skillState.milestones !== undefined && (
                    <Milestones milestones={skillState.milestones} openModal={openModalFns.milestones} mutateMilestones={updateFns.milestones} />
                )}
                {skillState.logs !== undefined && <Logs logs={skillState.logs} mutateLogs={updateFns.logs} openModal={openModalFns.logs} />}
                {skillState.motivesToLearn !== undefined && (
                    <MotivesToLearn
                        motivesToLearn={skillState.motivesToLearn}
                        mutateMotivesToLearn={updateFns.motivesToLearn}
                        openModal={openModalFns.motivesToLearn}
                    />
                )}
                {skillState.skillLevel !== undefined && <SkillLevels skillLevels={skillState.skillLevel} openModal={openModalFns.skillLevel} />}

                {skillState.usefulResources !== undefined && (
                    <SkillResources
                        mutateResources={updateFns.usefulResources}
                        skillResources={skillState.usefulResources}
                        openModal={openModalFns.usefulResources}
                    />
                )}
            </SkillColorContext.Provider>

            {/* Add Detail Section  */}
            <AppText fontSize={16} style={{ color: "white", fontFamily: "helvetica", marginVertical: 10 }}>
                Add these Sections To Your Skill Page
            </AppText>

            <View style={{ display: "flex", justifyContent: "flex-start", flexWrap: "wrap", flexDirection: "row", gap: 10 }}>
                {SKILL_DETAILS_KEYS.map((detail, idx) => {
                    const skillDetail = skillState[detail];

                    if (skillDetail !== undefined) return <Fragment key={idx}></Fragment>;

                    const initiateSkillAndOpenItsModal = () => {
                        initiateSkillState(detail)();
                        openModalFns[detail]()();
                    };

                    return (
                        <Pressable onPress={initiateSkillAndOpenItsModal} style={styles.btn} key={idx}>
                            <AppText style={{ color: color }} fontSize={16}>
                                {detail}
                            </AppText>
                        </Pressable>
                    );
                })}
            </View>

            {/* Detail Modal to Edit or Add New Entry */}

            {skillState.milestones !== undefined && editMilestoneModal.data !== undefined && (
                <UpdateMilestoneModal
                    closeModal={closeModalFns.milestones}
                    state={editMilestoneModal as SkillModal<Milestone>}
                    milestones={skillState.milestones!}
                    updateMilestonesArray={updateFns.milestones}
                />
            )}
            {skillState.logs !== undefined && editLogsModal.data !== undefined && (
                <UpdateLogsModal
                    closeModal={closeModalFns.logs}
                    logs={skillState.logs}
                    mutateLogs={updateFns.logs}
                    state={editLogsModal as SkillModal<SkillLogs>}
                />
            )}

            {skillState.motivesToLearn !== undefined && editMotivesToLearnModal.data !== undefined && (
                <UpdateMotivesToLearnModal
                    motivesToLearn={skillState.motivesToLearn}
                    mutateMotivesToLearn={updateFns.motivesToLearn}
                    state={editMotivesToLearnModal as SkillModal<MotiveToLearn>}
                    closeModal={closeModalFns.motivesToLearn}
                />
            )}

            {skillState.skillLevel !== undefined && editSkillLevelModal.data !== undefined && (
                <UpdateSkillLevelModal
                    closeModal={closeModalFns.skillLevel}
                    mutateSkillLevel={updateFns.skillLevel}
                    state={editSkillLevelModal as SkillModal<SkillLevel>}
                />
            )}
            {skillState.usefulResources !== undefined && editResourcesModal.data !== undefined && (
                <UpdateResourcesModal
                    closeModal={closeModalFns.usefulResources}
                    mutateSkillResources={updateFns.usefulResources}
                    resources={skillState.usefulResources}
                    state={editResourcesModal as SkillModal<SkillResource>}
                />
            )}
        </ScrollView>
    );

    function initiateSkillState(detail: keyof Skill) {
        return () => {
            if (detail === "isCompleted" || detail === "name") return;

            let result = { ...skillState };

            if (detail === "logs") result["logs"] = [];
            if (detail === "milestones") result["milestones"] = [];
            if (detail === "motivesToLearn") result["motivesToLearn"] = [];
            if (detail === "skillLevel") result["skillLevel"] = { ideal: "", starting: "" };
            if (detail === "usefulResources") result["usefulResources"] = [];

            return setSkillState(result);
        };
    }
}

export default SkillPage;

const styles = StyleSheet.create({
    btn: {
        alignSelf: "flex-start",
        backgroundColor: colors.darkGray,
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 10,
    },
});
