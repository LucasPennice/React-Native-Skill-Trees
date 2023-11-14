import React from "react";
import { Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSignIn } from "@clerk/clerk-expo";
import XMarkIcon from "@/components/Icons/XMarkIcon";
import AppText from "@/components/AppText";
import { colors } from "@/parameters";
import { router } from "expo-router";

const style = StyleSheet.create({
    container: { alignItems: "center", flex: 1, padding: 15 },
});

export default function SignInScreen() {
    const { signIn, setActive, isLoaded } = useSignIn();

    const [emailAddress, setEmailAddress] = React.useState("");
    const [password, setPassword] = React.useState("");

    const onSignInPress = async () => {
        if (!isLoaded) {
            return;
        }

        try {
            const completeSignIn = await signIn.create({
                identifier: emailAddress,
                password,
            });
            // This is an important step,
            // This indicates the user is signed in
            await setActive({ session: completeSignIn.createdSessionId });
        } catch (err: any) {
            console.log(err);
        }
    };
    return (
        <View style={style.container}>
            <Header />

            <View>
                <TextInput
                    autoCapitalize="none"
                    value={emailAddress}
                    placeholder="Email..."
                    onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
                />
            </View>

            <View>
                <TextInput value={password} placeholder="Password..." secureTextEntry={true} onChangeText={(password) => setPassword(password)} />
            </View>

            <TouchableOpacity onPress={onSignInPress}>
                <Text>Sign in</Text>
            </TouchableOpacity>
        </View>
    );
}

const Header = () => {
    const style = StyleSheet.create({
        container: { flexDirection: "row", justifyContent: "center", alignItems: "center", width: "100%", position: "relative" },
    });

    const goToWelcomeScreen = () => router.push("/(app)/welcomeScreen");

    return (
        <View style={style.container}>
            <Pressable onPressIn={goToWelcomeScreen} style={{ position: "absolute", left: 0, width: 45, height: 45 }}>
                <XMarkIcon width={25} height={25} fill={colors.unmarkedText} />
            </Pressable>
            <AppText fontSize={18} children={"Log In"} style={{ paddingTop: 2, fontFamily: "helveticaBold" }} />
            <View />
        </View>
    );
};
