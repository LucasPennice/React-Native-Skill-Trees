import FontAwesome from "@expo/vector-icons/FontAwesome";
import AppTextInput, { AppTextInputProps } from "./AppTextInput";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { colors } from "@/parameters";
const PasswordInput = (props: AppTextInputProps) => {
    const [hidePassword, setHidePassword] = useState(true);

    const toggleShowPassword = () => setHidePassword((p) => !p);

    const style = StyleSheet.create({
        container: { position: "relative" },
        toggleShowPassword: {
            position: "absolute",
            right: 0,
            height: "100%",
            width: 45,
            justifyContent: "center",
            alignItems: "center",
        },
    });

    return (
        <View style={style.container}>
            <AppTextInput {...props} inputProps={{ ...props.inputProps, secureTextEntry: hidePassword }} hideClearButton />
            <Pressable onPressIn={toggleShowPassword} style={style.toggleShowPassword}>
                {!hidePassword && <FontAwesome name={"eye"} size={18} color={colors.line} />}
                {hidePassword && <FontAwesome name={"eye-slash"} size={18} color={colors.line} />}
            </Pressable>
        </View>
    );
};

export default PasswordInput;
