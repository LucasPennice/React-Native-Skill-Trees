import { ScrollView, View } from "react-native";
import AppText from "../../components/AppText";
import { colors } from "../../parameters";

function Settings() {
    return (
        <ScrollView style={{ backgroundColor: colors.background, flex: 1, paddingHorizontal: 10 }}>
            <AppText fontSize={32} style={{ color: "white", fontFamily: "helveticaBold", marginBottom: 5 }}>
                Settings
            </AppText>
        </ScrollView>
    );
}

export default Settings;
