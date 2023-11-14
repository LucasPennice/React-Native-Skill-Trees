import AppButton from "@/components/AppButton";
import AppText from "@/components/AppText";
import AppTextInput from "@/components/AppTextInput";
import CheckIcon from "@/components/Icons/CheckIcon";
import TrashIcon from "@/components/Icons/TrashIcon";
import SliderToggler from "@/components/SliderToggler";
import { generate24CharHexId } from "@/functions/misc";
import { MENU_HIGH_DAMPENING, colors } from "@/parameters";
import { useEffect, useState } from "react";
import { Alert, Dimensions, Platform, Pressable, StyleSheet, View } from "react-native";
import Animated, {
    FadeInDown,
    FadeInLeft,
    FadeInRight,
    FadeOutLeft,
    FadeOutRight,
    useAnimatedStyle,
    withDelay,
    withSpring,
    withTiming,
} from "react-native-reanimated";

type Mode = "Milestone" | "Habit";

function useHandleModeState(initialMode: Mode) {
    const [mode, setMode] = useState<Mode>(initialMode);

    const toggleMode = () => setMode((p) => (p === "Habit" ? "Milestone" : "Habit"));

    return [mode, { toggleMode }] as const;
}

function GoalForm({ blockInteraction }: { blockInteraction: boolean }) {
    const [mode, { toggleMode }] = useHandleModeState("Milestone");

    const animatedOpacity = useAnimatedStyle(() => {
        return { opacity: withTiming(blockInteraction ? 0.5 : 1) };
    });

    return (
        <Animated.View pointerEvents={blockInteraction ? "none" : "auto"} style={animatedOpacity}>
            <AppText fontSize={18} children={"Track Skill Progress"} />
            <View>
                {mode === "Milestone" && (
                    <Animated.View exiting={FadeOutLeft} entering={FadeInLeft}>
                        <AppText
                            fontSize={14}
                            children={"Finish the list to complete the skill"}
                            style={{ marginTop: 3, marginBottom: 10, color: `${colors.white}80` }}
                        />
                    </Animated.View>
                )}
                {mode === "Habit" && (
                    <Animated.View entering={FadeInRight} exiting={FadeOutRight}>
                        <AppText
                            fontSize={14}
                            children={"Reach a specific streak to complete the skill"}
                            style={{ marginTop: 3, marginBottom: 10, color: `${colors.white}80` }}
                        />
                    </Animated.View>
                )}
            </View>

            <SliderToggler
                modeText={["Milestones", "Habit"]}
                isLeftSelected={mode === "Milestone"}
                toggleMode={toggleMode}
                indicatorStyles={{ borderColor: colors.white }}
            />

            {mode === "Milestone" && <MilestoneForm />}
            {mode === "Habit" && <HabitForm />}
        </Animated.View>
    );
}

type Milestone = {
    complete: boolean;
    completeOn?: string;
    id: string;
    text: string;
};

const useHandleMilestoneList = () => {
    const [milestoneList, setState] = useState<Milestone[]>([]);

    const addMilestone = () => {
        const isEmptyMilestone = milestoneList.find((milestone) => milestone.text === "");

        if (isEmptyMilestone) return Alert.alert("Empty milestone found");

        const newMilestone: Milestone = { complete: false, id: generate24CharHexId(), text: "" };

        setState((p) => [...p, newMilestone]);
    };

    const deleteMilestone = (idToDelete: string) => {
        setState((p) => {
            return p.filter((milestone) => milestone.id !== idToDelete);
        });
    };

    const updateMilestone = (idToUpdate: string, updatedMilestone: Milestone) => {
        setState((p) => {
            return p.map((milestone) => {
                if (idToUpdate === milestone.id) return updatedMilestone;

                return milestone;
            });
        });
    };

    return { milestoneList, addMilestone, deleteMilestone, updateMilestone };
};

const MilestoneForm = () => {
    const { addMilestone, deleteMilestone, milestoneList, updateMilestone } = useHandleMilestoneList();

    const DISTANCE_BETWEEN_CHECKBOXES = 32;
    const CHECKBOX_HEIGHT = 24;

    const animatedMilestoneConnectorHeight = useAnimatedStyle(() => {
        const k = milestoneList.length === 0 ? 0 : milestoneList.length - 1;

        return { height: withDelay(200, withSpring(k * CHECKBOX_HEIGHT + k * DISTANCE_BETWEEN_CHECKBOXES)) };
    });

    const DISTANCE_TO_TOP_OF_FIRST_CHECKBOX = (45 - CHECKBOX_HEIGHT) / 2;

    return (
        <Animated.View exiting={FadeOutLeft} entering={FadeInLeft} style={{ marginBottom: 60 }}>
            <View style={{ position: "relative" }}>
                {milestoneList.length > 1 && (
                    <Animated.View
                        style={[
                            animatedMilestoneConnectorHeight,
                            {
                                position: "absolute",
                                width: 1,
                                borderStyle: "dashed",
                                borderColor: `${colors.white}80`,
                                borderWidth: 1,
                                top: DISTANCE_TO_TOP_OF_FIRST_CHECKBOX,
                                left: 14,
                            },
                        ]}
                    />
                )}
                {milestoneList.map((milestone) => (
                    <StatementMilestone data={milestone} updateMilestone={updateMilestone} deleteMilestone={deleteMilestone} />
                ))}
            </View>

            <AppButton onPress={addMilestone} text={{ idle: "Add Milestone" }} />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    milestoneContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        position: "relative",
    },
    completeBoxPressable: {
        height: 40,
        width: 40,
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: 3,
    },
    completeBoxIndicator: {
        height: 24,
        width: 24,
        borderColor: colors.white,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderRadius: 5,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
});

