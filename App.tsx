import { useEffect, useRef } from "react";
import { Dimensions, SafeAreaView, View } from "react-native";
import { Provider } from "react-redux";
import { colors } from "./src/pages/homepage/canvas/parameters";
import HomePage from "./src/pages/homepage/HomePage";
import { useAppDispatch, useAppSelector } from "./src/redux/reduxHooks";
import { store } from "./src/redux/reduxStore";
import { selectScreenDimentions, updateDimentions } from "./src/redux/screenDimentionsSlice";

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

    return (
        <View
            style={{ flex: 1 }}
            onLayout={(event) => {
                var { x, y, width, height } = event.nativeEvent.layout;
                dispatch(updateDimentions({ width, height }));
            }}>
            <HomePage />
        </View>
    );
}
