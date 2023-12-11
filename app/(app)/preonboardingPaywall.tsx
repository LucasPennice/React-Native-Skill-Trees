import AppButton from "@/components/AppButton";
import AppText from "@/components/AppText";
import { colors } from "@/parameters";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { HandleAlertContext, SubscriptionContext, mixpanel } from "app/_layout";
import * as NavigationBar from "expo-navigation-bar";
import { router, useNavigation } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Dimensions, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import Purchases, { PurchasesOffering, PurchasesPackage } from "react-native-purchases";
import Animated, { FadeIn, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { HandleOnboardingModalContext } from "./_layout";

const { height } = Dimensions.get("window");

const BACKGROUND_COLOR = "#101111";

const style = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BACKGROUND_COLOR,
        alignItems: "center",
        position: "relative",
    },
});

const PRICE_CARD_HEIGHT = 140;
const PRICE_CARD_SMALL_HEIGHT = 100;

const handlePurchase =
    (availablePackages: PurchasesPackage[], entitlementId: string, openSuccessAlert: () => void, setLoading: (v: boolean) => void) => async () => {
        try {
            setLoading(true);

            const selectedPackage = availablePackages.find((p) => p.product.identifier === entitlementId);

            if (!selectedPackage) throw new Error(`Couldn't find ${entitlementId} in available packages`);

            await Purchases.purchasePackage(selectedPackage);

            openSuccessAlert();

            router.push("/(app)/home");
        } catch (e) {
            //@ts-ignore
            if (!e.userCancelled) mixpanel.track("purchaseError", { error: e });
        } finally {
            setLoading(false);
        }
    };

const restorePurchase = (setLoading: (v: boolean) => void, openSuccessAlert: () => void) => async () => {
    try {
        setLoading(true);
        const restore = await Purchases.restorePurchases();

        if (restore.activeSubscriptions.length !== 0) {
            openSuccessAlert();

            router.push("/(app)/home");
        }
    } catch (error) {
        //@ts-ignore
        mixpanel.track("purchaseError", { error });
    } finally {
        setLoading(false);
    }
};

const useBlockGoBack = () => {
    const navigation = useNavigation();

    useEffect(() => {
        navigation.addListener("beforeRemove", (e) => {
            e.preventDefault();
            navigation.dispatch(e.data.action);
        });
    }, []);
};

const SCROLLABLE_SCREEN_SIZE = height - 155 - PRICE_CARD_HEIGHT;

function PreOnboardingPaywallPage() {
    const [loading, setLoading] = useState(false);

    const [selected, setSelected] = useState<string>("pro_annual_1:p1a");

    const { currentOffering } = useContext(SubscriptionContext);
    const { open } = useContext(HandleAlertContext);

    useEffect(() => {
        mixpanel.track("Paywall view v1.0");
        NavigationBar.setBackgroundColorAsync(BACKGROUND_COLOR);
    }, []);

    const openSuccessAlert = () =>
        open({ state: "success", subtitle: "To check your membership details visit your profile", title: "Congratulations" });

    useBlockGoBack();

    const getSubscribeButtonText = () => {
        if (selected === "pro_lifetime") return "Start your journey, forever";
        if (selected === "pro_monthly_1:p1m") return "Start your journey";
        return "Start your 7 days free trial";
    };

    return (
        <View style={style.container}>
            <Header />

            {currentOffering && (
                <View style={{ flex: 1, width: "100%", padding: 15 }}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={{ flex: 1, height: SCROLLABLE_SCREEN_SIZE }}>
                            <AppText children={"How your free trial works"} fontSize={35} style={{ textAlign: "center" }} />

                            <TrialExplanation />
                        </View>
                        <DropdownProductSelector
                            state={[selected, setSelected]}
                            currentOffering={currentOffering}
                            setLoading={setLoading}
                            openSuccessAlert={openSuccessAlert}
                        />

                        <View
                            style={{
                                flexDirection: "row",
                                gap: 5,
                                borderWidth: 1,
                                borderColor: colors.line,
                                padding: 5,
                                width: 220,
                                justifyContent: "center",
                                alignItems: "center",
                                borderRadius: 5,
                                alignSelf: "center",
                                marginVertical: 30,
                            }}>
                            <FontAwesome name={"shield"} size={14} color={colors.line} />
                            <AppText
                                children={`SECURED WITH ${Platform.OS === "android" ? "PLAY STORE" : "APPLE STORE"}`}
                                fontSize={12}
                                style={{ color: colors.line }}
                            />
                        </View>
                    </ScrollView>
                    <View style={{ paddingTop: 10 }}>
                        <AppButton
                            disabled={loading}
                            state={loading ? "loading" : "idle"}
                            color={{ loading: colors.accent }}
                            onPress={handlePurchase(currentOffering.availablePackages, selected, openSuccessAlert, setLoading)}
                            text={{ idle: getSubscribeButtonText() }}
                            style={{ backgroundColor: colors.accent, height: 60 }}
                            textStyle={{ fontSize: 20, lineHeight: 60, color: colors.white }}
                        />
                    </View>
                </View>
            )}
        </View>
    );
}

