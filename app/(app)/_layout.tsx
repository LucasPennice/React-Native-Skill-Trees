import OnboardingModal from "@/OnboardingModal";
import AppText from "@/components/AppText";
import ChevronLeft from "@/components/Icons/ChevronLeft";
import WhatsNewModal from "@/components/WhatsNewModal";
import DismissPaywallSurvey from "@/components/surveys/DismissPaywallSurvey";
import MarketFitSurvey from "@/components/surveys/MarketFitSurvey";
import PostOnboardingSurvey from "@/components/surveys/PostOnboardingSurvey";
import { NAV_HEGIHT, colors, dayInMilliseconds } from "@/parameters";
import { useAppSelector } from "@/redux/reduxHooks";
import { selectSyncSlice } from "@/redux/slices/syncSlice";
import { selectTotalTreeQty } from "@/redux/slices/userTreesSlice";
import { LAST_ONBOARDING_STEP, selectUserVariables } from "@/redux/slices/userVariablesSlice";
import useHandleDeepLinking from "@/useHandleDeepLinking";
import useMongoCompliantUserId from "@/useMongoCompliantUserId";
import useRunDailyBackup from "@/useRunDailyBackup";
import useTrackNavigationEvents from "@/useTrackNavigationEvents";
import { useUser } from "@clerk/clerk-expo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { SubscriptionContext, mixpanel } from "app/_layout";
import { useFonts } from "expo-font";
import * as Linking from "expo-linking";
import { SplashScreen, Stack, router, usePathname, useRouter } from "expo-router";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Dimensions, KeyboardAvoidingView, Platform, Pressable, Text, TouchableOpacity, View } from "react-native";
import { routes, routesToHideNavBar } from "routes";
import { whatsNewDataArray } from "whatsNewData";

const { width, height } = Dimensions.get("window");

function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>["name"]; color: string; size?: number }) {
    return <FontAwesome size={props.size ?? 24} style={{ marginBottom: -3 }} {...props} />;
}

function useIdentifyMixPanelUserId() {
    const userId = useMongoCompliantUserId();

    useEffect(() => {
        if (userId !== null) mixpanel.identify(userId);
    }, [userId]);
}

const useHandleSurveyModals = () => {
    const [postOnboarding, setPostOnboarding] = useState(false);
    const [marketFit, setMarketFit] = useState(false);
    const [paywallDismiss, setPaywallDismiss] = useState(false);

    const openPostOnboardingModal = () => setPostOnboarding(true);
    const closePostOnboardingModal = () => setPostOnboarding(false);

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

const useInitialRedirect = (
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
    } = userVariables;
    const { isProUser, currentOffering } = useContext(SubscriptionContext);
    // const { isSignedIn } = useAuth();

    // const getIfUserOnboarded = useCallback(() => {
    //     if (isProUser === null) return null;
    //     if (isSignedIn === null) return null;
    //     //Pro and Cleark loaded
    //     if (appNumberWhenFinishedOnboarding === null) return false;
    //     //User finished onboarding
    //     if (isSignedIn === true) return true;
    //     //User is not logged
    //     if (isProUser === false) return true;
    //     //User is not pro
    //     return false;
    // }, [isProUser, isSignedIn, appNumberWhenFinishedOnboarding]);

    const treeQty = useAppSelector(selectTotalTreeQty);

    const DAYS_INTERVAL_TO_SHOW_PAYWALL = 3;

    const deepLinkOpenedApp = Linking.useURL() !== null;

    const getShouldOpenPaywall = useCallback(() => {
        const onboardingNotFinished = appNumberWhenFinishedOnboarding === null;
        const finishedOnboardingOnThisAppOpen = nthAppOpen === appNumberWhenFinishedOnboarding;

        if (isProUser === null) return false;
        if (isProUser) return false;

        //This does not inclues signIn/Up
        if (onboardingNotFinished) return false;

        if (finishedOnboardingOnThisAppOpen) return false;

        if (currentOffering === null) return false;

        const hasntShownPaywallYet = lastPaywallShowDate === null;
        if (hasntShownPaywallYet) return true;

        const daysSinceLastPaywallShown = (new Date().getTime() - (lastPaywallShowDate ?? 0)) / dayInMilliseconds;
        const waitMoreTimeToShowPaywallAgain = daysSinceLastPaywallShown < DAYS_INTERVAL_TO_SHOW_PAYWALL;

        if (waitMoreTimeToShowPaywallAgain) return false;

        return true;
    }, [userVariables, isProUser, currentOffering]);

    useEffect(() => {
        if (!readyToRedirect) return;

        if (nthAppOpen === 0 && onboardingStep === 0) return router.push("/welcomeNewUser");

        const userDidntFinishOnboarding = onboardingStep < LAST_ONBOARDING_STEP;

        if (nthAppOpen !== 0 && userDidntFinishOnboarding) return openOnboardingModal();

        if (isProUser === null) return;

        if (deepLinkOpenedApp) return;

        const onboardingNotFinished = appNumberWhenFinishedOnboarding === null;

        const WHATS_NEW_LATEST_VERSION = whatsNewDataArray[whatsNewDataArray.length - 1].version;
        const finishedOnboardingOnThisAppOpen = nthAppOpen === appNumberWhenFinishedOnboarding;
        const showWhatsNewModal =
            WHATS_NEW_LATEST_VERSION !== whatsNewLatestVersionShown && !onboardingNotFinished && !finishedOnboardingOnThisAppOpen;
        if (showWhatsNewModal) return openWhatsNewModal();

        const appsOpenSinceLastPMFShownGreaterThatThreshold = appOpenSinceLastPMFSurvey !== null && nthAppOpen - appOpenSinceLastPMFSurvey >= 3;
        if (treeQty >= 3 && marketFitSurvey !== true && appsOpenSinceLastPMFShownGreaterThatThreshold) return openMarketFitModal();

        let shouldOpenPaywall: boolean = getShouldOpenPaywall();
        if (shouldOpenPaywall) return router.push("/(app)/postOnboardingPaywall");
    }, [
        readyToRedirect,
        isProUser,
        onboardingStep,
        appNumberWhenFinishedOnboarding,
        nthAppOpen,
        marketFitSurvey,
        appOpenSinceLastPMFSurvey,
        getShouldOpenPaywall,
    ]);

    //     const onboardedUser = getIfUserOnboarded()

    // //HOOK mientras estoy en onboarding
    //     useEffect(() => {
    //         const userOnboarded = getIfUserOnboarded()
    //         if (userOnboarded === true || userOnboarded === null) return;

    //     }
    //         , [getIfUserOnboarded]);
    // //HOOK post onboarding
    //     useEffect(() => {
    //         const userOnboarded = getIfUserOnboarded();
    //         if (userOnboarded === false || userOnboarded === null) return;

    // }, [getIfUserOnboarded]);
};

