import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { Provider } from "react-redux";
import HomePage from "./src/HomePage";
import { store } from "./src/reduxStore";

export default function App() {
    return (
        <Provider store={store}>
            <HomePage />
        </Provider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
});
