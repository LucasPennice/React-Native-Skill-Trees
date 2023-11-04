import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useEffect } from "react";
import { Pressable, StyleProp, StyleSheet, TextStyle, View, ViewProps } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { colors } from "../parameters";
import AppText from "./AppText";

function RadioInput({
    state,
    text,
    onPress,
    style,
    iconProps,
    textProps,
}: {
    state: [boolean, (v: boolean) => void];
    text: string;
    onPress?: () => void;
    style?: ViewProps["style"];
    iconProps?: React.ComponentProps<typeof FontAwesome>;
    textProps?: StyleProp<TextStyle>;
}) {
    const [mastered, setMastered] = state;

    const isMastered = useSharedValue(false);

    useEffect(() => {
        isMastered.value = mastered;
    }, [mastered, isMastered]);

    const TOGGLE_SIZE = 25;

    const animatedLeft = useAnimatedStyle(() => {
        return { left: withSpring(isMastered.value ? TOGGLE_SIZE + 2 : 5, { damping: 25, stiffness: 300 }) };
    }, [isMastered]);

    const animatedBackgroundColor = useAnimatedStyle(() => {
        return { backgroundColor: withTiming(isMastered.value ? colors.accent : `${colors.accent}4D`) };
    }, [isMastered]);

    const styles = StyleSheet.create({
        container: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#282A2C",
            borderRadius: 15,
            paddingHorizontal: 15,
            height: 60,
            marginBottom: 30,
        },
        toggleContainer: {
            height: TOGGLE_SIZE,
            width: 2 * TOGGLE_SIZE,
            borderRadius: 25,
            position: "relative",
            borderWidth: 1,
            borderColor: colors.line,
        },
        toggleStyles: {
            height: TOGGLE_SIZE - 10,
            width: TOGGLE_SIZE - 10,
            position: "absolute",
            top: 4,
            backgroundColor: colors.accent,
            borderRadius: 35,
        },
    });

    return (
        <Pressable
            style={[styles.container, style]}
            onPress={() => {
                const newValue = !mastered;
                setMastered(newValue);
                if (onPress) onPress();
            }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                {iconProps && <FontAwesome size={iconProps.size ?? 28} style={{ marginBottom: 3 }} {...iconProps} />}
                <AppText fontSize={18} style={textProps}>
                    {text}
                </AppText>
            </View>
            <Animated.View style={[styles.toggleContainer]}>
                <Animated.View style={[animatedLeft, styles.toggleStyles]} />
            </Animated.View>
        </Pressable>
    );
}
export default RadioInput;