const StatementMilestone = ({
    data,
    updateMilestone,
    deleteMilestone,
}: {
    data: Milestone;
    updateMilestone: (idToUpdate: string, updatedMilestone: Milestone) => void;
    deleteMilestone: (idToDelete: string) => void;
}) => {
    const updateMilestoneText = (newText: string) => {
        updateMilestone(data.id, { ...data, text: newText });
    };

    const updateCompletion = (newCompletion: boolean) => {
        const newCompletionData = new Date().toString();
        updateMilestone(data.id, { ...data, complete: newCompletion, completeOn: newCompletion ? newCompletionData : undefined });
    };

    const toggleCompletion = () => {
        if (data.complete) return updateCompletion(false);

        updateCompletion(true);
    };

    const borderColor = data.complete ? "#BCED09" : colors.white;

    return (
        <Animated.View entering={FadeInDown} style={styles.milestoneContainer}>
            <Pressable style={styles.completeBoxPressable} onPress={toggleCompletion}>
                <View style={[styles.completeBoxIndicator, { borderColor }]} pointerEvents={"none"}>
                    {data.complete && <CheckIcon width={14} height={14} />}
                </View>
            </Pressable>
            <AppTextInput
                placeholder={"i.e: Read 5 books"}
                textState={[data.text, updateMilestoneText]}
                hideClearButton
                pattern={new RegExp(/^[^ ]/)}
                containerStyles={{ flex: 1 }}
            />
            <Pressable
                onPress={() => deleteMilestone(data.id)}
                style={{
                    position: "absolute",
                    width: 45,
                    height: 45,
                    justifyContent: "center",
                    alignItems: "center",
                    right: 0,
                }}>
                <TrashIcon height={18} width={18} color={colors.line} />
            </Pressable>
        </Animated.View>
    );
};

type Habit = {
    streakToComplete: number;
    startedAt: string;
    deadlineAt?: string;
    name: string;
    id: string;
    frequency: "Day" | "Weekly" | "Monthly";
    unit: string;
    quantity: number;
};

const initialState: Habit = {
    frequency: "Day",
    name: "",
    quantity: 1,
    startedAt: new Date().toString(),
    unit: "",
    id: generate24CharHexId(),
    deadlineAt: undefined,
    streakToComplete: 1,
};
const useHandleHabitState = () => {
    const [habit, setState] = useState<Habit>(initialState);

    const updateHabit = (habitField: keyof Habit) => (newValue: (typeof initialState)[keyof Habit]) => {
        setState((prev) => {
            return { ...prev, [habitField]: newValue };
        });
    };

    return { habit, updateHabit };
};

