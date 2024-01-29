import OnboardingModal from "@/OnboardingModal";
import AppText from "@/components/AppText";
import ChevronLeft from "@/components/Icons/ChevronLeft";
import WhatsNewModal from "@/components/WhatsNewModal";
import DismissPaywallSurvey from "@/components/surveys/DismissPaywallSurvey";
import MarketFitSurvey from "@/components/surveys/MarketFitSurvey";
import PostOnboardingSurvey from "@/components/surveys/PostOnboardingSurvey";
import { NAV_HEGIHT, colors, dayInMilliseconds } from "@/parameters";
import { useAppDispatch, useAppSelector } from "@/redux/reduxHooks";
import { selectTotalTreeQty } from "@/redux/slices/userTreesSlice";
import { LAST_ONBOARDING_STEP, completeOnboardingExperienceSurvey, selectUserVariables } from "@/redux/slices/userVariablesSlice";
import useHandleDeepLinking from "@/useHandleDeepLinking";
import useMongoCompliantUserId from "@/useMongoCompliantUserId";
import useRunDailyBackup from "@/useRunDailyBackup";
import useSubscriptionHandler from "@/useSubscriptionHandler";
import useTrackNavigationEvents from "@/useTrackNavigationEvents";
import { useAuth, useUser } from "@clerk/clerk-expo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { SubscriptionContext, mixpanel } from "app/_layout";
import { useFonts } from "expo-font";
import * as Linking from "expo-linking";
import { SplashScreen, Stack, router, usePathname, useRouter } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";
import { Dimensions, KeyboardAvoidingView, Platform, Pressable, Text, TouchableOpacity, View } from "react-native";
import { routes, routesToHideNavBar } from "routes";
import { whatsNewDataArray } from "whatsNewData";

const { width, height } = Dimensions.get("window");

function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>["name"]; color: string; size?: number }) {
    return <FontAwesome size={props.size ?? 24} style={{ marginBottom: -3 }} {...props} />;
}

function useIdentifyMixPanelUserId() {
    const userId = useMongoCompliantUserId();
    const { user } = useUser();
    const { isProUser } = useSubscriptionHandler();

    useEffect(() => {
        if (userId !== null) mixpanel.identify(userId);

        if (user === null || user === undefined) return;
        if (isProUser === null) return;

        mixpanel.registerSuperProperties({ emailAddress: user.primaryEmailAddress?.emailAddress, username: user.username, isProUser });
    }, [userId, user]);
}

const useHandleSurveyModals = () => {
    const [postOnboarding, setPostOnboarding] = useState(false);
    const [marketFit, setMarketFit] = useState(false);
    const [paywallDismiss, setPaywallDismiss] = useState(false);

    const dispatch = useAppDispatch();

    const openPostOnboardingModal = () => setPostOnboarding(true);
    const closePostOnboardingModal = () => {
        setPostOnboarding(false);
        dispatch(completeOnboardingExperienceSurvey());
    };

    const openMarketFitModal = () => setMarketFit(true);
    const closeMarketFitModal = () => setMarketFit(false);

    const openPaywallDismissModal = () => setPaywallDismiss(true);
    const closePaywallDismissModal = () => setPaywallDismiss(false);

    return {
        postOnboarding: {
            state: postOnboarding,
            open: openPostOnboardingModal,
            close: closePostOnboardingModal,
        },
        marketFit: {
            state: marketFit,
            open: openMarketFitModal,
            close: closeMarketFitModal,
        },
        paywallDismiss: {
            state: paywallDismiss,
            open: openPaywallDismissModal,
            close: closePaywallDismissModal,
        },
    };
};

// const getOnTrial = (customerInfo: CustomerInfo | null) => {
//     if (!customerInfo) return false;
//     if (!customerInfo.entitlements) return false;
//     if (!customerInfo.entitlements.active["Pro"]) return false;
//     if (customerInfo.entitlements.active["Pro"].periodType !== "TRIAL") return false;
//     return true;
// };

// const getTrialCompletion = (trial: boolean, customerInfo: CustomerInfo | null) => {
//     if (!trial) return 0;
//     if (!customerInfo) return 0;
//     if (!customerInfo.entitlements) return 0;
//     if (!customerInfo.entitlements.active["Pro"]) return 0;
//     if (
//         !customerInfo.entitlements.active["Pro"].originalPurchaseDateMillis ||
//         !customerInfo.entitlements.active["Pro"].expirationDateMillis ||
//         !customerInfo.entitlements.active["Pro"].originalPurchaseDateMillis
//     )
//         return 0;

//     const timeSinceTrialStarted = new Date().getTime() - customerInfo.entitlements.active["Pro"].originalPurchaseDateMillis;
//     const trialDuration =
//         customerInfo.entitlements.active["Pro"].expirationDateMillis - customerInfo.entitlements.active["Pro"].originalPurchaseDateMillis;
//     const trialCompletion = trialDuration === 0 ? 0 : timeSinceTrialStarted / trialDuration;

//     return trialCompletion;
// };

