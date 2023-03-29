import { useCallback, useEffect, useRef } from "react";
import { Dimensions, SafeAreaView, View } from "react-native";
import { Provider } from "react-redux";
import { colors } from "./src/pages/homepage/canvas/parameters";
import HomePage from "./src/pages/homepage/HomePage";
import { useAppDispatch, useAppSelector } from "./src/redux/reduxHooks";
import { store } from "./src/redux/reduxStore";
import { selectScreenDimentions, updateDimentions } from "./src/redux/screenDimentionsSlice";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import NavigationBar from "./src/NavigationBar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MyTrees from "./src/pages/myTrees/MyTrees";
import Settings from "./src/pages/settings/Settings";

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

    const onLayoutRootView = useCallback(async () => {
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
            <Stack.Navigator initialRouteName={"Home"} screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Home" component={HomePage} />
                <Stack.Screen name="My Trees" component={MyTrees} />
                <Stack.Screen name="Settings" component={Settings} />
            </Stack.Navigator>
            <NavigationBar />
        </View>
    );
}