export const HandleModalsContext = createContext<{ modal: (v: boolean) => void; openPaywallSurvey: () => void; openWhatsNewModal: () => void }>({
    modal: () => {},
    openPaywallSurvey: () => {},
    openWhatsNewModal: () => {},
});

export default function RootLayout() {
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [showWhatsNew, setShowWhatsNew] = useState(false);

    const { shouldWaitForClerkToLoad } = useAppSelector(selectSyncSlice);
    const { isSignedIn, isLoaded } = useUser();
    const pathname = usePathname();
    const router = useRouter();
    const { postOnboarding, marketFit, paywallDismiss } = useHandleSurveyModals();

    useIdentifyMixPanelUserId();
    useRunDailyBackup(isSignedIn);
    const trackScreenNavigation = useTrackNavigationEvents();

    const isClerkLoaded = shouldWaitForClerkToLoad === false ? true : isLoaded;

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

    const readyToRedirect = !(!fontsLoaded || !isClerkLoaded);

    useHandleDeepLinking(isLoaded);

    const closeOnboarding = () => setShowOnboarding(false);
    const openOnboarding = () => setShowOnboarding(true);
    const openWhatsNewModal = () => setShowWhatsNew(true);
    const closeShowWhatsNewModal = () => setShowWhatsNew(false);

    useInitialRedirect(readyToRedirect, openWhatsNewModal, marketFit.open, openOnboarding);

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

    const showNavBar = !Boolean(pathname === "/" || routesToHideNavBar.find((route) => pathname.includes(route)));

    return (
        <HandleModalsContext.Provider value={{ modal: setShowOnboarding, openPaywallSurvey: paywallDismiss.open, openWhatsNewModal }}>
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
                <PostOnboardingSurvey open={postOnboarding.state} close={postOnboarding.close} />
                <MarketFitSurvey open={marketFit.state} close={marketFit.close} />
                <DismissPaywallSurvey open={paywallDismiss.state} close={paywallDismiss.close} />
                <WhatsNewModal open={showWhatsNew} close={closeShowWhatsNewModal} />
                <OnboardingModal close={closeOnboarding} open={showOnboarding} openPostOnboardingModal={postOnboarding.open} />
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
