import AppButton from "@/components/AppButton";
import AppText from "@/components/AppText";
import FireIcon from "@/components/Icons/FireIcon";
import HourglassIcon from "@/components/Icons/HourglassIcon";
import SadFaceIcon from "@/components/Icons/SadFaceIcon";
import { ProgressBar } from "@/components/ProgressBarAndIndicator";
import Spacer from "@/components/Spacer";
import { colors } from "@/parameters";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

function UserProgress() {
    return (
        <View style={{ flex: 1, padding: 10 }}>
            <Header />

            <View style={{ flexDirection: "row", gap: 10 }}>
                <HabitDaySelector />
                <HabitFilterSelector />
            </View>

            <HabitScroller />

            <Spacer style={{ marginBottom: 10 }} />
        </View>
    );
}

const Header = () => {
    const style = StyleSheet.create({
        container: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
    });

    return (
        <View style={style.container}>
            <View style={{ justifyContent: "center", flex: 1 }}>
                <AppText fontSize={18} children={"My Habits"} />
                <AppText style={{ color: `${colors.white}80` }} fontSize={14}>
                    Double tap to see stats. Long press a habit to Edit
                </AppText>
            </View>
            <AppButton
                onPress={() => {}}
                text={{ idle: "New Habit" }}
                color={{ idle: colors.background }}
                style={{ paddingLeft: 40, borderRadius: 15, backgroundColor: colors.background }}
                textStyle={{ color: colors.accent }}
            />
        </View>
    );
};

const HabitDaySelector = () => {
    const style = StyleSheet.create({
        container: { flex: 1, height: 45, backgroundColor: colors.darkGray, borderRadius: 10 },
    });

    return <View style={style.container}></View>;
};
const HabitFilterSelector = () => {
    const style = StyleSheet.create({
        container: { width: 45, height: 45, backgroundColor: colors.darkGray, borderRadius: 10 },
    });
    return <View style={style.container}></View>;
};

const HabitScroller = () => {
    const style = StyleSheet.create({
        container: { height: 140, marginTop: 10 },
        footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
        allHabitsButton: { width: 90, height: 40, justifyContent: "center", alignItems: "flex-end" },
    });
    return (
        <>
            <View style={style.container}>
                <ScrollView horizontal>
                    <HabitCard />
                    <HabitCard />
                    <HabitCard />
                </ScrollView>
            </View>
            <View style={style.footer}>
                <AppText style={{ color: `${colors.white}80` }} fontSize={14}>
                    Scroll to see more habits
                </AppText>

                <Pressable onPressIn={() => {}} style={style.allHabitsButton}>
                    <AppText style={{ opacity: 0.7 }} fontSize={14}>
                        All Habits r
                    </AppText>
                </Pressable>
            </View>
        </>
    );
};

const HabitCard = () => {
    const style = StyleSheet.create({
        container: {
            width: 180,
            height: 140,
            backgroundColor: colors.darkGray,
            borderRadius: 10,
            marginRight: 10,
            padding: 10,
            justifyContent: "space-between",
        },
        habitNameContainer: { flexDirection: "row", gap: 5, alignItems: "center" },
        habitNameText: { paddingTop: 3 },
        pointSpacer: { width: 3, height: 3, borderRadius: 5, backgroundColor: colors.white, opacity: 0.8, marginHorizontal: 5 },
    });
    return (
        <View style={style.container}>
            <View style={style.habitNameContainer}>
                <SadFaceIcon height={18} width={18} />
                <AppText fontSize={16} children={"Read"} style={style.habitNameText} />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
                <AppText style={{ opacity: 0.8, marginRight: 3 }} fontSize={14} children={"4"} />
                <AppText style={{ opacity: 0.8 }} fontSize={14} children={"Pages"} />
                <View style={style.pointSpacer} />
                <AppText style={{ opacity: 0.8 }} fontSize={14} children={"Day"} />
            </View>
            <View>
                <AppText style={{ color: `${colors.white}80` }} fontSize={14} children={"Begginer Reader"} />
            </View>
            <View>
                <View style={{ height: 30, marginBottom: 10, flexDirection: "row", gap: 5 }}>
                    <RemainingTime />
                    <Streak />
                </View>
                <ProgressBar progress={Math.random() * 100} containerStyle={{ height: 14, backgroundColor: "#515053" }} />
            </View>
        </View>
    );
};

const RemainingTime = () => {
    const style = StyleSheet.create({
        container: {
            flex: 1,
            height: 30,
            backgroundColor: "#51505380",
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            gap: 3,
        },
        text: { paddingTop: 2 },
    });
    return (
        <View style={style.container}>
            <HourglassIcon height={15} width={12} fill={`${colors.white}80`} />
            <AppText fontSize={14} children={"24:00:00"} style={style.text} />
        </View>
    );
};
const Streak = () => {
    const style = StyleSheet.create({
        container: {
            paddingHorizontal: 8,
            height: 30,
            backgroundColor: "#51505380",
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            gap: 4,
        },
        text: { paddingTop: 2 },
    });
    return (
        <View style={style.container}>
            <FireIcon fill={colors.orange} width={13} height={15} />
            <AppText fontSize={14} children={"30/30"} style={style.text} />
        </View>
    );
};

export default UserProgress;
