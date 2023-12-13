import FontAwesome from "@expo/vector-icons/FontAwesome";
import AppButton from "@/components/AppButton";
import AppText from "@/components/AppText";
import { colors } from "@/parameters";
import { useAppDispatch } from "@/redux/reduxHooks";
import { setShouldWaitForClerkToLoad, updateLastBackupTime } from "@/redux/slices/syncSlice";
import useUpdateBackup from "@/useUpdateBackup";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { mixpanel } from "app/_layout";
import { Alert, Image, StyleSheet, TouchableOpacity, View } from "react-native";

import LoadingIcon from "@/components/LoadingIcon";
import { useState } from "react";
import { router } from "expo-router";

const style = StyleSheet.create({
    container: { flex: 1, padding: 20, gap: 20, justifyContent: "center", alignItems: "center", position: "relative" },
    settingContainer: { flex: 1, gap: 15 },
    versionText: { textAlign: "center", color: colors.line, marginVertical: 10 },
});

function AccountPage() {
    return (
        <View style={style.container}>
            <TouchableOpacity
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    height: 40,
                    width: 300,
                    justifyContent: "flex-start",
                    position: "absolute",
                    left: 10,
                    top: 10,
                }}
                onPress={() => router.push("/(app)/userProfile")}>
                <FontAwesome name={"chevron-left"} size={18} color={colors.softPurle} />
                <AppText children={"Settings"} fontSize={18} style={{ color: colors.softPurle, marginLeft: 10, paddingTop: 3 }} />
            </TouchableOpacity>

            <UserCard />

            <SignOutButton />
        </View>
    );
}

const UserCard = () => {
    const { user } = useUser();

    const [showLoading, setShowLoading] = useState(false);

    const style = StyleSheet.create({
        container: { gap: 15, alignItems: "center" },
        photo: { height: 120, width: 120, borderRadius: 60, backgroundColor: colors.darkGray },
        photoContainer: { position: "relative", justifyContent: "center", alignItems: "center" },
        loadingIndicator: { position: "absolute" },
        premiumStatus: { flexDirection: "row", gap: 5 },
    });

    return (
        <View style={style.container}>
            <View style={style.photoContainer}>
                <Image
                    style={style.photo}
                    source={{ uri: user?.imageUrl }}
                    onLoadStart={() => setShowLoading(true)}
                    onLoadEnd={() => setShowLoading(false)}
                />
                {showLoading && (
                    <View style={style.loadingIndicator}>
                        <LoadingIcon size={30} />
                    </View>
                )}
            </View>

            <View style={{ gap: 5 }}>
                <AppText fontSize={32} children={user?.username ?? "Username"} />
            </View>
        </View>
    );
};

const SignOutButton = () => {
    const { signOut, isLoaded, isSignedIn } = useAuth();

    const dispatch = useAppDispatch();

    const { backupState, handleUserBackup } = useUpdateBackup();

    const runOnSignOut = () => {
        mixpanel.reset();
        dispatch(setShouldWaitForClerkToLoad(true));
    };

    const handleSignOut = async () => {
        try {
            await handleUserBackup();

            runOnSignOut();

            dispatch(updateLastBackupTime());

            signOut();
        } catch (error) {
            mixpanel.track(`appError`, { message: error, stack: error });
            Alert.alert("Error creating a backup", `All progress after ${new Date().toString()} will be lost\nQuit anyway?`, [
                { text: "No", style: "default", isPreferred: true },
                {
                    text: "Yes",
                    style: "destructive",
                    onPress: () => {
                        runOnSignOut();

                        signOut();
                    },
                },
            ]);
        }
    };

    return (
        <AppButton
            disabled={!isLoaded || !isSignedIn}
            onPress={handleSignOut}
            text={{ idle: "Log Out", success: "Backup Successful", error: "Error Backing Up Data" }}
            color={{ idle: colors.darkGray }}
            state={backupState}
            pressableStyle={{ width: "100%" }}
            textStyle={{ fontSize: 18, lineHeight: 18, color: colors.red }}
            style={{ backgroundColor: colors.darkGray, height: 50 }}
        />
    );
};

export default AccountPage;
