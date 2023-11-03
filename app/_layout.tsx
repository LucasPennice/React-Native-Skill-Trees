import AppButton from "@/components/AppButton";
import AppText from "@/components/AppText";
import CopyIcon from "@/components/Icons/CopyIcon";
import SadFaceIcon from "@/components/Icons/SadFaceIcon";
import { IsSharingAvailableContext } from "@/context";
import { colors } from "@/parameters";
import { useAppDispatch, useAppSelector } from "@/redux/reduxHooks";
import { persistor, store } from "@/redux/reduxStore";
import { selectOnboarding, skipToStep } from "@/redux/slices/onboardingSlice";
import { updateSafeScreenDimentions } from "@/redux/slices/screenDimentionsSlice";
import { TreeData, selectAllTrees, selectTotalTreeQty, updateUserTrees } from "@/redux/slices/userTreesSlice";
import useHandleUserId from "@/useHandleUserId";
import useIsSharingAvailable from "@/useIsSharingAvailable";
import Clipboard from "@react-native-clipboard/clipboard";
import analytics from "@react-native-firebase/analytics";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Update } from "@reduxjs/toolkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as ExpoNavigationBar from "expo-navigation-bar";
import { ErrorBoundaryProps, SplashScreen, Stack } from "expo-router";
import { useEffect, useState } from "react";

import { LogBox, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, View } from "react-native";
import { TouchableHighlight } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { mixpanel } from "./(app)/_layout";
LogBox.ignoreLogs(["Warning: ..."]); // Ignore log notification by message
LogBox.ignoreAllLogs(); //Ignore all log notifications
export const unstable_settings = {
    // Ensure that reloading on `/modal` keeps a back button present.
    initialRouteName: "(tabs)",
};

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

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
    const isSharingAvailable = useIsSharingAvailable();

    if (Platform.OS === "android") ExpoNavigationBar.setBackgroundColorAsync(colors.darkGray);

    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <ThemeProvider value={DarkTheme}>
                    <QueryClientProvider client={queryClient}>
                        <IsSharingAvailableContext.Provider value={isSharingAvailable}>
                            <SafeAreaView style={[{ flex: 1, backgroundColor: colors.darkGray, position: "relative" }, Layout.AndroidSafeArea]}>
                                {Platform.OS === "ios" && <View style={Layout.IOsStatusBar} />}
                                <StatusBar barStyle={"light-content"} backgroundColor={colors.background} />
                                <AppWithReduxContext />
                            </SafeAreaView>
                        </IsSharingAvailableContext.Provider>
                    </QueryClientProvider>
                </ThemeProvider>
            </PersistGate>
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

function AppWithReduxContext() {
    const dispatch = useAppDispatch();
    useHandleUserId();
    useHandleOnboarding();
    useUpdateTreeDataForShowOnHomepage();

    return (
        <View
            style={{ flex: 1 }}
            onLayout={(event) => {
                var { width, height } = event.nativeEvent.layout;
                dispatch(updateSafeScreenDimentions({ width, height }));
            }}>
            <Stack screenOptions={{ headerShown: false }} />
        </View>
    );
}

export function ErrorBoundary(props: ErrorBoundaryProps) {
    console.log("ERROR");
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
            await analytics().logEvent("error", { message: props.error.message, stack: props.error.stack });

            await mixpanel.track(`error`, { message: props.error.message, stack: props.error.stack });
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
