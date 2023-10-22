import AppText from "@/components/AppText";
import { colors } from "@/parameters";
import { Alert, Dimensions, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import Animated, { interpolateColor, useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";

import AppTextInput from "@/components/AppTextInput";
import { useState } from "react";

const PAGE_MARGIN = 30;

const AppButton = ({ onPress }: { onPress: () => void }) => {
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

    return (
        <Pressable onPress={onPress}>
            <View style={styles.container}>
                <AppText children={"Send"} fontSize={14} style={{ color: "#E6E8E6" }} />
            </View>
        </Pressable>
    );
};

const FeedbackInput = ({
    title,
    allowMultiple,
    placeholder,
    containerStyles,
    onPress,
}: {
    title: string;
    allowMultiple: boolean;
    placeholder: string;
    containerStyles?: StyleProp<ViewStyle>;
    onPress: (data: string) => void;
}) => {
    const [text, setText] = useState("");

    const styles = StyleSheet.create({
        container: { backgroundColor: colors.darkGray, width: "100%", padding: 15, borderRadius: 10 },
        textInput: { backgroundColor: "#515053", minHeight: 45, fontSize: 10, marginBottom: 20 },
    });

    return (
        <View style={[styles.container, containerStyles]}>
            <AppText children={title} fontSize={16} style={{ color: "#E6E8E6", marginBottom: 20 }} />

            <AppTextInput
                placeholder={placeholder}
                textState={[text, setText]}
                disable={false}
                containerStyles={styles.textInput}
                textStyle={{ fontSize: 12 }}
                inputProps={{ placeholderTextColor: "#FFFFFF7D", multiline: true }}
            />
            <AppButton onPress={() => onPress(text)} />

            {/* OK TENGO QUE EVITAR QUE CIERTOS INPUTS SE MANDEN MAS DE UNA VEZ
            TENGO QUE AÑADIR UN INDICADOR AL BOTON DE QUE SE ENVIO BIEN EL FEEDBACK
            HAY UN UI BUG CUANDO NO SCROLEE LO SUFICIENTE PARA QUE EL STICKY HEADER SE PEGUE Y ABRO UN TEXT INPUT (POSIBLE SOLUCION PUEDE SER HACER TRES KEYBOARD AVOIDING VIEW, UNA PARA CADA INPUT EN LUGAR DE UNA SOLA PARA LOS TRES INPUTS) */}
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

type DataAndDate = { data: string; date: Date };
type UserFeedback = {
    problems: DataAndDate[];
    mainObstacle: DataAndDate[];
    suggestedFeatures: DataAndDate[];
    dislikes: DataAndDate[];
};

function Feedback() {
    const mockReduxInitialState: UserFeedback = { dislikes: [], mainObstacle: [], problems: [], suggestedFeatures: [] };

    const [foo, setFoo] = useState<UserFeedback>(mockReduxInitialState);

    const progressPercentage = getProgressPercentage(foo);

    const appendCoso = (key: keyof UserFeedback) => (data: string) => {
        if (data === "") return Alert.alert("Input cannot be empty");

        setFoo((prev) => {
            return { ...prev, [key]: [...prev[key], { data, date: new Date() }] } as UserFeedback;
        });
    };

    return (
        <ScrollView style={{ flex: 1, padding: 10 }} stickyHeaderIndices={[3]}>
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

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "position"}
                style={{ backgroundColor: colors.background }}
                keyboardVerticalOffset={-60}>
                <FeedbackInput
                    title={"What problem do you hope Skill Trees helps you solve?"}
                    placeholder={"Your answer"}
                    allowMultiple={false}
                    containerStyles={{ marginBottom: PAGE_MARGIN }}
                    onPress={appendCoso("problems")}
                />
                <FeedbackInput
                    title={"What's your main obstacle in solving it?"}
                    placeholder={"Your answer"}
                    allowMultiple={false}
                    containerStyles={{ marginBottom: PAGE_MARGIN }}
                    onPress={appendCoso("mainObstacle")}
                />
                <FeedbackInput
                    title={"What don't you like about Skill Trees"}
                    placeholder={"Your answer"}
                    allowMultiple={false}
                    containerStyles={{ marginBottom: PAGE_MARGIN }}
                    onPress={appendCoso("dislikes")}
                />
            </KeyboardAvoidingView>
        </ScrollView>
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

function getProgressPercentage(userFeedback: UserFeedback) {
    let acum = 0;

    const keys = Object.keys(userFeedback);

    const percentageIncrease = 100 / keys.length;

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i] as keyof UserFeedback;

        const feedbackIssue = userFeedback[key];

        if (feedbackIssue.length !== 0) acum += percentageIncrease;
    }

    return acum;
}

export default Feedback;
