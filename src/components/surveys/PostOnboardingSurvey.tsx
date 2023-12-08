import QuestionMark from "@/../assets/lotties/questionMark.json";
import { colors } from "@/parameters";
import { useFormspark } from "@formspark/use-formspark";
import { mixpanel } from "app/_layout";
import LottieView from "lottie-react-native";
import { useEffect, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import Animated, { Easing, FadeInDown, ZoomOut } from "react-native-reanimated";
import AppButton from "../AppButton";
import AppText from "../AppText";
import AppTextInput from "../AppTextInput";

const MODAL_HEIGHT = 450;
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
        backgroundColor: "#2A2D2F",
        position: "absolute",
        justifyContent: "center",
        alignItems: "center",
        top: 0,
    },
});

const useHandlePlay = (open: boolean) => {
    const animation = useRef<LottieView>(null);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        if (open) {
            timeoutId = setTimeout(() => {
                animation.current?.reset();
                animation.current?.play();
            }, 1000);
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

function PostOnboardingSurvey({ open, close }: { open: boolean; close: () => void }) {
    const [text, setText] = useState("");

    const [submit, submitting] = useFormspark({ formId: "FNSfOzfj6" });

    const handleSubmit = async () => {
        await submit({ experienceAfterOnboarding: text });
        mixpanel.track("postOnboardingSurvey v1.0", { experienceAfterOnboarding: text });
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
                        <AppText
                            children={"How it's your experience going so far?"}
                            fontSize={24}
                            style={{ fontFamily: "helveticaBold", textAlign: "center", color: "#FFFFFF" }}
                        />
                        <AppTextInput
                            placeholder={"Your feedback :)"}
                            textState={[text, setText]}
                            containerStyles={{
                                backgroundColor: "#2A2D2F",
                                height: 150,
                            }}
                        />

                        <AppButton
                            onPress={handleSubmit}
                            pressableStyle={{ width: "100%" }}
                            text={{ idle: "Submit" }}
                            disabled={text === ""}
                            color={{ loading: "#B863E3" }}
                            state={submitting ? "loading" : "idle"}
                            style={{ backgroundColor: "#B863E3" }}
                            textStyle={{ fontSize: 18, lineHeight: 18 }}
                        />
                    </View>
                    <View style={styles.iconContainer}>
                        <LottieView source={QuestionMark} loop={false} ref={animationRef} style={{ width: ICON_HEIGHT }} />
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

export default PostOnboardingSurvey;
