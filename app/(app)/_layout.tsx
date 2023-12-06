import AppText from "@/components/AppText";
import ChevronLeft from "@/components/Icons/ChevronLeft";
import OnboardingCompletionIcon from "@/components/Icons/OnboardingCompleteIcon";
import SteppedProgressBarAndIndicator, { OnboardingStep } from "@/components/SteppedProgressBarAndIndicator";
import { MENU_HIGH_DAMPENING, NAV_HEGIHT, colors } from "@/parameters";
import { useAppDispatch, useAppSelector } from "@/redux/reduxHooks";
import { closeOnboardingMenu, expandOnboardingMenu, selectOnboarding, skipToStep } from "@/redux/slices/onboardingSlice";
import { selectSyncSlice } from "@/redux/slices/syncSlice";
import { selectAllTrees } from "@/redux/slices/userTreesSlice";
import useHandleDeepLinking from "@/useHandleDeepLinking";
import useMongoCompliantUserId from "@/useMongoCompliantUserId";
import useRunDailyBackup from "@/useRunDailyBackup";
import useSubscriptionHandler from "@/useSubscriptionHandler";
import useTrackNavigationEvents from "@/useTrackNavigationEvents";
import { useUser } from "@clerk/clerk-expo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { mixpanel } from "app/_layout";
import { useFonts } from "expo-font";
import * as Linking from "expo-linking";
import { SplashScreen, Stack, router, usePathname, useRouter } from "expo-router";
import { Fragment, useEffect } from "react";
import { Alert, Dimensions, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeInRight, FadeOut, FadeOutLeft, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { RoutesParams, routesToHideNavBar, routes } from "routes";

function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>["name"]; color: string; size?: number }) {
    return <FontAwesome size={props.size ?? 24} style={{ marginBottom: -3 }} {...props} />;
}

function useIdentifyMixPanelUserId() {
    const userId = useMongoCompliantUserId();

    useEffect(() => {
        if (userId !== null) mixpanel.identify(userId);
    }, [userId]);
}

const useRedirectOnNavigation = (readyToRedirect: boolean, redirectToWelcomeScreen: boolean, redirectToPaywall: boolean) => {
    useEffect(() => {
        if (!readyToRedirect) return;
        if (redirectToWelcomeScreen) return router.push("/welcomeScreen");
        if (redirectToPaywall) return router.push("/(app)/paywall");
        // if (process.env.NODE_ENV === "production" && redirectToWelcomeScreen) return router.push("/welcomeScreen");
    }, [redirectToWelcomeScreen, readyToRedirect]);
};

