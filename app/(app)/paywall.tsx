import AppButton from "@/components/AppButton";
import AppText from "@/components/AppText";
import { colors } from "@/parameters";
import { HandleAlertContext, SubscriptionContext, mixpanel } from "app/_layout";
import PaywallSvg from "assets/PaywallSvg";
import { router, useNavigation } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Alert, Dimensions, Pressable, StyleSheet, View } from "react-native";
import Purchases, { PurchasesOffering, PurchasesPackage } from "react-native-purchases";
import Animated, { Easing, FadeInDown, useAnimatedStyle, useDerivedValue, withTiming } from "react-native-reanimated";
import Svg, { Circle, Path, SvgProps } from "react-native-svg";

const { height } = Dimensions.get("window");

const SVG_DIMENSIONS = { width: 361, height: 361 };

const MIN_OFFER_CONTAINER_HEIGHT = 470;
const OFFER_CONTAINER_HEIGHT =
    height - SVG_DIMENSIONS.height / 1.25 > MIN_OFFER_CONTAINER_HEIGHT ? height - SVG_DIMENSIONS.height / 1.25 : MIN_OFFER_CONTAINER_HEIGHT;

const style = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFFFFF", alignItems: "center", position: "relative" },
    offerContainer: {
        position: "absolute",
        justifyContent: "space-between",
        bottom: 0,
        backgroundColor: colors.darkGray,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingTop: 25,
        width: "100%",
        height: OFFER_CONTAINER_HEIGHT,
    },
});

const animationConstants = {
    easing: Easing.bezierFn(0.83, 0, 0.17, 1),
    offerContainerEnteringDuration: 1000,
    childEnteringDuration: 800,
    baseChildrenDelay: 900,
    nthChildDelay: (n: number) => 900 + 100 * (n - 1),
};

const animations = {
    offerContainEntering: FadeInDown.withInitialValues({ transform: [{ translateY: OFFER_CONTAINER_HEIGHT }] })
        .duration(animationConstants.offerContainerEnteringDuration)
        .easing(animationConstants.easing),
    nthChildEntering: (n: number) =>
        FadeInDown.easing(animationConstants.easing)
            .withInitialValues({ transform: [{ translateY: 80 }] })
            .delay(animationConstants.nthChildDelay(n))
            .duration(animationConstants.childEnteringDuration),
};

const handlePurchase = (availablePackages: PurchasesPackage[], entitlementId: string, openSuccessAlert: () => void) => async () => {
    try {
        const selectedPackage = availablePackages.find((p) => p.product.identifier === entitlementId);

        if (!selectedPackage) throw new Error(`Couldn't find ${entitlementId} in available packages`);

        await Purchases.purchasePackage(selectedPackage);

        openSuccessAlert();

        router.push("/(app)/home");
    } catch (e) {
        //@ts-ignore
        if (!e.userCancelled) mixpanel.track("purchaseError", { error: e });
    }
};

