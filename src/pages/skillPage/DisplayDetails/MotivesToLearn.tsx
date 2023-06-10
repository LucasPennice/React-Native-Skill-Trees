import { useRef } from "react";
import { Dimensions, Pressable, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Animated, { Layout } from "react-native-reanimated";
import AppText from "../../../components/AppText";
import { centerFlex, colors } from "../../../parameters";
import { generalStyles } from "../../../styles";
import { MotiveToLearn } from "../../../types";
import { LeftAction, RightAction } from "./ActionButtons";
type Props = {
    motivesToLearn: MotiveToLearn[];
    mutateMotivesToLearn: (newMotivesToLearn: MotiveToLearn[]) => void;
    openModal: (ref: Swipeable | null, data?: MotiveToLearn) => () => void;
};

function MotivesToLearn({ motivesToLearn, mutateMotivesToLearn, openModal }: Props) {
    const deleteMotive = (idToDelete: string) => () => {
        const result = motivesToLearn.filter((motive) => motive.id !== idToDelete);
        mutateMotivesToLearn(result);
    };

    return (
        <Animated.View layout={Layout.duration(200)} style={[centerFlex, { alignItems: "flex-start", gap: 15, marginBottom: 10 }]}>
            <View style={[centerFlex, { flexDirection: "row", justifyContent: "space-between", width: "100%" }]}>
                <AppText fontSize={24} style={{ color: "#FFFFFF", fontFamily: "helveticaBold" }}>
                    Motives To Learn
                </AppText>

                <Pressable onPress={openModal(null, undefined)} style={[generalStyles.btn, { backgroundColor: "transparent" }]}>
                    <AppText style={{ color: colors.accent }} fontSize={16}>
                        + Add Motive
                    </AppText>
                </Pressable>
            </View>
            {motivesToLearn.map((motive) => (
                <MotiveCard openModal={openModal} key={motive.id} data={motive} deleteMotive={deleteMotive(motive.id)} />
            ))}
        </Animated.View>
    );
}

function MotiveCard({
    data,
    openModal,
    deleteMotive,
}: {
    data: MotiveToLearn;
    openModal: (ref: Swipeable | null, data?: MotiveToLearn) => () => void;
    deleteMotive: () => void;
}) {
    const { width } = Dimensions.get("window");

    const ref = useRef<Swipeable | null>(null);
    return (
        <Animated.View layout={Layout.duration(200)}>
            <Swipeable ref={ref} renderLeftActions={LeftAction(openModal(ref.current, data))} renderRightActions={RightAction(deleteMotive)}>
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
                        <AppText
                            fontSize={20}
                            style={{ color: "#FFFFFF", maxWidth: width - 170 }}
                            textProps={{ ellipsizeMode: "tail", numberOfLines: 1 }}>
                            {data.text}
                        </AppText>
                    </View>
                </View>
            </Swipeable>
        </Animated.View>
    );
}

export default MotivesToLearn;
