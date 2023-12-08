import OnboardingCreateTree from "@/../assets/lotties/onboardingCreateTree.json";
import { colors } from "@/parameters";
import LottieView from "lottie-react-native";
import { Alert, Modal, Pressable, StyleSheet, View } from "react-native";
import Animated, { Easing, FadeInDown, ZoomOut } from "react-native-reanimated";
import { RoutesParams } from "routes";
import AppButton from "./components/AppButton";
import AppText from "./components/AppText";
import { OnboardingStep } from "./components/SteppedProgressBarAndIndicator";
import { useAppSelector } from "./redux/reduxHooks";
import { selectAllTrees } from "./redux/slices/userTreesSlice";
import { useHandleLottiePlay } from "./useHandleLottiePlay";
import { router } from "expo-router";
import { useEffect } from "react";
import { mixpanel } from "app/_layout";
import { selectOnboarding } from "./redux/slices/onboardingSlice";

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
        backgroundColor: "#2A2D2F",
        position: "absolute",
        justifyContent: "center",
        alignItems: "center",
        top: 0,
    },
});

function OnboardingModal({ open, close }: { open: boolean; close: () => void }) {
    const animationRef = useHandleLottiePlay(open);

    const resetAnimation = () => animationRef?.current?.play();

    const { currentStep } = useAppSelector(selectOnboarding);

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

        const params: RoutesParams["myTrees_treeId"] = {
            nodeId: firstUserTree.rootNodeId,
            treeId: firstUserTree.treeId,
            addNewNodePosition: "CHILDREN",
        };
        //@ts-ignore
        router.push({ pathname: `/myTrees/${firstUserTree.treeId}`, params });
    };

    const ONBOARDING_STEPS: OnboardingStep[] = [
        {
            title: "Create your first Skill Tree",
            subtitle: "The Skill Trees you create will also show up on the home tree with their color",
            onActionButtonPress: handleOnboardingAction(openCreateNewTree),
        },
        {
            title: "Add Skills to your Tree",
            subtitle: "Add my first Skill",
            onActionButtonPress: handleOnboardingAction(openAddSkillModal),
        },
        {
            title: "Keep your progress secured",
            subtitle: "Log in to backup",
            onActionButtonPress: () => Alert.alert("Log in to back up"),
        },
    ];

    const currentOnboardingData = ONBOARDING_STEPS[currentStep];

    useEffect(() => {
        if (open !== true) return;

        mixpanel.track(`onboarding step ${currentStep} (Create tree) viewed v1.0`, {
            title: currentOnboardingData.title,
            subtitle: currentOnboardingData.subtitle,
        });
    }, [open, currentStep]);

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
                        <AppText children={currentOnboardingData.title} fontSize={24} style={{ fontFamily: "helveticaBold", textAlign: "center" }} />
                        <AppText
                            children={currentOnboardingData.subtitle}
                            fontSize={18}
                            style={{ textAlign: "center", color: "#FFFFFF", opacity: 0.8 }}
                        />

                        <Pressable onPress={resetAnimation}>
                            <LottieView source={OnboardingCreateTree} loop={false} ref={animationRef} style={{ width: "100%", maxWidth: 350 }} />
                        </Pressable>

                        <AppButton
                            onPress={currentOnboardingData.onActionButtonPress}
                            pressableStyle={{ width: "100%" }}
                            text={{ idle: "Continue" }}
                            color={{ loading: "#B863E3" }}
                            style={{ backgroundColor: "#B863E3" }}
                            textStyle={{ fontSize: 18, lineHeight: 18 }}
                        />
                    </View>
                    <View style={styles.iconContainer}>
                        <AppText children={currentStep + 1} fontSize={50} style={{ paddingTop: 5 }} />
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

export default OnboardingModal;
