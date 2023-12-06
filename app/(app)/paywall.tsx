import AppButton from "@/components/AppButton";
import AppText from "@/components/AppText";
import { colors } from "@/parameters";
import PaywallSvg from "assets/PaywallSvg";
import { useEffect, useState } from "react";
import { Dimensions, Pressable, StatusBar, StyleSheet, View } from "react-native";
import Animated, { Easing, FadeInDown, useAnimatedStyle, useDerivedValue, withTiming } from "react-native-reanimated";
import Svg, { Circle, Path, SvgProps } from "react-native-svg";

const { height } = Dimensions.get("window");

const SVG_DIMENSIONS = { width: 361, height: 361 };

const OFFER_CONTAINER_HEIGHT = height - SVG_DIMENSIONS.height / 1.25;

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

const DELAY = 900;
const DELAY_P = 100;

function PaywallPage() {
    useEffect(() => {}, []);

    return (
        <View style={style.container}>
            <StatusBar barStyle={"light-content"} backgroundColor={"#FFFFFF"} />

            <PaywallSvg width={SVG_DIMENSIONS.width} height={SVG_DIMENSIONS.height} />

            <Animated.View
                entering={FadeInDown.withInitialValues({ transform: [{ translateY: OFFER_CONTAINER_HEIGHT }] })
                    .duration(1000)
                    .easing(Easing.bezierFn(0.83, 0, 0.17, 1))}
                style={style.offerContainer}>
                <Animated.View
                    entering={FadeInDown.easing(Easing.bezierFn(0.83, 0, 0.17, 1))
                        .withInitialValues({ transform: [{ translateY: 80 }] })
                        .delay(DELAY)
                        .duration(800)}>
                    <AppText
                        children={"Keep moving forward with Skill Trees Pro"}
                        fontSize={30}
                        style={{ color: "#FFFFFF", fontFamily: "helveticaBold", textAlign: "center", marginBottom: 20 }}
                    />
                    <AppText children={"And watch your future take shape in real time"} fontSize={18} style={{ textAlign: "center" }} />
                </Animated.View>

                <ProductSelector />

                <Animated.View
                    entering={FadeInDown.easing(Easing.bezierFn(0.83, 0, 0.17, 1))
                        .withInitialValues({ transform: [{ translateY: 80 }] })
                        .delay(DELAY + 2 * DELAY_P)
                        .duration(800)}>
                    <AppButton
                        onPress={() => {}}
                        text={{ idle: "CONTINUE" }}
                        style={{ backgroundColor: colors.accent, borderRadius: 30 }}
                        textStyle={{ fontFamily: "helveticaBold", fontSize: 18, lineHeight: 18 }}
                    />
                    <AppButton
                        onPress={() => {}}
                        text={{ idle: "Restore" }}
                        color={{ idle: "transparent" }}
                        textStyle={{ fontSize: 16, lineHeight: 16, opacity: 0.5 }}
                    />
                </Animated.View>
            </Animated.View>
        </View>
    );
}

export default PaywallPage;

const ProductSelector = () => {
    const [selected, setSelected] = useState<"Month" | "Year">("Year");

    const selectMonth = () => setSelected("Month");
    const selectYear = () => setSelected("Year");

    return (
        <Animated.View
            entering={FadeInDown.easing(Easing.bezierFn(0.83, 0, 0.17, 1))
                .withInitialValues({ transform: [{ translateY: 80 }] })
                .delay(DELAY + DELAY_P)
                .duration(800)}>
            <AppText children={"Regional discount applied (80% off)"} fontSize={16} style={{ opacity: 0.4, marginBottom: 5 }} />
            <View style={{ gap: 18 }}>
                <Product
                    selected={selected === "Month"}
                    data={{ name: "Monthly", discountedPriceString: "$4.99/mo", priceString: "$0.99/mo" }}
                    onPress={selectMonth}
                />
                <Product
                    selected={selected === "Year"}
                    data={{ name: "Annual", discountedPriceString: "$39.99/yr ($3.33/mo)", priceString: "$9.99/yr ($0.83/mo)" }}
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
        discountedPriceString?: string;
        priceString?: string;
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
                        style={[{ fontFamily: "helvetica", fontSize: 18, lineHeight: 18, marginLeft: 4, paddingTop: 2 }, animatedTextColor]}
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
