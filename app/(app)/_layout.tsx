import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { SplashScreen } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";

export default function RootLayout() {
    const [loaded, error] = useFonts({
        helvetica: require("../../assets/Helvetica.ttf"),
        helveticaBold: require("../../assets/Helvetica-Bold.ttf"),
        emojisMono: require("../../assets/NotoEmoji-Regular.ttf"),
        ...FontAwesome.font,
    });

    useEffect(() => {
        if (error) throw error;
    }, [error]);

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) return <Text>Loading...</Text>;
    // ME PARECE QUE EL PROBLEMA ESTA EN TENER UN TABS ADENTRO DE UN STACK ?
    //     O AL MENOS AL PROGRAMA NO LE FUSTA TENER UN STACK ADENTRO DE UN STACK ADENTRO DE UM<TABS>
    //     HABRIA QUE IR PROBANDO QUE ES

    return <View style={{ backgroundColor: "green", width: 100, height: 100 }}></View>;

    // return (
    //     <View style={{ backgroundColor: "green", width: 400, height: 400 }}></View>
    // return (
    // <Stack
    //     screenOptions={{
    //         headerShown: false,
    //     }}>
    //     <Stack.Screen name="(tabs)" />
    // </Stack>
    // );
}
