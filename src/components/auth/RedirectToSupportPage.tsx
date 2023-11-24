import { StyleSheet, TouchableOpacity } from "react-native";
import AppText from "../AppText";
import ChevronRight from "../Icons/ChevronRight";
import { colors } from "@/parameters";
import { router } from "expo-router";

const style = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 0,
        left: 0,
        flexDirection: "row",
        gap: 5,
        height: 45,
        alignItems: "flex-end",
        paddingRight: 20,
        paddingLeft: 10,
        paddingBottom: 10,
    },
});

function RedirectToSupportPage() {
    const redirect = () => router.push("/support");

    return (
        <TouchableOpacity style={style.container} onPress={redirect}>
            <AppText
                children={"Something not working? Reach out so I can fix it"}
                fontSize={14}
                style={{ paddingBottom: 3, color: `${colors.white}80` }}
            />
            <ChevronRight width={24} height={24} color={`${colors.white}80`} />
        </TouchableOpacity>
    );
}

export default RedirectToSupportPage;
