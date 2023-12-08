import AppButton from "@/components/AppButton";
import AppText from "@/components/AppText";
import { colors } from "@/parameters";
import { HandleAlertContext, SubscriptionContext, mixpanel } from "app/_layout";
import { router, useNavigation } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import Purchases, { PurchasesOffering, PurchasesPackage } from "react-native-purchases";
import Animated, { Easing, FadeInDown, useAnimatedStyle, useDerivedValue, withTiming } from "react-native-reanimated";
import Svg, { Circle, Path, Rect, SvgProps } from "react-native-svg";

const { height } = Dimensions.get("window");

const SVG_DIMENSIONS = { width: 361, height: 361 };

const MIN_OFFER_CONTAINER_HEIGHT = 470;
const OFFER_CONTAINER_HEIGHT =
    height - SVG_DIMENSIONS.height / 1.25 > MIN_OFFER_CONTAINER_HEIGHT ? height - SVG_DIMENSIONS.height / 1.25 : MIN_OFFER_CONTAINER_HEIGHT;

const style = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.darkGray,
        alignItems: "center",
        justifyContent: "space-between",
        position: "relative",
        padding: 20,
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

    useEffect(() => {
        mixpanel.track("Paywall view v1.0");
    }, []);

    const openSuccessAlert = () =>
        open({ state: "success", subtitle: "To check your membership details visit your profile", title: "Congratulations" });

    useBlockGoBack();

    const annualPricePerWeek = ((currentOffering?.annual?.product.price ?? 0) / 12).toFixed(2);

    return (
        <View style={style.container}>
            <Header />

            {currentOffering && (
                <>
                    <Animated.View entering={animations.nthChildEntering(0)}>
                        <AppText
                            children={"Watch your progress in real time"}
                            fontSize={35}
                            style={{ fontFamily: "helveticaBold", textAlign: "center", marginBottom: 20 }}
                        />
                        <AppText children={"Keep moving forward with Skill Trees Pro"} fontSize={18} style={{ textAlign: "center" }} />
                    </Animated.View>

                    <ProductSelector currentOffering={currentOffering} selectedProduct={selected} setSelectedProduct={setSelected} />

                    <Animated.View entering={animations.nthChildEntering(2)} style={{ gap: 10, width: "100%" }}>
                        <AppButton
                            onPress={handlePurchase(currentOffering.availablePackages, selected, openSuccessAlert)}
                            text={{ idle: "CONTINUE" }}
                            style={{ backgroundColor: colors.accent, borderRadius: 30, height: 60 }}
                            textStyle={{ fontFamily: "helveticaBold", fontSize: 18, lineHeight: 60 }}
                        />

                        <AppText
                            children={`Only $${annualPricePerWeek} per week billed annually`}
                            fontSize={16}
                            style={{ textAlign: "center", opacity: 0.7 }}
                        />
                    </Animated.View>
                </>
            )}
        </View>
    );
}

const Header = () => {
    const style = StyleSheet.create({
        container: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" },
    });

    return (
        <View style={style.container}>
            <AppButton
                onPress={console.log}
                text={{ idle: "Exit" }}
                color={{ idle: "transparent" }}
                textStyle={{ fontSize: 16, lineHeight: 16, opacity: 0.4 }}
            />

            <PaywallLogo />

            <AppButton
                onPress={() => router.push("/support")}
                text={{ idle: "Help" }}
                color={{ idle: "transparent" }}
                textStyle={{ fontSize: 16, lineHeight: 16, opacity: 0.4 }}
            />
        </View>
    );
};

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
        <Animated.View entering={animations.nthChildEntering(1)} style={{ width: "100%" }}>
            <AppText children={"Special discount for [COUNTRY] users (80% off)"} fontSize={16} style={{ opacity: 0.4, marginBottom: 5 }} />
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

