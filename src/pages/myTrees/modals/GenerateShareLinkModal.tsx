import Clipboard from "@react-native-clipboard/clipboard";
import FlingToDismissModal from "@/components/FlingToDismissModal";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { colors } from "@/parameters";
import AppText from "@/components/AppText";
import CopyIcon from "@/components/Icons/CopyIcon";
import SeedIcon from "@/components/Icons/SeedIcon";
import { useAppSelector } from "@/redux/reduxHooks";
import { selectSyncSlice } from "@/redux/slices/syncSlice";
import useUpdateBackup from "@/useUpdateBackup";
import useMongoCompliantUserId from "@/useMongoCompliantUserId";
import LoadingIcon from "@/components/LoadingIcon";
import { mixpanel } from "app/(app)/_layout";

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

const generateShareLink = (userId: string, selectedTreeIds: string[]) => {
    const APP_SCHEME = "skilltrees";

    return `${APP_SCHEME}://myTrees/import?userId=${userId}&treesToImportIds=[${selectedTreeIds.map((id) => `"${id}"`).join(",")}]`;
};

function GenerateShareLinkModal({ closeModal, selectedTreeIds }: { closeModal: () => void; selectedTreeIds: string[] }) {
    const [mode, setMode] = useState<"UpdatingBackup" | "ShowLink">("UpdatingBackup");

    const { localMutationsSinceBackups } = useAppSelector(selectSyncSlice);
    const { handleUserBackup } = useUpdateBackup();
    const userId = useMongoCompliantUserId();

    useEffect(() => {
        (async () => {
            try {
                if (!userId) throw new Error("Couldn't get your userId");
                if (!localMutationsSinceBackups) return setMode("ShowLink");
                await handleUserBackup();

                setMode("ShowLink");
            } catch (error) {
                mixpanel.track(`appError`, { message: error, stack: error });
                Alert.alert("There was an error updating your backup", "Please contact the developer");
            }
        })();
    }, []);

    return (
        <FlingToDismissModal closeModal={closeModal} open={true}>
            <>
                {mode === "UpdatingBackup" && <UpdatingBackup />}
                {mode === "ShowLink" && <ShowLink userId={userId!} selectedTreeIds={selectedTreeIds} />}
            </>
        </FlingToDismissModal>
    );
}

const UpdatingBackup = () => {
    return (
        <View style={styles.container}>
            <LoadingIcon />
            <AppText children={"Updating your backup..."} fontSize={24} style={{ marginVertical: 20, textAlign: "center" }} />
        </View>
    );
};

const ShowLink = ({ selectedTreeIds, userId }: { selectedTreeIds: string[]; userId: string }) => {
    const copyShareLink = () => Clipboard.setString(generateShareLink(userId, selectedTreeIds));

    const [copied, setCopied] = useState(false);

    const animatedColor = useAnimatedStyle(() => {
        return { borderColor: withTiming(copied ? colors.green : colors.darkGray) };
    });

    return (
        <Animated.View entering={FadeInDown} style={styles.container}>
            <SeedIcon fill={colors.green} width={120} height={120} />
            <AppText children={"Send your trees to a friend with this link"} fontSize={24} style={{ marginVertical: 20, textAlign: "center" }} />

            <TouchableOpacity
                style={{ width: "100%" }}
                onPress={() => {
                    copyShareLink();
                    setCopied(true);
                }}>
                <Animated.View style={[styles.clipboardTextContainer, animatedColor]}>
                    <CopyIcon color={colors.white} size={24} />
                    <AppText children={copied ? "Copied!" : "Copy link"} fontSize={16} />
                </Animated.View>
            </TouchableOpacity>
        </Animated.View>
    );
};

export default GenerateShareLinkModal;
