import { StyleSheet } from "react-native";
import { colors } from "./parameters";

export const generalStyles = StyleSheet.create({
    btn: {
        alignSelf: "flex-start",
        backgroundColor: colors.darkGray,
        paddingHorizontal: 30,
        paddingVertical: 15,
        minHeight: 48,
        borderRadius: 10,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
});
