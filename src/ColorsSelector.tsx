import { useState } from "react";
import { Animated, Pressable, ScrollView } from "react-native";
import { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { centerFlex } from "./types";

function ColorSelector({ colorsArray }: { colorsArray: string[] }) {
    const [selectedColor, setSelectedColor] = useState("");

    const selectColor = (color: string) => () => setSelectedColor(color);

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {colorsArray.map((color, idx) => {
                const selected = selectedColor === color;

                return <ColorOption key={idx} color={color} selected={selected} selectColor={selectColor(color)} />;
            })}
        </ScrollView>
    );
}

function ColorOption({ color, selected, selectColor }: { color: string; selected: boolean; selectColor: () => void }) {
    const styles = useAnimatedStyle(() => {
        return {
            width: withTiming(selected ? 50 : 30, { duration: 200 }),
            height: withTiming(selected ? 50 : 30, { duration: 200 }),
        };
    }, [selected]);

    return (
        <Pressable
            onPress={selectColor}
            style={[
                centerFlex,
                {
                    width: 50,
                    marginRight: 25,
                    height: 50,
                },
            ]}>
            <Animated.View
                style={[
                    styles,
                    {
                        borderRadius: 25,
                        backgroundColor: color,
                    },
                ]}
            />
        </Pressable>
    );
}
export default ColorSelector;
