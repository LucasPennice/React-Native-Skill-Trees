import AppButton from "@/components/AppButton";
import { Linking, StyleSheet, View } from "react-native";

function illustrationCreditsPage() {
    const style = StyleSheet.create({
        container: { flex: 1, padding: 10, gap: 20 },
    });

    const redirectToStorySet = () => Linking.openURL("https://storyset.com/people");

    return (
        <View style={style.container}>
            <AppButton onPress={redirectToStorySet} text={{ idle: "People Illustrations by Storyset" }} color={{ idle: "transparent" }} />
        </View>
    );
}

export default illustrationCreditsPage;
