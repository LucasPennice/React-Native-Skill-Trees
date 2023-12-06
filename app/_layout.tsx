import AppButton from "@/components/AppButton";
import AppText from "@/components/AppText";
import ChevronLeft from "@/components/Icons/ChevronLeft";
import CopyIcon from "@/components/Icons/CopyIcon";
import SadFaceIcon from "@/components/Icons/SadFaceIcon";
import { IsSharingAvailableContext } from "@/context";
import { HOMEPAGE_TREE_ID, HOMETREE_ROOT_ID, NODE_ICON_FONT_SIZE, USER_ICON_FONT_SIZE, colors } from "@/parameters";
import { useAppDispatch, useAppSelector } from "@/redux/reduxHooks";
import { persistor, store } from "@/redux/reduxStore";
import { homeTreeSliceInitialState } from "@/redux/slices/homeTreeSlice";
import { createHomeRootNode, selectNodeById } from "@/redux/slices/nodesSlice";
import { selectOnboarding, skipToStep } from "@/redux/slices/onboardingSlice";
import { updateSafeScreenDimentions } from "@/redux/slices/screenDimentionsSlice";
import { initializeFeedbackArrays } from "@/redux/slices/userFeedbackSlice";
import { TreeData, selectAllTrees, selectTotalTreeQty, updateUserTrees } from "@/redux/slices/userTreesSlice";
import { NormalizedNode, getDefaultSkillValue } from "@/types";
import useIsSharingAvailable from "@/useIsSharingAvailable";
import useTrackNavigationEvents from "@/useTrackNavigationEvents";
import { ClerkProvider } from "@clerk/clerk-expo";
import Clipboard from "@react-native-clipboard/clipboard";
import analytics from "@react-native-firebase/analytics";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Update } from "@reduxjs/toolkit";
import { SkFont, useFont } from "@shopify/react-native-skia";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as ExpoNavigationBar from "expo-navigation-bar";
import { ErrorBoundaryProps, SplashScreen, Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { createContext, useEffect, useState } from "react";
import { LogBox, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from "react-native";
import { TouchableHighlight } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { routes } from "routes";
import { Mixpanel } from "mixpanel-react-native";
import "../globals";

LogBox.ignoreLogs(["Warning: ..."]); // Ignore log notification by message
LogBox.ignoreAllLogs(); //Ignore all log notifications
export const unstable_settings = {
    // Ensure that reloading on `/modal` keeps a back button present.
    initialRouteName: "(tabs)",
};

const trackAutomaticEvents = true;
export const mixpanel = new Mixpanel("5a141ce3c43980d8fab68b96e1256525", trackAutomaticEvents);
mixpanel.init();

const clerkKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

const Layout = StyleSheet.create({
    AndroidSafeArea: {
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    IOsStatusBar: {
        height: 100,
        backgroundColor: colors.background,
        top: 0,
        left: 0,
        position: "absolute",
        width: "100%",
    },
});

export type SkiaAppFonts = {
    labelFont: SkFont;
    nodeLetterFont: SkFont;
    emojiFont: SkFont;
    userEmojiFont: SkFont;
};

function useSkiaFonts() {
    const labelFont = useFont(require("../assets/Helvetica.ttf"), 12);
    const nodeLetterFont = useFont(require("../assets/Helvetica.ttf"), NODE_ICON_FONT_SIZE);
    const emojiFont = useFont(require("../assets/NotoEmoji-Regular.ttf"), NODE_ICON_FONT_SIZE);
    const userEmojiFont = useFont(require("../assets/NotoEmoji-Regular.ttf"), USER_ICON_FONT_SIZE);

    if (!labelFont || !nodeLetterFont || !emojiFont || !userEmojiFont) return undefined;

    return { labelFont, nodeLetterFont, emojiFont, userEmojiFont };
}

export const SkiaFontContext = createContext<SkiaAppFonts | undefined>(undefined);

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
    const isSharingAvailable = useIsSharingAvailable();

    const skiaFonts = useSkiaFonts();

    if (Platform.OS === "android") ExpoNavigationBar.setBackgroundColorAsync(colors.darkGray);

    const tokenCache = {
        async getToken(key: string) {
            try {
                return SecureStore.getItemAsync(key);
            } catch (err) {
                return null;
            }
        },
        async saveToken(key: string, value: string) {
            try {
                return SecureStore.setItemAsync(key, value);
            } catch (err) {
                return;
            }
        },
    };

    return (
        <Provider store={store}>
            <SkiaFontContext.Provider value={skiaFonts}>
                <PersistGate loading={null} persistor={persistor}>
                    <ThemeProvider value={DarkTheme}>
                        <QueryClientProvider client={queryClient}>
                            <IsSharingAvailableContext.Provider value={isSharingAvailable}>
                                <ClerkProvider publishableKey={clerkKey!} tokenCache={tokenCache}>
                                    <SafeAreaView
                                        style={[{ flex: 1, backgroundColor: colors.darkGray, position: "relative" }, Layout.AndroidSafeArea]}>
                                        {Platform.OS === "ios" && <View style={Layout.IOsStatusBar} />}
                                        <StatusBar barStyle={"light-content"} backgroundColor={colors.background} />
                                        <AppWithReduxContext />
                                    </SafeAreaView>
                                </ClerkProvider>
                            </IsSharingAvailableContext.Provider>
                        </QueryClientProvider>
                    </ThemeProvider>
                </PersistGate>
            </SkiaFontContext.Provider>
        </Provider>
    );
}

const useHandleOnboarding = () => {
    const onboarding = useAppSelector(selectOnboarding);
    const treeQty = useAppSelector(selectTotalTreeQty);
    const dispatch = useAppDispatch();

    if (onboarding.complete) return;

    if (onboarding.currentStep !== 0) return;

    const PAST_SKILLS_STEP = 2;

    if (treeQty !== 0) dispatch(skipToStep(PAST_SKILLS_STEP));
};

const useUpdateTreeDataForShowOnHomepage = () => {
    const userTrees = useAppSelector(selectAllTrees);
    const dispatch = useAppDispatch();

    const treesToUpdate = userTrees.filter((t) => t.showOnHomeScreen === undefined);

    if (treesToUpdate.length === 0) return;

    const changes = treesToUpdate.map((tree) => {
        return { id: tree.treeId, changes: { showOnHomeScreen: true } } as Update<TreeData>;
    });

    dispatch(updateUserTrees(changes));
};

const useUpdateUserFeedback = () => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(initializeFeedbackArrays);
    }, []);
};

