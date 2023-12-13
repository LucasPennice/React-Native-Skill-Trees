import AppButton from "@/components/AppButton";
import AppText from "@/components/AppText";
import ChevronRight from "@/components/Icons/ChevronRight";
import CrownIcon from "@/components/Icons/CrownIcon";
import TicketIcon from "@/components/Icons/TicketIcon";
import { colors } from "@/parameters";
import { useAppDispatch, useAppSelector } from "@/redux/reduxHooks";
import { selectSyncSlice, setShouldWaitForClerkToLoad, updateLastBackupTime } from "@/redux/slices/syncSlice";
import useUpdateBackup from "@/useUpdateBackup";
import { useAuth, useUser } from "@clerk/clerk-expo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { SubscriptionContext, mixpanel } from "app/_layout";
import * as Application from "expo-application";
import { router } from "expo-router";
import { Alert, Image, StyleSheet, TouchableOpacity, View } from "react-native";

import LoadingIcon from "@/components/LoadingIcon";
import { useContext, useState } from "react";
import { CustomerInfo } from "react-native-purchases";

const style = StyleSheet.create({
    container: { flex: 1, padding: 15, gap: 20 },
    settingContainer: { flex: 1, gap: 15 },
    versionText: { textAlign: "center", color: colors.line, marginVertical: 10 },
});

const millisecondsToHours = 1000 * 60 * 60;
function UserProfile() {
    const { isSignedIn, user } = useUser();
    const { isProUser, customerInfo } = useContext(SubscriptionContext);

    const { lastUpdateUTC_Timestamp } = useAppSelector(selectSyncSlice);

    const hoursSinceLastUpdate = parseInt(`${(new Date().getTime() - lastUpdateUTC_Timestamp) / millisecondsToHours}`);

    const navigateToSignIn = () => router.push("/(app)/auth/signIn");
    const navigateToSignUp = () => router.push("/(app)/auth/signUp");

    return (
        <View style={style.container}>
            <AppText fontSize={24} children={"Settings"} />

            <View style={style.settingContainer}>
                <SettingLink
                    icon={"user"}
                    href={isSignedIn ? "/(app)/account" : "/(app)/auth/signUp"}
                    title={"Account"}
                    subtitle={user ? user.emailAddresses[0].emailAddress : "No active account"}
                    warning={!isSignedIn}
                />
                <SettingLink
                    icon={"cloud-upload"}
                    href={isSignedIn ? "/(app)/backup" : "/(app)/auth/signUp"}
                    title={"Cloud Sync"}
                    subtitle={
                        isSignedIn ? `Last updated ${hoursSinceLastUpdate} ${hoursSinceLastUpdate === 1 ? "hour" : "hours"} ago` : "Log in to backup"
                    }
                    warning={!isSignedIn}
                />
                <SettingLink
                    icon={"credit-card-alt"}
                    href={isProUser ? "/(app)/subscriptionDetails" : "/(app)/postOnboardingPaywall"}
                    title={"Subscription"}
                    subtitle={isProUser && customerInfo ? getProString(customerInfo) : "No active subscription"}
                    warning={!isProUser}
                />
            </View>

            <View>
                <AppText fontSize={14} children={`Version ${Application.nativeBuildVersion}`} style={style.versionText} />

                {!isSignedIn && (
                    <>
                        <AppButton
                            onPress={navigateToSignUp}
                            pressableStyle={{ width: "100%" }}
                            text={{ idle: "Create account" }}
                            color={{ loading: colors.accent }}
                            style={{ backgroundColor: colors.accent, height: 50, marginBottom: 10 }}
                            textStyle={{ fontSize: 18, lineHeight: 18 }}
                        />
                        <AppButton
                            onPress={navigateToSignIn}
                            pressableStyle={{ width: "100%" }}
                            text={{ idle: "I have an account" }}
                            color={{ idle: colors.darkGray }}
                            style={{ backgroundColor: colors.darkGray, height: 50 }}
                            textStyle={{ fontSize: 18, lineHeight: 18 }}
                        />
                    </>
                )}
                {isSignedIn && <SignOutButton />}
            </View>
        </View>
    );
}

const SettingLink = ({
    href,
    icon,
    subtitle,
    title,
    warning,
}: {
    href: string;
    icon: React.ComponentProps<typeof FontAwesome>["name"];
    title: string;
    subtitle: string;
    warning: boolean;
}) => {
    //@ts-ignore
    const redirect = () => router.push(href);

    return (
        <TouchableOpacity
            onPress={redirect}
            style={{
                height: 70,
                paddingHorizontal: 10,
                flexDirection: "row",
                borderBottomWidth: 1,
                borderColor: `${colors.line}40`,
                alignItems: "center",
                position: "relative",
                justifyContent: "space-between",
            }}>
            <View style={{ flexDirection: "row", gap: 20, alignItems: "center" }}>
                <View
                    style={{
                        backgroundColor: colors.softPurle,
                        width: 40,
                        height: 40,
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 10,
                    }}>
                    {/* @ts-ignore */}
                    <FontAwesome name={icon} size={22} color={colors.darkGray} />
                </View>
                <View style={{ gap: 6 }}>
                    <AppText fontSize={18} children={title} />
                    <AppText fontSize={12} children={subtitle} style={{ opacity: 0.7 }} />
                </View>
            </View>
            <ChevronRight color={colors.line} />
            {warning && (
                <View
                    style={{
                        position: "absolute",
                        top: 5,
                        left: 40,
                        backgroundColor: colors.darkGray,
                        width: 20,
                        height: 20,
                        borderRadius: 7,
                        justifyContent: "center",
                        alignItems: "center",
                    }}>
                    <FontAwesome name={"exclamation"} size={14} color={colors.unmarkedText} />
                </View>
            )}
        </TouchableOpacity>
    );
};

export default UserProfile;

const UserCard = () => {
    const { user } = useUser();

    const [showLoading, setShowLoading] = useState(false);

    const style = StyleSheet.create({
        container: { flexDirection: "row", gap: 15, alignItems: "center" },
        photo: { height: 60, width: 60, borderRadius: 30, backgroundColor: colors.darkGray },
        photoContainer: { position: "relative", justifyContent: "center", alignItems: "center" },
        loadingIndicator: { position: "absolute" },
        premiumStatus: { flexDirection: "row", gap: 5 },
    });

    const freeTrial = true;

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
            disabled={!isLoaded}
            onPress={handleSignOut}
            text={{ idle: "Sign Out", success: "Backup Successful", error: "Error Backing Up Data" }}
            color={{ idle: colors.line }}
            state={backupState}
            style={{ backgroundColor: colors.background }}
        />
    );
};

const getProString = (customerInfo: CustomerInfo) => {
    const identifier = customerInfo.activeSubscriptions[0];

    switch (identifier) {
        case "pro_annual_1:p1a":
            return "Annual billing";
        case "pro_monthly_1:p1m":
            return "Monthly billing";
        case "pro_lifetime":
            return "Pro forever";
        default:
            return "Pro";
    }
};
