import { useNavigation } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable, View } from "react-native";
import { Routes, StackNavigatorParams } from "../../App";
import { NAV_HEGIHT, centerFlex, colors } from "../parameters";
import AppText from "./AppText";
import { useState } from "react";

function NavigationBar({ data: APP_ROUTES }: { data: Routes }) {
    const nav = useNavigation<NativeStackScreenProps<StackNavigatorParams>["navigation"]>();
    const appRoutesForNavBar = APP_ROUTES.filter((route) => route.hideFromNavBar !== true);

    const [routeName, setRouteName] = useState("Home");

    nav.addListener("state", (e) => {
        const currentRoute = e.data.state.routes[e.data.state.routes.length - 1].name;
        setRouteName(currentRoute);
    });

    const foo = appRoutesForNavBar.find((route) => route.route === routeName);

    const res = foo === undefined ? "MyTrees" : foo.route;

    return (
        <View
            style={[
                centerFlex,
                {
                    height: NAV_HEGIHT,
                    backgroundColor: colors.darkGray,
                    borderTopLeftRadius: 10,
                    borderTopEndRadius: 10,
                    flexDirection: "row",
                    position: "relative",
                    gap: 30,
                },
            ]}>
            {appRoutesForNavBar.map((appRoute, idx) => {
                return (
                    <Pressable
                        key={idx}
                        //@ts-ignore
                        onPress={() => nav.navigate(appRoute.route)}
                        style={[centerFlex, { height: NAV_HEGIHT, width: 100 }]}>
                        <View style={centerFlex}>
                            <AppText style={{ color: appRoute.route === res ? colors.accent : colors.unmarkedText }} fontSize={16}>
                                {appRoute.title}
                            </AppText>
                        </View>
                    </Pressable>
                );
            })}
        </View>
    );
}

export default NavigationBar;
