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

type Props = NativeStackScreenProps<StackNavigatorParams, "SkillPage">;
const SKILL_DETAILS_KEYS: (keyof Skill)[] = ["logs", "motivesToLearn", "isCompleted", "milestones", "skillLevel", "usefulResources"];

export const getDefaultMilestone = () => {
    return { complete: false, completedOn: undefined, description: "", title: "", id: makeid(24) };
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

    const openModal = (detail: keyof Skill) => (data?: Milestone | SkillLevel | SkillResource | SkillLogs | string) => () => {
        if (detail === "milestones")
            setEditMilestoneModal((p) => {
                const dataToEdit = data as Milestone | undefined;

                if (dataToEdit !== undefined) return { data: dataToEdit, open: true, ref: null };

                return { data: getDefaultMilestone(), open: true, ref: null };
            });
    };

    const initiateSkillState = (detail: keyof Skill) => () => {
        if (detail === "isCompleted" || detail === "name") return;

        let result = { ...skillState };

        if (detail === "logs") result["logs"] = [];
        if (detail === "milestones") result["milestones"] = [];
        if (detail === "motivesToLearn") result["motivesToLearn"] = [];
        if (detail === "skillLevel") result["skillLevel"] = { ideal: "", starting: "" };
        if (detail === "usefulResources") result["usefulResources"] = [];

        setSkillState(result);
        return openModal(detail)();
    };

    const openModalFns = {
        milestones: (refToSwippeable: Swipeable | null, data?: Milestone) => () => {
            setEditMilestoneModal((p) => {
                const dataToEdit = data as Milestone | undefined;

                if (dataToEdit !== undefined) return { data: dataToEdit, open: true, ref: refToSwippeable };

                return { data: getDefaultMilestone(), open: true, ref: null };
            });
        },
    };

    const updateFns = {
        updateMilestonesArray: (newMilestones: Milestone[] | undefined) =>
            setSkillState((p) => {
                return { ...p, milestones: newMilestones };
            }),
    };

    const closeModalFns = {
        milestones: () => {
            console.log(editMilestoneModal.ref === null);
            if (editMilestoneModal.ref !== null) editMilestoneModal.ref.close();
            setEditMilestoneModal((p) => {
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

            {skillState.milestones !== undefined && (
                <Milestones
                    milestones={skillState.milestones}
                    openModal={openModalFns.milestones}
                    updateMilestonesArray={updateFns.updateMilestonesArray}
                />
            )}

            <AppText fontSize={16} style={{ color: "white", fontFamily: "helvetica", marginVertical: 10 }}>
                Add these Sections To Your Skill Page
            </AppText>
            <View style={{ display: "flex", justifyContent: "flex-start", flexWrap: "wrap", flexDirection: "row", gap: 10 }}>
                {SKILL_DETAILS_KEYS.map((detail, idx) => {
                    const skillDetail = skillState[detail];

                    if (skillDetail !== undefined) return <Fragment key={idx}></Fragment>;

                    return (
                        <Pressable onPress={initiateSkillState(detail)} style={styles.btn} key={idx}>
                            <AppText style={{ color: color }} fontSize={16}>
                                {detail}
                            </AppText>
                        </Pressable>
                    );
                })}
            </View>

            {skillState.milestones !== undefined && editMilestoneModal.data !== undefined && (
                <UpdateMilestoneModal
                    closeModal={closeModalFns.milestones}
                    state={editMilestoneModal as SkillModal<Milestone>}
                    milestones={skillState.milestones!}
                    updateMilestonesArray={updateFns.updateMilestonesArray}
                />
            )}
        </ScrollView>
    );
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

function getDefaultValueOfSkillDetail(detail: keyof Skill | undefined) {
    if (detail === "logs") return { date: new Date(), text: "" } as SkillLogs;
    if (detail === "milestones") return { complete: false, completedOn: undefined, description: "", title: "" } as Milestone;
    if (detail === "motivesToLearn") return "" as string;
    if (detail === "skillLevel") return { ideal: "", starting: "" } as SkillLevel;
    if (detail === "usefulResources") return { description: "", title: "", url: undefined } as SkillResource;
    return "";
}
