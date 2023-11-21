import AppButton from "@/components/AppButton";
import AppText from "@/components/AppText";
import ChevronRight from "@/components/Icons/ChevronRight";
import CrownIcon from "@/components/Icons/CrownIcon";
import TicketIcon from "@/components/Icons/TicketIcon";
import { colors } from "@/parameters";
import { useAppDispatch } from "@/redux/reduxHooks";
import { setShouldWaitForClerkToLoad, updateLastBackupTime } from "@/redux/slices/syncSlice";
import useUpdateBackup from "@/useUpdateBackup";
import { useAuth, useUser } from "@clerk/clerk-expo";
import * as Application from "expo-application";
import { router } from "expo-router";
import { Alert, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { mixpanel } from "./_layout";

function UserProfile() {
    const style = StyleSheet.create({
        container: { flex: 1, padding: 10, gap: 20 },
        settingContainer: { flex: 1 },
        versionText: { textAlign: "center", color: colors.line, marginTop: 10 },
    });

    return (
        <View style={style.container}>
            <AppText fontSize={18} children={"My Account"} />

            <UserCard />

            <View style={style.settingContainer}>
                <TouchableOpacity
                    onPress={() => router.push("/(app)/backup")}
                    style={{
                        backgroundColor: colors.darkGray,
                        borderRadius: 10,
                        height: 45,
                        paddingHorizontal: 10,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}>
                    <AppText fontSize={14} children={"Backup Settings"} />
                    <ChevronRight color={colors.unmarkedText} />
                </TouchableOpacity>
            </View>

            <View>
                <SignOutButton />
                <AppText fontSize={14} children={`Version ${Application.nativeBuildVersion}`} style={style.versionText} />
            </View>
        </View>
    );
}

export default UserProfile;

const UserCard = () => {
    const { user } = useUser();

    const style = StyleSheet.create({
        container: { flexDirection: "row", gap: 15, alignItems: "center" },
        photo: { height: 60, width: 60, borderRadius: 30, backgroundColor: colors.darkGray },
        premiumStatus: { flexDirection: "row", gap: 5 },
    });

    const freeTrial = true;

    return (
        <View style={style.container}>
            <Image style={style.photo} source={{ uri: user?.imageUrl }} />
            <View style={{ gap: 5 }}>
                <AppText fontSize={20} children={user?.username ?? "Username"} />

                {freeTrial && (
                    <View style={style.premiumStatus}>
                        <TicketIcon width={14} height={14} fill={colors.gold} />
                        <AppText fontSize={14} children={"Free Trial"} style={{ color: colors.gold, paddingTop: 1 }} />
                    </View>
                )}
                {!freeTrial && (
                    <View style={style.premiumStatus}>
                        <CrownIcon width={15} height={15} fill={colors.gold} />
                        <AppText fontSize={14} children={"Premium Member"} style={{ color: colors.gold, paddingTop: 2 }} />
                    </View>
                )}
            </View>
        </View>
    );
};

const SignOutButton = () => {
    const { signOut, isLoaded } = useAuth();

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
            disabled={!isLoaded}
            onPress={handleSignOut}
            text={{ idle: "Sign Out", success: "Backup Successful", error: "Error Backing Up Data" }}
            color={{ idle: colors.line }}
            state={backupState}
            style={{ backgroundColor: colors.background }}
        />
    );
};