const HabitForm = () => {
    const { habit, updateHabit } = useHandleHabitState();

    const validateNumber = (tentativeNumber: string) => {
        if (tentativeNumber === "0") return 1;

        const cleanNumber = tentativeNumber.replace(/[^0-9]/g, "");

        return cleanNumber;
    };

    const shouldDisplayCommitmentMessage = habit.name !== "" && habit.unit !== "";

    return (
        <Animated.View entering={FadeInRight} exiting={FadeOutRight} style={{ marginBottom: 60 }}>
            <AppText style={{ marginBottom: 5 }} fontSize={16} children={"Habit Name"} />
            <AppTextInput
                placeholder={"Read"}
                textState={[habit.name, updateHabit("name")]}
                pattern={new RegExp(/^[^ ]/)}
                containerStyles={{ flex: 1, marginBottom: 20 }}
            />
            <AppText fontSize={16} children={"Frequency"} />
            <AppText
                fontSize={14}
                children={"How much and how often do you practice this habit?"}
                style={{ marginTop: 3, marginBottom: 10, color: `${colors.white}80` }}
            />
            <View style={{ flexDirection: "row", gap: 5, alignItems: "center", marginBottom: 20 }}>
                <AppTextInput
                    placeholder={"4"}
                    textState={[habit.quantity.toString(), (v: string) => updateHabit("quantity")(validateNumber(v))]}
                    hideClearButton
                    inputProps={{ keyboardType: Platform.OS === "android" ? "numeric" : "number-pad" }}
                    containerStyles={{ width: 45 }}
                    textStyle={{ marginRight: 0, paddingLeft: 0, textAlign: "center" }}
                />
                <AppTextInput
                    placeholder={"pages"}
                    textState={[habit.unit, updateHabit("unit")]}
                    hideClearButton
                    pattern={new RegExp(/^[^ ]/)}
                    containerStyles={{ flex: 0.5 }}
                    textStyle={{ marginRight: 0, paddingLeft: 0, textAlign: "center" }}
                />

                <FrequencyPicker onUpdate={updateHabit("frequency")} />
            </View>

            <AppText fontSize={16} children={"Streak to complete"} />
            <AppText
                fontSize={14}
                children={"Want to make a habit that lasts forever? Click here"}
                style={{ marginTop: 3, marginBottom: 10, color: `${colors.white}80` }}
            />

            <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                <AppTextInput
                    placeholder={"4"}
                    textState={[habit.streakToComplete.toString(), (v: string) => updateHabit("streakToComplete")(validateNumber(v))]}
                    hideClearButton
                    inputProps={{ keyboardType: Platform.OS === "android" ? "numeric" : "number-pad" }}
                    containerStyles={{ width: 45 }}
                    textStyle={{ marginRight: 0, paddingLeft: 0, textAlign: "center" }}
                />

                <View style={{ flex: 1 }}>
                    {shouldDisplayCommitmentMessage && (
                        <>
                            <View style={{ flexDirection: "row", gap: 3, flexWrap: "wrap" }}>
                                <AppText fontSize={14} children={`I will`} />
                                <AppText fontSize={14} children={habit.name} style={{ color: colors.accent, fontFamily: "helveticaBold" }} />
                                <AppText fontSize={14} children={habit.quantity} style={{ color: colors.accent, fontFamily: "helveticaBold" }} />
                                <AppText fontSize={14} children={habit.unit} style={{ color: colors.accent, fontFamily: "helveticaBold" }} />
                                <AppText fontSize={14} children={`a`} />
                                <AppText fontSize={14} children={habit.frequency} style={{ color: colors.accent, fontFamily: "helveticaBold" }} />
                            </View>
                            <View style={{ flexDirection: "row", gap: 3, flexWrap: "wrap" }}>
                                <AppText
                                    fontSize={14}
                                    children={`${habit.streakToComplete} times`}
                                    style={{ color: colors.accent, fontFamily: "helveticaBold" }}
                                />
                                <AppText fontSize={14} children={`to complete this skill`} />
                            </View>
                        </>
                    )}
                    {!shouldDisplayCommitmentMessage && (
                        <AppText
                            style={{ color: `${colors.white}80` }}
                            fontSize={14}
                            children={`I will Read 4 pages a day 30 times to complete this skill`}
                        />
                    )}
                </View>
            </View>
        </Animated.View>
    );
};

const usePickFrequency = (onUpdate?: (v: Habit["frequency"]) => void) => {
    const [frequency, setFrequency] = useState<Habit["frequency"]>("Day");

    useEffect(() => {
        if (onUpdate) onUpdate(frequency);
    }, [frequency]);

    return { frequency, setFrequency };
};

const FrequencyPicker = ({ onUpdate }: { onUpdate: (v: Habit["frequency"]) => void }) => {
    const { frequency, setFrequency } = usePickFrequency(onUpdate);

    const [width, setWidth] = useState(Dimensions.get("window").width / 2);

    const indicatorWidth = width;

    const styles = StyleSheet.create({
        pressable: { width, justifyContent: "center", alignItems: "center" },
        container: { height: 45, flex: 1, backgroundColor: colors.darkGray, borderRadius: 10, flexDirection: "row", position: "relative" },
        indicator: { position: "absolute", height: 45, width: indicatorWidth, borderRadius: 10, borderWidth: 1, borderColor: colors.white },
    });

    const animatedStyles = useAnimatedStyle(() => {
        const left = frequency === "Day" ? 0 : frequency === "Weekly" ? indicatorWidth : 2 * indicatorWidth;
        return { left: withSpring(left, MENU_HIGH_DAMPENING) };
    });

    return (
        <View onLayout={(e) => setWidth(e.nativeEvent.layout.width / 3)} style={styles.container}>
            <Animated.View style={[styles.indicator, animatedStyles]} />

            <Pressable style={styles.pressable} onPress={() => setFrequency("Day")}>
                <AppText fontSize={14} children={"day"} />
            </Pressable>
            <Pressable style={styles.pressable} onPress={() => setFrequency("Weekly")}>
                <AppText fontSize={14} children={"week"} />
            </Pressable>
            <Pressable style={styles.pressable} onPress={() => setFrequency("Monthly")}>
                <AppText fontSize={14} children={"month"} />
            </Pressable>
        </View>
    );
};

export default GoalForm;
