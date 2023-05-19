import { useContext, useRef } from "react";
import { Dimensions, Pressable, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Animated, { Layout } from "react-native-reanimated";
import { generalStyles } from "../../../../App";
import AppText from "../../../components/AppText";
import { centerFlex, colors } from "../../../parameters";
import { MotiveToLearn } from "../../../types";
import { LeftAction, RightAction } from "./ActionButtons";
import { SkillColorContext } from "../SkillPage";
type Props = {
    motivesToLearn: MotiveToLearn[];
    mutateMotivesToLearn: (newMotivesToLearn: MotiveToLearn[] | undefined) => void;
    openModal: (ref: Swipeable | null, data?: MotiveToLearn) => () => void;
};

function MotivesToLearn({ motivesToLearn, mutateMotivesToLearn, openModal }: Props) {
    const color = useContext(SkillColorContext);

    const deleteMotive = (idToDelete: string) => () => {
        const result = motivesToLearn.filter((motive) => motive.id !== idToDelete);
        mutateMotivesToLearn(result);
    };

    return (
        <View style={[centerFlex, { alignItems: "flex-start", gap: 15, marginBottom: 10 }]}>
            <AppText fontSize={24} style={{ color: "white", fontFamily: "helveticaBold" }}>
                Motives To Learn
            </AppText>
            {motivesToLearn.map((motive) => (
                <MotiveCard openModal={openModal} key={motive.id} data={motive} deleteMotive={deleteMotive(motive.id)} />
            ))}

            <Animated.View layout={Layout.duration(200)}>
                <Pressable onPress={openModal(null, undefined)} style={generalStyles.btn}>
                    <AppText style={{ color }} fontSize={16}>
                        Add Motive
                    </AppText>
                </Pressable>
            </Animated.View>
        </View>
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
                            style={{ color: "white", maxWidth: width - 170 }}
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
