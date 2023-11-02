import AppText from "@/components/AppText";
import OnboardingCompletionIcon from "@/components/Icons/OnboardingCompleteIcon";
import SteppedProgressBarAndIndicator, { OnboardingStep } from "@/components/SteppedProgressBarAndIndicator";
import { getUserFeedbackProgressPercentage, getWheelParams } from "@/functions/misc";
import { MENU_HIGH_DAMPENING, NAV_HEGIHT, colors } from "@/parameters";
import { useAppDispatch, useAppSelector } from "@/redux/reduxHooks";
import { open } from "@/redux/slices/addTreeModalSlice";
import { selectOnboarding, skipToStep } from "@/redux/slices/onboardingSlice";
import { selectUserFeedbackSlice } from "@/redux/slices/userFeedbackSlice";
import { selectUserId } from "@/redux/slices/userSlice";
import { selectAllTrees } from "@/redux/slices/userTreesSlice";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import analytics from "@react-native-firebase/analytics";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, router, usePathname, useRouter } from "expo-router";
import { Mixpanel } from "mixpanel-react-native";
import { Fragment, useEffect, useRef, useState } from "react";
import { Alert, Dimensions, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeInRight, FadeOut, FadeOutLeft, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { RoutesParams, routes } from "routes";

function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>["name"]; color: string; size?: number }) {
    return <FontAwesome size={props.size ?? 28} style={{ marginBottom: -3 }} {...props} />;
}

function usePassMixPanelUserId() {
    const userId = useAppSelector(selectUserId);

    useEffect(() => {
        if (userId !== "") mixpanel.identify(userId);

        //WHEN A USER LOGS OUT I'M SUPPOUSED TO CALL mixpanel.reset()
    }, [userId]);
}

const progressWheelProps = getWheelParams(colors.accent, colors.line, 45, 4);

const trackAutomaticEvents = true;
export const mixpanel = new Mixpanel("5a141ce3c43980d8fab68b96e1256525", trackAutomaticEvents);
mixpanel.init();

export default function RootLayout() {
    const onboarding = useAppSelector(selectOnboarding);
    usePassMixPanelUserId();

    const userFeedback = useAppSelector(selectUserFeedbackSlice);

    const { width, height } = Dimensions.get("window");

    const pathname = usePathname();
    const router = useRouter();

    const [loaded, error] = useFonts({
        helvetica: require("../../assets/Helvetica.ttf"),
        helveticaBold: require("../../assets/Helvetica-Bold.ttf"),
        emojisMono: require("../../assets/NotoEmoji-Regular.ttf"),
        ...FontAwesome.font,
    });

    const dispatch = useAppDispatch();

    const openAddTreeModal = () => dispatch(open());

    useEffect(() => {
        if (error) throw error;
    }, [error]);

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    const prevRouteName = useRef<string | null>(null);

    if (!loaded) return <Text>Loading...</Text>;

    const strokeDashoffset =
        progressWheelProps.circumference - (progressWheelProps.circumference * getUserFeedbackProgressPercentage(userFeedback)) / 100;

    return (
        <View style={{ flex: 1, minHeight: Platform.OS === "android" ? height - NAV_HEGIHT : "auto" }}>
            <Stack
                screenOptions={{ headerShown: false }}
                screenListeners={{
                    state: async (e) => {
                        //@ts-ignore
                        const currentRouteName = e.data.state.routes[e.data.state.routes.length - 1].name as string;

                        if (prevRouteName.current !== currentRouteName) {
                            await analytics().logScreenView({
                                screen_name: currentRouteName,
                                screen_class: currentRouteName,
                            });

                            await mixpanel.track(`Navigate to ${currentRouteName}`);
                        }

                        prevRouteName.current = currentRouteName;
                    },
                }}>
                <Stack.Screen
                    name={routes.home.name}
                    options={{
                        title: "Home",
                    }}
                />
                <Stack.Screen
                    name={routes.myTrees.name}
                    options={{
                        title: "My Trees",
                    }}
                />
                <Stack.Screen
                    name={routes.feedback.name}
                    options={{
                        title: "Feedback (NEW)",
                    }}
                />
                <Stack.Screen name={routes.myTrees_treeId.name} />
                <Stack.Screen name={routes.myTrees_skillId.name} />
                <Stack.Screen name={"index"} />
            </Stack>

            {/* {!onboarding.complete && <Onboarding />} */}

            {!pathname.includes("welcomeScreen") && (
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "padding"}
                    enabled={false}
                    style={{ backgroundColor: colors.darkGray, height: NAV_HEGIHT, width, flexDirection: "row" }}>
                    <Pressable
                        style={{ width: width / 3, flex: 1, justifyContent: "center", alignItems: "center", gap: 6 }}
                        onPress={() => router.replace("/home")}>
                        <TabBarIcon name="home" color={pathname.includes("home") ? colors.accent : colors.unmarkedText} />
                        <AppText style={{ color: pathname.includes("home") ? colors.accent : colors.unmarkedText }} fontSize={12}>
                            Home
                        </AppText>
                    </Pressable>
                    <Pressable
                        style={{ width: width / 3, flex: 1, justifyContent: "center", alignItems: "center", gap: 6 }}
                        onPress={() => router.replace("/(app)/myTrees")}>
                        <TabBarIcon name="tree" color={pathname.includes("myTrees") ? colors.accent : colors.unmarkedText} />
                        <AppText style={{ color: pathname.includes("myTrees") ? colors.accent : colors.unmarkedText }} fontSize={12}>
                            My Trees
                        </AppText>
                    </Pressable>
                    <Pressable
                        style={{ width: width / 3, flex: 1, justifyContent: "center", alignItems: "center", gap: 6, position: "relative" }}
                        onPress={() => router.replace("/(app)/feedback")}>
                        <TabBarIcon name="group" color={pathname.includes("feedback") ? colors.accent : colors.unmarkedText} />
                        <AppText style={{ color: pathname.includes("feedback") ? colors.accent : colors.unmarkedText }} fontSize={12}>
                            Community
                        </AppText>
                    </Pressable>
                </KeyboardAvoidingView>
            )}
        </View>
    );
}

