import { Dimensions, Pressable, TextStyle, View, ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";
import { MENU_HIGH_DAMPENING, centerFlex, colors } from "../parameters";
import AppText from "./AppText";
import { StyleSheet } from "react-native";

type Props = {
    toggleMode: () => void;
    isLeftSelected: boolean;
    indicatorWidth?: number;
    containerStyles?: ViewStyle;
    indicatorStyles?: ViewStyle;
    modeText?: [string, string];
    textStyle?: TextStyle;
};

const HEIGHT = 45;

const { width } = Dimensions.get("window");

function SliderToggler({
    toggleMode,
    isLeftSelected,
    indicatorWidth = width / 2 - 11,
    containerStyles,
    modeText = ["Details", "Edit"],
    textStyle,
    indicatorStyles,
}: Props) {
    const style = StyleSheet.create({
        container: {
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            borderColor: "#282A2C",
            borderWidth: 2,
            height: HEIGHT,
            borderRadius: 10,
            position: "relative",
            marginBottom: 10,
        },
        indicator: {
            position: "absolute",
            height: HEIGHT,
            width: indicatorWidth,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.accent,
        },
    });

    const transform = useAnimatedStyle(() => {
        return { left: withSpring(isLeftSelected ? 0 : indicatorWidth, MENU_HIGH_DAMPENING) };
    }, [isLeftSelected]);

    return (
        <View style={style.container}>
            <Animated.View style={[style.indicator, indicatorStyles, transform]} />

            <Pressable onPress={toggleMode} style={[centerFlex, { flex: 1, height: HEIGHT }, containerStyles]}>
                <AppText fontSize={14} style={textStyle}>
                    {modeText[0]}
                </AppText>
            </Pressable>

            <Pressable onPress={toggleMode} style={[centerFlex, { height: HEIGHT, flex: 1 }]}>
                <AppText fontSize={14} style={textStyle}>
                    {modeText[1]}
                </AppText>
            </Pressable>
        </View>
    );
}

export default SliderToggler;
