import AppText from "@/components/AppText";
import ChevronLeft from "@/components/Icons/ChevronLeft";
import { NAV_HEGIHT, colors } from "@/parameters";
import { useAppDispatch } from "@/redux/reduxHooks";
import { open } from "@/redux/slices/addTreeModalSlice";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { SplashScreen, Tabs, router } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { routes } from "routes";

function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>["name"]; color: string; size?: number }) {
    return <FontAwesome size={props.size ?? 28} style={{ marginBottom: -3 }} {...props} />;
}

export default function RootLayout() {
    const [loaded, error] = useFonts({
        helvetica: require("../../assets/Helvetica.ttf"),
        helveticaBold: require("../../assets/Helvetica-Bold.ttf"),
        emojisMono: require("../../assets/NotoEmoji-Regular.ttf"),
        ...FontAwesome.font,
    });

    const dispatch = useAppDispatch();

    const openAddTreeModal = () => dispatch(open());

    useEffect(() => {
        if (error) throw error;
    }, [error]);

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) return <Text>Loading...</Text>;
    // ME PARECE QUE EL PROBLEMA ESTA EN TENER UN TABS ADENTRO DE UN STACK ?
    //     O AL MENOS AL PROGRAMA NO LE FUSTA TENER UN STACK ADENTRO DE UN STACK ADENTRO DE UM<TABS>
    //     HABRIA QUE IR PROBANDO QUE ES

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                lazy: true,
                unmountOnBlur: true,
                tabBarHideOnKeyboard: true,
                tabBarStyle: { height: NAV_HEGIHT, backgroundColor: colors.darkGray },
                tabBarActiveTintColor: colors.accent,
            }}>
            <Tabs.Screen
                name={routes.home.name}
                options={{ unmountOnBlur: false, title: "Home", tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} /> }}
            />
            <Tabs.Screen
                name={routes.myTrees.name}
                options={{
                    headerShown: true,
                    header: MyTreesHeader(openAddTreeModal),
                    title: "My Trees",
                    tabBarIcon: ({ color }) => <TabBarIcon name="tree" color={color} />,
                }}
            />
            <Tabs.Screen name={routes.myTrees_treeId.name} options={{ href: null }} />
            <Tabs.Screen name={routes.myTrees_skillId.name} options={{ href: null }} />
            <Tabs.Screen name={"index"} options={{ href: null }} />
        </Tabs>
    );
}

function MyTreesHeader(openAddTreeModal: () => void) {
    const style = StyleSheet.create({
        button: {
            height: 48,
            paddingHorizontal: 15,
            alignItems: "flex-end",
            justifyContent: "center",
        },
        backButton: {
            paddingLeft: 0,
            paddingRight: 30,
        },
    });
    return () => (
        <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
            <TouchableOpacity onPress={router.back} style={[style.button, style.backButton]}>
                <ChevronLeft />
            </TouchableOpacity>
            <TouchableOpacity onPress={openAddTreeModal} style={style.button}>
                <AppText style={{ color: colors.accent }} fontSize={16}>
                    New Skill Tree
                </AppText>
            </TouchableOpacity>
        </View>
    );
}
