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

export default function App() {
    return (
        <Provider store={store}>
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                <AppWithReduxContext />
            </SafeAreaView>
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

    return (
        <View
            style={{ flex: 1 }}
            onLayout={(event) => {
                onLayoutRootView();
                var { x, y, width, height } = event.nativeEvent.layout;
                dispatch(updateDimentions({ width, height }));
            }}>
            <HomePage />
        </View>
    );
}