export default function RootLayout() {
    const deepLinkOpenedApp = Linking.useURL() !== null;

    useIdentifyMixPanelUserId();
    const onboarding = useAppSelector(selectOnboarding);
    const { shouldWaitForClerkToLoad } = useAppSelector(selectSyncSlice);
    const { isSignedIn, isLoaded } = useUser();
    useRunDailyBackup(isSignedIn);
    const isClerkLoaded = deepLinkOpenedApp ? isLoaded : shouldWaitForClerkToLoad === false ? true : isLoaded;

    const { isProUser, onFreeTrial } = useSubscriptionHandler();

    const { width, height } = Dimensions.get("window");

    const pathname = usePathname();
    const router = useRouter();

    const [fontsLoaded, error] = useFonts({
        helvetica: require("../../assets/Helvetica.ttf"),
        helveticaBold: require("../../assets/Helvetica-Bold.ttf"),
        emojisMono: require("../../assets/NotoEmoji-Regular.ttf"),
        ...FontAwesome.font,
    });

    useEffect(() => {
        if (error) throw error;
    }, [error]);

    useEffect(() => {
        if (fontsLoaded && isClerkLoaded) SplashScreen.hideAsync();
    }, [fontsLoaded, isClerkLoaded]);

    const trackScreenNavigation = useTrackNavigationEvents();

    const readyToRedirect = !(!fontsLoaded || !isClerkLoaded);

    const redirectToWelcomeScreen = isLoaded && !isSignedIn;
    const redirectToPaywall = isLoaded && isSignedIn && !isProUser && !onFreeTrial;

    useRedirectOnNavigation(readyToRedirect, redirectToWelcomeScreen, redirectToPaywall);

    const shouldHandleDeepLink = isLoaded && (Boolean(isProUser) || onFreeTrial);

    useHandleDeepLinking(shouldHandleDeepLink);

    // const dispatch = useAppDispatch();
    // useEffect(() => {
    //     const getUserBackup = () => axiosClient.get<UserBackup>(`backup/757365725f32595a47524158`);

    //     const batchUpdateUserStore = (userBackup: UserBackup) => {
    //         // should only result in one combined re-render, not four
    //         batch(() => {
    //             dispatch(overwriteOnboardingSlice(userBackup.onboarding));
    //             dispatch(overwriteHomeTreeSlice(userBackup.homeTree));
    //             dispatch(overwriteUserTreesSlice(userBackup.userTreesSlice));
    //             dispatch(overwriteNodeSlice(userBackup.nodeSlice));
    //         });
    //     };

    //     (async () => {
    //         const { data: userBackup } = await getUserBackup();
    //         batchUpdateUserStore(userBackup);
    //     })();
    // }, []);

    if (!fontsLoaded || !isClerkLoaded) return <Text>Loading...</Text>;

    const hide = !Boolean(pathname === "/" || routesToHideNavBar.find((route) => pathname.includes(route)));

    return (
        <View style={{ flex: 1, minHeight: Platform.OS === "android" ? height - NAV_HEGIHT : "auto" }}>
            <Stack
                screenOptions={{
                    headerShown: false,
                    header: ({ navigation, options, route, back }) => {
                        return (
                            <View
                                style={{
                                    height: 45,
                                    backgroundColor: colors.darkGray,
                                    alignItems: "center",
                                    position: "relative",
                                    justifyContent: "center",
                                }}>
                                <TouchableOpacity
                                    onPress={navigation.goBack}
                                    style={{ position: "absolute", left: 0, flexDirection: "row", alignItems: "center", height: 45, width: 100 }}>
                                    <ChevronLeft height={30} width={30} color={colors.accent} />
                                </TouchableOpacity>

                                <AppText fontSize={16} children={options.title} style={{ textTransform: "capitalize" }} />
                            </View>
                        );
                    },
                }}
                screenListeners={trackScreenNavigation}>
                <Stack.Screen
                    name={routes.illustrationCredits.name}
                    options={{
                        title: "Illustration Credits",
                        headerShown: true,
                    }}
                />
                <Stack.Screen
                    name={routes.backup.name}
                    options={{
                        title: "Backup",
                        headerShown: true,
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

            {/* {hide && !onboarding.complete && <Onboarding />} */}

            {hide && (
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "padding"}
                    enabled={false}
                    style={{ backgroundColor: colors.darkGray, height: NAV_HEGIHT, width, flexDirection: "row" }}>
                    <Pressable
                        style={{ width: width / 4, flex: 1, justifyContent: "center", alignItems: "center", gap: 6 }}
                        onPress={() => router.replace("/home")}>
                        <TabBarIcon name="home" color={pathname.includes("home") ? colors.accent : colors.unmarkedText} />
                        <AppText style={{ color: pathname.includes("home") ? colors.accent : colors.unmarkedText }} fontSize={12}>
                            Home
                        </AppText>
                    </Pressable>
                    <Pressable
                        style={{ width: width / 4, flex: 1, justifyContent: "center", alignItems: "center", gap: 6 }}
                        onPress={() => router.replace("/(app)/myTrees")}>
                        <TabBarIcon name="tree" color={pathname.includes("myTrees") ? colors.accent : colors.unmarkedText} />
                        <AppText style={{ color: pathname.includes("myTrees") ? colors.accent : colors.unmarkedText }} fontSize={12}>
                            My Trees
                        </AppText>
                    </Pressable>
                    {/* <Pressable
                        style={{ width: width / 4, flex: 1, justifyContent: "center", alignItems: "center", gap: 6, position: "relative" }}
                        onPress={() => router.replace("/(app)/userProgress")}>
                        <TabBarIcon name="check-circle" color={pathname.includes("userProgress") ? colors.accent : colors.unmarkedText} />
                        <AppText style={{ color: pathname.includes("userProgress") ? colors.accent : colors.unmarkedText }} fontSize={12}>
                            Habits
                        </AppText>
                    </Pressable> */}
                    <Pressable
                        style={{ width: width / 4, flex: 1, justifyContent: "center", alignItems: "center", gap: 6, position: "relative" }}
                        onPress={() => router.replace("/(app)/feedback")}>
                        <TabBarIcon name="group" color={pathname.includes("feedback") ? colors.accent : colors.unmarkedText} />
                        <AppText style={{ color: pathname.includes("feedback") ? colors.accent : colors.unmarkedText }} fontSize={12}>
                            Community
                        </AppText>
                    </Pressable>
                    <Pressable
                        style={{ width: width / 4, flex: 1, justifyContent: "center", alignItems: "center", gap: 6, position: "relative" }}
                        onPress={() => router.replace("/(app)/userProfile")}>
                        <TabBarIcon name="user" color={pathname.includes("userProfile") ? colors.accent : colors.unmarkedText} />
                        <AppText style={{ color: pathname.includes("userProfile") ? colors.accent : colors.unmarkedText }} fontSize={12}>
                            Profile
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
    const { currentStep, open } = useAppSelector(selectOnboarding);
    const userTrees = useAppSelector(selectAllTrees);
    const dispatch = useAppDispatch();

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

    const closeMenu = () => dispatch(closeOnboardingMenu());

    const handleOnboardingAction = (action: () => void) => () => {
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
                        <Pressable style={{ height: 45, justifyContent: "center" }} onPress={closeMenu}>
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

            {!open && <Pressable onPressIn={() => dispatch(expandOnboardingMenu())} style={{ width: 45, height: 45, position: "absolute" }} />}
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
