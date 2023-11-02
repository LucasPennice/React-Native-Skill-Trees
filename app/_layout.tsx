import { IsSharingAvailableContext } from "@/context";
import { colors } from "@/parameters";
import { useAppDispatch, useAppSelector } from "@/redux/reduxHooks";
import { persistor, store } from "@/redux/reduxStore";
import { selectOnboarding, skipToStep } from "@/redux/slices/onboardingSlice";
import { updateSafeScreenDimentions } from "@/redux/slices/screenDimentionsSlice";
import { selectTotalTreeQty } from "@/redux/slices/userTreesSlice";
import useHandleUserId from "@/useHandleUserId";
import useIsSharingAvailable from "@/useIsSharingAvailable";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as ExpoNavigationBar from "expo-navigation-bar";
import { SplashScreen, Stack } from "expo-router";
import { LogBox, Platform, SafeAreaView, StatusBar, StyleSheet, View } from "react-native";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
export { ErrorBoundary } from "expo-router";
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

function AppWithReduxContext() {
    const dispatch = useAppDispatch();
    useHandleUserId();
    useHandleOnboarding();

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
