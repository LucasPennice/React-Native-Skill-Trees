import OnboardingAddSkill from "@/../assets/lotties/onboardingAddSkills.json";
import OnboardingCreateTree from "@/../assets/lotties/onboardingCreateTree.json";
import OnboardingCustomizeHomeTree from "@/../assets/lotties/onboardingCustomizeHomeTree.json";
import { colors } from "@/parameters";
import { mixpanel } from "app/_layout";
import { router } from "expo-router";
import LottieView from "lottie-react-native";
import { memo, useEffect } from "react";
import { Alert, Modal, Pressable, StyleSheet, View } from "react-native";
import Animated, { Easing, FadeInDown, ZoomOut } from "react-native-reanimated";
import AppButton from "./components/AppButton";
import AppText from "./components/AppText";
import { useAppSelector } from "./redux/reduxHooks";
import { selectAllTrees } from "./redux/slices/userTreesSlice";
import { selectUserVariables } from "./redux/slices/userVariablesSlice";
import { useHandleLottiePlay } from "./useHandleLottiePlay";
import { RoutesParams } from "routes";
import { useAuth } from "@clerk/clerk-expo";

type OnboardingStep = {
    title: string;
    subtitle: string;
    onActionButtonPress: () => void;
    optional?: true;
};

const MODAL_HEIGHT = 500;
const ICON_HEIGHT = 90;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#00000080" },
    opaqueZone: { flex: 1 },
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
});

function OnboardingModal({ open, close, openPostOnboardingModal }: { open: boolean; close: () => void; openPostOnboardingModal: () => void }) {
    const animationRef = useHandleLottiePlay(open);

    const resetAnimation = () => animationRef?.current?.play();

    const { onboardingStep } = useAppSelector(selectUserVariables);
    const { isSignedIn } = useAuth();

    const userTrees = useAppSelector(selectAllTrees);

    const openCreateNewTree = () => {
        //@ts-ignore
        router.push({ pathname: "/myTrees", params: { openNewTreeModal: true } });
    };

    const handleOnboardingAction = (action: () => void) => () => {
        close();
        action();
    };

    const openAddSkillModal = () => {
        if (userTrees.length === 0) return Alert.alert("You should at least have one user tree");

        const firstUserTree = userTrees[0];

        router.push({ pathname: `/myTrees/${firstUserTree.treeId}` });
    };

    const openCanvasSettingsModal = () => {
        const params: RoutesParams["home"] = { openEditCanvasSettings: "true" };
        router.push({ pathname: "/(app)/home", params });
    };

    const ONBOARDING_STEPS: OnboardingStep[] = [
        {
            title: "Create your first Skill Tree",
            subtitle: "The Skill Trees you create will also show up on the home tree with their color",
            onActionButtonPress: handleOnboardingAction(openCreateNewTree),
        },
        {
            title: "Add Skills to your Tree",
            subtitle: "Long press any skill to open the add menu. You can add many skills at once",
            onActionButtonPress: handleOnboardingAction(openAddSkillModal),
        },
        {
            title: "Customize your Home Tree",
            subtitle: "Tap the settings icon to customize a tree's appearance",
            onActionButtonPress: handleOnboardingAction(openCanvasSettingsModal),
        },
        {
            title: "Sign in to Skill Trees",
            subtitle: "To back up your progress. Click outside this message to close",
            //THE BUTTON DOESN'T SHOW FOR THIS ONBOARDING STEP
            onActionButtonPress: () => {},
            optional: true,
        },
    ];

    const currentOnboardingData = ONBOARDING_STEPS[onboardingStep];

    useEffect(() => {
        if (isSignedIn === null) return;
        if (open !== true) return;
        if (isSignedIn === true) return close();

        mixpanel.track(`ONBOARDING Step ${onboardingStep + 1} Viewed <1.0>`, {
            title: currentOnboardingData.title,
            subtitle: currentOnboardingData.subtitle,
        });
    }, [isSignedIn, open, onboardingStep]);

    const getLottieAnimation = () => {
        switch (onboardingStep) {
            case 0:
                return OnboardingCreateTree;
            case 1:
                return OnboardingAddSkill;
            case 2:
                return OnboardingCustomizeHomeTree;
            default:
                return OnboardingAddSkill;
        }
    };

    const navigateToSignIn = () => {
        close();
        router.push("/(app)/auth/signIn");
    };
    const navigateToSignUp = () => {
        close();
        router.push("/(app)/auth/signUp");
    };

    const ignoreAndOpenPostOnboardingModal = () => close();

    return (
        <Modal animationType="fade" transparent={true} visible={open} onRequestClose={close} presentationStyle={"overFullScreen"}>
            <View style={styles.container}>
                <Pressable style={styles.opaqueZone} onPress={currentOnboardingData.optional ? ignoreAndOpenPostOnboardingModal : undefined} />
                <Animated.View
                    style={styles.alertContainer}
                    exiting={ZoomOut.easing(Easing.bezierFn(0.83, 0, 0.17, 1))}
                    entering={FadeInDown.withInitialValues({ transform: [{ translateY: MODAL_HEIGHT }] })
                        .duration(800)
                        .easing(Easing.bezierFn(0.83, 0, 0.17, 1))}>
                    <View style={styles.alertContentContainer}>
                        <AppText children={currentOnboardingData.title} fontSize={24} style={{ fontFamily: "helveticaBold", textAlign: "center" }} />
                        <AppText
                            children={currentOnboardingData.subtitle}
                            fontSize={18}
                            style={{ textAlign: "center", color: "#FFFFFF", opacity: 0.8 }}
                        />

                        {onboardingStep !== 3 && (
                            <>
                                <Pressable onPress={resetAnimation}>
                                    <LottieView
                                        source={getLottieAnimation()}
                                        loop={false}
                                        ref={animationRef}
                                        style={{ width: "100%", maxWidth: 350 }}
                                    />
                                </Pressable>
                                <AppButton
                                    onPress={currentOnboardingData.onActionButtonPress}
                                    pressableStyle={{ width: "100%" }}
                                    text={{ idle: "Continue" }}
                                    color={{ loading: colors.accent }}
                                    style={{ backgroundColor: colors.accent }}
                                    textStyle={{ fontSize: 18, lineHeight: 18 }}
                                />
                            </>
                        )}

                        {onboardingStep === 3 && (
                            <>
                                <View style={{ height: 250, justifyContent: "flex-end", marginTop: 10, gap: 15, width: "100%" }}>
                                    <AppButton
                                        onPress={navigateToSignUp}
                                        pressableStyle={{ width: "100%" }}
                                        text={{ idle: "Create account" }}
                                        color={{ loading: colors.accent }}
                                        style={{ backgroundColor: colors.accent, height: 50 }}
                                        textStyle={{ fontSize: 18, lineHeight: 18 }}
                                    />
                                    <AppButton
                                        onPress={navigateToSignIn}
                                        pressableStyle={{ width: "100%" }}
                                        text={{ idle: "I have an account" }}
                                        color={{ idle: colors.line }}
                                        style={{ backgroundColor: colors.line, height: 50 }}
                                        textStyle={{ fontSize: 18, lineHeight: 18 }}
                                    />
                                </View>
                            </>
                        )}
                    </View>
                    <View style={styles.iconContainer}>
                        <AppText children={onboardingStep + 1} fontSize={50} style={{ paddingTop: 5 }} />
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

export default memo(OnboardingModal);
