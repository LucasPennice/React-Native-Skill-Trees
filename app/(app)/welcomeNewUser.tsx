import WelcomeScreenAnimation from "@/../assets/lotties/welcomeScreen.json";
import AppText from "@/components/AppText";
import { colors } from "@/parameters";
import { useHandleLottiePlay } from "@/useHandleLottiePlay";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";
import LottieView from "lottie-react-native";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";

const { width, height } = Dimensions.get("window");
const TEXT_CONTAINER_HEIGHT = 400;

const style = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.darkGray,
        alignItems: "center",
        justifyContent: "space-between",
        position: "relative",
    },
    contentContainer: {
        height: TEXT_CONTAINER_HEIGHT,
        width: "100%",
        gap: 25,
        padding: 30,
        paddingTop: 45,
    },
    continueButton: {
        position: "absolute",
        bottom: 20,
        right: 20,
        width: 55,
        height: 55,
        backgroundColor: colors.softPurle,
        borderRadius: 55,
        justifyContent: "center",
        alignItems: "center",
    },
    lottieContainer: {
        width: width,
        height: height - TEXT_CONTAINER_HEIGHT,
        backgroundColor: colors.background,
        overflow: "hidden",
        justifyContent: "flex-end",
        alignItems: "center",
    },
});
function WelcomeNewUser() {
    const redirectToPreOnboardingPaywall = () => {
        router.push("/preOnboardingPaywall");
    };

    const animationRef = useHandleLottiePlay(true);

    return (
        <View style={style.container}>
            <View style={style.lottieContainer}>
                <LottieView
                    source={WelcomeScreenAnimation}
                    ref={animationRef}
                    loop={false}
                    style={{ height: height - TEXT_CONTAINER_HEIGHT, maxHeight: 400 }}
                />
            </View>

            <View style={style.contentContainer}>
                <AppText children={"Welcome to Skill Trees"} fontSize={38} />
                <AppText
                    children={
                        "Skill Trees is a easy to use tool to organize your life's objectives and watch the progress as it happens. It lets you give form to your goals, so you don't have to worry about keeping track of your progress or what to work on next."
                    }
                    style={{ lineHeight: 25, opacity: 0.9 }}
                    fontSize={18}
                />
            </View>
            <TouchableOpacity onPress={redirectToPreOnboardingPaywall} style={style.continueButton}>
                <FontAwesome name={"arrow-right"} size={20} color={colors.darkGray} />
            </TouchableOpacity>
        </View>
    );
}

export default WelcomeNewUser;
