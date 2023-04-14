import { Pressable, ViewProps } from "react-native";
import { useEffect } from "react";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { centerFlex } from "../types";
import { colors } from "../pages/homepage/canvas/parameters";
import AppText from "./AppText";

function RadioInput({
    state,
    text,
    onPress,
    style,
}: {
    state: [boolean, (v: boolean) => void];
    text: string;
    onPress?: () => void;
    style?: ViewProps["style"];
}) {
    const [mastered, setMastered] = state;

    const isMastered = useSharedValue(false);

    useEffect(() => {
        isMastered.value = mastered;
    }, [mastered]);

    const left = useAnimatedStyle(() => {
        return { left: withSpring(isMastered.value ? 35 : 5, { damping: 25, stiffness: 300 }) };
    }, [isMastered]);

    const bgColor = useAnimatedStyle(() => {
        return { backgroundColor: withTiming(isMastered.value ? colors.accent : `${colors.accent}4D`) };
    }, [isMastered]);

    return (
        <Pressable
            style={[
                centerFlex,
                {
                    flexDirection: "row",
                    justifyContent: "space-between",
                    backgroundColor: `${colors.line}4D`,
                    borderRadius: 15,
                    paddingHorizontal: 15,
                    height: 60,
                    marginBottom: 30,
                },
                style,
            ]}
            //@ts-ignore
            onPress={() => {
                //@ts-ignore
                setMastered((p) => !p);
                if (onPress) onPress();
            }}>
            <AppText style={{ color: "white" }} fontSize={18}>
                {text}
            </AppText>
            <Animated.View
                style={[
                    bgColor,
                    {
                        height: 40,
                        width: 70,
                        borderRadius: 25,
                        position: "relative",
                    },
                ]}>
                <Animated.View style={[left, { height: 30, width: 30, position: "absolute", top: 5, backgroundColor: "white", borderRadius: 35 }]} />
            </Animated.View>
        </Pressable>
    );
}
export default RadioInput;
