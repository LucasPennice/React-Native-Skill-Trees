import AppText from "@/components/AppText";
import ChevronLeft from "@/components/Icons/ChevronLeft";
import SettingsIcon from "@/components/Icons/SettingsIcon";
import ProgressBarAndIndicator from "@/components/ProgressBarAndIndicator";
import { getUserFeedbackProgressPercentage, getWheelParams } from "@/functions/misc";
import { MENU_HIGH_DAMPENING, NAV_HEGIHT, colors } from "@/parameters";
import { useAppDispatch, useAppSelector } from "@/redux/reduxHooks";
import { open } from "@/redux/slices/addTreeModalSlice";
import { selectUserFeedbackSlice } from "@/redux/slices/userFeedbackSlice";
import { selectUserId } from "@/redux/slices/userSlice";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import analytics from "@react-native-firebase/analytics";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, router, usePathname, useRouter } from "expo-router";
import { Mixpanel } from "mixpanel-react-native";
import { useEffect, useRef, useState } from "react";
import { Dimensions, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";
import { routes } from "routes";

function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>["name"]; color: string; size?: number }) {
    return <FontAwesome size={props.size ?? 28} style={{ marginBottom: -3 }} {...props} />;
}

function usePassMixPanelUserId() {
    const userId = useAppSelector(selectUserId);

    useEffect(() => {
        if (userId !== "") mixpanel.identify(userId);

        //WHEN A USER LOGS OUT I'M SUPPOUSED TO CALL mixpanel.reset()
    }, [userId]);
}

const progressWheelProps = getWheelParams(colors.accent, colors.line, 45, 4);

const trackAutomaticEvents = true;
export const mixpanel = new Mixpanel("5a141ce3c43980d8fab68b96e1256525", trackAutomaticEvents);
mixpanel.init();

export default function RootLayout() {
    usePassMixPanelUserId();

    const userFeedback = useAppSelector(selectUserFeedbackSlice);

    const { width, height } = Dimensions.get("window");

    const pathname = usePathname();
    const router = useRouter();

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

    const prevRouteName = useRef<string | null>(null);

    if (!loaded) return <Text>Loading...</Text>;

    const strokeDashoffset =
        progressWheelProps.circumference - (progressWheelProps.circumference * getUserFeedbackProgressPercentage(userFeedback)) / 100;

    return (
        <View style={{ flex: 1, minHeight: Platform.OS === "android" ? height - NAV_HEGIHT : "auto" }}>
            <Stack
                screenOptions={{ headerShown: false }}
                screenListeners={{
                    state: async (e) => {
                        //@ts-ignore
                        const currentRouteName = e.data.state.routes[e.data.state.routes.length - 1].name as string;

                        if (prevRouteName.current !== currentRouteName) {
                            await analytics().logScreenView({
                                screen_name: currentRouteName,
                                screen_class: currentRouteName,
                            });

                            await mixpanel.track(`Navigate to ${currentRouteName}`);
                        }

                        prevRouteName.current = currentRouteName;
                    },
                }}>
                <Stack.Screen
                    name={routes.home.name}
                    options={{
                        title: "Home",
                    }}
                />
                <Stack.Screen
                    name={routes.myTrees.name}
                    options={{
                        headerShown: true,
                        header: MyTreesHeader(openAddTreeModal),
                        title: "My Trees",
                    }}
                />
                <Stack.Screen
                    name={routes.feedback.name}
                    options={{
                        title: "Feedback (NEW)",
                    }}
                />
                <Stack.Screen name={routes.myTrees_treeId.name} />
                <Stack.Screen name={routes.myTrees_skillId.name} />
                <Stack.Screen name={"index"} />
            </Stack>
            {/* <Onboarding /> */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "padding"}
                enabled={false}
                style={{ backgroundColor: colors.darkGray, height: NAV_HEGIHT, width, flexDirection: "row" }}>
                <Pressable
                    style={{ width: width / 3, flex: 1, justifyContent: "center", alignItems: "center", gap: 6 }}
                    onPress={() => router.replace("/home")}>
                    <TabBarIcon name="home" color={pathname.includes("home") ? colors.accent : colors.unmarkedText} />
                    <AppText style={{ color: pathname.includes("home") ? colors.accent : colors.unmarkedText }} fontSize={12}>
                        Home
                    </AppText>
                </Pressable>
                <Pressable
                    style={{ width: width / 3, flex: 1, justifyContent: "center", alignItems: "center", gap: 6 }}
                    onPress={() => router.replace("/(app)/myTrees")}>
                    <TabBarIcon name="tree" color={pathname.includes("myTrees") ? colors.accent : colors.unmarkedText} />
                    <AppText style={{ color: pathname.includes("myTrees") ? colors.accent : colors.unmarkedText }} fontSize={12}>
                        My Trees
                    </AppText>
                </Pressable>
                <Pressable
                    style={{ width: width / 3, flex: 1, justifyContent: "center", alignItems: "center", gap: 6, position: "relative" }}
                    onPress={() => router.replace("/(app)/feedback")}>
                    <TabBarIcon name="group" color={pathname.includes("feedback") ? colors.accent : colors.unmarkedText} />
                    <AppText style={{ color: pathname.includes("feedback") ? colors.accent : colors.unmarkedText }} fontSize={12}>
                        Community
                    </AppText>
                </Pressable>
            </KeyboardAvoidingView>
        </View>
    );
}

const Onboarding = () => {
    const { height, width } = Dimensions.get("window");

    const [open, setOpen] = useState(true);

    const DIMENSIONS = { closed: { width: 45, height: 45 }, open: { width, height: 170 } };
    const CLOSED_POSITION = { left: 10, top: height - NAV_HEGIHT - DIMENSIONS.closed.height - 10 };
    const style = StyleSheet.create({
        container: { width: DIMENSIONS.closed.width, height: DIMENSIONS.closed.height, backgroundColor: colors.darkGray, position: "absolute" },
        icon: { width: DIMENSIONS.closed.width, height: DIMENSIONS.closed.height, position: "absolute" },
    });

    const animatedContainerStyle = useAnimatedStyle(() => {
        return {
            top: withSpring(open ? 0 : CLOSED_POSITION.top, MENU_HIGH_DAMPENING),
            left: withSpring(open ? 0 : CLOSED_POSITION.left, MENU_HIGH_DAMPENING),
            width: withSpring(open ? DIMENSIONS.open.width : DIMENSIONS.closed.width, MENU_HIGH_DAMPENING),
            height: withSpring(open ? DIMENSIONS.open.height : DIMENSIONS.closed.height, MENU_HIGH_DAMPENING),
            borderRadius: withSpring(open ? 20 : DIMENSIONS.closed.width, MENU_HIGH_DAMPENING),
        };
    });

    const animatedIconStyle = useAnimatedStyle(() => {
        return {
            top: withSpring(open ? 80 : 7),
            left: withSpring(open ? 10 : 7, MENU_HIGH_DAMPENING),
        };
    });

    return (
        <Animated.View style={[style.container, animatedContainerStyle]}>
            {open && (
                <>
                    <ProgressBarAndIndicator progressPercentage={0} containerStyles={{ backgroundColor: colors.darkGray }} />
                    <Pressable onPressIn={() => setOpen(false)} style={{ width: 50, height: 50, backgroundColor: "red" }} />
                </>
            )}
            {!open && <Pressable onPressIn={() => setOpen(true)} style={{ width: 45, height: 45 }} />}
            <Animated.View style={[style.icon, animatedIconStyle]} pointerEvents={"none"}>
                <SettingsIcon />
            </Animated.View>
        </Animated.View>
    );
};

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
