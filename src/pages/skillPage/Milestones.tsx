import { useRef } from "react";
import { Dimensions, Pressable, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Animated, { Layout } from "react-native-reanimated";
import AppText from "../../components/AppText";
import { centerFlex, colors } from "../../parameters";
import { generalStyles } from "../../styles";
import { Milestone } from "../../types";
import { LeftAction, RightAction } from "./DisplayDetails/ActionButtons";

function Milestones({
    milestones,
    openModal,
    mutateMilestones,
}: {
    milestones: Milestone[];
    openModal: (ref: Swipeable | null, data?: Milestone) => () => void;
    mutateMilestones: (newMilestones: Milestone[]) => void;
}) {
    const deleteMilestone = (idToDelete: string) => () => {
        const result = milestones.filter((milestone) => milestone.id !== idToDelete);
        mutateMilestones(result);
    };

    const toggleMilestone = (idToToggle: string) => () => {
        const result = milestones.map((milestone) => {
            if (milestone.id === idToToggle) return { ...milestone, complete: !milestone.complete, completedOn: new Date().toLocaleDateString() };
            return milestone;
        });
        mutateMilestones(result);
    };

    return (
        <Animated.View layout={Layout.duration(200)} style={[centerFlex, { alignItems: "flex-start", marginBottom: 10 }]}>
            <View style={[centerFlex, { flexDirection: "row", justifyContent: "space-between", width: "100%" }]}>
                <AppText fontSize={24} style={{ color: "#FFFFFF", fontFamily: "helveticaBold" }}>
                    Milestones
                </AppText>

                <Pressable onPress={openModal(null, undefined)} style={[generalStyles.btn, { backgroundColor: "transparent" }]}>
                    <AppText style={{ color: colors.accent }} fontSize={16}>
                        + Add Milestone
                    </AppText>
                </Pressable>
            </View>

            <AppText fontSize={18} style={{ color: colors.unmarkedText, marginBottom: 10 }}>
                Click a milestone to toggle it's completion
            </AppText>

            {milestones.map((milestone) => (
                <MilestoneCard
                    openModal={openModal}
                    key={milestone.id}
                    data={milestone}
                    toggleMilestone={toggleMilestone(milestone.id)}
                    deleteMilestone={deleteMilestone(milestone.id)}
                />
            ))}
        </Animated.View>
    );
}

export default Milestones;

function MilestoneCard({
    data,
    openModal,
    deleteMilestone,
    toggleMilestone,
}: {
    data: Milestone;
    openModal: (ref: Swipeable | null, data?: Milestone) => () => void;
    deleteMilestone: () => void;
    toggleMilestone: () => void;
}) {
    const { width } = Dimensions.get("window");

    const ref = useRef<Swipeable | null>(null);
    return (
        <Animated.View layout={Layout.duration(200)} style={{ marginTop: 10 }}>
            <Swipeable ref={ref} renderLeftActions={LeftAction(openModal(ref.current, data))} renderRightActions={RightAction(deleteMilestone)}>
                <Pressable
                    onPress={toggleMilestone}
                    style={[
                        centerFlex,
                        {
                            flexDirection: "row",
                            gap: 15,
                            backgroundColor: colors.darkGray,
                            width: width - 20,
                            paddingHorizontal: 15,
                            justifyContent: "flex-start",
                            paddingVertical: 15,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: data.complete ? colors.accent : colors.darkGray,
                        },
                    ]}>
                    <View style={[centerFlex, { gap: 5, alignItems: "flex-start" }]}>
                        <View style={[centerFlex, { flexDirection: "row", gap: 5 }]}>
                            <AppText
                                fontSize={20}
                                style={{ color: "#FFFFFF", maxWidth: width - 170 }}
                                textProps={{ ellipsizeMode: "tail", numberOfLines: 1 }}>
                                {data.title}
                            </AppText>
                        </View>
                        {data.description !== "" && (
                            <AppText fontSize={18} style={{ color: colors.unmarkedText }}>
                                {data.description}
                            </AppText>
                        )}
                    </View>
                </Pressable>
            </Swipeable>
            {data.completedOn !== undefined && (
                <AppText fontSize={18} style={{ color: colors.unmarkedText, marginTop: 10 }}>
                    {data.completedOn}
                </AppText>
            )}
        </Animated.View>
    );
}
