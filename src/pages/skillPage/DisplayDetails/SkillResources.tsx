import { Dimensions, Pressable, View } from "react-native";
import AppText from "../../../components/AppText";
import { centerFlex, colors } from "../../../parameters";
import { generalStyles } from "../../../styles";
import { SkillResource } from "../../../types";

function ResourceHeader({ openModal }: { openModal: () => void }) {
    return (
        <>
            <View style={[centerFlex, { flexDirection: "row", justifyContent: "space-between", width: "100%" }]}>
                <AppText fontSize={24} style={{ color: "#FFFFFF", fontFamily: "helveticaBold" }}>
                    Resources
                </AppText>

                <Pressable onPress={openModal} style={[generalStyles.btn, { backgroundColor: "transparent" }]}>
                    <AppText style={{ color: colors.accent }} fontSize={16}>
                        + Add Resource
                    </AppText>
                </Pressable>
            </View>
            <AppText fontSize={18} style={{ color: colors.unmarkedText, marginBottom: 10 }}>
                Click the icon-labeled resources to visit the corresponding URL
            </AppText>
        </>
    );
}

function ResourceCard({ data, onPress, backgroundColor }: { data: SkillResource; onPress?: (d: string) => void; backgroundColor?: string }) {
    return (
        <Pressable style={[{ width: "100%" }]} onPress={onPress && data.url ? () => onPress(data.url!) : undefined}>
            <View
                style={[
                    centerFlex,
                    {
                        flexDirection: "row",
                        gap: 15,
                        backgroundColor: backgroundColor ?? colors.darkGray,
                        paddingHorizontal: 15,
                        paddingVertical: 15,
                        justifyContent: "flex-start",
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: colors.darkGray,
                    },
                ]}>
                <View style={[centerFlex, { gap: 5, alignItems: "flex-start" }]}>
                    <View style={[centerFlex, { flexDirection: "row", gap: 5 }]}>
                        {data.url && (
                            <AppText fontSize={20} style={{ color: colors.accent, fontFamily: "emojisMono", lineHeight: 33 }}>
                                {data.url && "🌎"}
                            </AppText>
                        )}
                        <AppText fontSize={20} style={{ color: "#FFFFFF", fontFamily: "helveticaBold" }}>
                            {data.title}
                        </AppText>
                    </View>
                    <AppText fontSize={18} style={{ color: colors.unmarkedText }}>
                        {data.description}
                    </AppText>
                </View>
            </View>
        </Pressable>
    );
}

export { ResourceHeader, ResourceCard };
