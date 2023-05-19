import { useRef } from "react";
import { Dimensions, Pressable, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Animated, { Layout } from "react-native-reanimated";
import { generalStyles } from "../../../../App";
import AppText from "../../../components/AppText";
import { centerFlex, colors } from "../../../parameters";
import { MotiveToLearn, SkillLevel } from "../../../types";
import { LeftAction, RightAction } from "./ActionButtons";

type Props = {
    skillLevels: SkillLevel;
    openModal: (ref: Swipeable | null, data?: SkillLevel) => () => void;
};

function SkillLevels({ openModal, skillLevels }: Props) {
    return (
        <View style={[centerFlex, { alignItems: "flex-start", gap: 15, marginBottom: 10 }]}>
            <AppText fontSize={24} style={{ color: "white", fontFamily: "helveticaBold" }}>
                Skill Level
            </AppText>
            <SkillLevelCard openModal={openModal} data={skillLevels} />
        </View>
    );
}

function SkillLevelCard({ data, openModal }: { data: SkillLevel; openModal: (ref: Swipeable | null, data?: SkillLevel) => () => void }) {
    const { width } = Dimensions.get("window");

    const ref = useRef<Swipeable | null>(null);
    return (
        <Animated.View layout={Layout.duration(200)}>
            <Swipeable ref={ref} renderLeftActions={LeftAction(openModal(ref.current, data))}>
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
                            {data.ideal}
                        </AppText>
                        <AppText
                            fontSize={20}
                            style={{ color: "white", maxWidth: width - 170 }}
                            textProps={{ ellipsizeMode: "tail", numberOfLines: 1 }}>
                            {data.starting}
                        </AppText>
                    </View>
                </View>
            </Swipeable>
        </Animated.View>
    );
}

export default SkillLevels;
