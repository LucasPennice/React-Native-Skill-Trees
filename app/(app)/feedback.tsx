import AppButton, { ButtonState } from "@/components/AppButton";
import AppText from "@/components/AppText";
import AppTextInput from "@/components/AppTextInput";
import CopyIcon from "@/components/Icons/CopyIcon";
import Spacer from "@/components/Spacer";
import { getUserFeedbackProgressPercentage } from "@/functions/misc";
import { faceImage } from "@/images";
import { colors } from "@/parameters";
import { useAppDispatch, useAppSelector } from "@/redux/reduxHooks";
import { DataAndDate, UserFeedback, appendNewEntry, selectUserFeedbackSlice } from "@/redux/slices/userFeedbackSlice";
import { selectUserId } from "@/redux/slices/userSlice";
import Clipboard from "@react-native-clipboard/clipboard";
import { useMutation } from "@tanstack/react-query";
import axiosClient from "axiosClient";
import { useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleProp, StyleSheet, TouchableHighlight, View, ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { mixpanel } from "./_layout";
import ProgressBarAndIndicator from "@/components/ProgressBarAndIndicator";

const PAGE_MARGIN = 30;

const FeedbackInput = ({
    title,
    placeholder,
    containerStyles,
    onPress,
    disabled,
    buttonState,
    buttonText,
}: {
    title: string;
    disabled: boolean;
    placeholder: string;
    containerStyles?: StyleProp<ViewStyle>;
    onPress: (data: string) => void;
    buttonState?: ButtonState;
    buttonText?: { [key in ButtonState]?: string };
}) => {
    const [text, setText] = useState("");

    const styles = StyleSheet.create({
        container: { backgroundColor: colors.darkGray, width: "100%", padding: 15, borderRadius: 10, zIndex: 5 },
        textInput: { backgroundColor: "#515053", minHeight: 45, fontSize: 10, marginBottom: 20 },
        disabledContainer: { opacity: 0.6 },
    });

    return (
        <View style={[styles.container, containerStyles]}>
            <AppText children={title} fontSize={16} style={{ color: "#E6E8E6", marginBottom: 20 }} />

            <AppTextInput
                placeholder={placeholder}
                textState={[text, setText]}
                disable={disabled}
                containerStyles={[styles.textInput, disabled ? styles.disabledContainer : undefined]}
                textStyle={{ fontSize: 12 }}
                inputProps={{ placeholderTextColor: "#FFFFFF7D", multiline: true }}
            />
            <AppButton onPress={() => onPress(text)} disabled={disabled} state={buttonState} text={buttonText} />
        </View>
    );
};

function useCreateUpdateFeedbackMutations(setFeedbackState: React.Dispatch<React.SetStateAction<UserFeedback>>) {
    const userId = useAppSelector(selectUserId);
    const dispatch = useAppDispatch();

    const { mutate: problems, status: problemsStatus } = useMutation({
        mutationFn: (newProblem: DataAndDate) => axiosClient.patch(`feedback/${userId}/problems`, newProblem),
        onSuccess: async (_, newEntry) => {
            await mixpanel.track(`UserFeedback-MainUserProblemToSolve`);
            dispatch(appendNewEntry({ keyToUpdate: "problems", newEntry }));
            setFeedbackState((prev) => {
                const result = { ...prev, problems: [...prev.problems, newEntry] } as UserFeedback;

                return result;
            });
        },
    });
    const { mutate: mainObstacle, status: mainObstacleStatus } = useMutation({
        mutationFn: (newMainObstacle: DataAndDate) => axiosClient.patch(`feedback/${userId}/mainObstacle`, newMainObstacle),
        onSuccess: async (_, newEntry) => {
            await mixpanel.track(`UserFeedback-MainObstacle`);
            dispatch(appendNewEntry({ keyToUpdate: "mainObstacle", newEntry }));
            setFeedbackState((prev) => {
                const result = { ...prev, mainObstacle: [...prev.mainObstacle, newEntry] } as UserFeedback;

                return result;
            });
        },
    });
    const { mutate: suggestedFeatures, status: suggestedFeaturesStatus } = useMutation({
        mutationFn: (newSuggestedFeature: DataAndDate) => axiosClient.patch(`feedback/${userId}/suggestedFeatures`, newSuggestedFeature),
        onSuccess: (_, newEntry) => {
            dispatch(appendNewEntry({ keyToUpdate: "suggestedFeatures", newEntry }));
            setFeedbackState((prev) => {
                const result = { ...prev, suggestedFeatures: [...prev.suggestedFeatures, newEntry] } as UserFeedback;

                return result;
            });
        },
    });
    const { mutate: dislikes, status: dislikesStatus } = useMutation({
        mutationFn: (newDislike: DataAndDate) => axiosClient.patch(`feedback/${userId}/dislikes`, newDislike),
        onSuccess: async (_, newEntry) => {
            await mixpanel.track(`UserFeedback-DislikeAboutSkillTrees`);
            dispatch(appendNewEntry({ keyToUpdate: "dislikes", newEntry }));
            setFeedbackState((prev) => {
                const result = { ...prev, dislikes: [...prev.dislikes, newEntry] } as UserFeedback;

                return result;
            });
        },
    });
    const { mutate: currentSolution, status: currentSolutionStatus } = useMutation({
        mutationFn: (newDislike: DataAndDate) => axiosClient.patch(`feedback/${userId}/currentSolution`, newDislike),
        onSuccess: async (_, newEntry) => {
            await mixpanel.track(`UserFeedback-CurrentSolution`);
            dispatch(appendNewEntry({ keyToUpdate: "currentSolution", newEntry }));
            setFeedbackState((prev) => {
                const result = { ...prev, currentSolution: [...prev.currentSolution, newEntry] } as UserFeedback;

                return result;
            });
        },
    });
    const { mutate: whyIsItHard, status: whyIsItHardStatus } = useMutation({
        mutationFn: (newDislike: DataAndDate) => axiosClient.patch(`feedback/${userId}/whyIsItHard`, newDislike),
        onSuccess: async (_, newEntry) => {
            await mixpanel.track(`UserFeedback-WhyIsItHard`);
            dispatch(appendNewEntry({ keyToUpdate: "whyIsItHard", newEntry }));
            setFeedbackState((prev) => {
                const result = { ...prev, whyIsItHard: [...prev.whyIsItHard, newEntry] } as UserFeedback;

                return result;
            });
        },
    });
    const { mutate: reasonToSolveProblem, status: reasonToSolveProblemStatus } = useMutation({
        mutationFn: (newDislike: DataAndDate) => axiosClient.patch(`feedback/${userId}/reasonToSolveProblem`, newDislike),
        onSuccess: async (_, newEntry) => {
            await mixpanel.track(`UserFeedback-ReasonToSolveProblem`);
            dispatch(appendNewEntry({ keyToUpdate: "reasonToSolveProblem", newEntry }));
            setFeedbackState((prev) => {
                const result = { ...prev, reasonToSolveProblem: [...prev.reasonToSolveProblem, newEntry] } as UserFeedback;

                return result;
            });
        },
    });

    return {
        reasonToSolveProblem,
        reasonToSolveProblemStatus,
        whyIsItHard,
        whyIsItHardStatus,
        currentSolution,
        currentSolutionStatus,
        problems,
        problemsStatus,
        mainObstacle,
        mainObstacleStatus,
        suggestedFeatures,
        suggestedFeaturesStatus,
        dislikes,
        dislikesStatus,
    };
}

function Feedback() {
    const prevUserFeedback = useAppSelector(selectUserFeedbackSlice);
    const [feedbackState, setFeedbackState] = useState<UserFeedback>(prevUserFeedback);

    const update = useCreateUpdateFeedbackMutations(setFeedbackState);

    const progressPercentage = getUserFeedbackProgressPercentage(feedbackState);

    const appendToFeedbackField = (key: keyof UserFeedback) => (data: string) => {
        if (data === "") return Alert.alert("Input cannot be empty");

        const newEntry = { data, date: new Date().toISOString() };

        switch (key) {
            case "problems":
                update.problems(newEntry);
                break;
            case "mainObstacle":
                update.mainObstacle(newEntry);
                break;
            case "dislikes":
                update.dislikes(newEntry);
                break;
            case "currentSolution":
                update.currentSolution(newEntry);
                break;
            case "reasonToSolveProblem":
                update.reasonToSolveProblem(newEntry);
                break;
            case "suggestedFeatures":
                update.suggestedFeatures(newEntry);
                break;
            case "whyIsItHard":
                update.whyIsItHard(newEntry);
                break;
            default:
                Alert.alert("Invalid key in appendToFeedbackField");
                break;
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "position"}
            style={{ backgroundColor: colors.background, flex: 1 }}
            keyboardVerticalOffset={-60}>
            <ScrollView style={{ padding: 10 }} stickyHeaderIndices={[1]}>
                <Header />

                <ProgressBarAndIndicator progressPercentage={progressPercentage} />

                <Spacer style={{ marginBottom: PAGE_MARGIN }} />
                <FeedbackInput
                    title={"What problem do you hope Skill Trees helps you solve?"}
                    placeholder={feedbackState["problems"].length !== 0 ? feedbackState["problems"][0].data : "Your answer"}
                    containerStyles={{ marginBottom: PAGE_MARGIN }}
                    onPress={appendToFeedbackField("problems")}
                    disabled={feedbackState["problems"].length !== 0}
                    buttonState={feedbackState["problems"].length !== 0 ? "success" : update.problemsStatus}
                />
                {/* <FeedbackInput
                    title={"Why is it important for you to solve this problem?"}
                    placeholder={feedbackState["reasonToSolveProblem"].length !== 0 ? feedbackState["reasonToSolveProblem"][0].data : "Your answer"}
                    containerStyles={{ marginBottom: PAGE_MARGIN }}
                    onPress={appendToFeedbackField("reasonToSolveProblem")}
                    disabled={feedbackState["reasonToSolveProblem"].length !== 0}
                    buttonState={feedbackState["reasonToSolveProblem"].length !== 0 ? "success" : update.reasonToSolveProblemStatus}
                /> */}
                <FeedbackInput
                    title={"How do you solve that problem today?"}
                    placeholder={feedbackState["currentSolution"].length !== 0 ? feedbackState["currentSolution"][0].data : "Your answer"}
                    containerStyles={{ marginBottom: PAGE_MARGIN }}
                    onPress={appendToFeedbackField("currentSolution")}
                    disabled={feedbackState["currentSolution"].length !== 0}
                    buttonState={feedbackState["currentSolution"].length !== 0 ? "success" : update.currentSolutionStatus}
                />
                <FeedbackInput
                    title={"What's your main obstacle in solving it?"}
                    placeholder={feedbackState["mainObstacle"].length !== 0 ? feedbackState["mainObstacle"][0].data : "Your answer"}
                    containerStyles={{ marginBottom: PAGE_MARGIN }}
                    onPress={appendToFeedbackField("mainObstacle")}
                    disabled={feedbackState["mainObstacle"].length !== 0}
                    buttonState={feedbackState["mainObstacle"].length !== 0 ? "success" : update.mainObstacleStatus}
                />

                {/* <FeedbackInput
                    title={"Why is it hard to overcome?"}
                    placeholder={feedbackState["whyIsItHard"].length !== 0 ? feedbackState["whyIsItHard"][0].data : "Your answer"}
                    containerStyles={{ marginBottom: PAGE_MARGIN }}
                    onPress={appendToFeedbackField("whyIsItHard")}
                    disabled={feedbackState["whyIsItHard"].length !== 0}
                    buttonState={feedbackState["whyIsItHard"].length !== 0 ? "success" : update.whyIsItHardStatus}
                /> */}

                {/* <FeedbackInput
                    title={"Is there anything you dislike about Skill Trees"}
                    placeholder={feedbackState["dislikes"].length !== 0 ? feedbackState["dislikes"][0].data : "Your answer"}
                    containerStyles={{ marginBottom: PAGE_MARGIN }}
                    onPress={appendToFeedbackField("dislikes")}
                    disabled={feedbackState["dislikes"].length !== 0}
                    buttonState={feedbackState["dislikes"].length !== 0 ? "success" : update.dislikesStatus}
                /> */}

                <Spacer style={{ marginBottom: PAGE_MARGIN }} />

                <Contact />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const Header = () => {
    const styles = StyleSheet.create({
        top: { flexDirection: "row-reverse", gap: 10, marginBottom: 20 },
        photo: { height: 60, width: 60, backgroundColor: colors.unmarkedText, borderRadius: 60 },
    });
    return (
        <>
            <View style={styles.top}>
                <View style={{ flex: 1 }}>
                    <AppText children={"Hey Beta User!"} fontSize={18} style={{ color: "#E6E8E6", marginBottom: 10, fontFamily: "helveticaBold" }} />
                    <AppText children={"My name is Lucas and I'm the creator of Skill Trees"} fontSize={16} style={{ color: "#E6E8E6" }} />
                </View>
                <Image style={styles.photo} source={faceImage} />
            </View>
            <AppText children={"I would appreciate it if you could leave some feedback"} fontSize={14} style={{ color: "#E6E8E6" }} />
            <AppText children={"Why am I asking for this favor?"} fontSize={14} style={{ color: "#E6E8E6", marginBottom: 10 }} />
            <AppText
                children={"If I understand you more I can make a better product for you and 1200+ other gamers who downloaded Skill Trees"}
                fontSize={14}
                style={{ color: "#E6E8E6", marginBottom: 20 }}
            />
            <AppText children={"I made a Skill Trees Discord group to make communication easier"} fontSize={14} style={{ color: "#E6E8E6" }} />
            <AppText
                children={"You can also reach me at my personal email. Links below"}
                fontSize={14}
                style={{ color: "#E6E8E6", marginBottom: 20 }}
            />
        </>
    );
};

const Contact = () => {
    const copyEmailToClipboard = () => Clipboard.setString("lucaspennice@gmail.com");
    const copyDiscordServerToClipboard = () => Clipboard.setString("https://discord.com/invite/ZHENer9yAW");

    const [copied, setCopied] = useState(false);
    const [copiedServer, setCopiedServer] = useState(false);

    const animatedColor = useAnimatedStyle(() => {
        return { borderColor: withTiming(copied ? colors.green : colors.accent) };
    });
    const animatedCopyServerColor = useAnimatedStyle(() => {
        return { borderColor: withTiming(copiedServer ? colors.green : colors.accent) };
    });

    const styles = StyleSheet.create({
        container: { marginBottom: 20 },
        clipboardTextContainer: {
            backgroundColor: colors.darkGray,
            borderRadius: 10,
            borderStyle: "solid",
            flexDirection: "row",
            borderWidth: 1,
            height: 45,
            marginBottom: 10,
            justifyContent: "center",
            alignItems: "center",
        },
    });

    return (
        <View style={styles.container}>
            <AppText children={"Contact"} fontSize={18} style={{ color: "#E6E8E6", marginBottom: 20 }} />

            <AppText children={"Join out Discord server:"} fontSize={16} style={{ color: "#E6E8E6", marginBottom: 10 }} />

            <TouchableHighlight
                onPress={() => {
                    copyDiscordServerToClipboard();
                    setCopiedServer(true);
                }}>
                <Animated.View style={[styles.clipboardTextContainer, animatedCopyServerColor, { marginBottom: 20 }]}>
                    <AppText children={"https://discord.gg/ZHENer9yAW"} fontSize={16} style={{ color: "#E6E8E6" }} />
                    <CopyIcon color={colors.accent} size={30} style={{ position: "absolute", right: 10 }} />
                </Animated.View>
            </TouchableHighlight>

            <AppText children={"You can also reach out at:"} fontSize={16} style={{ color: "#E6E8E6", marginBottom: 10 }} />
            <TouchableHighlight
                onPress={() => {
                    copyEmailToClipboard();
                    setCopied(true);
                }}>
                <Animated.View style={[styles.clipboardTextContainer, animatedColor]}>
                    <AppText children={"lucaspennice@gmail.com"} fontSize={16} style={{ color: "#E6E8E6" }} />
                    <CopyIcon color={colors.accent} size={30} style={{ position: "absolute", right: 10 }} />
                </Animated.View>
            </TouchableHighlight>
        </View>
    );
};

export default Feedback;
