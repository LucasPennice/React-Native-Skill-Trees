import { memo } from "react";
import { Pressable, ScrollView, StyleProp, View, ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";
import { MENU_DAMPENING, centerFlex, colors } from "../parameters";
import { ColorGradient } from "../types";
import AppText from "./AppText";

function ColorOption({ data, isSelected, selectColor }: { data: ColorGradient; isSelected: boolean; selectColor: () => void }) {
    const width = useAnimatedStyle(() => {
        return {
            width: withSpring(isSelected ? 70 : 50, MENU_DAMPENING),
        };
    }, [isSelected]);
    const opacity = useAnimatedStyle(() => {
        return {
            opacity: withTiming(isSelected ? 1 : 0.6),
        };
    }, [isSelected]);

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
                <Animated.View style={[width, { height: 30, backgroundColor: data.color1, borderRadius: 10 }]} />
            </Animated.View>

            <AppText fontSize={14} style={{ color: colors.unmarkedText, marginTop: 5 }}>
                {data.label}
            </AppText>
        </Pressable>
    );
}

const MemoOption = memo(ColorOption, (prev, next) => {
    if (prev.data.color1 !== next.data.color1) return false;
    if (prev.isSelected !== next.isSelected) return false;

    return true;
});

function ColorGradientSelector({
    colorsArray,
    state,
    style,
    containerStyle,
}: {
    colorsArray: ColorGradient[];
    state: [ColorGradient | undefined, (v: ColorGradient) => void];
    style?: StyleProp<ViewStyle>;
    containerStyle?: StyleProp<ViewStyle>;
}) {
    const [selectedColor, setSelectedColor] = state;

    const selectColor = (color: ColorGradient) => () => setSelectedColor(color);

    return (
        <View style={[{ height: 70 }, containerStyle]}>
            <ScrollView contentContainerStyle={[style]} horizontal showsHorizontalScrollIndicator={false}>
                {colorsArray.map((data, idx) => {
                    const isSelected = selectedColor !== undefined && selectedColor.color1 === data.color1;
                    return <MemoOption key={idx} data={data} isSelected={isSelected} selectColor={selectColor(data)} />;
                })}
            </ScrollView>
        </View>
    );
}

export default ColorGradientSelector;
