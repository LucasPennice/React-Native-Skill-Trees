import { Pressable, ScrollView, StyleProp, View, ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";
import { MENU_DAMPENING, centerFlex, colors } from "../parameters";
import AppText from "./AppText";
import { LinearGradient } from "expo-linear-gradient";
import { ColorGradient } from "../types";

function ColorGradientSelector({
    colorsArray,
    state,
    style,
}: {
    colorsArray: ColorGradient[];
    state: [ColorGradient | undefined, (v: ColorGradient) => void];
    style?: StyleProp<ViewStyle>;
}) {
    const [selectedColor, setSelectedColor] = state;

    const selectColor = (color: ColorGradient) => () => setSelectedColor(color);

    return (
        <View style={{ height: 70 }}>
            <ScrollView contentContainerStyle={[style]} horizontal showsHorizontalScrollIndicator={false}>
                {colorsArray.map((data, idx) => {
                    return <ColorOption key={idx} data={data} selectedColor={selectedColor} selectColor={selectColor(data)} />;
                })}
            </ScrollView>
        </View>
    );
}

function ColorOption({
    data,
    selectedColor,
    selectColor,
}: {
    data: ColorGradient;
    selectedColor: ColorGradient | undefined;
    selectColor: () => void;
}) {
    const selected = JSON.stringify(selectedColor) === JSON.stringify(data);

    const width = useAnimatedStyle(() => {
        return {
            width: withSpring(selected ? 70 : 50, { ...MENU_DAMPENING }),
        };
    }, [selectedColor]);
    const opacity = useAnimatedStyle(() => {
        return {
            opacity: withTiming(selected ? 1 : 0.6, { duration: 200 }),
        };
    }, [selectedColor]);

    return (
        <Pressable
            onPress={selectColor}
            style={[
                centerFlex,
                {
                    width: 70,
                    marginRight: 10,
                    height: 70,
                },
            ]}>
            <Animated.View style={opacity}>
                <LinearGradient colors={[data.color1, data.color2]} end={{ x: 1, y: 1 }} style={{ borderRadius: 10 }}>
                    <Animated.View style={[width, { height: 30 }]} />
                </LinearGradient>
            </Animated.View>

            <AppText fontSize={14} style={{ color: colors.unmarkedText, marginTop: 5 }}>
                {data.label}
            </AppText>
        </Pressable>
    );
}
export default ColorGradientSelector;
