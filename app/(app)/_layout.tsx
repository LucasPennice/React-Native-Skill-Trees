import AppText from "@/components/AppText";
import ChevronLeft from "@/components/Icons/ChevronLeft";
import { NAV_HEGIHT, colors } from "@/parameters";
import { useAppDispatch, useAppSelector } from "@/redux/reduxHooks";
import { open } from "@/redux/slices/addTreeModalSlice";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, router, usePathname, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Dimensions, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { routes } from "routes";
import analytics from "@react-native-firebase/analytics";
import { Mixpanel } from "mixpanel-react-native";
import { selectUserId } from "@/redux/slices/userSlice";
import { getUserFeedbackProgressPercentage, getWheelParams } from "@/functions/misc";
import { Svg, Circle } from "react-native-svg";
import { selectUserFeedbackSlice } from "@/redux/slices/userFeedbackSlice";

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

                            mixpanel.track(`Navigate to ${currentRouteName}`);
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
                    <Svg width={progressWheelProps.size} height={progressWheelProps.size}>
                        <Circle
                            strokeWidth={progressWheelProps.strokeWidth}
                            cx={progressWheelProps.centerCoordinate}
                            cy={progressWheelProps.centerCoordinate}
                            r={progressWheelProps.radius}
                            fillOpacity={0}
                            stroke={progressWheelProps.backgroundStroke}
                        />
                        <Circle
                            strokeWidth={progressWheelProps.strokeWidth}
                            cx={progressWheelProps.centerCoordinate}
                            cy={progressWheelProps.centerCoordinate}
                            r={progressWheelProps.radius}
                            stroke={pathname.includes("feedback") ? colors.accent : colors.unmarkedText}
                            fillOpacity={0}
                            strokeDasharray={progressWheelProps.circumference}
                            strokeLinecap="round"
                            strokeDashoffset={strokeDashoffset}
                        />
                    </Svg>
                    <AppText
                        fontSize={12}
                        style={{
                            position: "absolute",
                            color: pathname.includes("feedback") ? colors.accent : colors.unmarkedText,
                        }}>
                        {getUserFeedbackProgressPercentage(userFeedback)}
                    </AppText>
                </Pressable>
            </KeyboardAvoidingView>
        </View>
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
