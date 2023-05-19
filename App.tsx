/// <reference types="@welldone-software/why-did-you-render" />
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { NativeStackNavigationOptions, createNativeStackNavigator } from "@react-navigation/native-stack";
import { CardStyleInterpolators, createStackNavigator } from "@react-navigation/stack";
import { TransitionSpec } from "@react-navigation/stack/lib/typescript/src/types";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { createContext, useCallback } from "react";
import { Platform, SafeAreaView, StatusBar, StyleSheet, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { enableScreens } from "react-native-screens";
import { Provider } from "react-redux";
import AppText from "./src/components/AppText";
import NavigationBar from "./src/components/NavigationBar";
import Homepage from "./src/pages/homepage/Homepage";
import MyTrees from "./src/pages/myTrees/MyTrees";
import Settings from "./src/pages/settings/Settings";
import SkillPage from "./src/pages/skillPage/SkillPage";
import ViewingSkillTree from "./src/pages/viewingSkillTree/ViewingSkillTree";
import { colors } from "./src/parameters";
import { open } from "./src/redux/addTreeModalSlice";
import { useAppDispatch } from "./src/redux/reduxHooks";
import { store } from "./src/redux/reduxStore";
import { updateDimentions } from "./src/redux/screenDimentionsSlice";
import { populateUserTrees } from "./src/redux/userTreesSlice";
import { Skill, Tree } from "./src/types";
import useIsSharingAvailable from "./src/useIsSharingAvailable";
import useKeepAsyncStorageUpdated from "./src/useKeepAsyncStorageUpdated";
import "./wdyr";
import { IsSharingAvailableContext } from "./src/context";
import { populateCanvasDisplaySettings } from "./src/redux/canvasDisplaySettingsSlice";
enableScreens();

export type StackNavigatorParams = {
    Home: undefined;
    ViewingSkillTree: undefined;
    MyTrees: undefined;
    Settings: undefined;
    SkillPage: Tree<Skill>;
};

export type RouteName = keyof StackNavigatorParams;

export type Routes = {
    props?: StackNavigatorParams[RouteName];
    component: (props: any) => JSX.Element;
    route: RouteName;
    options?: NativeStackNavigationOptions;
    hideFromNavBar?: boolean;
    title: string;
}[];

export default function App() {
    const isSharingAvailable = useIsSharingAvailable();

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Provider store={store}>
                <IsSharingAvailableContext.Provider value={isSharingAvailable}>
                    <NavigationContainer>
                        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                            {Platform.OS === "android" && <StatusBar backgroundColor={colors.background} />}
                            <AppWithReduxContext />
                        </SafeAreaView>
                    </NavigationContainer>
                </IsSharingAvailableContext.Provider>
            </Provider>
        </GestureHandlerRootView>
    );
}

function AppWithReduxContext() {
    const dispatch = useAppDispatch();

    //This is the constant that should be edited when adding a new screen
    const APP_ROUTES: Routes = [
        { component: Homepage, route: "Home", options: { headerShown: false }, title: "Me" },
        {
            component: ViewingSkillTree,
            route: "ViewingSkillTree",
            options: { headerShown: false },
            title: "Viewing Skill Tree",
            hideFromNavBar: true,
        },
        {
            component: MyTrees,
            route: "MyTrees",
            options: {
                headerRight: (props) => (
                    <TouchableOpacity onPress={() => dispatch(open())} style={{ paddingVertical: 10, paddingHorizontal: 15 }}>
                        <AppText style={{ color: props.tintColor }} fontSize={16}>
                            + Add Tree
                        </AppText>
                    </TouchableOpacity>
                ),
            },
            title: "My Trees",
        },
        { component: Settings, route: "Settings", title: "Settings" },
        { component: SkillPage, route: "SkillPage", title: "Skill Page", hideFromNavBar: true },
    ];

    const [fontsLoaded] = useFonts({
        helvetica: require("./assets/Helvetica.ttf"),
        helveticaBold: require("./assets/Helvetica-Bold.ttf"),
    });

    const populateReduxStore = async () => {
        try {
            const [userTreesKeyValue, canvasDisplaySettingsKeyValue] = await AsyncStorage.multiGet(["@roadmaps", "@canvasDisplaySettings"]);

            const userTrees = userTreesKeyValue[1];
            const canvasDisplaySettings = canvasDisplaySettingsKeyValue[1];

            if (userTrees !== null && userTrees !== "") {
                dispatch(populateUserTrees(JSON.parse(userTrees)));
            }

            if (canvasDisplaySettings !== null && canvasDisplaySettings !== "") {
                dispatch(populateCanvasDisplaySettings(JSON.parse(canvasDisplaySettings)));
            }
        } catch (e) {
            console.log("There has been an error getting the user's roadmaps");
        }
    };

    const onLayoutRootView = useCallback(async () => {
        await populateReduxStore();

        if (fontsLoaded) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    useKeepAsyncStorageUpdated();

    if (!fontsLoaded) {
        return null;
    }

    const AndroidStack = createStackNavigator<StackNavigatorParams>();
    const Stack = createNativeStackNavigator<StackNavigatorParams>();

    const config: TransitionSpec = {
        animation: "spring",
        config: {
            stiffness: 1000,
            damping: 500,
            mass: 3,
            overshootClamping: true,
            restDisplacementThreshold: 0.01,
            restSpeedThreshold: 0.01,
        },
    };

    return (
        <View
            style={{ flex: 1 }}
            onLayout={(event) => {
                onLayoutRootView();
                var { x, y, width, height } = event.nativeEvent.layout;
                dispatch(updateDimentions({ width, height }));
            }}>
            {Platform.OS === "android" && (
                <AndroidStack.Navigator
                    initialRouteName={"Home"}
                    screenOptions={{
                        gestureEnabled: true,
                        gestureDirection: "horizontal",
                        cardOverlayEnabled: false,
                        detachPreviousScreen: false,
                        presentation: "modal",
                        cardStyle: { backgroundColor: "transparent" },
                        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                        transitionSpec: Platform.OS === "android" ? { close: config, open: config } : undefined,
                        headerStyle: { backgroundColor: colors.background, shadowColor: "rgba(0,0,0,0)" },
                        headerTintColor: colors.accent,
                        headerTitleStyle: { fontWeight: "bold" },
                        title: "",
                    }}>
                    {APP_ROUTES.map((screen) => (
                        <Stack.Screen key={screen.route} name={screen.route} component={screen.component} options={screen.options} />
                    ))}
                </AndroidStack.Navigator>
            )}
            {Platform.OS !== "android" && (
                <Stack.Navigator
                    initialRouteName={"Home"}
                    screenOptions={{
                        headerStyle: { backgroundColor: colors.background },
                        headerTintColor: colors.accent,
                        headerTitleStyle: { fontWeight: "bold" },
                        title: "",
                    }}>
                    {APP_ROUTES.map((screen) => (
                        <Stack.Screen key={screen.route} name={screen.route} component={screen.component} options={screen.options} />
                    ))}
                </Stack.Navigator>
            )}

            <NavigationBar data={APP_ROUTES} />
        </View>
    );
}

export const generalStyles = StyleSheet.create({
    btn: {
        alignSelf: "flex-start",
        backgroundColor: colors.darkGray,
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 10,
    },
});
