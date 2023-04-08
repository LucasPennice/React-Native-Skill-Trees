import { useCallback, useEffect } from "react";
import { SafeAreaView, TouchableOpacity, View } from "react-native";
import { Provider } from "react-redux";
import { colors } from "./src/pages/homepage/canvas/parameters";
import HomePage from "./src/pages/homepage/HomePage";
import { useAppDispatch, useAppSelector } from "./src/redux/reduxHooks";
import { store } from "./src/redux/reduxStore";
import { updateDimentions } from "./src/redux/screenDimentionsSlice";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import NavigationBar from "./src/NavigationBar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MyTrees from "./src/pages/myTrees/MyTrees";
import Settings from "./src/pages/settings/Settings";
import AppText from "./src/AppText";
import { open } from "./src/redux/addTreeSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { mockSkillTreeArray } from "./src/types";
import { populateUserTrees, selectTreeSlice } from "./src/redux/currentTreeSlice";

export default function App() {
    return (
        <Provider store={store}>
            <NavigationContainer>
                <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                    <AppWithReduxContext />
                </SafeAreaView>
            </NavigationContainer>
        </Provider>
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

    if (!fontsLoaded) {
        return null;
    }

    const Stack = createNativeStackNavigator();

    return (
        <View
            style={{ flex: 1 }}
            onLayout={(event) => {
                onLayoutRootView();
                var { x, y, width, height } = event.nativeEvent.layout;
                dispatch(updateDimentions({ width, height }));
            }}>
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
                                <AppText style={{ color: props.tintColor, fontSize: 16 }}>+ Add Tree</AppText>
                            </TouchableOpacity>
                        ),
                    }}
                />
                <Stack.Screen name="Settings" component={Settings} />
            </Stack.Navigator>
            <NavigationBar />
        </View>
    );
}
