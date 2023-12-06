import { colors } from "@/parameters";
import { StyleSheet, View } from "react-native";

const style = StyleSheet.create({
    container: { flex: 1, padding: 10, gap: 20 },
    settingContainer: { flex: 1 },
    versionText: { textAlign: "center", color: colors.line, marginTop: 10 },
});

function PaywallPage() {
    return <View style={style.container}></View>;
}

export default PaywallPage;
