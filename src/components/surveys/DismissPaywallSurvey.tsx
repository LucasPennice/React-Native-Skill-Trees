import QuestionMark from "@/../assets/lotties/questionMark.json";
import { colors } from "@/parameters";
import { useHandleLottiePlay } from "@/useHandleLottiePlay";
import { useFormspark } from "@formspark/use-formspark";
import { mixpanel } from "app/_layout";
import LottieView from "lottie-react-native";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { Easing, FadeInDown, FadeInRight, FadeOutLeft, ZoomOut } from "react-native-reanimated";
import AppButton from "../AppButton";
import AppText from "../AppText";
import AppTextInput from "../AppTextInput";
import { useAppDispatch } from "@/redux/reduxHooks";
import { completeDismissPaywallSurvey } from "@/redux/slices/userVariablesSlice";
import { BACKGROUND_COLOR } from "../subscription/functions";

const MODAL_HEIGHT = 500;
const ICON_HEIGHT = 90;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#00000080" },
    tapToCloseZone: { flex: 1 },
    alertContainer: { height: MODAL_HEIGHT, position: "relative", alignItems: "center", justifyContent: "flex-end" },
    alertContentContainer: {
        height: MODAL_HEIGHT - ICON_HEIGHT / 2,
        width: "100%",
        backgroundColor: colors.darkGray,
        position: "relative",
        alignItems: "center",
        justifyContent: "space-between",
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
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
    pressable: {
        borderWidth: 1,
        borderColor: colors.clearGray,
        height: 60,
        justifyContent: "center",
        alignItems: "center",
        borderBottomWidth: 0,
        backgroundColor: BACKGROUND_COLOR,
    },
});

function DismissPaywallSurvey({ open, close }: { open: boolean; close: () => void }) {
    const [longAnswer, setLongAnswer] = useState("");

    const [showLongForm, setShowLongForm] = useState(false);

    const [submit, submitting] = useFormspark({ formId: "OLioqg4JK" });

    const dispatch = useAppDispatch();

    const handleSubmit = async (reason: string) => {
        close();
        mixpanel.track("SURVEY Dismiss Paywall Survey <1.0>", { reason, longAnswer });
        dispatch(completeDismissPaywallSurvey());
        await submit({ reason, longAnswer });
    };

    const animationRef = useHandleLottiePlay(open);

    const setTextAndSubmit = (text: string) => () => {
        handleSubmit(text);
    };

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
                        <View>
                            <AppText
                                children={"Not interested?"}
                                fontSize={24}
                                style={{ fontFamily: "helveticaBold", textAlign: "center", color: "#FFFFFF", marginBottom: 5 }}
                            />
                            <AppText children={"Please share why"} fontSize={18} style={{ textAlign: "center", color: "#FFFFFF", opacity: 0.8 }} />
                        </View>

                        {!showLongForm && (
                            <Animated.View style={{ width: "100%" }} exiting={FadeOutLeft}>
                                <TouchableOpacity
                                    disabled={submitting}
                                    onPress={setTextAndSubmit("Too Expensive")}
                                    style={[styles.pressable, { borderTopLeftRadius: 20, borderTopRightRadius: 20 }]}>
                                    <AppText children={"Too Expensive"} fontSize={18} style={{ textAlign: "center", color: colors.softPurle }} />
                                </TouchableOpacity>
                                <TouchableOpacity disabled={submitting} onPress={setTextAndSubmit("I don't pay for apps")} style={styles.pressable}>
                                    <AppText
                                        children={"I don't pay for apps"}
                                        fontSize={18}
                                        style={{ textAlign: "center", color: colors.softPurle }}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity disabled={submitting} onPress={setTextAndSubmit("I need to try it first")} style={styles.pressable}>
                                    <AppText
                                        children={"I need to try it first"}
                                        fontSize={18}
                                        style={{ textAlign: "center", color: colors.softPurle }}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    disabled={submitting}
                                    onPress={setTextAndSubmit("I don't know what it is")}
                                    style={styles.pressable}>
                                    <AppText
                                        children={"I don't know what it is"}
                                        fontSize={18}
                                        style={{ textAlign: "center", color: colors.softPurle }}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setShowLongForm(true)}
                                    style={[styles.pressable, { borderBottomWidth: 1, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }]}>
                                    <AppText children={"Other"} fontSize={18} style={{ textAlign: "center", color: colors.softPurle }} />
                                </TouchableOpacity>
                            </Animated.View>
                        )}

                        {showLongForm && (
                            <Animated.View style={{ width: "100%", justifyContent: "space-evenly", flex: 1 }} entering={FadeInRight}>
                                <AppTextInput
                                    placeholder={"Your feedback :)"}
                                    textState={[longAnswer, setLongAnswer]}
                                    containerStyles={{
                                        backgroundColor: colors.clearGray,
                                        height: 150,
                                    }}
                                />
                                <AppButton
                                    onPress={() => handleSubmit(longAnswer)}
                                    pressableStyle={{ width: "100%" }}
                                    text={{ idle: "Submit" }}
                                    disabled={submitting}
                                    color={{ loading: colors.softPurle }}
                                    state={submitting ? "loading" : "idle"}
                                    style={{ backgroundColor: colors.softPurle }}
                                    textStyle={{ fontSize: 18, lineHeight: 18 }}
                                />
                            </Animated.View>
                        )}
                    </View>
                    <View style={styles.iconContainer}>
                        <LottieView source={QuestionMark} loop={false} ref={animationRef} style={{ width: ICON_HEIGHT }} />
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

export default DismissPaywallSurvey;
