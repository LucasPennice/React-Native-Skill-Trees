import AppButton from "@/components/AppButton";
import AppText from "@/components/AppText";
import ChevronRight from "@/components/Icons/ChevronRight";
import { colors } from "@/parameters";
import { useAppSelector } from "@/redux/reduxHooks";
import { selectSyncSlice } from "@/redux/slices/syncSlice";
import { useUser } from "@clerk/clerk-expo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { SubscriptionContext } from "app/_layout";
import * as Application from "expo-application";
import { router } from "expo-router";
import { useContext } from "react";
import { Linking, StyleSheet, TouchableOpacity, View } from "react-native";
import { CustomerInfo } from "react-native-purchases";
import { HandleModalsContext } from "./_layout";

const style = StyleSheet.create({
    container: { flex: 1, padding: 15, gap: 20 },
    settingContainer: { flex: 1, gap: 15 },
    versionText: { textAlign: "center", color: colors.line, marginVertical: 10 },
});

const millisecondsToHours = 1000 * 60 * 60;
function UserProfile() {
    const { isSignedIn, user } = useUser();
    const { isProUser, customerInfo } = useContext(SubscriptionContext);
    const { openWhatsNewModal } = useContext(HandleModalsContext);

    const { lastUpdateUTC_Timestamp } = useAppSelector(selectSyncSlice);

    const hoursSinceLastUpdate = parseInt(`${(new Date().getTime() - lastUpdateUTC_Timestamp) / millisecondsToHours}`);

    const navigateToSignIn = () => router.push("/(app)/auth/signIn");
    const navigateToSignUp = () => router.push("/(app)/auth/signUp");

    const navigateToDiscordLink = async () => {
        const DISCORD_SERVER_INVITE_LINK = "https://discord.com/invite/ZHENer9yAW";
        Linking.openURL(DISCORD_SERVER_INVITE_LINK);
    };

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

                <AppText fontSize={16} children={"DISCOVER"} style={{ marginTop: 10, opacity: 0.8 }} />

                <InsightButton icon={"magic"} onPress={openWhatsNewModal} title={"What's new in Skill Trees"} />

                {isProUser === true && <InsightButton icon={"tree"} onPress={navigateToDiscordLink} title={"Join our Discord Server"} />}
            </View>

            <View>
                <AppText fontSize={14} children={`Version ${Application.nativeApplicationVersion}`} style={style.versionText} />

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

const InsightButton = ({
    onPress,
    icon,
    title,
    isLink,
}: {
    onPress: () => void;
    icon: React.ComponentProps<typeof FontAwesome>["name"];
    title: string;
    isLink?: true;
}) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                height: 50,
                paddingHorizontal: 10,
                flexDirection: "row",
                borderBottomWidth: 1,
                borderColor: `${colors.line}40`,
                alignItems: "center",
                position: "relative",
                justifyContent: "space-between",
            }}>
            <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                <View
                    style={{
                        backgroundColor: colors.clearGray,
                        width: 35,
                        height: 35,
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 10,
                    }}>
                    <FontAwesome name={icon} size={16} color={colors.white} />
                </View>

                <AppText fontSize={18} children={title} style={{ opacity: 0.9 }} />
            </View>
            {isLink && <ChevronRight color={colors.line} />}
        </TouchableOpacity>
    );
};

export default UserProfile;

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
