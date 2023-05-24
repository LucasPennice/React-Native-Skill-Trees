import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { NativeStackNavigationOptions, createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFonts } from "expo-font";
import * as Linking from "expo-linking";
import * as SplashScreen from "expo-splash-screen";
import { useCallback } from "react";
import { Platform, SafeAreaView, StatusBar, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import AppText from "./src/components/AppText";
import NavigationBar from "./src/components/NavigationBar";
import { IsSharingAvailableContext } from "./src/context";
import Homepage from "./src/pages/homepage/Homepage";
import MyTrees from "./src/pages/myTrees/MyTrees";
import SkillPage from "./src/pages/skillPage/SkillPage";
import ViewingSkillTree from "./src/pages/viewingSkillTree/ViewingSkillTree";
import { colors } from "./src/parameters";
import { open } from "./src/redux/addTreeModalSlice";
import { populateCanvasDisplaySettings } from "./src/redux/canvasDisplaySettingsSlice";
import { useAppDispatch } from "./src/redux/reduxHooks";
import { store } from "./src/redux/reduxStore";
import { updateSafeScreenDimentions } from "./src/redux/screenDimentionsSlice";
import { populateUserTrees } from "./src/redux/userTreesSlice";
import { Skill, Tree } from "./src/types";
import useIsSharingAvailable from "./src/useIsSharingAvailable";
import useKeepAsyncStorageUpdated from "./src/useKeepAsyncStorageUpdated";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { populateUserId } from "./src/redux/userSlice";
import { makeid } from "./src/functions/misc";
import * as ExpoNavigationBar from "expo-navigation-bar";

const prefix = Linking.createURL("/");

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

const queryClient = new QueryClient();

export default function App() {
    const isSharingAvailable = useIsSharingAvailable();

    const linking = {
        prefixes: [prefix],
    };

    if (Platform.OS === "android") ExpoNavigationBar.setBackgroundColorAsync(colors.darkGray);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <IsSharingAvailableContext.Provider value={isSharingAvailable}>
                        <NavigationContainer>
                            {/* <NavigationContainer linking={linking} fallback={<Text>Loading...</Text>}> */}
                            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                                {Platform.OS === "android" && <StatusBar />}
                                <AppWithReduxContext />
                            </SafeAreaView>
                        </NavigationContainer>
                    </IsSharingAvailableContext.Provider>
                </Provider>
            </QueryClientProvider>
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
            title: "Skill Trees",
        },
        // { component: Settings, route: "Settings", title: "Settings" },
        {
            component: SkillPage,
            route: "SkillPage",
            title: "Skill Page",
            options: { headerShown: false, gestureEnabled: false },
            hideFromNavBar: true,
        },
    ];

    const [fontsLoaded] = useFonts({
        helvetica: require("./assets/Helvetica.ttf"),
        helveticaBold: require("./assets/Helvetica-Bold.ttf"),
    });

    const populateReduxStore = async () => {
        try {
            const [userTreesKeyValue, canvasDisplaySettingsKeyValue, userInfoKeyValue] = await AsyncStorage.multiGet([
                "@roadmaps",
                "@canvasDisplaySettings",
                "@userId",
            ]);

            const userTrees = userTreesKeyValue[1];
            const canvasDisplaySettings = canvasDisplaySettingsKeyValue[1];
            const userId = userInfoKeyValue[1];

            if (userTrees !== null && userTrees !== "") {
                dispatch(populateUserTrees(JSON.parse(userTrees)));
            }

            if (canvasDisplaySettings !== null && canvasDisplaySettings !== "") {
                dispatch(populateCanvasDisplaySettings(JSON.parse(canvasDisplaySettings)));
            }

            if (userId !== null && userId !== "") {
                dispatch(populateUserId(userId));
            } else {
                dispatch(populateUserId(makeid(24)));
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

    // const AndroidStack = createStackNavigator<StackNavigatorParams>();
    const Stack = createNativeStackNavigator<StackNavigatorParams>();

    return (
        <View
            style={{ flex: 1 }}
            onLayout={(event) => {
                onLayoutRootView();
                var { x, y, width, height } = event.nativeEvent.layout;
                dispatch(updateSafeScreenDimentions({ width, height }));
            }}>
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
            <NavigationBar data={APP_ROUTES} />
        </View>
    );
}