const useGuaranteeHomeRootTree = () => {
    const foundHomeNode = useAppSelector(selectNodeById(HOMETREE_ROOT_ID));
    const dispatch = useAppDispatch();

    if (foundHomeNode) return;

    const { icon } = homeTreeSliceInitialState;

    const homeNode: NormalizedNode = {
        nodeId: HOMETREE_ROOT_ID,
        isRoot: true,
        childrenIds: [],
        data: getDefaultSkillValue("Life Skills", false, icon),
        level: 0,
        parentId: null,
        treeId: HOMEPAGE_TREE_ID,
        x: 0,
        y: 0,
        category: "USER",
    };

    dispatch(createHomeRootNode(homeNode));
};

function AppWithReduxContext() {
    const dispatch = useAppDispatch();
    //
    useHandleOnboarding();
    useUpdateTreeDataForShowOnHomepage();
    useUpdateUserFeedback();
    useGuaranteeHomeRootTree();
    const trackScreenNavigation = useTrackNavigationEvents();

    return (
        <View
            style={{ flex: 1 }}
            onLayout={(event) => {
                var { width, height } = event.nativeEvent.layout;
                dispatch(updateSafeScreenDimentions({ width, height }));
            }}>
            <Stack
                screenListeners={trackScreenNavigation}
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
                }}>
                <Stack.Screen name={routes.support.name} options={{ title: routes.support.name, headerShown: true }} />
            </Stack>
        </View>
    );
}

