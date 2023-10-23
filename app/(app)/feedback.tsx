import AppText from "@/components/AppText";
import { colors } from "@/parameters";
import { Alert, Dimensions, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import Animated, { ZoomIn, ZoomOut, interpolateColor, useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";
import AppTextInput from "@/components/AppTextInput";
import LoadingIcon from "@/components/LoadingIcon";
import { useAppDispatch, useAppSelector } from "@/redux/reduxHooks";
import { selectUserId } from "@/redux/slices/userSlice";
import { useMutation } from "@tanstack/react-query";
import axiosClient from "axiosClient";
import { useState } from "react";
import { DataAndDate, UserFeedback, appendNewEntry, selectUserFeedbackSlice } from "@/redux/slices/userFeedbackSlice";
import { getUserFeedbackProgressPercentage } from "@/functions/misc";
import { mixpanel } from "./_layout";

const PAGE_MARGIN = 30;

type ButtonState = "error" | "idle" | "loading" | "success";

const AppButton = ({
    onPress,
    disabled,
    style,
    state = "idle",
    text,
    disabledStyle,
}: {
    onPress: () => void;
    disabled?: boolean;
    style?: ViewStyle;
    disabledStyle?: ViewStyle;
    state?: ButtonState;
    text?: { [key in ButtonState]?: string };
}) => {
    const styles = StyleSheet.create({
        container: {
            backgroundColor: colors.darkGray,
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 10,
            borderStyle: "solid",
            borderWidth: 1,
            height: 45,
            borderColor: colors.accent,
        },
    });
    const disabledStyles = disabled ? disabledStyle : undefined;

    const animatedContainerStyles = useAnimatedStyle(() => {
        let borderColor = "";

        switch (state) {
            case "idle":
                borderColor = colors.accent;
                break;
            case "error":
                borderColor = colors.red;
                break;
            case "success":
                borderColor = colors.green;
                break;
            case "loading":
                borderColor = "#E6E6E6";
                break;
            default:
                borderColor = "#E6E6E6";
                break;
        }

        return {
            borderColor: withTiming(borderColor),
        };
    });

    return (
        <Pressable onPress={onPress} disabled={disabled}>
            <Animated.View style={[styles.container, animatedContainerStyles, disabledStyles, style]}>
                {state === "idle" && (
                    <Animated.View entering={ZoomIn} exiting={ZoomOut}>
                        <AppText children={text?.idle ?? "Send"} fontSize={14} style={{ color: "#E6E8E6" }} />
                    </Animated.View>
                )}
                {state === "error" && (
                    <Animated.View entering={ZoomIn} exiting={ZoomOut}>
                        <AppText children={text?.error ?? "Error"} fontSize={14} style={{ color: "#E6E8E6" }} />
                    </Animated.View>
                )}
                {state === "success" && (
                    <Animated.View entering={ZoomIn} exiting={ZoomOut}>
                        <AppText children={text?.success ?? "Sent!"} fontSize={14} style={{ color: "#E6E8E6" }} />
                    </Animated.View>
                )}
                {state === "loading" && (
                    <Animated.View entering={ZoomIn} exiting={ZoomOut}>
                        <LoadingIcon backgroundColor={colors.darkGray} size={20} />
                    </Animated.View>
                )}
            </Animated.View>
        </Pressable>
    );
};

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
        container: { backgroundColor: colors.darkGray, width: "100%", padding: 15, borderRadius: 10 },
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

const ProgressBar = ({ progressPercentage }: { progressPercentage: number }) => {
    const roundedProgressPercentage = parseInt(`${progressPercentage}`);

    const MAX_PROGRESS_INDICATOR_WIDTH = 56;
    const HORIZONTAL_PADDING = 20;

    const { width } = Dimensions.get("window");

    const widthWithPaddingAccounted = width - HORIZONTAL_PADDING;

    const possiblyNegativeProgressIndicatorLeft = (widthWithPaddingAccounted * roundedProgressPercentage) / 100 - MAX_PROGRESS_INDICATOR_WIDTH;
    const progressIndicatorLeft = possiblyNegativeProgressIndicatorLeft < 0 ? 0 : possiblyNegativeProgressIndicatorLeft;

    const styles = StyleSheet.create({
        container: {
            width: "100%",
            height: 50,
            backgroundColor: colors.background,
            marginBottom: 10,
            position: "relative",
            transform: [{ translateY: -10 }],
        },
        progressIndicator: {
            alignItems: "center",
            marginBottom: 20,
            width: MAX_PROGRESS_INDICATOR_WIDTH,
            position: "absolute",
            textAlign: "center",
            top: 0,
            backgroundColor: colors.darkGray,
            padding: 5,
            borderRadius: 10,
        },
        progressBar: { height: "100%", backgroundColor: "#EFEFEF", borderRadius: 10 },
        barContainer: { width: "100%", height: 10, backgroundColor: colors.line, borderRadius: 10, position: "absolute", bottom: 10 },
    });

    const animatedProgressBar = useAnimatedStyle(() => {
        return {
            width: withSpring(`${roundedProgressPercentage}%`, { dampingRatio: 0.7 }),
            backgroundColor: withTiming(interpolateColor(roundedProgressPercentage, [0, 66, 100], [colors.red, colors.orange, colors.green])),
        };
    });

    const animatedProgressIndicator = useAnimatedStyle(() => {
        return { left: withSpring(progressIndicatorLeft, { dampingRatio: 0.7 }) };
    });

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.progressIndicator, animatedProgressIndicator]}>
                <AppText children={`${roundedProgressPercentage}%`} fontSize={18} style={{ color: "#E6E8E6" }} />
            </Animated.View>
            <View style={styles.barContainer}>
                <Animated.View style={[styles.progressBar, animatedProgressBar]} />
            </View>
        </View>
    );
};