const DropdownProductSelector = ({
    state,
    currentOffering,
    openSuccessAlert,
    setLoading,
}: {
    state: [string, (v: string) => void];
    currentOffering: PurchasesOffering;
    setLoading: (v: boolean) => void;
    openSuccessAlert: () => void;
}) => {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = state;

    const style = StyleSheet.create({
        container: { width: "100%", backgroundColor: colors.darkGray, borderRadius: 15 },
        footerContainer: { width: "100%", flexDirection: "row", justifyContent: "space-between" },
    });

    const toggleOpen = () => setOpen((p) => !p);

    const animatedHeight = useAnimatedStyle(() => {
        return { height: withTiming(open ? PRICE_CARD_HEIGHT + 2 * PRICE_CARD_SMALL_HEIGHT : PRICE_CARD_HEIGHT) };
    });

    const monthlyPackage = currentOffering.availablePackages.find((p) => p.packageType === "MONTHLY");
    const annualPackage = currentOffering.availablePackages.find((p) => p.packageType === "ANNUAL");
    const lifetimePackage = currentOffering.availablePackages.find((p) => p.packageType === "LIFETIME");

    if (!monthlyPackage || !annualPackage || !lifetimePackage) throw new Error("monthly or annual package not found");

    const selectMonth = () => setSelected(monthlyPackage.product.identifier);
    const selectYear = () => setSelected(annualPackage.product.identifier);
    const selectLifetime = () => setSelected(lifetimePackage.product.identifier);

    return (
        <>
            <Animated.View style={[style.container, animatedHeight]}>
                <RadialInput
                    border={open}
                    title={`Annual - US$ ${annualPackage.product.price}`}
                    onPress={selectYear}
                    selected={selected === annualPackage.product.identifier}
                    subtitle={`US$ ${(annualPackage.product.price / 12).toFixed(2)} per month, billed annually, 7 days free trial`}
                    bestValue
                    regionalPrice
                />
                {open && (
                    <Animated.View entering={FadeIn}>
                        <RadialInput
                            title={`Monthly - US$ ${monthlyPackage.product.price}`}
                            onPress={selectMonth}
                            selected={selected === monthlyPackage.product.identifier}
                            regionalPrice
                            subtitle={"Billed monthly"}
                            border={open}
                        />
                        <RadialInput
                            title={`Lifetime - US$ ${lifetimePackage.product.price}`}
                            regionalPrice
                            onPress={selectLifetime}
                            selected={selected === lifetimePackage.product.identifier}
                            subtitle={"One time payment, your forever"}
                            border={false}
                        />
                    </Animated.View>
                )}
            </Animated.View>
            <View style={style.footerContainer}>
                <TouchableOpacity style={{ paddingVertical: 15 }} onPress={restorePurchase(setLoading, openSuccessAlert)}>
                    <AppText fontSize={14} children={"Restore Purchase"} style={{ color: colors.softPurle }} />
                </TouchableOpacity>
                <TouchableOpacity style={{ paddingVertical: 15, flexDirection: "row", gap: 5 }} onPress={toggleOpen}>
                    <AppText fontSize={14} children={"More Subscription Plans"} style={{ color: colors.softPurle }} />
                    <FontAwesome name={open ? "chevron-up" : "chevron-down"} size={12} color={colors.softPurle} />
                </TouchableOpacity>
            </View>
        </>
    );
};

const TrialExplanation = () => {
    const style = StyleSheet.create({
        container: {
            flex: 1,
            marginVertical: 20,
        },
        block: {
            height: 80,
            flexDirection: "row",
            gap: 15,
            alignItems: "center",
        },
        arrow: { flex: 1, position: "relative" },
        icon: {
            gap: 3,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: `${colors.line}20`,
            width: 60,
            height: 60,
            borderRadius: 15,
        },
    });

    return (
        <View style={style.container}>
            <View style={style.block}>
                <View style={style.icon}>
                    <AppText fontSize={10} children={"TODAY"} style={{ opacity: 0.5 }} />
                    <FontAwesome name={"unlock"} size={24} color={colors.white} />
                </View>

                <View style={{ gap: 3, flex: 1 }}>
                    <AppText fontSize={24} children={"Today"} style={{}} />
                    <AppText fontSize={16} children={"Start your personal growth journey."} style={{}} />
                </View>
            </View>
            <View style={style.arrow}>
                <View style={{ width: 3, height: "100%", backgroundColor: `${colors.line}20`, left: 28 }} />
            </View>
            <View style={style.block}>
                <View style={style.icon}>
                    <AppText fontSize={10} children={"DAY 6"} style={{ opacity: 0.5 }} />
                    <FontAwesome name={"clock-o"} size={24} color={colors.white} />
                </View>

                <View style={{ gap: 3, flex: 1 }}>
                    <AppText fontSize={24} children={"In 6 Days"} style={{}} />
                    <AppText fontSize={16} children={"You'll get a reminder that your trial is about to end."} style={{}} />
                </View>
            </View>
            <View style={style.arrow}>
                <View style={{ width: 3, height: "100%", backgroundColor: `${colors.line}20`, left: 28 }} />
            </View>
            <View style={style.block}>
                <View style={style.icon}>
                    <AppText fontSize={10} children={"DAY 7"} style={{ opacity: 0.5 }} />
                    <FontAwesome name={"check"} size={24} color={colors.white} />
                </View>

                <View style={{ gap: 3, flex: 1 }}>
                    <AppText fontSize={24} children={"In 7 Days"} style={{}} />
                    <AppText fontSize={16} children={"Full access starts. Cancel anytime before."} style={{}} />
                </View>
            </View>
        </View>
    );
};

