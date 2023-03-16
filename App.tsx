import { useEffect, useRef } from "react";
import { Dimensions, SafeAreaView, View } from "react-native";
import { Provider } from "react-redux";
import HomePage from "./src/pages/HomePage";
import { useAppDispatch, useAppSelector } from "./src/reduxHooks";
import { store } from "./src/reduxStore";
import { selectScreenDimentions, updateDimentions } from "./src/screenDimentionsSlice";

export default function App() {
    return (
        <Provider store={store}>
            <SafeAreaView style={{ flex: 1 }}>
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