const DAYS_INTERVAL_TO_SHOW_PAYWALL = 3;
//This means at 85% of the trial or more
// const NOTIFY_TRIAL_THRESHOLD = 0.85;

const useRedirectOnAppFocus = (
    readyToRedirect: boolean,
    openWhatsNewModal: () => void,
    openMarketFitModal: () => void,
    openOnboardingModal: () => void
) => {
    const userVariables = useAppSelector(selectUserVariables);
    const {
        onboardingStep,
        appNumberWhenFinishedOnboarding,
        nthAppOpen,
        lastPaywallShowDate,
        whatsNewLatestVersionShown,
        marketFitSurvey,
        appOpenSinceLastPMFSurvey,
        onboardingExperience,
    } = userVariables;
    const treeQty = useAppSelector(selectTotalTreeQty);
    const { isProUser, currentOffering } = useContext(SubscriptionContext);
    const { isSignedIn } = useAuth();
    const pathname = usePathname();

    // const { open } = useContext(HandleAlertContext);
    // const dispatch = useDispatch();

    // const openTrialAboutToEnd = () => {
    //     open({
    //         title: "Your trial ends in a day",
    //         state: "idle",
    //         subtitle: "You don't need to do anything. Just letting you know :)",
    //         buttonText: "Thanks",
    //     });
    //     dispatch(updateTrialAboutToEndShown());
    // };

    const runWelcomeUser = nthAppOpen === 0 && onboardingStep === 0;
    const finishOnboarding = onboardingStep === LAST_ONBOARDING_STEP;
    const runOnboardingModal = pathname.includes("home") && !finishOnboarding;
    const runSignUp = isProUser === true && isSignedIn === false;

    const whatsNewLatestVersion = whatsNewDataArray[whatsNewDataArray.length - 1].version;
    const finishedOnboardingOnThisAppOpen = nthAppOpen === appNumberWhenFinishedOnboarding;
    const runWhatsNewModal = whatsNewLatestVersion !== whatsNewLatestVersionShown && finishOnboarding && !finishedOnboardingOnThisAppOpen;

    const appsOpenSinceLastPMFShownGreaterThatThreshold = appOpenSinceLastPMFSurvey !== null && nthAppOpen - appOpenSinceLastPMFSurvey >= 3;
    const runMarketFitModal = treeQty >= 3 && marketFitSurvey !== true && appsOpenSinceLastPMFShownGreaterThatThreshold;

    const deepLinkOpenedApp = Linking.useURL() !== null;

    const hasntShownPaywallYet = lastPaywallShowDate === null;
    const daysSinceLastPaywallShown = (new Date().getTime() - (lastPaywallShowDate ?? 0)) / dayInMilliseconds;
    const paywallIntervalThreshold = daysSinceLastPaywallShown >= DAYS_INTERVAL_TO_SHOW_PAYWALL;
    const runPaywall = isProUser === false && finishOnboarding && currentOffering && (hasntShownPaywallYet || paywallIntervalThreshold);

    // const onTrial = getOnTrial(customerInfo);

    // const trialCompletion = getTrialCompletion(onTrial, customerInfo);

    // const runTrialAboutToEnd = onTrial === true && trialAboutToEndShown === false && trialCompletion >= NOTIFY_TRIAL_THRESHOLD;

    useEffect(() => {
        if (!readyToRedirect) return;
        if (runWelcomeUser) return router.push("/welcomeNewUser");
        if (runOnboardingModal) return openOnboardingModal();

        //PRE ONBOARDING 👆
        if (isProUser === null) return;
        if (isSignedIn === null) return;
        //🚨 We have to show onboarding experience (or set the state as shown) for every way to finish the onboarding otherwise the app won't work correctly
        if (deepLinkOpenedApp) return;
        //POST ONBOARDING 👇
        // if (runTrialAboutToEnd) return openTrialAboutToEnd();

        if (runSignUp) return router.push("/auth/signUp");

        if (runWhatsNewModal) return openWhatsNewModal();

        if (runMarketFitModal) return openMarketFitModal();

        if (runPaywall) return router.push("/(app)/postOnboardingPaywall");
    }, [readyToRedirect, isProUser, nthAppOpen, isSignedIn]);
};

export const HandleModalsContext = createContext<{
    modal: (v: boolean) => void;
    openPaywallSurvey: () => void;
    openWhatsNewModal: () => void;
    openOnboardingFeedbackModal: () => void;
}>({
    modal: () => {},
    openPaywallSurvey: () => {},
    openWhatsNewModal: () => {},
    openOnboardingFeedbackModal: () => {},
});