const Spacer = ({ style }: { style?: ViewStyle }) => {
    const styles = StyleSheet.create({
        container: { width: "100%", height: 2, backgroundColor: colors.darkGray, borderRadius: 10 },
    });

    return <View style={[styles.container, style]} />;
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

    return { problems, problemsStatus, mainObstacle, mainObstacleStatus, suggestedFeatures, suggestedFeaturesStatus, dislikes, dislikesStatus };
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
            case "suggestedFeatures":
                update.suggestedFeatures(newEntry);
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
            <ScrollView style={{ padding: 10 }} stickyHeaderIndices={[3]}>
                <AppText children={"Hey Beta Users!"} fontSize={18} style={{ color: "#E6E8E6", marginBottom: 20 }} />
                <AppText
                    children={"Your feedback fuels our mission to help more people become who they are destined to be"}
                    fontSize={16}
                    style={{ color: "#E6E8E6", marginBottom: 20 }}
                />
                <AppText
                    children={"Share your feedback to boost the completion percentage and help us improve the Skill Trees!"}
                    fontSize={16}
                    style={{ color: "#E6E8E6", marginBottom: 30 }}
                />

                <ProgressBar progressPercentage={progressPercentage} />

                <Spacer style={{ marginBottom: PAGE_MARGIN }} />

                <FeedbackInput
                    title={"What problem do you hope Skill Trees helps you solve?"}
                    placeholder={feedbackState["problems"].length !== 0 ? feedbackState["problems"][0].data : "Your answer"}
                    containerStyles={{ marginBottom: PAGE_MARGIN }}
                    onPress={appendToFeedbackField("problems")}
                    disabled={feedbackState["problems"].length !== 0}
                    buttonState={feedbackState["problems"].length !== 0 ? "success" : update.problemsStatus}
                />
                <FeedbackInput
                    title={"What's your main obstacle in solving it?"}
                    placeholder={feedbackState["mainObstacle"].length !== 0 ? feedbackState["mainObstacle"][0].data : "Your answer"}
                    containerStyles={{ marginBottom: PAGE_MARGIN }}
                    onPress={appendToFeedbackField("mainObstacle")}
                    disabled={feedbackState["mainObstacle"].length !== 0}
                    buttonState={feedbackState["mainObstacle"].length !== 0 ? "success" : update.mainObstacleStatus}
                />
                <FeedbackInput
                    title={"What don't you like about Skill Trees"}
                    placeholder={feedbackState["dislikes"].length !== 0 ? feedbackState["dislikes"][0].data : "Your answer"}
                    containerStyles={{ marginBottom: PAGE_MARGIN }}
                    onPress={appendToFeedbackField("dislikes")}
                    disabled={feedbackState["dislikes"].length !== 0}
                    buttonState={feedbackState["dislikes"].length !== 0 ? "success" : update.dislikesStatus}
                />
            </ScrollView>
        </KeyboardAvoidingView>
        // <LinearGradient colors={["#BF5AF2", "#5A7BF2"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.2 }} style={{ flex: 1 }}>
        //     <View style={{ width, height: 130, justifyContent: "center", alignItems: "center", gap: 20 }}>
        //         <AppText fontSize={36} style={{ color: "#FFFFFF", fontFamily: "helveticaBold" }}>
        //             Hello!
        //         </AppText>
        //         <AppText fontSize={20} style={{ color: "#FFFFFF", fontFamily: "helveticaBold" }}>
        //             I hope you are enjoying Skill Trees
        //         </AppText>
        //     </View>

        //     <Animated.View style={{ flex: 1 }} entering={SlideInDown.duration(600).easing(Easing.inOut(Easing.cubic))}>
        //         <LinearGradient
        //             colors={["#515053", "#181A1C"]}
        //             start={{ x: 0.5, y: -0.5 }}
        //             end={{ x: 0.5, y: 1 }}
        //             style={{ flex: 1, borderTopLeftRadius: 25, borderTopRightRadius: 25 }}>
        //             <View style={{ flex: 1, padding: 25, justifyContent: "space-between", alignItems: "center" }}>
        //                 <Animated.View style={{ gap: 0 }} entering={FadeInDown.duration(300).delay(650).easing(Easing.inOut(Easing.cubic))}>
        //                     <AppText fontSize={16} style={{ color: "#FFFFFF", fontFamily: "helvetica", textAlign: "center", lineHeight: 23 }}>
        //                         If you'd like to help shape the future of Skill Trees by giving feedback
        //                     </AppText>
        //                     <AppText fontSize={16} style={{ color: "#FFFFFF", fontFamily: "helvetica", textAlign: "center", lineHeight: 23 }}>
        //                         Consider following me or reaching out
        //                     </AppText>
        //                     <AppText fontSize={16} style={{ color: "#FFFFFF", fontFamily: "helvetica", textAlign: "center", lineHeight: 23 }}>
        //                         I'll run polls to figure out the best way to help you reach your life's goals
        //                     </AppText>
        //                 </Animated.View>
        //                 <Animated.View entering={FadeInDown.duration(300).delay(700).easing(Easing.inOut(Easing.cubic))} style={{ gap: 30 }}>
        //                     <Pressable
        //                         onPress={async () => {
        //                             await analytics().logEvent("ClickInstagramLink");
        //                             Linking.openURL("https://instagram.com/lucas_pennice?igshid=NGVhN2U2NjQ0Yg%3D%3D&utm_source=qr");
        //                         }}>
        //                         <LinearGradient
        //                             colors={["#BF5AF2", "#5A7BF2"]}
        //                             start={{ x: 0, y: 0 }}
        //                             end={{ x: 1, y: 1 }}
        //                             style={{
        //                                 width: width - 60,
        //                                 height: 80,
        //                                 borderRadius: 20,
        //                                 flexDirection: "row",
        //                                 justifyContent: "space-between",
        //                                 alignItems: "center",
        //                                 paddingHorizontal: 30,
        //                             }}>
        //                             <FontAwesome size={50} name="instagram" color={"#FFFFFF"} />
        //                             <View>
        //                                 <AppText
        //                                     fontSize={16}
        //                                     style={{ color: "#FFFFFF", fontFamily: "helveticaBold", textAlign: "center", marginBottom: 5 }}>
        //                                     Follow me on
        //                                 </AppText>
        //                                 <AppText fontSize={16} style={{ color: "#FFFFFF", fontFamily: "helveticaBold", textAlign: "center" }}>
        //                                     Instagram
        //                                 </AppText>
        //                             </View>
        //                         </LinearGradient>
        //                     </Pressable>

        //                     <Pressable
        //                         onPress={async () => {
        //                             await analytics().logEvent("ClickTwitterLink");
        //                             Linking.openURL("https://twitter.com/LucasPennice");
        //                         }}>
        //                         <LinearGradient
        //                             colors={["#5A7BF2", "#40C8E0"]}
        //                             start={{ x: 0, y: 0 }}
        //                             end={{ x: 1, y: 1 }}
        //                             style={{
        //                                 width: width - 60,
        //                                 height: 80,
        //                                 borderRadius: 20,
        //                                 flexDirection: "row",
        //                                 justifyContent: "space-between",
        //                                 alignItems: "center",
        //                                 paddingHorizontal: 30,
        //                             }}>
        //                             <FontAwesome size={50} name="twitter" color={"#FFFFFF"} />
        //                             <View>
        //                                 <AppText
        //                                     fontSize={16}
        //                                     style={{ color: "#FFFFFF", fontFamily: "helveticaBold", textAlign: "center", marginBottom: 5 }}>
        //                                     Follow me on
        //                                 </AppText>
        //                                 <AppText fontSize={16} style={{ color: "#FFFFFF", fontFamily: "helveticaBold", textAlign: "center" }}>
        //                                     X (Twitter)
        //                                 </AppText>
        //                             </View>
        //                         </LinearGradient>
        //                     </Pressable>
        //                 </Animated.View>
        //                 <Animated.View entering={FadeInDown.duration(300).delay(750).easing(Easing.inOut(Easing.cubic))}>
        //                     <AppText fontSize={16} style={{ color: colors.unmarkedText, fontFamily: "helvetica", textAlign: "center" }}>
        //                         Or send me an email at:
        //                     </AppText>
        //                     <AppText fontSize={16} style={{ color: colors.unmarkedText, fontFamily: "helvetica", textAlign: "center" }}>
        //                         skilltreesapp@gmail.com
        //                     </AppText>
        //                 </Animated.View>
        //             </View>
        //         </LinearGradient>
        //     </Animated.View>
        // </LinearGradient>
    );
}

export default Feedback;