const handleRestore = async () => {
    try {
        await Purchases.restorePurchases();
    } catch (e) {
        mixpanel.track("purchaseError", { error: e });
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

function PaywallPage() {
    const [selected, setSelected] = useState<string>("pro_annual_1:p1a");

    const { currentOffering } = useContext(SubscriptionContext);
    const { open } = useContext(HandleAlertContext);

    const openSuccessAlert = () =>
        open({ state: "success", subtitle: "To check your membership details visit your profile", title: "Congratulations" });

    useBlockGoBack();

    return (
        <View style={style.container}>
            <PaywallSvg width={SVG_DIMENSIONS.width} height={SVG_DIMENSIONS.height} />

            {currentOffering && (
                <Animated.View entering={animations.offerContainEntering} style={style.offerContainer}>
                    <Animated.View entering={animations.nthChildEntering(0)}>
                        <AppText
                            children={"Keep moving forward with Skill Trees Pro"}
                            fontSize={30}
                            style={{ color: "#FFFFFF", fontFamily: "helveticaBold", textAlign: "center", marginBottom: 20 }}
                        />
                        <AppText children={"And watch your future take shape in real time"} fontSize={18} style={{ textAlign: "center" }} />
                    </Animated.View>

                    <ProductSelector currentOffering={currentOffering} selectedProduct={selected} setSelectedProduct={setSelected} />

                    <Animated.View entering={animations.nthChildEntering(2)}>
                        <AppButton
                            onPress={handlePurchase(currentOffering.availablePackages, selected, openSuccessAlert)}
                            text={{ idle: "CONTINUE" }}
                            style={{ backgroundColor: colors.accent, borderRadius: 30, height: 60 }}
                            textStyle={{ fontFamily: "helveticaBold", fontSize: 18, lineHeight: 60 }}
                        />
                        <AppButton
                            onPress={handleRestore}
                            text={{ idle: "Restore" }}
                            color={{ idle: "transparent" }}
                            textStyle={{ fontSize: 16, lineHeight: 16, opacity: 0.5 }}
                        />
                    </Animated.View>
                </Animated.View>
            )}
        </View>
    );
}

export default PaywallPage;

const ProductSelector = ({
    currentOffering,
    setSelectedProduct,
    selectedProduct,
}: {
    currentOffering: PurchasesOffering;
    setSelectedProduct: (productId: string) => void;
    selectedProduct: string;
}) => {
    const monthlyPackage = currentOffering.availablePackages.find((p) => p.packageType === "MONTHLY");
    const annualPackage = currentOffering.availablePackages.find((p) => p.packageType === "ANNUAL");

    if (!monthlyPackage || !annualPackage) throw new Error("monthly or annual package not found");

    const selectMonth = () => setSelectedProduct(monthlyPackage.product.identifier);
    const selectYear = () => setSelectedProduct(annualPackage.product.identifier);

    return (
        <Animated.View entering={animations.nthChildEntering(1)}>
            <AppText children={"Regional discount applied (80% off) - USD currency"} fontSize={16} style={{ opacity: 0.4, marginBottom: 5 }} />
            <View style={{ gap: 18 }}>
                <Product
                    selected={selectedProduct === monthlyPackage.product.identifier}
                    data={{ name: monthlyPackage.packageType, discountedPriceString: null, priceString: `$${monthlyPackage.product.price}/mo` }}
                    onPress={selectMonth}
                />
                <Product
                    selected={selectedProduct === annualPackage.product.identifier}
                    data={{
                        name: annualPackage.packageType,
                        discountedPriceString: null,
                        priceString: `$${annualPackage.product.price}/yr ($${(annualPackage.product.price / 12).toFixed(2)}/mo)`,
                    }}
                    onPress={selectYear}
                />
            </View>
        </Animated.View>
    );
};

type ProductProps = {
    selected: boolean;
    onPress: () => void;
    data: {
        name: string;
        discountedPriceString: string | null;
        priceString: string | null;
    };
};

const Product = ({ selected, onPress, data }: ProductProps) => {
    const style = StyleSheet.create({
        container: {
            width: "100%",
            height: 80,
            borderWidth: 2,
            justifyContent: "center",
            gap: 8,
            borderRadius: 15,
            paddingHorizontal: 20,
        },
        row: {
            flexDirection: "row",
            alignItems: "center",
        },
    });

    const selectedSV = useDerivedValue(() => selected);

    const animatedContainerStyles = useAnimatedStyle(() => {
        return {
            backgroundColor: withTiming(selectedSV.value ? "#FFFFFF" : colors.darkGray),
            borderColor: withTiming(selectedSV.value ? "#FFFFFF" : "#515053"),
        };
    });

    const animatedTextColor = useAnimatedStyle(() => {
        return { color: withTiming(selectedSV.value ? "#000000" : colors.white) };
    });

    return (
        <Pressable onPress={onPress}>
            <Animated.View style={[style.container, animatedContainerStyles]}>
                <View style={style.row}>
                    <SelectedProductIcon fill={selected ? "#000000" : colors.white} stroke={selected ? "#FFFFFF" : colors.white} />
                    <Animated.Text
                        allowFontScaling={false}
                        style={[
                            { fontFamily: "helvetica", fontSize: 18, lineHeight: 18, marginLeft: 4, paddingTop: 2, textTransform: "capitalize" },
                            animatedTextColor,
                        ]}
                        children={data.name}
                    />
                </View>
                <View style={style.row}>
                    {data.discountedPriceString && (
                        <Animated.Text
                            allowFontScaling={false}
                            style={[
                                {
                                    fontFamily: "helvetica",
                                    fontSize: 16,
                                    lineHeight: 16,
                                    marginRight: 5,
                                    opacity: 0.6,
                                    textDecorationLine: "line-through",
                                },
                                animatedTextColor,
                            ]}
                            children={data.discountedPriceString}
                        />
                    )}
                    <Animated.Text
                        allowFontScaling={false}
                        style={[{ fontFamily: "helvetica", fontSize: 16, lineHeight: 16 }, animatedTextColor]}
                        children={data.priceString}
                    />
                </View>
            </Animated.View>
        </Pressable>
    );
};

const SelectedProductIcon = (props: SvgProps) => {
    return (
        <Svg width={22} height={22} fill="none" {...props}>
            <Circle cx={11} cy={11} r={10} fill={props.fill} />
            <Path
                fill={props.stroke}
                d="M15.79 7.353c.28.279.28.732 0 1.01l-5.714 5.715a.715.715 0 0 1-1.011 0l-2.857-2.857a.715.715 0 0 1 1.01-1.011l2.353 2.35 5.21-5.207a.715.715 0 0 1 1.011 0h-.002Z"
            />
        </Svg>
    );
};