export default function RootLayout() {
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [showWhatsNew, setShowWhatsNew] = useState(false);

    const { isSignedIn, isLoaded } = useUser();
    const { customerInfo } = useSubscriptionHandler();
    const pathname = usePathname();
    const router = useRouter();
    const { postOnboarding, marketFit, paywallDismiss } = useHandleSurveyModals();

    useIdentifyMixPanelUserId();
    useRunDailyBackup(isSignedIn);
    const trackScreenNavigation = useTrackNavigationEvents();

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
        if (fontsLoaded && isLoaded) SplashScreen.hideAsync();
    }, [fontsLoaded, isLoaded]);

    //  WHEN TURNING SUBSCRIPTIONS ON AGAIN UNCOMMENT THIS 👇
    const readyToRedirect = !(!fontsLoaded || !isLoaded);
    // const readyToRedirect = !(!fontsLoaded || !isLoaded || !customerInfo);

    useHandleDeepLinking(isLoaded);

    const closeOnboarding = () => setShowOnboarding(false);
    const openOnboarding = () => setShowOnboarding(true);
    const openWhatsNewModal = () => setShowWhatsNew(true);
    const closeShowWhatsNewModal = () => setShowWhatsNew(false);

    useRedirectOnAppFocus(readyToRedirect, openWhatsNewModal, marketFit.open, openOnboarding);

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

    if (!readyToRedirect) return <Text>Loading...</Text>;

    const showNavBar = !Boolean(pathname === "/" || routesToHideNavBar.find((route) => pathname.includes(route)));

    return (
        <HandleModalsContext.Provider
            value={{
                modal: setShowOnboarding,
                openPaywallSurvey: paywallDismiss.open,
                openWhatsNewModal,
                openOnboardingFeedbackModal: postOnboarding.open,
            }}>
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
                                        <ChevronLeft height={30} width={30} color={colors.line} />
                                    </TouchableOpacity>

                                    <AppText fontSize={16} children={options.title} style={{ textTransform: "capitalize" }} />
                                </View>
                            );
                        },
                    }}
                    screenListeners={trackScreenNavigation}>
                    <Stack.Screen
                        name={routes.subscriptionDetails.name}
                        options={{
                            title: "Membership Plan",
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

                {/* MODALS 👇 */}
                <MarketFitSurvey open={marketFit.state} close={marketFit.close} />
                <DismissPaywallSurvey open={paywallDismiss.state} close={paywallDismiss.close} />
                <WhatsNewModal open={showWhatsNew} close={closeShowWhatsNewModal} />
                <OnboardingModal close={closeOnboarding} open={showOnboarding} openPostOnboardingModal={postOnboarding.open} />
                <PostOnboardingSurvey open={postOnboarding.state} close={postOnboarding.close} />
                {/* MODALS 👆 */}

                {showNavBar && (
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "padding"}
                        enabled={false}
                        style={{ backgroundColor: colors.darkGray, height: NAV_HEGIHT, width, flexDirection: "row" }}>
                        <Pressable
                            style={{ width: width / 4, flex: 1, justifyContent: "center", alignItems: "center", gap: 6 }}
                            onPress={() => router.replace("/home")}>
                            <TabBarIcon name="home" color={pathname.includes("home") ? colors.white : colors.line} />
                            <AppText style={{ color: pathname.includes("home") ? colors.white : colors.line }} fontSize={10}>
                                Home
                            </AppText>
                        </Pressable>
                        <Pressable
                            style={{ width: width / 4, flex: 1, justifyContent: "center", alignItems: "center", gap: 6 }}
                            onPress={() => router.replace("/(app)/myTrees")}>
                            <TabBarIcon name="tree" color={pathname.includes("myTrees") ? colors.white : colors.line} />
                            <AppText style={{ color: pathname.includes("myTrees") ? colors.white : colors.line }} fontSize={10}>
                                My Trees
                            </AppText>
                        </Pressable>
                        {/* <Pressable
                        style={{ width: width / 4, flex: 1, justifyContent: "center", alignItems: "center", gap: 6, position: "relative" }}
                        onPress={() => router.replace("/(app)/userProgress")}>
                        <TabBarIcon name="check-circle" color={pathname.includes("userProgress") ? colors.white : colors.line} />
                        <AppText style={{ color: pathname.includes("userProgress") ? colors.white : colors.line }} fontSize={10}>
                            Habits
                        </AppText>
                    </Pressable> */}
                        {/* <Pressable
                            style={{ width: width / 4, flex: 1, justifyContent: "center", alignItems: "center", gap: 6, position: "relative" }}
                            onPress={() => router.replace("/(app)/feedback")}>
                            <TabBarIcon name="group" color={pathname.includes("feedback") ? colors.white : colors.line} />
                            <AppText style={{ color: pathname.includes("feedback") ? colors.white : colors.line }} fontSize={10}>
                                Community
                            </AppText>
                        </Pressable> */}
                        <Pressable
                            style={{ width: width / 4, flex: 1, justifyContent: "center", alignItems: "center", gap: 6, position: "relative" }}
                            onPress={() => router.replace("/(app)/userProfile")}>
                            <TabBarIcon name="user-circle-o" color={pathname.includes("userProfile") ? colors.white : colors.line} />
                            <AppText style={{ color: pathname.includes("userProfile") ? colors.white : colors.line }} fontSize={10}>
                                Settings
                            </AppText>
                        </Pressable>
                    </KeyboardAvoidingView>
                )}
            </View>
        </HandleModalsContext.Provider>
    );
}
