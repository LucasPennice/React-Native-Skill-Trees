import AppButton from "@/components/AppButton";
import AppText from "@/components/AppText";
import DropdownProductSelector from "@/components/subscription/DropdownProductSelector";
import { BACKGROUND_COLOR, getSubscribeButtonText, handlePurchase } from "@/components/subscription/functions";
import { colors } from "@/parameters";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { HandleAlertContext, SubscriptionContext, mixpanel } from "app/_layout";
import { useNavigation } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";

const style = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BACKGROUND_COLOR,
        alignItems: "center",
        position: "relative",
    },
});

const useBlockGoBack = () => {
    const navigation = useNavigation();

    useEffect(() => {
        navigation.addListener("beforeRemove", (e) => {
            e.preventDefault();
            navigation.dispatch(e.data.action);
        });
    }, []);
};

function PaywallPage() {
    const [selected, setSelected] = useState<string>("pro_annual_1:p1a");
    const [loading, setLoading] = useState(false);

    const { currentOffering } = useContext(SubscriptionContext);
    const { open } = useContext(HandleAlertContext);

    useEffect(() => {
        mixpanel.track("Paywall view v1.0");
    }, []);

    const openSuccessAlert = () =>
        open({ state: "success", subtitle: "To check your membership details visit your profile", title: "Congratulations" });

    useBlockGoBack();

    return (
        <View style={style.container}>
            {currentOffering && (
                <View style={{ flex: 1, width: "100%", padding: 15 }}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={{ flex: 1, height: "100%" }}>
                            <AppText children={"How your free trial works"} fontSize={35} style={{ textAlign: "center" }} />
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
                            onPress={handlePurchase(
                                currentOffering.availablePackages.find((p) => p.identifier === selected)!,
                                openSuccessAlert,
                                setLoading,
                                "Pre onboarding paywall subscription v1.0"
                            )}
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

export default PaywallPage;
