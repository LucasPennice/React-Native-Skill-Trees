import AppText from "@/components/AppText";
import { colors } from "@/parameters";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useEffect, useState } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { PurchasesOffering, PurchasesPackage } from "react-native-purchases";
import Animated, { FadeIn, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { PRICE_CARD_HEIGHT, PRICE_CARD_SMALL_HEIGHT, restorePurchase } from "./functions";

const getDiscount = (puchasePackage: PurchasesPackage) => {
    if (Platform.OS === "android") {
        const subscriptionOptions = puchasePackage.product.subscriptionOptions;

        if (subscriptionOptions === null || subscriptionOptions.length === 0) return 0;

        const fullPrice = subscriptionOptions[0].fullPricePhase?.price.amountMicros;
        const discountPrice = subscriptionOptions[0].introPhase?.price.amountMicros;

        if (fullPrice === undefined || discountPrice === undefined || fullPrice === 0) return 0;

        return discountPrice / fullPrice;
    } else {
        throw new Error("getDiscount Dropdown product selector ios");
    }
};

const SECOND_IN_MILLISECONDS = 1000;

const december27 = 1703701420526;

function calculateTimeDifference(startingDate: number, limitDate: number) {
    const timeDifference = Math.abs(limitDate - startingDate);

    const hours = Math.floor(timeDifference / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

    return `${hours < 10 ? "0" : ""}${hours}:${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

const useDiscountString = (discount: boolean) => {
    const [remainingTime, setRemainingTime] = useState(calculateTimeDifference(new Date().getTime(), december27));

    useEffect(() => {
        if (!discount) return;

        const interval = setInterval(() => {
            setRemainingTime(calculateTimeDifference(new Date().getTime(), december27));
        }, SECOND_IN_MILLISECONDS);

        return () => clearInterval(interval);
    }, [discount]);

    return remainingTime;
};

const DropdownProductSelector = ({
    state,
    currentOffering,
    onRestorePurchase,
    setLoading,
}: {
    state: [string, (v: string) => void];
    currentOffering: PurchasesOffering;
    setLoading: (v: boolean) => void;
    onRestorePurchase: () => void;
}) => {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = state;

    const style = StyleSheet.create({
        container: { width: "100%", backgroundColor: colors.darkGray, borderRadius: 15, overflow: "hidden" },
        footerContainer: { width: "100%", flexDirection: "row", justifyContent: "space-between" },
    });

    const toggleOpen = () => setOpen((p) => !p);

    const monthlyPackage = currentOffering.availablePackages.find((p) => p.packageType === "MONTHLY");
    const annualPackage = currentOffering.availablePackages.find((p) => p.packageType === "ANNUAL");
    const lifetimePackage = currentOffering.availablePackages.find((p) => p.packageType === "LIFETIME");

    if (!monthlyPackage || !annualPackage || !lifetimePackage) throw new Error("monthly or annual package not found");

    const selectMonth = () => setSelected(monthlyPackage.product.identifier);
    const selectYear = () => setSelected(annualPackage.product.identifier);
    const selectLifetime = () => setSelected(lifetimePackage.product.identifier);

    const annualDiscount = getDiscount(annualPackage);
    const annualDiscountPrice = (annualDiscount * annualPackage.product.price).toFixed(2);

    const monthlyDiscount = getDiscount(monthlyPackage);
    const monthlyDiscountPrice = (monthlyDiscount * monthlyPackage.product.price).toFixed(2);

    const animatedHeight = useAnimatedStyle(() => {
        const totalCards = 3;
        //Annual card always says best value so we start with one
        let largeCards = 1;

        if (monthlyDiscount !== 0) largeCards += 1;

        return {
            height: withTiming(open ? largeCards * PRICE_CARD_HEIGHT + (totalCards - largeCards) * PRICE_CARD_SMALL_HEIGHT : PRICE_CARD_HEIGHT),
        };
    });

    const remainingTime = useDiscountString(monthlyDiscount !== 0 || annualDiscount !== 0);

    return (
        <>
            <Animated.View style={[style.container, animatedHeight]}>
                <RadialInput
                    border={open}
                    title={`Annual - ${annualPackage.product.currencyCode} ${annualDiscountPrice}`}
                    onPress={selectYear}
                    selected={selected === annualPackage.product.identifier}
                    subtitle={`${annualPackage.product.currencyCode} ${(parseFloat(annualDiscountPrice) / 12)
                        .toFixed(2)
                        .replace(".", ",")} per month, billed annually, 7 days free trial`}
                    bestValue
                    discount={{ fullPrice: annualPackage.product.priceString, remainingTime }}
                />
                {open && (
                    <Animated.View entering={FadeIn}>
                        <RadialInput
                            title={`Monthly - ${monthlyPackage.product.currencyCode} ${monthlyDiscountPrice}`}
                            onPress={selectMonth}
                            selected={selected === monthlyPackage.product.identifier}
                            subtitle={"Billed monthly"}
                            border={open}
                            discount={{ fullPrice: annualPackage.product.priceString, remainingTime }}
                        />
                        <RadialInput
                            title={`Lifetime - ${lifetimePackage.product.priceString}`}
                            onPress={selectLifetime}
                            selected={selected === lifetimePackage.product.identifier}
                            subtitle={"One time payment, yours forever"}
                            border={false}
                        />
                    </Animated.View>
                )}
            </Animated.View>
            <View style={style.footerContainer}>
                <TouchableOpacity style={{ paddingVertical: 15 }} onPress={restorePurchase(setLoading, onRestorePurchase, "Restore subscription")}>
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
    discount,
}: {
    selected: boolean;
    onPress: () => void;
    title: string;
    border: boolean;
    subtitle: string;
    bestValue?: true;
    discount?: {
        fullPrice: string;
        remainingTime: string;
    };
}) => {
    const displayTags = bestValue || discount;

    const style = StyleSheet.create({
        container: {
            width: "100%",
            height: displayTags ? PRICE_CARD_HEIGHT : PRICE_CARD_SMALL_HEIGHT,
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
        bestValue: {
            backgroundColor: `${colors.gold}30`,
            color: colors.gold,
            width: 90,
            paddingTop: 2,
            height: 25,
            textAlign: "center",
            verticalAlign: "middle",
            borderRadius: 5,
        },
        discount: {
            backgroundColor: colors.clearGray,
            flexDirection: "row",
            paddingTop: 2,
            paddingHorizontal: 8,
            height: 25,
            alignItems: "center",
            gap: 5,
            borderRadius: 5,
        },
    });

    return (
        <TouchableOpacity style={style.container} onPress={onPress}>
            <View style={{ flex: 1, height: PRICE_CARD_HEIGHT, gap: 9, justifyContent: "center" }}>
                {displayTags && (
                    <View style={{ flexDirection: "row", gap: 5 }}>
                        {bestValue && <AppText fontSize={12} style={style.bestValue} children={"BEST VALUE"} />}
                        {discount && (
                            <View style={style.discount}>
                                <AppText
                                    fontSize={12}
                                    style={{ textDecorationStyle: "solid", textDecorationLine: "line-through", opacity: 0.7 }}
                                    children={discount.fullPrice}
                                />
                                <AppText fontSize={14} children={discount.remainingTime} />
                            </View>
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
