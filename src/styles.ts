import { StyleSheet } from "react-native";
import { colors } from "./parameters";

export const generalStyles = StyleSheet.create({
    btn: {
        alignSelf: "flex-start",
        backgroundColor: colors.darkGray,
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 10,
    },
});
