import { Dimensions, Pressable, View } from "react-native";
import AppText from "../../../components/AppText";
import { centerFlex, colors } from "../../../parameters";
import { generalStyles } from "../../../styles";
import { MotiveToLearn } from "../../../types";

function MotivesToLearnHeader({ openModal }: { openModal: () => void }) {
    return (
        <View style={[centerFlex, { flexDirection: "row", justifyContent: "space-between", width: "100%" }]}>
            <AppText fontSize={24} style={{ color: "#FFFFFF", fontFamily: "helveticaBold" }}>
                Motives To Learn
            </AppText>

            <Pressable onPress={openModal} style={[generalStyles.btn, { backgroundColor: "transparent" }]}>
                <AppText style={{ color: colors.accent }} fontSize={16}>
                    + Add Motive
                </AppText>
            </Pressable>
        </View>
    );
}

function MotivesToLearnCard({ data }: { data: MotiveToLearn }) {
    const { width } = Dimensions.get("window");

    return (
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
                    borderColor: colors.darkGray,
                },
            ]}>
            <View style={[centerFlex, { gap: 5, alignItems: "flex-start" }]}>
                <AppText fontSize={20} style={{ color: "#FFFFFF", maxWidth: width - 170 }} textProps={{ ellipsizeMode: "tail", numberOfLines: 1 }}>
                    {data.text}
                </AppText>
            </View>
        </View>
    );
}

export { MotivesToLearnHeader, MotivesToLearnCard };
