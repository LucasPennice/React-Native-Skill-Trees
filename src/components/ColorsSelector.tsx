import { Pressable, ScrollView, StyleProp, ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";
import { MENU_DAMPENING, centerFlex, colors } from "../parameters";
import AppText from "./AppText";

function ColorSelector({
    colorsArray,
    state,
    style,
}: {
    colorsArray: {
        label: string;
        color: string;
    }[];
    state: [string, (v: string) => void];
    style?: StyleProp<ViewStyle>;
}) {
    const [selectedColor, setSelectedColor] = state;

    const selectColor = (color: string) => () => setSelectedColor(color);

    return (
        <ScrollView contentContainerStyle={style} horizontal showsHorizontalScrollIndicator={false}>
            {colorsArray.map((data, idx) => {
                return <ColorOption key={idx} data={data} selectedColor={selectedColor} selectColor={selectColor(data.color)} />;
            })}
        </ScrollView>
    );
}

function ColorOption({
    data,
    selectedColor,
    selectColor,
}: {
    data: {
        label: string;
        color: string;
    };
    selectedColor: string;
    selectColor: () => void;
}) {
    const selected = selectedColor === data.color;

    const styles = useAnimatedStyle(() => {
        return {
            width: withSpring(selected ? 70 : 50, { ...MENU_DAMPENING }),
            backgroundColor: withTiming(selected ? data.color : `${data.color}9D`, { duration: 200 }),
        };
    }, [selectedColor]);

    return (
        <Pressable
            onPress={selectColor}
            style={[
                centerFlex,
                {
                    width: 70,
                    marginRight: 25,
                    height: 70,
                },
            ]}>
            <Animated.View
                style={[
                    styles,
                    {
                        height: 30,
                        borderRadius: 10,
                    },
                ]}
            />
            <AppText fontSize={14} style={{ color: colors.unmarkedText, marginTop: 5 }}>
                {data.label}
            </AppText>
        </Pressable>
    );
}
export default ColorSelector;
