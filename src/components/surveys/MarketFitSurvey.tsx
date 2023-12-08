import QuestionMark from "@/../assets/lotties/questionMark.json";
import Selected from "@/../assets/lotties/success.json";
import { colors } from "@/parameters";
import { useFormspark } from "@formspark/use-formspark";
import { mixpanel } from "app/_layout";
import LottieView from "lottie-react-native";
import { useEffect, useRef, useState } from "react";
import { Dimensions, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { Easing, FadeInDown, ZoomOut } from "react-native-reanimated";
import AppButton from "../AppButton";
import AppText from "../AppText";
import AppTextInput from "../AppTextInput";

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
        backgroundColor: "#2A2D2F",
        position: "absolute",
        justifyContent: "center",
        alignItems: "center",
        top: 0,
    },
});

const useHandlePlay = (open: boolean, delay = 1000) => {
    const animation = useRef<LottieView>(null);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        if (open) {
            timeoutId = setTimeout(() => {
                animation.current?.reset();
                animation.current?.play();
            }, delay);
        }

        if (!open) {
            animation.current?.reset();
            animation.current?.pause();
        }

        return () => {
            clearTimeout(timeoutId);
        };
    }, [open]);

    return animation;
};

function MarketFitSurvey({ open, close }: { open: boolean; close: () => void }) {
    const [selected, setSelected] = useState<null | string>(null);
    const [avatar, setAvatar] = useState("");
    const [benefit, setBenefit] = useState("");
    const [improvements, setImprovements] = useState("");

    const disableSubmit = selected === null || avatar === "" || benefit === "" || improvements === "";

    const [submit, submitting] = useFormspark({ formId: "Tmlap1Run" });

    const handleSubmit = async () => {
        await submit({ nps: selected, avatar, mainBenefit: benefit, improvements });
        mixpanel.track("marketFitSurvey v1.0", { nps: selected, avatar, mainBenefit: benefit, improvements });
        close();
    };

    const animationRef = useHandlePlay(open);

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
                                    containerStyles={{ backgroundColor: "#2A2D2F", marginBottom: 20 }}
                                />
                                <AppText
                                    children={"What is the main benefit you receive from Skill Trees?"}
                                    fontSize={18}
                                    style={{ fontFamily: "helveticaBold", marginBottom: 10 }}
                                />
                                <AppTextInput
                                    placeholder={"Your answer"}
                                    textState={[benefit, setBenefit]}
                                    containerStyles={{ backgroundColor: "#2A2D2F", height: 100, marginBottom: 20 }}
                                />
                                <AppText
                                    children={"How can we improve Skill Trees for you?"}
                                    fontSize={18}
                                    style={{ fontFamily: "helveticaBold", marginBottom: 10 }}
                                />

                                <AppTextInput
                                    placeholder={"... would be a huge improvement"}
                                    textState={[improvements, setImprovements]}
                                    containerStyles={{ backgroundColor: "#2A2D2F", height: 150, marginBottom: 20 }}
                                />

                                <AppButton
                                    onPress={handleSubmit}
                                    pressableStyle={{ width: "100%" }}
                                    text={{ idle: "Submit" }}
                                    disabled={disableSubmit}
                                    color={{ loading: "#B863E3" }}
                                    state={submitting ? "loading" : "idle"}
                                    style={{ backgroundColor: "#B863E3" }}
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

const RadialInput = ({ selected, onPress, title }: { selected: boolean; onPress: () => void; title: string }) => {
    const style = StyleSheet.create({
        container: {
            width: "100%",
            height: 50,
            alignItems: "center",
            gap: 8,
            borderRadius: 15,
            paddingHorizontal: 10,
            flexDirection: "row",
            backgroundColor: "#2A2D2F",
            marginBottom: 10,
        },
        selectedIndicator: {
            width: 30,
            height: 30,
            overflow: "hidden",
            borderRadius: 30,
            backgroundColor: colors.line,
            justifyContent: "center",
            alignItems: "center",
        },
    });

    const animationRef = useHandlePlay(selected, 0);

    return (
        <TouchableOpacity onPress={onPress}>
            <Animated.View style={style.container}>
                <View style={style.selectedIndicator}>
                    <LottieView source={Selected} loop={false} ref={animationRef} style={{ width: 25 }} speed={1.25} />
                </View>
                <AppText fontSize={18} style={{ marginLeft: 4 }} children={title} />
            </Animated.View>
        </TouchableOpacity>
    );
};

export default MarketFitSurvey;
