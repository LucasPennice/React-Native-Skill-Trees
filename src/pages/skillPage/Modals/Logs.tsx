import { Swipeable } from "react-native-gesture-handler";
import { SkillLogs } from "../../../types";
import { Dimensions, Pressable, View } from "react-native";
import { centerFlex, colors } from "../../../parameters";
import AppText from "../../../components/AppText";
import Animated, { Layout } from "react-native-reanimated";
import { generalStyles } from "../../../../App";
import { useRef } from "react";
import { LeftAction, RightAction } from "./ActionButtons";

function Logs({
    logs,
    openModal,
    mutateLogs,
}: {
    logs: SkillLogs[];
    openModal: (ref: Swipeable | null, data?: SkillLogs) => () => void;
    mutateLogs: (newLogs: SkillLogs[] | undefined) => void;
}) {
    const deleteLog = (idToDelete: string) => () => {
        const result = logs.filter((log) => log.id !== idToDelete);
        mutateLogs(result);
    };

    return (
        <View style={[centerFlex, { alignItems: "flex-start", gap: 15, marginBottom: 10 }]}>
            <AppText fontSize={24} style={{ color: "white", fontFamily: "helveticaBold" }}>
                Logs
            </AppText>
            {logs.map((log) => (
                <LogCard openModal={openModal} key={log.id} data={log} deleteLog={deleteLog(log.id)} />
            ))}

            <Animated.View layout={Layout.duration(200)}>
                <Pressable onPress={openModal(null, undefined)} style={generalStyles.btn}>
                    <AppText style={{ color: colors.accent }} fontSize={16}>
                        Add Log
                    </AppText>
                </Pressable>
            </Animated.View>
        </View>
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
            <Swipeable ref={ref} renderLeftActions={LeftAction(openModal(ref.current, data))} renderRightActions={RightAction(deleteLog)}>
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
                        },
                    ]}>
                    <AppText fontSize={20} style={{ color: "white", maxWidth: width - 170 }} textProps={{ ellipsizeMode: "tail", numberOfLines: 1 }}>
                        {data.text}
                    </AppText>
                    <AppText fontSize={20} style={{ color: "white", maxWidth: width - 170 }} textProps={{ ellipsizeMode: "tail", numberOfLines: 1 }}>
                        {data.date.toLocaleDateString()}
                    </AppText>
                </View>
            </Swipeable>
        </Animated.View>
    );
}

export default Logs;
