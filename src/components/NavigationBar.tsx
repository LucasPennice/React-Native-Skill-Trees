import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Dimensions, Pressable, View } from "react-native";
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";
import AppText from "./AppText";
import { colors, NAV_HEGIHT } from "../pages/homepage/canvas/parameters";
import { centerFlex, MENU_DAMPENING } from "../types";

function NavigationBar() {
    const nav = useNavigation();
    const { width } = Dimensions.get("screen");

    const [navData, setNavData] = useState<null | { routeIdx: number; routeNames: string[] }>(null);
    const [routeNameLength, setRouteNameLength] = useState<number[]>([]);

    nav.addListener("state", (e) => {
        const currentRoute = e.data.state.routes[e.data.state.routes.length - 1].name;

        const currentRouteIdx = e.data.state.routeNames.findIndex((r) => r === currentRoute);

        setNavData({ routeIdx: currentRouteIdx, routeNames: e.data.state.routeNames });
    });

    const animatedStyles = useAnimatedStyle(() => {
        if (!navData) return { left: 0, opacity: 0 };

        const wordLeftShift = routeNameLength.reduce((a, b, idx) => (idx < navData.routeIdx ? a + b : a), 0);
        const leftMargin = (width - routeNameLength.reduce((a, b) => a + b, 0)) / 2;

        return {
            left: withSpring(leftMargin + wordLeftShift, { damping: 28, stiffness: 300 }),
            opacity: 1,
            width: routeNameLength[navData.routeIdx] ?? 50,
        };
    }, [navData, routeNameLength]);

    if (!navData || !nav) return <></>;

    return (
        <View
            style={[
                centerFlex,
                {
                    height: NAV_HEGIHT,
                    backgroundColor: colors.background,
                    borderTopLeftRadius: 10,
                    borderTopEndRadius: 10,
                    flexDirection: "row",
                    position: "relative",
                },
            ]}>
            <Animated.View
                style={[
                    animatedStyles,
                    {
                        width: width / navData.routeNames.length,
                        position: "absolute",
                        backgroundColor: colors.darkGray,
                        height: 40,
                        top: 13,
                        borderRadius: 10,
                    },
                ]}
            />
            {navData.routeNames.map((r, idx) => {
                return (
                    <Pressable
                        key={idx}
                        onPress={() => {
                            // @ts-ignore
                            nav.navigate(r);
                        }}
                        style={[centerFlex, { padding: 20 }]}
                        onLayout={(e) => {
                            const result = [...routeNameLength];
                            result[idx] = e.nativeEvent.layout.width;
                            setRouteNameLength(result);
                        }}>
                        <AppText style={{ color: colors.unmarkedText }} fontSize={16}>
                            {r}
                        </AppText>
                    </Pressable>
                );
            })}
        </View>
    );
}

export default NavigationBar;