export function ErrorBoundary(props: ErrorBoundaryProps) {
    const copyEmailToClipboard = () => Clipboard.setString("lucaspennice@gmail.com");
    const copyDiscordServerToClipboard = () => Clipboard.setString("https://discord.com/invite/ZHENer9yAW");

    const [copied, setCopied] = useState(false);
    const [copiedServer, setCopiedServer] = useState(false);

    const animatedColor = useAnimatedStyle(() => {
        return { borderColor: withTiming(copied ? colors.green : colors.darkGray) };
    });
    const animatedCopyServerColor = useAnimatedStyle(() => {
        return { borderColor: withTiming(copiedServer ? colors.green : colors.darkGray) };
    });

    useEffect(() => {
        (async () => {
            await analytics().logEvent("appError", { message: props.error.message, stack: props.error.stack });

            await mixpanel.track(`appError`, { message: props.error.message, stack: props.error.stack });
        })();
    }, []);

    const styles = StyleSheet.create({
        clipboardTextContainer: {
            backgroundColor: colors.darkGray,
            borderRadius: 10,
            borderStyle: "solid",
            flexDirection: "row",
            borderWidth: 1,
            height: 45,
            marginBottom: 10,
            justifyContent: "center",
            alignItems: "center",
        },
    });

    return (
        <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: "space-between", padding: 10, gap: 20 }}>
            <View style={{ justifyContent: "center", alignItems: "center" }}>
                <SadFaceIcon width={143} height={130} />
                <AppText children={"Oops!"} fontSize={26} style={{ fontFamily: "helveticaBold", marginTop: 10 }} />
                <AppText
                    children={"Seems like you found an error"}
                    fontSize={20}
                    style={{ fontFamily: "helveticaBold", marginTop: 10, textAlign: "center" }}
                />
            </View>

            <View
                style={{ backgroundColor: colors.darkGray, borderRadius: 10, padding: 10, flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ScrollView>
                    <AppText children={props.error.message} fontSize={16} style={{ color: colors.pink, marginBottom: 10 }} />
                    <AppText children={props.error.stack} fontSize={16} style={{ color: colors.line }} />
                </ScrollView>
            </View>

            <View>
                <AppText children={"Please send me an email at:"} fontSize={16} style={{ color: "#E6E8E6", marginBottom: 5 }} />
                <TouchableHighlight
                    onPress={() => {
                        copyDiscordServerToClipboard();
                        setCopiedServer(true);
                    }}>
                    <Animated.View style={[styles.clipboardTextContainer, animatedCopyServerColor, { marginBottom: 10 }]}>
                        <AppText children={"https://discord.gg/ZHENer9yAW"} fontSize={16} style={{ color: "#E6E8E6" }} />
                        <CopyIcon color={colors.accent} size={30} style={{ position: "absolute", right: 10 }} />
                    </Animated.View>
                </TouchableHighlight>

                <AppText children={"Or reach out through our Discord server:"} fontSize={16} style={{ color: "#E6E8E6", marginBottom: 5 }} />
                <TouchableHighlight
                    onPress={() => {
                        copyEmailToClipboard();
                        setCopied(true);
                    }}>
                    <Animated.View style={[styles.clipboardTextContainer, animatedColor]}>
                        <AppText children={"lucaspennice@gmail.com"} fontSize={16} style={{ color: "#E6E8E6" }} />
                        <CopyIcon color={colors.accent} size={30} style={{ position: "absolute", right: 10 }} />
                    </Animated.View>
                </TouchableHighlight>
                <AppButton onPress={props.retry} text={{ idle: "Retry" }} />
            </View>
        </View>
    );
}