const { height, width } = Dimensions.get("window");
const DIMENSIONS = { closed: { width: 45, height: 45 }, open: { width, height: 150 } };
const CLOSED_POSITION = { left: 10, bottom: NAV_HEGIHT + 10 };

const Onboarding = () => {
    const { currentStep } = useAppSelector(selectOnboarding);
    const userTrees = useAppSelector(selectAllTrees);
    const dispatch = useAppDispatch();

    const [open, setOpen] = useState(false);

    const style = StyleSheet.create({
        container: {
            width: DIMENSIONS.closed.width,
            height: DIMENSIONS.closed.height,
            backgroundColor: colors.darkGray,
            position: "absolute",
            paddingHorizontal: 10,
            paddingTop: 5,
            overflow: "hidden",
        },
        buttonsContainer: { flexDirection: "row", justifyContent: "space-between" },
    });

    const animatedContainerStyle = useAnimatedStyle(() => {
        return {
            bottom: withSpring(open ? height - DIMENSIONS.open.height : CLOSED_POSITION.bottom, { duration: 1000, dampingRatio: 0.9 }),
            left: withSpring(open ? 0 : CLOSED_POSITION.left, { duration: 1000, dampingRatio: 0.9 }),
            width: withSpring(open ? DIMENSIONS.open.width : DIMENSIONS.closed.width, { duration: 1000, dampingRatio: 0.9 }),
            height: withSpring(open ? DIMENSIONS.open.height : DIMENSIONS.closed.height, { duration: 1000, dampingRatio: 0.9 }),
            borderRadius: withSpring(open ? 20 : DIMENSIONS.closed.width, { duration: 1000, dampingRatio: 0.9 }),
        };
    });

    const openCreateNewTree = () => {
        //@ts-ignore
        router.push({ pathname: "/myTrees", params: { openNewTreeModal: true } });
    };

    const closeOnboardingMenu = () => setOpen(false);

    const handleOnboardingAction = (action: () => void) => () => {
        closeOnboardingMenu();
        setTimeout(action, 200);
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
            text: "What do you want to learn?",
            actionButtonText: "Create my first Skill Tree",
            iconName: "tree",
            onActionButtonPress: handleOnboardingAction(openCreateNewTree),
        },
        {
            text: "What's the first Skill you want to master?",
            actionButtonText: "Add my first Skill",
            iconName: "star",
            onActionButtonPress: handleOnboardingAction(openAddSkillModal),
        },
        {
            text: "Don't lose your past achievements",
            skippeable: true,
            actionButtonText: "Add them as Skill Trees",
            iconName: "trophy",
            onActionButtonPress: handleOnboardingAction(openCreateNewTree),
        },
        {
            text: "Keep your progress secured",
            actionButtonText: "Log in to backup",
            iconName: "shield",
            onActionButtonPress: () => Alert.alert("Log in to back up"),
        },
    ];

    return (
        <Animated.View style={[style.container, animatedContainerStyle]}>
            {open && (
                <Animated.View exiting={FadeOut} entering={FadeIn}>
                    <SteppedProgressBarAndIndicator currentStep={currentStep} steps={ONBOARDING_STEPS} />
                    <View style={{ position: "absolute", right: 0, top: 23 }}>
                        <OnboardingCompletionIcon />
                    </View>
                </Animated.View>
            )}

            <CurrentText steps={ONBOARDING_STEPS} currentStepIdx={currentStep} open={open} />

            {open && (
                <Animated.View style={style.buttonsContainer} exiting={FadeOut} entering={FadeIn}>
                    <View>
                        {ONBOARDING_STEPS[currentStep].skippeable && (
                            <Pressable style={{ height: 45, justifyContent: "center" }} onPress={() => dispatch(skipToStep(currentStep + 1))}>
                                <AppText
                                    fontSize={12}
                                    children={"Skip"}
                                    style={{
                                        paddingHorizontal: 15,
                                        height: 34,
                                        borderRadius: 10,
                                        marginRight: 5,
                                        color: "#E6E8E6",
                                        verticalAlign: "middle",
                                    }}
                                />
                            </Pressable>
                        )}
                    </View>
                    <View style={{ flexDirection: "row" }}>
                        <Pressable style={{ height: 45, justifyContent: "center" }} onPress={closeOnboardingMenu}>
                            <AppText
                                fontSize={12}
                                children={"Dismiss"}
                                style={{
                                    paddingHorizontal: 15,
                                    height: 34,
                                    borderRadius: 10,
                                    marginRight: 5,
                                    color: "#E6E8E6",
                                    textAlign: "center",
                                    verticalAlign: "middle",
                                }}
                            />
                        </Pressable>

                        <Pressable style={{ height: 45, justifyContent: "center" }} onPress={ONBOARDING_STEPS[currentStep].onActionButtonPress}>
                            <AppText
                                fontSize={12}
                                children={ONBOARDING_STEPS[currentStep].actionButtonText}
                                style={{
                                    paddingHorizontal: 15,
                                    height: 34,
                                    backgroundColor: colors.accent,
                                    borderRadius: 10,
                                    color: "#E6E8E6",
                                    textAlign: "center",
                                    verticalAlign: "middle",
                                }}
                            />
                        </Pressable>
                    </View>
                </Animated.View>
            )}

            {!open && <Pressable onPressIn={() => setOpen(true)} style={{ width: 45, height: 45, position: "absolute" }} />}
        </Animated.View>
    );
};

