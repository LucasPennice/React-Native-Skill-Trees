import AppButton from "@/components/AppButton";
import AppText from "@/components/AppText";
import DropdownProductSelector from "@/components/subscription/DropdownProductSelector";
import { BACKGROUND_COLOR, PRICE_CARD_HEIGHT, getSubscribeButtonText, handlePurchase } from "@/components/subscription/functions";
import { colors } from "@/parameters";
import { useAppDispatch } from "@/redux/reduxHooks";
import { completeCustomizeHomeTree, completeOnboardingExperienceSurvey } from "@/redux/slices/userVariablesSlice";
import useBlockGoBack from "@/useBlockGoBack";
import useSkipOnboarding from "@/useSkipOnboarding";
import useSubscriptionHandler from "@/useSubscriptionHandler";
import { useAuth } from "@clerk/clerk-expo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { HandleAlertContext, SubscriptionContext, mixpanel } from "app/_layout";
import * as NavigationBar from "expo-navigation-bar";
import { router } from "expo-router";
import { useCallback, useContext, useEffect, useState } from "react";
import { Dimensions, Platform, ScrollView, StyleSheet, View } from "react-native";
import { batch } from "react-redux";
import { HandleModalsContext } from "./_layout";

const { height } = Dimensions.get("window");

const style = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BACKGROUND_COLOR,
        alignItems: "center",
        position: "relative",
    },
});

const SCROLLABLE_SCREEN_SIZE = height - 155 - PRICE_CARD_HEIGHT;

const useIfProRedirectHome = () => {
    const { isProUser } = useSubscriptionHandler();

    useEffect(() => {
        if (isProUser === null) return;

        if (isProUser === true) router.push("/(app)/home");
    }, [isProUser]);
};

function PreOnboardingPaywallPage() {
    const [loading, setLoading] = useState(false);

    useIfProRedirectHome();

    const [selected, setSelected] = useState<string>("pro_annual_1:p1a");

    const { modal: setShowOnboarding } = useContext(HandleModalsContext);
    const { currentOffering } = useContext(SubscriptionContext);
    const { isSignedIn } = useAuth();
    const { open } = useContext(HandleAlertContext);

    useEffect(() => {
        mixpanel.track(`PAYWALL Pre Onboarding Paywall View <1.0>`);
        NavigationBar.setBackgroundColorAsync(BACKGROUND_COLOR);
    }, []);

    const skipOnboarding = useSkipOnboarding();

    const redirectHomeCongratulateAndStartOnboarding = useCallback(() => {
        open({ state: "success", subtitle: "To check your membership details visit your profile", title: "Congratulations" });

        if (isSignedIn === true) {
            skipOnboarding();
        } else {
            setShowOnboarding(true);
        }

        router.push("/home");
    }, [isSignedIn]);

    const redirectToSignIn = () => router.push("/auth/signIn");

    useBlockGoBack();

    const purchase = useCallback(() => {
        if (currentOffering === null) return;

        handlePurchase(
            currentOffering.availablePackages.find((p) => p.product.identifier === selected)!,
            redirectHomeCongratulateAndStartOnboarding,
            setLoading,
            `PAYWALL Pre Onboarding Paywall ${selected} Subscription <1.0>`
        )();
    }, [currentOffering, selected]);

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
                            onRestorePurchase={redirectToSignIn}
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
                            onPress={purchase}
                            text={{ idle: getSubscribeButtonText(selected) }}
                            style={{ backgroundColor: colors.accent, height: 60 }}
                            textStyle={{ fontSize: 20, lineHeight: 60, color: colors.white }}
                        />
                    </View>
                </View>
            )}
        </View>
    );
}

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

    const { modal: setShowOnboarding } = useContext(HandleModalsContext);

    const { isSignedIn } = useAuth();

    const dispatch = useAppDispatch();

    const redirectHome = useCallback(() => {
        if (isSignedIn === true) {
            batch(() => {
                dispatch(completeOnboardingExperienceSurvey());
                dispatch(completeCustomizeHomeTree());
            });
        } else {
            setShowOnboarding(true);
        }

        router.push("/home");
    }, [isSignedIn]);

    return (
        <View style={style.container}>
            <AppButton
                onPress={redirectHome}
                text={{ idle: "Close" }}
                color={{ idle: "transparent" }}
                style={{ width: 100, alignItems: "flex-start", backgroundColor: BACKGROUND_COLOR }}
                textStyle={{ fontSize: 16, lineHeight: 16, opacity: 0.3 }}
            />
        </View>
    );
};

export default PreOnboardingPaywallPage;
