import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import { CardStyleInterpolators, StackNavigationOptions, createStackNavigator } from "@react-navigation/stack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import * as ExpoNavigationBar from "expo-navigation-bar";
import * as SplashScreen from "expo-splash-screen";
import { useCallback } from "react";
import { Platform, SafeAreaView, StatusBar, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import AppText from "./src/components/AppText";
import NavigationBar from "./src/components/NavigationBar";
import { IsSharingAvailableContext } from "./src/context";
import Homepage from "./src/pages/homepage/Homepage";
import MyTrees from "./src/pages/myTrees/MyTrees";
import SkillPage from "./src/pages/skillPage/SkillPage";
import ViewingSkillTree from "./src/pages/viewingSkillTree/ViewingSkillTree";
import { centerFlex, colors } from "./src/parameters";
import { open } from "./src/redux/slices/addTreeModalSlice";
import { useAppDispatch } from "./src/redux/reduxHooks";
import { persistor, store } from "./src/redux/reduxStore";
import { updateSafeScreenDimentions } from "./src/redux/slices/screenDimentionsSlice";
import { DnDZone, Skill, Tree } from "./src/types";
import useHandleUserId from "./src/useHandleUserId";
import useIsSharingAvailable from "./src/useIsSharingAvailable";

export type StackNavigatorParams = {
    Home: undefined;
    ViewingSkillTree?: {
        treeId: string;
        selectedNodeId?: string;
        selectedNodeMenuMode?: "EDITING" | "VIEWING";
        addNodeModal?: {
            nodeId: string;
            dnDZoneType: DnDZone["type"];
        };
    };
    MyTrees: { openNewTreeModal?: boolean; editingTreeId?: string };
    Settings: undefined;
    SkillPage: Tree<Skill>;
};

export type RouteName = keyof StackNavigatorParams;

export type Routes = {
    props?: StackNavigatorParams[RouteName];
    component: (props: any) => JSX.Element;
    route: RouteName;
    options?: StackNavigationOptions;
    hideFromNavBar?: boolean;
    title: string;
}[];

const queryClient = new QueryClient();

export default function App() {
    const isSharingAvailable = useIsSharingAvailable();

    if (Platform.OS === "android") ExpoNavigationBar.setBackgroundColorAsync(colors.darkGray);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <PersistGate loading={null} persistor={persistor}>
                        <IsSharingAvailableContext.Provider value={isSharingAvailable}>
                            <NavigationContainer theme={DarkTheme}>
                                <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                                    {Platform.OS === "android" && <StatusBar />}
                                    <AppWithReduxContext />
                                </SafeAreaView>
                            </NavigationContainer>
                        </IsSharingAvailableContext.Provider>
                    </PersistGate>
                </Provider>
            </QueryClientProvider>
        </GestureHandlerRootView>
    );
}

function AppWithReduxContext() {
    const dispatch = useAppDispatch();
    useHandleUserId();
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
                    <TouchableOpacity onPress={() => dispatch(open())} style={[centerFlex, { height: 48, paddingHorizontal: 15 }]}>
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
            hideFromNavBar: true,
        },
    ];

    const [fontsLoaded] = useFonts({
        helvetica: require("./assets/Helvetica.ttf"),
        helveticaBold: require("./assets/Helvetica-Bold.ttf"),
        emojisMono: require("./assets/NotoEmoji-Regular.ttf"),
    });

    const onLayoutRootView = useCallback(async () => {
        // await populateReduxStore();

        if (fontsLoaded) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) return null;

    const Stack = createStackNavigator<StackNavigatorParams>();

    return (
        <View
            style={{ flex: 1 }}
            onLayout={(event) => {
                onLayoutRootView();
                var { width, height } = event.nativeEvent.layout;
                dispatch(updateSafeScreenDimentions({ width, height }));
            }}>
            <Stack.Navigator
                initialRouteName={"Home"}
                screenOptions={{
                    headerStyle: { backgroundColor: colors.background, shadowColor: "#00000000" },
                    headerTintColor: colors.accent,

                    headerTitleStyle: { fontWeight: "bold" },
                    title: "",
                    cardStyleInterpolator: Platform.OS === "android" ? CardStyleInterpolators.forFadeFromBottomAndroid : undefined,
                    presentation: Platform.OS === "android" ? "transparentModal" : undefined,
                }}>
                {APP_ROUTES.map((screen) => (
                    <Stack.Screen key={screen.route} name={screen.route} component={screen.component} options={screen.options} />
                ))}
            </Stack.Navigator>
            <NavigationBar data={APP_ROUTES} />
        </View>
    );
}