const CurrentText = ({ steps, currentStepIdx, open }: { steps: OnboardingStep[]; currentStepIdx: number; open: boolean }) => {
    const style = StyleSheet.create({
        container: { height: 55, justifyContent: "center" },
        textContainer: { flexDirection: "row", alignItems: "center", gap: 10 },
        text: { color: "#E6E8E6", marginTop: 6 },
    });

    const animatedIconStyle = useAnimatedStyle(() => {
        const fooIcon = getIconSpacing(currentStepIdx);
        return {
            top: withSpring(open ? 0 : fooIcon.top),
            left: withSpring(open ? 0 : fooIcon.left, MENU_HIGH_DAMPENING),
        };
    });

    return (
        <View style={style.container} pointerEvents={"none"}>
            {steps.map((step, idx) => {
                if (idx !== currentStepIdx) return <Fragment key={idx} />;

                return (
                    <Animated.View
                        pointerEvents={"none"}
                        key={idx}
                        style={[style.textContainer, animatedIconStyle]}
                        entering={FadeInRight}
                        exiting={FadeOutLeft}>
                        <TabBarIcon color={open ? "#E6E8E6" : colors.accent} name={step.iconName} size={16} />
                        {open && (
                            <Animated.View exiting={FadeOut}>
                                <AppText children={step.text} fontSize={16} style={style.text} />
                            </Animated.View>
                        )}
                    </Animated.View>
                );
            })}
        </View>
    );
};

function getIconSpacing(currentIdx: number): { left: number; top: number } {
    "worklet";

    switch (currentIdx) {
        case 0:
            return { left: 6, top: -12 };
        case 3:
            return { left: 7, top: -11 };
        default:
            return { left: 5, top: -12 };
    }
}
