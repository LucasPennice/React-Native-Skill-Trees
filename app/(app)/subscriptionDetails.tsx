import AppButton from "@/components/AppButton";
import AppText from "@/components/AppText";
import CrownIcon from "@/components/Icons/CrownIcon";
import { colors } from "@/parameters";
import { SubscriptionContext } from "app/_layout";
import { Redirect } from "expo-router";
import { useContext } from "react";
import { Linking, StyleSheet, View } from "react-native";
import { PACKAGE_TYPE } from "react-native-purchases";

const style = StyleSheet.create({
    container: { flex: 1, padding: 10, gap: 20 },
    infoContainer: { backgroundColor: colors.darkGray, padding: 20, borderRadius: 20, gap: 15 },
    row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});

function SubscriptionDetailsPage() {
    const { customerInfo, currentOffering } = useContext(SubscriptionContext);

    if (!customerInfo) throw new Error("customer info is null");
    if (customerInfo.managementURL === null) return <Redirect href={"/(app)/postOnboardingPaywall"} />;

    const redirectToManageSubscription = () => Linking.openURL(customerInfo.managementURL!);

    const subscriptionId = customerInfo.activeSubscriptions[0];
    const monthly = subscriptionId.includes("monthly");

    const price = currentOffering?.availablePackages.find((p) => p.packageType === (monthly ? PACKAGE_TYPE["MONTHLY"] : PACKAGE_TYPE["ANNUAL"]));

    const expirationDate = customerInfo.latestExpirationDate!;

    return (
        <View style={style.container}>
            <View style={style.infoContainer}>
                <View style={style.row}>
                    <AppText fontSize={16} children={"Plan"} />
                    <View
                        style={{
                            backgroundColor: colors.gold,
                            paddingHorizontal: 15,
                            paddingVertical: 10,
                            borderRadius: 15,
                            flexDirection: "row",
                            gap: 5,
                        }}>
                        <CrownIcon height={16} width={16} />
                        <AppText fontSize={16} children={"Pro"} style={{ color: "#000000" }} />
                    </View>
                </View>
                <View style={style.row}>
                    <AppText fontSize={16} children={`Billed ${monthly ? "Monthly" : "Annually"}`} />
                    <AppText fontSize={16} children={`${price ? price.product.priceString : "Loading..."}`} />
                </View>
                <View style={style.row}>
                    <AppText fontSize={16} children={"Billing Date"} />
                    <AppText fontSize={16} children={new Date(expirationDate).toLocaleDateString()} />
                </View>
            </View>

            <AppButton onPress={redirectToManageSubscription} text={{ idle: "Manage Subscription" }} color={{ idle: colors.darkGray }} />
        </View>
    );
}

export default SubscriptionDetailsPage;
