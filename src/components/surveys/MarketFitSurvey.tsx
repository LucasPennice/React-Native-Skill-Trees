import QuestionMark from "@/../assets/lotties/questionMark.json";
import { colors } from "@/parameters";
import { useHandleLottiePlay } from "@/useHandleLottiePlay";
import { useFormspark } from "@formspark/use-formspark";
import { mixpanel } from "app/_layout";
import LottieView from "lottie-react-native";
import { useEffect, useState } from "react";
import { Dimensions, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import Animated, { Easing, FadeInDown, ZoomOut } from "react-native-reanimated";
import AppButton from "../AppButton";
import AppText from "../AppText";
import AppTextInput from "../AppTextInput";
import RadialInput from "../RadialInput";
import { useAppDispatch } from "@/redux/reduxHooks";
import { updateAppOpenSinceLastPMFSurvey } from "@/redux/slices/userVariablesSlice";

const { height } = Dimensions.get("window");

const MODAL_HEIGHT = height - 50;
const ICON_HEIGHT = 90;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#00000080" },
    tapToCloseZone: { flex: 1 },
    alertContainer: { height: MODAL_HEIGHT, position: "relative", alignItems: "center", justifyContent: "flex-end" },
    alertContentContainer: {
        height: MODAL_HEIGHT - ICON_HEIGHT / 2,
        width: "100%",
        backgroundColor: colors.darkGray,
        paddingTop: ICON_HEIGHT / 2 + 20,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    iconContainer: {
        width: ICON_HEIGHT,
        height: ICON_HEIGHT,
        overflow: "hidden",
        borderRadius: ICON_HEIGHT,
        backgroundColor: colors.clearGray,
        position: "absolute",
        justifyContent: "center",
        alignItems: "center",
        top: 0,
    },
});

function MarketFitSurvey({ open, close }: { open: boolean; close: () => void }) {
    const [selected, setSelected] = useState<null | string>(null);
    const [avatar, setAvatar] = useState("");
    const [benefit, setBenefit] = useState("");
    const [improvements, setImprovements] = useState("");

    const disableSubmit = selected === null || avatar === "" || benefit === "" || improvements === "";

    const [submit, submitting] = useFormspark({ formId: "Tmlap1Run" });

    const handleSubmit = async () => {
        await submit({ nps: selected, avatar, mainBenefit: benefit, improvements });
        mixpanel.track("SURVEY Market Fit <1.0>", { nps: selected, avatar, mainBenefit: benefit, improvements });
        close();
    };

    const dispatch = useAppDispatch();
    useEffect(() => {
        if (!open) return;

        dispatch(updateAppOpenSinceLastPMFSurvey());
    }, [open]);

    const animationRef = useHandleLottiePlay(open);

    return (
        <Modal animationType="fade" transparent={true} visible={open} onRequestClose={close} presentationStyle={"overFullScreen"}>
            <View style={styles.container}>
                <Pressable onPress={close} style={styles.tapToCloseZone} />
                <Animated.View
                    style={styles.alertContainer}
                    exiting={ZoomOut.easing(Easing.bezierFn(0.83, 0, 0.17, 1))}
                    entering={FadeInDown.withInitialValues({ transform: [{ translateY: MODAL_HEIGHT }] })
                        .duration(800)
                        .easing(Easing.bezierFn(0.83, 0, 0.17, 1))}>
                    <View style={styles.alertContentContainer}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "position"}>
                                <AppText
                                    children={"I value your opinion"}
                                    fontSize={24}
                                    style={{ fontFamily: "helveticaBold", textAlign: "center", color: "#FFFFFF", marginBottom: 30 }}
                                />

                                <AppText
                                    children={"How would you feel if you could no longer use Skill Trees?"}
                                    fontSize={18}
                                    style={{ fontFamily: "helveticaBold", marginBottom: 10 }}
                                />
                                <RadialInput
                                    title={"Very disappointed"}
                                    onPress={() => setSelected("Very disappointed")}
                                    selected={selected === "Very disappointed"}
                                />
                                <RadialInput
                                    title={"Somewhat disappointed "}
                                    onPress={() => setSelected("Somewhat disappointed ")}
                                    selected={selected === "Somewhat disappointed "}
                                />
                                <RadialInput
                                    title={"Not disappointed"}
                                    onPress={() => setSelected("Not disappointed")}
                                    selected={selected === "Not disappointed"}
                                />

                                <AppText
                                    children={"What type of people do you think would most benefit from Skill Trees?"}
                                    fontSize={18}
                                    style={{ fontFamily: "helveticaBold", marginBottom: 10, marginTop: 20 }}
                                />
                                <AppTextInput
                                    placeholder={"... would benefit from using Skill Trees"}
                                    textState={[avatar, setAvatar]}
                                    containerStyles={{ backgroundColor: colors.clearGray, marginBottom: 20 }}
                                />
                                <AppText
                                    children={"What is the main benefit you receive from Skill Trees?"}
                                    fontSize={18}
                                    style={{ fontFamily: "helveticaBold", marginBottom: 10 }}
                                />
                                <AppTextInput
                                    placeholder={"Your answer"}
                                    textState={[benefit, setBenefit]}
                                    containerStyles={{ backgroundColor: colors.clearGray, height: 100, marginBottom: 20 }}
                                />
                                <AppText
                                    children={"How can we improve Skill Trees for you?"}
                                    fontSize={18}
                                    style={{ fontFamily: "helveticaBold", marginBottom: 10 }}
                                />

                                <AppTextInput
                                    placeholder={"... would be a huge improvement"}
                                    textState={[improvements, setImprovements]}
                                    containerStyles={{ backgroundColor: colors.clearGray, height: 150, marginBottom: 20 }}
                                />

                                <AppButton
                                    onPress={handleSubmit}
                                    pressableStyle={{ width: "100%" }}
                                    text={{ idle: "Submit" }}
                                    disabled={disableSubmit}
                                    color={{ loading: colors.softPurle }}
                                    state={submitting ? "loading" : "idle"}
                                    style={{ backgroundColor: colors.softPurle }}
                                    textStyle={{ fontSize: 18, lineHeight: 18 }}
                                />
                            </KeyboardAvoidingView>
                        </ScrollView>
                    </View>
                    <View style={styles.iconContainer}>
                        <LottieView source={QuestionMark} loop={false} ref={animationRef} style={{ width: ICON_HEIGHT }} />
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

export default MarketFitSurvey;
