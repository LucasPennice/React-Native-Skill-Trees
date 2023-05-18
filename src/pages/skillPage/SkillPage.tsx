import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Fragment, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { StackNavigatorParams } from "../../../App";
import AppText from "../../components/AppText";
import { colors } from "../../parameters";
import { Milestone, Skill, SkillLevel, SkillLogs, SkillResource, getDefaultSkillValue } from "../../types";
import Milestones from "./Milestones";
import UpdateMilestoneModal from "./Modals/UpdateMilestoneModal";
import { makeid } from "../../functions/misc";
import { Swipeable } from "react-native-gesture-handler";
import Logs from "./Modals/Logs";
import UpdateLogsModal from "./Modals/UpdateLogsModal";

type Props = NativeStackScreenProps<StackNavigatorParams, "SkillPage">;
const SKILL_DETAILS_KEYS: (keyof Skill)[] = ["logs", "motivesToLearn", "isCompleted", "milestones", "skillLevel", "usefulResources"];

export const getDefaultMilestone = () => {
    return { complete: false, completedOn: undefined, description: "", title: "", id: makeid(24) };
};
export const getDefaultLog = (): SkillLogs => {
    return { date: new Date(), text: "", id: makeid(24) };
};

export type SkillModal<T> = { open: boolean; data: T; ref: Swipeable | null };

function SkillPage({ route }: Props) {
    const currentSkill = route.params ?? undefined;

    // if (!currentSkill||!currentSkill.skill || !currentSkill.color) return <></>;

    // const { skill, color } = currentSkill;
    const color = colors.accent;
    //Local State
    const [skillState, setSkillState] = useState<Skill>(getDefaultSkillValue("puitios", false));
    //Local State - Modal
    const [editMilestoneModal, setEditMilestoneModal] = useState<SkillModal<Milestone | undefined>>({ open: false, data: undefined, ref: null });
    const [editLogsModal, setEditLogsModal] = useState<SkillModal<SkillLogs | undefined>>({ open: false, data: undefined, ref: null });

    //THIS 👇 object must have a function per key in SKILL_DETAILS_KEYS
    const openModalFns: { [key: string]: any } = {
        milestones: (refToSwippeable: Swipeable | null, data?: Milestone) => () => {
            setEditMilestoneModal((p) => {
                const dataToEdit = data as Milestone | undefined;

                if (dataToEdit !== undefined) return { data: dataToEdit, open: true, ref: refToSwippeable };

                return { data: getDefaultMilestone(), open: true, ref: null };
            });
        },
        logs: (refToSwippeable: Swipeable | null, data?: SkillLogs) => () => {
            console.log("duduuude");
            setEditLogsModal((p) => {
                const dataToEdit = data as SkillLogs | undefined;

                if (dataToEdit !== undefined) return { data: dataToEdit, open: true, ref: refToSwippeable };

                return { data: getDefaultLog(), open: true, ref: null };
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
    };

    return (
        <ScrollView style={{ backgroundColor: colors.background, flex: 1, paddingHorizontal: 10 }}>
            <AppText fontSize={32} style={{ color: "white", fontFamily: "helveticaBold", marginBottom: 5 }}>
                {skillState.name}
            </AppText>
            <Pressable onPress={() => setSkillState(getDefaultSkillValue("puitios", false))} style={styles.btn}>
                <AppText style={{ color: color }} fontSize={16}>
                    RESET
                </AppText>
            </Pressable>
            <AppText fontSize={16} style={{ color: colors.unmarkedText, fontFamily: "helvetica", marginBottom: 5 }}>
                {skillState.isCompleted ? "Mastered" : "Not Mastered"}
            </AppText>

            {/* Display And Add Details */}

            {skillState.milestones !== undefined && (
                <Milestones milestones={skillState.milestones} openModal={openModalFns.milestones} updateMilestonesArray={updateFns.milestones} />
            )}
            {skillState.logs !== undefined && <Logs logs={skillState.logs} mutateLogs={updateFns.logs} openModal={openModalFns.logs} />}

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
