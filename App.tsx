import { useCallback, useEffect } from "react";
import { Platform, SafeAreaView, TouchableOpacity, View } from "react-native";
import { Provider } from "react-redux";
import { colors } from "./src/pages/homepage/canvas/parameters";
import HomePage from "./src/pages/homepage/HomePage";
import { useAppDispatch, useAppSelector } from "./src/redux/reduxHooks";
import { store } from "./src/redux/reduxStore";
import { updateDimentions } from "./src/redux/screenDimentionsSlice";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import NavigationBar from "./src/components/NavigationBar";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator, CardStyleInterpolators } from "@react-navigation/stack";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MyTrees from "./src/pages/myTrees/MyTrees";
import Settings from "./src/pages/settings/Settings";
import AppText from "./src/components/AppText";
import { open } from "./src/redux/addTreeModalSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { populateUserTrees, selectTreeSlice } from "./src/redux/userTreesSlice";
import useKeepAsyncStorageUpdated from "./src/useKeepAsyncStorageUpdated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { TransitionSpec } from "@react-navigation/stack/lib/typescript/src/types";

export default function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Provider store={store}>
                <NavigationContainer>
                    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                        <AppWithReduxContext />
                    </SafeAreaView>
                </NavigationContainer>
            </Provider>
        </GestureHandlerRootView>
    );
}

function AppWithReduxContext() {
    const dispatch = useAppDispatch();

    const [fontsLoaded] = useFonts({
        helvetica: require("./assets/Helvetica.ttf"),
        helveticaBold: require("./assets/Helvetica-Bold.ttf"),
    });

    const populateReduxStore = async () => {
        try {
            const userTrees = await AsyncStorage.getItem("@roadmaps");
            if (userTrees !== null && userTrees !== "") {
                dispatch(populateUserTrees(JSON.parse(userTrees)));
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

    // AsyncStorage.setItem("@roadmaps", JSON.stringify(mockSkillTreeArray));

    useKeepAsyncStorageUpdated();

    if (!fontsLoaded) {
        return null;
    }

    const AndroidStack = createStackNavigator();
    const Stack = createNativeStackNavigator();

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
                    <Stack.Screen name="Home" component={HomePage} options={{ headerShown: false }} />
                    <Stack.Screen
                        name="My Trees"
                        component={MyTrees}
                        options={{
                            headerRight: (props) => (
                                <TouchableOpacity onPress={() => dispatch(open())} style={{ paddingVertical: 10, paddingHorizontal: 15 }}>
                                    <AppText style={{ color: props.tintColor }} fontSize={16}>
                                        + Add Tree
                                    </AppText>
                                </TouchableOpacity>
                            ),
                        }}
                    />
                    <Stack.Screen name="Settings" component={Settings} />
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
                    <Stack.Screen name="Home" component={HomePage} options={{ headerShown: false }} />
                    <Stack.Screen
                        name="My Trees"
                        component={MyTrees}
                        options={{
                            headerRight: (props) => (
                                <TouchableOpacity onPress={() => dispatch(open())} style={{ paddingVertical: 10, paddingLeft: 15 }}>
                                    <AppText style={{ color: props.tintColor }} fontSize={16}>
                                        + Add Tree
                                    </AppText>
                                </TouchableOpacity>
                            ),
                        }}
                    />
                    <Stack.Screen name="Settings" component={Settings} />
                </Stack.Navigator>
            )}

            <NavigationBar />
        </View>
    );
}
