import { useState } from "react";
import { Pressable, ScrollView } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { centerFlex } from "../types";

function ColorSelector({ colorsArray, state }: { colorsArray: string[]; state: [string, (v: string) => void] }) {
    const [selectedColor, setSelectedColor] = state;

    const selectColor = (color: string) => () => setSelectedColor(color);

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {colorsArray.map((color, idx) => {
                return <ColorOption key={idx} color={color} selectedColor={selectedColor} selectColor={selectColor(color)} />;
            })}
        </ScrollView>
    );
}

function ColorOption({ color, selectedColor, selectColor }: { color: string; selectedColor: string; selectColor: () => void }) {
    const selected = selectedColor === color;

    const styles = useAnimatedStyle(() => {
        return {
            width: withTiming(selected ? 50 : 30, { duration: 200 }),
            height: withTiming(selected ? 50 : 30, { duration: 200 }),
        };
    }, [selectedColor]);

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
