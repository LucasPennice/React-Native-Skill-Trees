import AppText from "@/components/AppText";
import { colors } from "@/parameters";
import { LinearGradient } from "expo-linear-gradient";
import { Dimensions, Pressable, View } from "react-native";
import Animated, { Easing, FadeInDown, SlideInDown } from "react-native-reanimated";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import analytics from "@react-native-firebase/analytics";

import * as Linking from "expo-linking";

function Feedback() {
    const { width } = Dimensions.get("screen");
    return (
        <LinearGradient colors={["#BF5AF2", "#5A7BF2"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.2 }} style={{ flex: 1 }}>
            <View style={{ width, height: 130, justifyContent: "center", alignItems: "center", gap: 20 }}>
                <AppText fontSize={36} style={{ color: "#FFFFFF", fontFamily: "helveticaBold" }}>
                    Hello!
                </AppText>
                <AppText fontSize={20} style={{ color: "#FFFFFF", fontFamily: "helveticaBold" }}>
                    I hope you are enjoying Skill Trees
                </AppText>
            </View>

            <Animated.View style={{ flex: 1 }} entering={SlideInDown.duration(600).easing(Easing.inOut(Easing.cubic))}>
                <LinearGradient
                    colors={["#515053", "#181A1C"]}
                    start={{ x: 0.5, y: -0.5 }}
                    end={{ x: 0.5, y: 1 }}
                    style={{ flex: 1, borderTopLeftRadius: 25, borderTopRightRadius: 25 }}>
                    <View style={{ flex: 1, padding: 25, justifyContent: "space-between", alignItems: "center" }}>
                        <Animated.View style={{ gap: 0 }} entering={FadeInDown.duration(300).delay(650).easing(Easing.inOut(Easing.cubic))}>
                            <AppText fontSize={16} style={{ color: "#FFFFFF", fontFamily: "helvetica", textAlign: "center", lineHeight: 23 }}>
                                If you'd like to help shape the future of Skill Trees by giving feedback
                            </AppText>
                            <AppText fontSize={16} style={{ color: "#FFFFFF", fontFamily: "helvetica", textAlign: "center", lineHeight: 23 }}>
                                Consider following me or reaching out
                            </AppText>
                            <AppText fontSize={16} style={{ color: "#FFFFFF", fontFamily: "helvetica", textAlign: "center", lineHeight: 23 }}>
                                I'll run polls to figure out the best way to help you reach your life's goals
                            </AppText>
                        </Animated.View>
                        <Animated.View entering={FadeInDown.duration(300).delay(700).easing(Easing.inOut(Easing.cubic))} style={{ gap: 30 }}>
                            <Pressable
                                onPress={async () => {
                                    await analytics().logEvent("ClickInstagramLink");
                                    Linking.openURL("https://instagram.com/lucas_pennice?igshid=NGVhN2U2NjQ0Yg%3D%3D&utm_source=qr");
                                }}>
                                <LinearGradient
                                    colors={["#BF5AF2", "#5A7BF2"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={{
                                        width: width - 60,
                                        height: 80,
                                        borderRadius: 20,
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        paddingHorizontal: 30,
                                    }}>
                                    <FontAwesome size={50} name="instagram" color={"#FFFFFF"} />
                                    <View>
                                        <AppText
                                            fontSize={16}
                                            style={{ color: "#FFFFFF", fontFamily: "helveticaBold", textAlign: "center", marginBottom: 5 }}>
                                            Follow me on
                                        </AppText>
                                        <AppText fontSize={16} style={{ color: "#FFFFFF", fontFamily: "helveticaBold", textAlign: "center" }}>
                                            Instagram
                                        </AppText>
                                    </View>
                                </LinearGradient>
                            </Pressable>

                            <Pressable
                                onPress={async () => {
                                    await analytics().logEvent("ClickTwitterLink");
                                    Linking.openURL("https://twitter.com/LucasPennice");
                                }}>
                                <LinearGradient
                                    colors={["#5A7BF2", "#40C8E0"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={{
                                        width: width - 60,
                                        height: 80,
                                        borderRadius: 20,
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        paddingHorizontal: 30,
                                    }}>
                                    <FontAwesome size={50} name="twitter" color={"#FFFFFF"} />
                                    <View>
                                        <AppText
                                            fontSize={16}
                                            style={{ color: "#FFFFFF", fontFamily: "helveticaBold", textAlign: "center", marginBottom: 5 }}>
                                            Follow me on
                                        </AppText>
                                        <AppText fontSize={16} style={{ color: "#FFFFFF", fontFamily: "helveticaBold", textAlign: "center" }}>
                                            X (Twitter)
                                        </AppText>
                                    </View>
                                </LinearGradient>
                            </Pressable>
                        </Animated.View>
                        <Animated.View entering={FadeInDown.duration(300).delay(750).easing(Easing.inOut(Easing.cubic))}>
                            <AppText fontSize={16} style={{ color: colors.unmarkedText, fontFamily: "helvetica", textAlign: "center" }}>
                                Or send me an email at:
                            </AppText>
                            <AppText fontSize={16} style={{ color: colors.unmarkedText, fontFamily: "helvetica", textAlign: "center" }}>
                                skilltreesapp@gmail.com
                            </AppText>
                        </Animated.View>
                    </View>
                </LinearGradient>
            </Animated.View>
        </LinearGradient>
    );
}

export default Feedback;