const RadialInput = ({
    selected,
    onPress,
    title,
    subtitle,
    bestValue,
    border,
}: // regionalPrice,
{
    selected: boolean;
    onPress: () => void;
    title: string;
    border: boolean;
    subtitle: string;
    bestValue?: true;
    regionalPrice?: true;
}) => {
    const style = StyleSheet.create({
        container: {
            width: "100%",
            height: bestValue ? PRICE_CARD_HEIGHT : PRICE_CARD_SMALL_HEIGHT,
            alignItems: "center",
            gap: 8,
            paddingHorizontal: 15,
            borderBottomWidth: border ? 1 : 0,
            borderColor: `${colors.line}80`,
            flexDirection: "row",
        },
        selectedIndicator: {
            width: 35,
            height: 35,
            borderRadius: 30,
            borderWidth: 2,
            backgroundColor: colors.line,
            justifyContent: "center",
            alignItems: "center",
        },
    });

    const displayTags = bestValue;
    // const displayTags = regionalPrice || bestValue;

    return (
        <TouchableOpacity style={style.container} onPress={onPress}>
            <View style={{ flex: 1, height: PRICE_CARD_HEIGHT, gap: 9, justifyContent: "center" }}>
                {displayTags && (
                    <View style={{ flexDirection: "row", gap: 5 }}>
                        {bestValue && (
                            <AppText
                                fontSize={12}
                                style={{
                                    backgroundColor: `${colors.gold}30`,
                                    color: colors.gold,
                                    width: 90,
                                    paddingTop: 2,
                                    height: 25,
                                    textAlign: "center",
                                    verticalAlign: "middle",
                                    borderRadius: 5,
                                }}
                                children={"BEST VALUE"}
                            />
                        )}
                        {/* {regionalPrice && (
                            <AppText
                                fontSize={12}
                                style={{
                                    backgroundColor: `${colors.softPurle}30`,
                                    color: colors.softPurle,
                                    width: 150,
                                    paddingTop: 2,
                                    height: 25,
                                    textAlign: "center",
                                    verticalAlign: "middle",
                                    borderRadius: 5,
                                }}
                                children={"REGIONAL DISCOUNT"}
                            />
                        )} */}
                    </View>
                )}
                <AppText fontSize={22} children={title} />
                <AppText fontSize={14} style={{ opacity: 0.5 }} children={subtitle} />
            </View>
            <View style={{ width: 60, alignItems: "center" }}>
                <View
                    style={[
                        style.selectedIndicator,
                        { backgroundColor: selected ? colors.softPurle : "transparent", borderColor: selected ? colors.softPurle : colors.line },
                    ]}>
                    {selected && <FontAwesome name={"check"} size={16} color={colors.darkGray} />}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const Header = () => {
    const style = StyleSheet.create({
        container: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            paddingHorizontal: 20,
            paddingTop: 10,
        },
    });

    const setShowOnboarding = useContext(HandleOnboardingModalContext);

    const redirectToLogin = () => router.push("/logIn");
    const redirectToHome = () => {
        setShowOnboarding(true);
        router.push("/home");
    };

    return (
        <View style={style.container}>
            <AppButton
                onPress={redirectToLogin}
                text={{ idle: "Log In" }}
                color={{ idle: "transparent" }}
                style={{ width: 100, alignItems: "flex-start", backgroundColor: BACKGROUND_COLOR }}
                textStyle={{ fontSize: 16, lineHeight: 16, opacity: 0.3 }}
            />

            <AppButton
                onPress={redirectToHome}
                text={{ idle: "Close" }}
                color={{ idle: "transparent" }}
                style={{ width: 100, alignItems: "flex-end", backgroundColor: BACKGROUND_COLOR }}
                textStyle={{ fontSize: 16, lineHeight: 16, opacity: 0.3 }}
            />
        </View>
    );
};

export default PreOnboardingPaywallPage;
