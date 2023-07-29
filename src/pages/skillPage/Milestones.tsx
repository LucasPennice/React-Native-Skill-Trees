import { Pressable, View } from "react-native";
import AppText from "../../components/AppText";
import { centerFlex, colors } from "../../parameters";
import { generalStyles } from "../../styles";
import { Milestone } from "../../types";

function MilestoneHeader({ openModal }: { openModal: () => void }) {
    return (
        <>
            <View style={[centerFlex, { flexDirection: "row", justifyContent: "space-between", width: "100%" }]}>
                <AppText fontSize={24} style={{ color: "#FFFFFF", fontFamily: "helveticaBold" }}>
                    Milestones
                </AppText>

                <Pressable onPress={openModal} style={[generalStyles.btn, { backgroundColor: "transparent" }]}>
                    <AppText style={{ color: colors.accent }} fontSize={16}>
                        + Add Milestone
                    </AppText>
                </Pressable>
            </View>

            <AppText fontSize={18} style={{ color: colors.unmarkedText, marginBottom: 10 }}>
                Click a milestone to toggle it's completion
            </AppText>
        </>
    );
}

function MilestoneCard({ data, onPress, backgroundColor }: { data: Milestone; onPress?: (d: string) => void; backgroundColor?: string }) {
    return (
        <Pressable
            onPress={onPress ? () => onPress(data.id) : undefined}
            style={[
                centerFlex,
                {
                    flexDirection: "row",
                    gap: 15,
                    backgroundColor: backgroundColor ?? colors.darkGray,
                    width: "100%",
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
                    <AppText fontSize={20} style={{ color: "#FFFFFF" }}>
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
    );
}

export { MilestoneCard, MilestoneHeader };
