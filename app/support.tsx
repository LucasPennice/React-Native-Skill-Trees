import AppText from "@/components/AppText";
import CopyIcon from "@/components/Icons/CopyIcon";
import { colors } from "@/parameters";
import Clipboard from "@react-native-clipboard/clipboard";
import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";

const style = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: "center", alignItems: "center", maxWidth: 360 },
    clipboardTextContainer: {
        backgroundColor: colors.darkGray,
        borderRadius: 30,
        borderStyle: "solid",
        flexDirection: "row",
        borderWidth: 1,
        height: 45,
        marginBottom: 10,
        justifyContent: "center",
        alignItems: "center",
    },
});

function SupportScreen() {
    const copyEmailToClipboard = () => Clipboard.setString("lucaspennice@gmail.com");
    const copyDiscordServerToClipboard = () => Clipboard.setString("https://discord.com/invite/ZHENer9yAW");

    const [copied, setCopied] = useState(false);
    const [copiedServer, setCopiedServer] = useState(false);

    const animatedColor = useAnimatedStyle(() => {
        return { borderColor: withTiming(copied ? colors.green : colors.darkGray) };
    });
    const animatedCopyServerColor = useAnimatedStyle(() => {
        return { borderColor: withTiming(copiedServer ? colors.green : colors.darkGray) };
    });

    return (
        <View style={style.container}>
            <AppText children={"Contact"} fontSize={24} style={{ marginBottom: 20 }} />

            <AppText children={"Here's my personal email address:"} fontSize={16} style={{ marginBottom: 10 }} />
            <TouchableOpacity
                onPress={() => {
                    copyEmailToClipboard();
                    setCopied(true);
                }}
                style={{ width: "100%", marginBottom: 20 }}>
                <Animated.View style={[style.clipboardTextContainer, animatedColor]}>
                    <CopyIcon color={colors.accent} size={24} style={{ position: "absolute", right: 10 }} />
                    <AppText children={"lucaspennice@gmail.com"} fontSize={16} />
                </Animated.View>
            </TouchableOpacity>

            <AppText children={"Join out Discord server:"} fontSize={16} style={{ marginBottom: 10 }} />

            <TouchableOpacity
                style={{ width: "100%" }}
                onPress={() => {
                    copyDiscordServerToClipboard();
                    setCopiedServer(true);
                }}>
                <Animated.View style={[style.clipboardTextContainer, animatedCopyServerColor, { marginBottom: 20 }]}>
                    <CopyIcon color={colors.accent} size={24} style={{ position: "absolute", right: 10 }} />
                    <AppText children={"https://discord.gg/ZHENer9yAW"} fontSize={16} />
                </Animated.View>
            </TouchableOpacity>
        </View>
    );
}

export default SupportScreen;
