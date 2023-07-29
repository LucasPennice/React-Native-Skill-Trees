import { Pressable, View } from "react-native";
import AppText from "../../../components/AppText";
import { centerFlex, colors } from "../../../parameters";
import { generalStyles } from "../../../styles";
import { SkillLogs } from "../../../types";

function LogHeader({ openModal }: { openModal: () => void }) {
    return (
        <View style={[centerFlex, { flexDirection: "row", justifyContent: "space-between", width: "100%" }]}>
            <AppText fontSize={24} style={{ color: "#FFFFFF", fontFamily: "helveticaBold" }}>
                Log Entries
            </AppText>

            <Pressable onPress={openModal} style={[generalStyles.btn, { backgroundColor: "transparent" }]}>
                <AppText style={{ color: colors.accent }} fontSize={16}>
                    + Add Log
                </AppText>
            </Pressable>
        </View>
    );
}

function LogCard({ data, backgroundColor }: { data: SkillLogs; backgroundColor?: string }) {
    return (
        <View
            style={[
                {
                    backgroundColor: backgroundColor ?? colors.darkGray,
                    width: "100%",
                    paddingHorizontal: 15,
                    alignItems: "flex-start",
                    paddingVertical: 15,
                    borderRadius: 10,
                },
            ]}>
            <AppText fontSize={18} style={{ color: "#FFFFFF" }}>
                {data.text}
            </AppText>
        </View>
    );
}

export { LogCard, LogHeader };
