import { ScrollView } from "react-native";
import { colors } from "../../parameters";
import AppText from "../../components/AppText";

function Homepage() {
    return (
        <ScrollView style={{ backgroundColor: colors.background, flex: 1, paddingHorizontal: 10 }}>
            <AppText fontSize={32} style={{ color: "white", fontFamily: "helveticaBold", marginBottom: 5 }}>
                My skills
            </AppText>
        </ScrollView>
    );
}

export default Homepage;
