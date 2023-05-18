import { useRef } from "react";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Animated, { Layout } from "react-native-reanimated";
import AppText from "../../components/AppText";
import { centerFlex, colors } from "../../parameters";
import { Milestone } from "../../types";
import { LeftAction, RightAction } from "./Modals/ActionButtons";
import { generalStyles } from "../../../App";

function Milestones({
    milestones,
    openModal,
    updateMilestonesArray,
}: {
    milestones: Milestone[];
    openModal: (ref: Swipeable | null, data?: Milestone) => () => void;
    updateMilestonesArray: (newMilestones: Milestone[] | undefined) => void;
}) {
    const deleteMilestone = (idToDelete: string) => () => {
        const result = milestones.filter((milestone) => milestone.id !== idToDelete);
        updateMilestonesArray(result);
    };

    return (
        <View style={[centerFlex, { alignItems: "flex-start", gap: 15, marginBottom: 10 }]}>
            <AppText fontSize={24} style={{ color: "white", fontFamily: "helveticaBold" }}>
                Milestones
            </AppText>
            {milestones.map((milestone) => (
                <MilestoneCard openModal={openModal} key={milestone.id} data={milestone} deleteMilestone={deleteMilestone(milestone.id)} />
            ))}

            <Animated.View layout={Layout.duration(200)}>
                <Pressable onPress={openModal(null, undefined)} style={generalStyles.btn}>
                    <AppText style={{ color: colors.accent }} fontSize={16}>
                        Add Milestone
                    </AppText>
                </Pressable>
            </Animated.View>
        </View>
    );
}

export default Milestones;

function MilestoneCard({
    data,
    openModal,
    deleteMilestone,
}: {
    data: Milestone;
    openModal: (ref: Swipeable | null, data?: Milestone) => () => void;
    deleteMilestone: () => void;
}) {
    const { width } = Dimensions.get("window");

    const ref = useRef<Swipeable | null>(null);
    return (
        <Animated.View layout={Layout.duration(200)}>
            <Swipeable ref={ref} renderLeftActions={LeftAction(openModal(ref.current, data))} renderRightActions={RightAction(deleteMilestone)}>
                <View
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
                                style={{ color: "white", maxWidth: width - 170 }}
                                textProps={{ ellipsizeMode: "tail", numberOfLines: 1 }}>
                                {data.title}
                            </AppText>
                            {data.completedOn !== undefined && (
                                <AppText fontSize={18} style={{ color: "white" }}>
                                    - {data.completedOn.toLocaleDateString()}
                                </AppText>
                            )}
                        </View>
                        {data.description !== "" && (
                            <AppText fontSize={18} style={{ color: colors.unmarkedText }}>
                                {data.description}
                            </AppText>
                        )}
                    </View>
                </View>
            </Swipeable>
        </Animated.View>
    );
}
