import AppButton from "@/components/AppButton";
import AppText from "@/components/AppText";
import DropdownProductSelector from "@/components/subscription/DropdownProductSelector";
import { BACKGROUND_COLOR, getSubscribeButtonText, handlePurchase } from "@/components/subscription/functions";
import { colors } from "@/parameters";
import { useAppDispatch, useAppSelector } from "@/redux/reduxHooks";
import { selectUserVariables, updateLastPaywallShowDate } from "@/redux/slices/userVariablesSlice";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { HandleAlertContext, SubscriptionContext, mixpanel } from "app/_layout";
import { router } from "expo-router";
import { useCallback, useContext, useEffect, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import Svg, { Path, SvgProps } from "react-native-svg";
import { HandleModalsContext } from "./_layout";

const style = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BACKGROUND_COLOR,
        alignItems: "center",
        position: "relative",
        padding: 20,
        paddingTop: 0,
    },
});

const { height } = Dimensions.get("window");

const useHandleGoBack = () => {
    const { exitPaywallSurvey, nthAppOpen } = useAppSelector(selectUserVariables);
    const { openPaywallSurvey } = useContext(HandleModalsContext);

    const goBack = useCallback(() => {
        router.push("/(app)/home");

        if (exitPaywallSurvey === true) return;
        if (nthAppOpen === 0) return;

        openPaywallSurvey();
    }, [exitPaywallSurvey, nthAppOpen]);

    return goBack;
};

function PostOnboardingPaywall() {
    const [selected, setSelected] = useState<string>("pro_annual_1:p1a");
    const [loading, setLoading] = useState(false);

    const { currentOffering } = useContext(SubscriptionContext);
    const { open } = useContext(HandleAlertContext);

    const dispatch = useAppDispatch();

    useEffect(() => {
        mixpanel.track("PAYWALL Post Onboarding Paywall View <1.0>");
        dispatch(updateLastPaywallShowDate());
    }, []);

    const openSuccessAlert = () =>
        open({ state: "success", subtitle: "To check your membership details visit your profile", title: "Congratulations" });

    const back = useHandleGoBack();

    const purchase = useCallback(() => {
        if (currentOffering === null) return;

        handlePurchase(
            currentOffering.availablePackages.find((p) => p.product.identifier === selected)!,
            openSuccessAlert,
            setLoading,
            `PAYWALL Post Onboarding Paywall ${selected} Subscription <1.0>`
        )();
    }, [currentOffering, selected]);

    return (
        <View style={style.container}>
            <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center", height: 40, justifyContent: "flex-start", width: "100%", paddingTop: 10 }}
                onPress={back}>
                <View
                    style={{
                        height: 30,
                        width: 30,
                        borderRadius: 30,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: colors.clearGray,
                        opacity: 0.8,
                    }}>
                    <FontAwesome name={"close"} size={18} color={colors.background} />
                </View>
            </TouchableOpacity>

            {currentOffering && (
                <View style={{ flex: 1, width: "100%" }}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={{ flex: 1, height: height - 300 }}>
                            <View>
                                <AppText
                                    children={"Go Premium!"}
                                    fontSize={42}
                                    style={{ textAlign: "center", marginBottom: 10, fontFamily: "helveticaBold" }}
                                />
                                <AppText
                                    children={"Unlock the full potential of Skill Trees."}
                                    fontSize={24}
                                    style={{ textAlign: "center", marginBottom: 25, opacity: 0.8 }}
                                />
                            </View>

                            <Checklist />
                        </View>
                        <DropdownProductSelector
                            state={[selected, setSelected]}
                            currentOffering={currentOffering}
                            setLoading={setLoading}
                            openSuccessAlert={openSuccessAlert}
                        />
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

const Checklist = () => {
    return (
        <View style={{ gap: 25, flex: 1, justifyContent: "center", marginBottom: 25 }}>
            <View style={{ flexDirection: "row", gap: 20 }}>
                <FontAwesome name={"check-circle"} size={24} color={colors.unmarkedText} />
                <View style={{ gap: 4 }}>
                    <AppText children={"Organize your whole life"} fontSize={18} style={{ fontFamily: "helveticaBold" }} />
                    <AppText
                        children={"Give shape to your objectives. Express your creativity and visualize your path forward"}
                        fontSize={16}
                        style={{ opacity: 0.5 }}
                    />
                </View>
            </View>
            <View style={{ flexDirection: "row", gap: 20 }}>
                <FontAwesome name={"check-circle"} size={24} color={colors.unmarkedText} />
                <View style={{ gap: 4 }}>
                    <AppText children={"Easy to stay on track"} fontSize={18} style={{ fontFamily: "helveticaBold" }} />
                    <AppText children={"You immediately know what to work on next. It only takes a glance"} fontSize={16} style={{ opacity: 0.5 }} />
                </View>
            </View>
            <View style={{ flexDirection: "row", gap: 20 }}>
                <FontAwesome name={"check-circle"} size={24} color={colors.unmarkedText} />
                <View style={{ gap: 4 }}>
                    <AppText children={"See the progress as it happens"} fontSize={18} style={{ fontFamily: "helveticaBold" }} />
                    <AppText
                        children={"Take a look at your home tree and feel proud of how far you've come"}
                        fontSize={16}
                        style={{ opacity: 0.5 }}
                    />
                </View>
            </View>
        </View>
    );
};

export default PostOnboardingPaywall;
