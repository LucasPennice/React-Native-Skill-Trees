import AppText from "@/components/AppText";
import ChevronLeft from "@/components/Icons/ChevronLeft";
import OnboardingCompletionIcon from "@/components/Icons/OnboardingCompleteIcon";
import SteppedProgressBarAndIndicator, { OnboardingStep } from "@/components/SteppedProgressBarAndIndicator";
import { MENU_HIGH_DAMPENING, NAV_HEGIHT, colors } from "@/parameters";
import { useAppDispatch, useAppSelector } from "@/redux/reduxHooks";
import { closeOnboardingMenu, expandOnboardingMenu, selectOnboarding, skipToStep } from "@/redux/slices/onboardingSlice";
import { selectSyncSlice } from "@/redux/slices/syncSlice";
import { selectAllTrees } from "@/redux/slices/userTreesSlice";
import useMongoCompliantUserId from "@/useMongoCompliantUserId";
import useTrackNavigationEvents from "@/useTrackNavigationEvents";
import useUpdateBackup from "@/useUpdateBackup";
import { useUser } from "@clerk/clerk-expo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import * as Linking from "expo-linking";
import { SplashScreen, Stack, router, usePathname, useRouter } from "expo-router";
import { Mixpanel } from "mixpanel-react-native";
import { Fragment, useEffect, useRef, useState } from "react";
import { Alert, AppState, Dimensions, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeInRight, FadeOut, FadeOutLeft, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { RoutesParams, hideNavAndOnboarding, routes } from "routes";
import { dayInMilliseconds } from "./backup";

function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>["name"]; color: string; size?: number }) {
    return <FontAwesome size={props.size ?? 24} style={{ marginBottom: -3 }} {...props} />;
}

function useIdentifyMixPanelUserId() {
    const userId = useMongoCompliantUserId();

    useEffect(() => {
        if (userId !== null) mixpanel.identify(userId);
    }, [userId]);
}

const trackAutomaticEvents = true;
export const mixpanel = new Mixpanel("5a141ce3c43980d8fab68b96e1256525", trackAutomaticEvents);
mixpanel.init();

const useHandleUpdateBackup = (isSignedIn: boolean | undefined) => {
    const { localMutationsSinceBackups, lastUpdateUTC_Timestamp } = useAppSelector(selectSyncSlice);

    const appState = useRef(AppState.currentState);
    const [appStateVisible, setAppStateVisible] = useState(appState.current);

    useEffect(() => {
        const subscription = AppState.addEventListener("change", (nextAppState) => {
            appState.current = nextAppState;
            setAppStateVisible(appState.current);
        });

        return () => {
            subscription.remove();
        };
    }, []);

    const { handleUserBackup } = useUpdateBackup();

    useEffect(() => {
        (async () => {
            const dayOrMoreSinceLastBackup = new Date().getTime() - lastUpdateUTC_Timestamp >= dayInMilliseconds;
            if (!(dayOrMoreSinceLastBackup && localMutationsSinceBackups)) return;
            if (!isSignedIn) return;

            if (appStateVisible !== "active") return;

            try {
                await handleUserBackup();
            } catch (error) {
                Alert.alert("Error creating a backup", `Please contact the developer ${error}`);
            }
        })();
    }, [appStateVisible, isSignedIn]);
};

const useRedirectToWelcomeScreen = (attemptToRedirect: boolean, isLoaded: boolean, isSignedIn: boolean | undefined) => {
    useEffect(() => {
        if (!attemptToRedirect) return;
        if (isLoaded && !isSignedIn) return router.push("/welcomeScreen");
        // if (process.env.NODE_ENV === "production" && isLoaded && !isSignedIn) return router.push("/welcomeScreen");
    }, [isLoaded, isSignedIn, attemptToRedirect]);
};

const manuallyParseParams = (url: string) => {
    //
    const splitUrl = url.split("?");
    const paramArray = splitUrl.slice(1);

    const result: { [key: string]: string } = {};

    paramArray.forEach((s) => {
        const [key, data] = s.split("=");

        result[key] = data;
    });

    return result;
};

const onUrlChange = (url: string | null, isLoaded: boolean, userId: string | null) => {
    if (url === null) return;
    if (!isLoaded) return;
    if (!userId) return Alert.alert("Please create an account or log in", "Before clicking a skill trees link");

    const { path: action } = Linking.parse(url);

    const queryParams = manuallyParseParams(url);

    //Handle import case
    if (action === "redirect/import") {
        if (!queryParams) return Alert.alert("Invalid import link");
        if (queryParams.userId === undefined) return Alert.alert("User id doesn't exist in import link");
        if (queryParams.treesToImportIds === undefined) return Alert.alert("The trees to import do not exist at the provided import link.");

        //HANDLES THE ROUTING FOR INITIAL AND SUBSEQUENT EVENTS - AND THE PARAM SETTING FOR ONLY THE FIRST EVENT
        router.push({
            pathname: `/(app)/myTrees`,
            //@ts-ignore
            params: { userIdImport: queryParams.userId, treesToImportIds: queryParams.treesToImportIds } as RoutesParams["myTrees"],
        });

        //PARAM SETTING FOR ONLY SUBSEQUENT EVENTS
        //@ts-ignore
        router.setParams({ userIdImport: queryParams.userId, treesToImportIds: queryParams.treesToImportIds } as RoutesParams["myTrees"]);
        return;
    }
};

const useHandleDeepLinking = (isLoaded: boolean) => {
    const url = Linking.useURL();

    const userId = useMongoCompliantUserId();

    useEffect(() => {
        onUrlChange(url, isLoaded, userId);
    }, [userId, isLoaded]);

    useEffect(() => {
        const eventEmmiter = Linking.addEventListener("url", (e) => {
            const url = e.url;

            onUrlChange(url, isLoaded, userId);
        });

        return () => {
            eventEmmiter.remove();
        };
    }, [userId, isLoaded]);
};

export default function RootLayout() {
    useIdentifyMixPanelUserId();
    const onboarding = useAppSelector(selectOnboarding);
    const { shouldWaitForClerkToLoad } = useAppSelector(selectSyncSlice);
    const { isSignedIn, isLoaded } = useUser();
    useHandleUpdateBackup(isSignedIn);
    const isClerkLoaded = shouldWaitForClerkToLoad === false ? true : isLoaded;

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

    const attemptToRedirect = !(!fontsLoaded || !isClerkLoaded);

    useRedirectToWelcomeScreen(attemptToRedirect, isLoaded, isSignedIn);

    useHandleDeepLinking(isLoaded);

    if (!fontsLoaded || !isClerkLoaded) return <Text>Loading...</Text>;

    const hide = !Boolean(pathname === "/" || hideNavAndOnboarding.find((route) => pathname.includes(route)));

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

                                <AppText fontSize={16} children={route.name} style={{ textTransform: "capitalize" }} />
                            </View>
                        );
                    },
                }}
                screenListeners={trackScreenNavigation}>
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