const PaywallLogo = (props: SvgProps) => (
    <Svg width={141} height={26} fill="none" {...props}>
        <Circle cx={19.981} cy={18.45} r={2.351} stroke="#fff" strokeWidth={0.894} />
        <Circle cx={11.5} cy={18.45} r={2.351} stroke="#fff" strokeWidth={0.894} />
        <Circle cx={3.019} cy={18.45} r={2.351} stroke="#fff" strokeWidth={0.894} />
        <Circle cx={11.5} cy={6.597} r={2.351} stroke="#fff" strokeWidth={0.894} />
        <Path stroke="#fff" strokeWidth={0.808} d="M11.532 9.352c0 6.549 8.481.763 8.481 6.549M11.468 9.374c0 6.51-8.476.758-8.476 6.51" />
        <Rect width={0.808} height={7.241} x={11.096} y={8.901} fill="#fff" rx={0.404} />
        <Path
            fill="#E6E8E6"
            d="M39.481 18.214c.78 0 1.413-.086 1.9-.258.923-.329 1.384-.94 1.384-1.835 0-.522-.229-.926-.687-1.213-.457-.279-1.177-.525-2.157-.74l-1.674-.376c-1.646-.372-2.783-.776-3.413-1.213-1.066-.73-1.599-1.87-1.599-3.423 0-1.417.515-2.594 1.546-3.531 1.03-.937 2.543-1.406 4.54-1.406 1.666 0 3.087.444 4.26 1.33 1.18.88 1.8 2.162 1.857 3.843H42.26c-.057-.952-.472-1.628-1.245-2.028-.515-.265-1.155-.398-1.921-.398-.852 0-1.531.172-2.04.516-.507.343-.761.822-.761 1.438 0 .565.25.987.751 1.266.322.186 1.009.404 2.06.655l2.727.655c1.194.286 2.096.668 2.704 1.148.945.744 1.417 1.82 1.417 3.23 0 1.446-.555 2.648-1.664 3.606-1.102.952-2.661 1.428-4.679 1.428-2.06 0-3.681-.469-4.862-1.406-1.18-.945-1.77-2.24-1.77-3.885h3.155c.1.722.297 1.263.59 1.62.537.651 1.456.977 2.758.977ZM58.885 20.5h-3.691l-2.802-5.001-1.266 1.32V20.5H48.12V4.734h3.005v8.522l3.81-4.4h3.788l-4.089 4.475 4.25 7.169Zm4.648-11.698V20.5H60.43V8.802h3.102Zm0-4.218v2.822H60.43V4.584h3.102Zm3.037.096h3.059V20.5h-3.06V4.68Zm6.117 0h3.06V20.5h-3.06V4.68Zm23.912 0v2.802h-4.733V20.5H88.54V7.482h-4.754V4.68h12.814Zm6.375 6.944c-1.23 0-2.057.401-2.479 1.202-.236.451-.354 1.145-.354 2.082V20.5h-3.08V8.802h2.919v2.039c.472-.78.884-1.313 1.234-1.6.573-.479 1.317-.718 2.232-.718.058 0 .104.003.14.01.043 0 .132.004.268.011v3.134a8.38 8.38 0 0 0-.88-.054Zm12.697 5.442c-.079.694-.44 1.398-1.084 2.114-1.002 1.137-2.404 1.706-4.207 1.706a5.93 5.93 0 0 1-3.939-1.438c-1.138-.959-1.707-2.518-1.707-4.68 0-2.024.512-3.577 1.535-4.657 1.03-1.08 2.365-1.62 4.003-1.62.973 0 1.85.182 2.63.547.78.365 1.424.94 1.932 1.728.458.694.754 1.499.89 2.415.079.536.111 1.309.097 2.318h-8.006c.043 1.173.411 1.996 1.105 2.468.422.294.93.44 1.524.44.63 0 1.141-.179 1.535-.536.214-.194.404-.462.569-.805h3.123Zm-3.027-3.585c-.05-.809-.297-1.42-.74-1.835-.437-.422-.981-.634-1.632-.634-.708 0-1.259.222-1.652.666-.387.444-.63 1.045-.73 1.803h4.754Zm15.262 3.585c-.079.694-.44 1.398-1.084 2.114-1.002 1.137-2.404 1.706-4.207 1.706a5.93 5.93 0 0 1-3.939-1.438c-1.138-.959-1.707-2.518-1.707-4.68 0-2.024.512-3.577 1.535-4.657 1.03-1.08 2.365-1.62 4.003-1.62.973 0 1.85.182 2.63.547.78.365 1.424.94 1.932 1.728.457.694.754 1.499.89 2.415.079.536.111 1.309.097 2.318h-8.006c.042 1.173.411 1.996 1.105 2.468.422.294.93.44 1.524.44.63 0 1.141-.179 1.535-.536.214-.194.404-.462.569-.805h3.123Zm-3.027-3.585c-.05-.809-.297-1.42-.74-1.835-.437-.422-.981-.634-1.632-.634-.708 0-1.259.222-1.653.666-.386.444-.629 1.045-.729 1.803h4.754Zm13.308-4.143c.916.587 1.442 1.596 1.578 3.027h-3.059c-.043-.394-.154-.705-.332-.934-.337-.415-.909-.622-1.718-.622-.665 0-1.141.103-1.427.31-.279.208-.419.452-.419.73 0 .351.151.605.451.763.301.164 1.363.447 3.188.848 1.216.286 2.128.719 2.736 1.298.601.587.902 1.32.902 2.2 0 1.16-.433 2.107-1.299 2.844-.858.73-2.189 1.095-3.992 1.095-1.839 0-3.198-.386-4.078-1.159-.873-.78-1.31-1.77-1.31-2.973h3.102c.064.544.204.93.418 1.16.38.407 1.081.611 2.104.611.601 0 1.077-.09 1.427-.268.358-.18.537-.448.537-.805a.868.868 0 0 0-.429-.784c-.286-.179-1.349-.486-3.188-.923-1.323-.329-2.257-.74-2.801-1.234-.544-.486-.816-1.188-.816-2.104 0-1.08.423-2.006 1.267-2.78.851-.78 2.046-1.169 3.584-1.169 1.46 0 2.651.29 3.574.87Z"
        />
    </Svg>
);
