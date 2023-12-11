import OnboardingModal from "@/OnboardingModal";
import AppText from "@/components/AppText";
import ChevronLeft from "@/components/Icons/ChevronLeft";
import MarketFitSurvey from "@/components/surveys/MarketFitSurvey";
import PostOnboardingSurvey from "@/components/surveys/PostOnboardingSurvey";
import { NAV_HEGIHT, colors } from "@/parameters";
import { useAppSelector } from "@/redux/reduxHooks";
import { selectSyncSlice } from "@/redux/slices/syncSlice";
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
import { createContext, useContext, useEffect, useState } from "react";
import { Dimensions, KeyboardAvoidingView, Platform, Pressable, Text, TouchableOpacity, View } from "react-native";
import { routes, routesToHideNavBar } from "routes";

function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>["name"]; color: string; size?: number }) {
    return <FontAwesome size={props.size ?? 24} style={{ marginBottom: -3 }} {...props} />;
}

function useIdentifyMixPanelUserId() {
    const userId = useMongoCompliantUserId();

    useEffect(() => {
        if (userId !== null) mixpanel.identify(userId);
    }, [userId]);
}

const useInitialRedirect = (readyToRedirect: boolean, redirectToWelcomeScreen: boolean, redirectToPaywall: boolean) => {
    const { nthAppOpen, onboardingStep } = useAppSelector(selectUserVariables);

    useEffect(() => {
        if (!readyToRedirect) return;

        // if (true) return router.push("/welcomeNewUser");
        if (nthAppOpen === 0 || onboardingStep === 0) return router.push("/welcomeNewUser");

        // if (redirectToWelcomeScreen) return router.push("/welcomeScreen");
        if (redirectToPaywall) return router.replace("/(app)/paywall");
    }, [redirectToWelcomeScreen, readyToRedirect, redirectToPaywall]);
};

const useHandleSurveyModals = () => {
    const [postOnboarding, setPostOnboarding] = useState(false);
    const [marketFit, setMarketFit] = useState(false);

    const openPostOnboardingModal = () => setPostOnboarding(true);
    const closePostOnboardingModal = () => setPostOnboarding(false);

    const openMarketFitModal = () => setMarketFit(true);
    const closeMarketFitModal = () => setMarketFit(false);

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
    };
};

export const HandleOnboardingModalContext = createContext<(v: boolean) => void>(() => {});

export default function RootLayout() {
    const [showOnboarding, setShowOnboarding] = useState(false);
    const deepLinkOpenedApp = Linking.useURL() !== null;

    const { postOnboarding, marketFit } = useHandleSurveyModals();
    useIdentifyMixPanelUserId();
    const { shouldWaitForClerkToLoad } = useAppSelector(selectSyncSlice);
    const { onboardingStep } = useAppSelector(selectUserVariables);
    const { isSignedIn, isLoaded } = useUser();
    useRunDailyBackup(isSignedIn);
    const isClerkLoaded = deepLinkOpenedApp ? isLoaded : shouldWaitForClerkToLoad === false ? true : isLoaded;

    useEffect(() => {
        console.log(onboardingStep);
    }, [onboardingStep]);

    const { isProUser, onFreeTrial, currentOffering } = useContext(SubscriptionContext);

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

    const redirectToPaywall = isSignedIn === true && isProUser === false && onFreeTrial === false && currentOffering !== null;

    useInitialRedirect(fontsLoaded, redirectToWelcomeScreen, redirectToPaywall);

    const shouldHandleDeepLink = isLoaded && (isProUser === true || onFreeTrial === true);

    useHandleDeepLinking(shouldHandleDeepLink);

    useEffect(() => {
        const userDidFirstOnboardingStep = onboardingStep > 0;
        const userDidntFinishOnboarding = onboardingStep <= LAST_ONBOARDING_STEP;
        if (userDidFirstOnboardingStep && userDidntFinishOnboarding) setShowOnboarding(true);
    }, []);

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

    const closeOnboarding = () => setShowOnboarding(false);

    return (
        <HandleOnboardingModalContext.Provider value={setShowOnboarding}>
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

                {postOnboarding.state && <PostOnboardingSurvey open={postOnboarding.state} close={postOnboarding.close} />}

                {marketFit.state && <MarketFitSurvey open={marketFit.state} close={marketFit.close} />}

                <OnboardingModal close={closeOnboarding} open={showOnboarding} />

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
        </HandleOnboardingModalContext.Provider>
    );
}
