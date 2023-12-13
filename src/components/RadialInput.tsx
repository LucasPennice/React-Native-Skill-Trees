import Selected from "@/../assets/lotties/success.json";
import { colors } from "@/parameters";
import { useHandleLottiePlay } from "@/useHandleLottiePlay";
import LottieView from "lottie-react-native";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated from "react-native-reanimated";
import AppText from "./AppText";

const RadialInput = ({ selected, onPress, title }: { selected: boolean; onPress: () => void; title: string }) => {
    const style = StyleSheet.create({
        container: {
            width: "100%",
            height: 50,
            alignItems: "center",
            gap: 8,
            borderRadius: 15,
            paddingHorizontal: 10,
            flexDirection: "row",
            backgroundColor: colors.clearGray,
            marginBottom: 10,
        },
        selectedIndicator: {
            width: 30,
            height: 30,
            overflow: "hidden",
            borderRadius: 30,
            backgroundColor: colors.line,
            justifyContent: "center",
            alignItems: "center",
        },
    });

    const animationRef = useHandleLottiePlay(selected, 0);

    return (
        <TouchableOpacity onPress={onPress}>
            <Animated.View style={style.container}>
                <View style={style.selectedIndicator}>
                    <LottieView source={Selected} loop={false} ref={animationRef} style={{ width: 25 }} speed={1.25} />
                </View>
                <AppText fontSize={18} style={{ marginLeft: 4 }} children={title} />
            </Animated.View>
        </TouchableOpacity>
    );
};

export default RadialInput;
