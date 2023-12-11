import AppText from "@/components/AppText";
import { colors } from "@/parameters";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { PurchasesOffering } from "react-native-purchases";
import Animated, { FadeIn, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { PRICE_CARD_HEIGHT, PRICE_CARD_SMALL_HEIGHT, restorePurchase } from "./functions";

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
                            subtitle={"Billed monthly"}
                            border={open}
                        />
                        <RadialInput
                            title={`Lifetime - US$ ${lifetimePackage.product.price}`}
                            onPress={selectLifetime}
                            selected={selected === lifetimePackage.product.identifier}
                            subtitle={"One time payment, your forever"}
                            border={false}
                        />
                    </Animated.View>
                )}
            </Animated.View>
            <View style={style.footerContainer}>
                <TouchableOpacity style={{ paddingVertical: 15 }} onPress={restorePurchase(setLoading, openSuccessAlert, "Restore subscription")}>
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
export default DropdownProductSelector;

const RadialInput = ({
    selected,
    onPress,
    title,
    subtitle,
    bestValue,
    border,
}: {
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
