import { useRef } from "react";
import { Dimensions, Pressable, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Animated, { Layout } from "react-native-reanimated";
import AppText from "../../../components/AppText";
import { centerFlex, colors } from "../../../parameters";
import { generalStyles } from "../../../styles";
import { SkillLogs } from "../../../types";
import { LeftAction, RightAction } from "./ActionButtons";

function Logs({
    logs,
    openModal,
    mutateLogs,
}: {
    logs: SkillLogs[];
    openModal: (ref: Swipeable | null, data?: SkillLogs) => () => void;
    mutateLogs: (newLogs: SkillLogs[]) => void;
}) {
    const deleteLog = (idToDelete: string) => () => {
        const result = logs.filter((log) => log.id !== idToDelete);
        mutateLogs(result);
    };

    return (
        <Animated.View layout={Layout.duration(200)} style={[centerFlex, { alignItems: "flex-start", gap: 15, marginBottom: 10 }]}>
            <View style={[centerFlex, { flexDirection: "row", justifyContent: "space-between", width: "100%" }]}>
                <AppText fontSize={24} style={{ color: "#FFFFFF", fontFamily: "helveticaBold" }}>
                    Log Entries
                </AppText>

                <Pressable onPress={openModal(null, undefined)} style={[generalStyles.btn, { backgroundColor: "transparent" }]}>
                    <AppText style={{ color: colors.accent }} fontSize={16}>
                        + Add Log
                    </AppText>
                </Pressable>
            </View>
            {logs.map((log) => (
                <LogCard openModal={openModal} key={log.id} data={log} deleteLog={deleteLog(log.id)} />
            ))}
        </Animated.View>
    );
}

function LogCard({
    data,
    openModal,
    deleteLog,
}: {
    data: SkillLogs;
    openModal: (ref: Swipeable | null, data?: SkillLogs) => () => void;
    deleteLog: () => void;
}) {
    const { width } = Dimensions.get("window");

    const ref = useRef<Swipeable | null>(null);
    return (
        <Animated.View layout={Layout.duration(200)}>
            <Swipeable
                ref={ref}
                renderLeftActions={LeftAction(openModal(ref.current, data))}
                renderRightActions={RightAction(deleteLog)}
                overshootLeft={false}
                overshootRight={false}>
                <View
                    style={[
                        {
                            backgroundColor: colors.darkGray,
                            width: width - 20,
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
            </Swipeable>
            <AppText fontSize={16} style={{ color: colors.unmarkedText, marginTop: 10 }} textProps={{ ellipsizeMode: "tail", numberOfLines: 1 }}>
                {data.date}
            </AppText>
        </Animated.View>
    );
}

export default Logs;
