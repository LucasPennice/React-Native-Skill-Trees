import Clipboard from "@react-native-clipboard/clipboard";
import FlingToDismissModal from "@/components/FlingToDismissModal";
import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { colors } from "@/parameters";
import AppText from "@/components/AppText";
import CopyIcon from "@/components/Icons/CopyIcon";
import SeedIcon from "@/components/Icons/SeedIcon";

const styles = StyleSheet.create({
    clipboardTextContainer: {
        borderRadius: 30,
        borderStyle: "solid",
        flexDirection: "row",
        borderWidth: 1,
        backgroundColor: colors.darkGray,
        height: 45,
        marginBottom: 10,
        gap: 5,
        justifyContent: "center",
        alignItems: "center",
    },
    container: { flex: 1, justifyContent: "center", padding: 10, alignItems: "center" },
});

function GenerateShareLinkModal({ closeModal, selectedTreeIds }: { closeModal: () => void; selectedTreeIds: string[] }) {
    const copyDiscordServerToClipboard = () => Clipboard.setString("https://discord.com/invite/ZHENer9yAW");

    const [copied, setCopied] = useState(false);

    const animatedColor = useAnimatedStyle(() => {
        return { borderColor: withTiming(copied ? colors.green : colors.darkGray) };
    });

    return (
        <FlingToDismissModal closeModal={closeModal} open={true}>
            <View style={styles.container}>
                <SeedIcon fill={colors.green} width={120} height={120} />
                <AppText children={"Send your trees to a friend with this link"} fontSize={24} style={{ marginVertical: 20, textAlign: "center" }} />

                <TouchableOpacity
                    style={{ width: "100%" }}
                    onPress={() => {
                        copyDiscordServerToClipboard();
                        setCopied(true);
                    }}>
                    <Animated.View style={[styles.clipboardTextContainer, animatedColor]}>
                        <CopyIcon color={colors.white} size={24} />
                        <AppText children={copied ? "Copied!" : "Copy link"} fontSize={16} />
                    </Animated.View>
                </TouchableOpacity>
            </View>
        </FlingToDismissModal>
    );
}

export default GenerateShareLinkModal;
