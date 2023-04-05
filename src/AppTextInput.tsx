import { Pressable, TextInput, View, ViewProps } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { centerFlex } from "./types";
import AppText from "./AppText";
import { colors } from "./pages/homepage/canvas/parameters";

function AppTextInput({
    textState,
    placeholder,
    containerStyles,
}: {
    textState: [string, (v: string) => void];
    placeholder: string;
    containerStyles?: ViewProps["style"];
}) {
    const [text, setText] = textState;

    const textFocused = useSharedValue(false);

    const clearButtonStyles = useAnimatedStyle(() => {
        return {
            right: withSpring(textFocused.value ? 0 : -35, { damping: 25, stiffness: 300 }),
            opacity: withSpring(textFocused.value ? 1 : 0, { damping: 25, stiffness: 300 }),
        };
    }, [textFocused]);

    const inputStyles = useAnimatedStyle(() => {
        return {
            marginRight: withSpring(textFocused.value ? 55 : 0, { damping: 25, stiffness: 300 }),
        };
    }, [textFocused]);

    return (
        <View style={[centerFlex, { flexDirection: "row", position: "relative" }, containerStyles]}>
            <Animated.View
                style={[
                    inputStyles,
                    {
                        flex: 1,
                        height: 60,
                    },
                ]}>
                <TextInput
                    blurOnSubmit
                    //@ts-ignore
                    enterKeyHint="done"
                    onBlur={() => (textFocused.value = false)}
                    onFocus={() => (textFocused.value = true)}
                    onChangeText={setText}
                    placeholder={placeholder}
                    value={text}
                    style={{
                        backgroundColor: `${colors.line}4D`,
                        borderRadius: 15,
                        fontSize: 20,
                        paddingLeft: 20,
                        fontFamily: "helvetica",
                        textAlign: "left",
                        color: "white",
                        flex: 1,
                    }}
                />
            </Animated.View>
            <Animated.View style={[centerFlex, clearButtonStyles, { position: "absolute", height: 60 }]}>
                <Pressable
                    style={[centerFlex, { flex: 1, paddingHorizontal: 10 }]}
                    disabled={!textFocused}
                    onPress={() => {
                        setText("");
                    }}>
                    <AppText style={{ color: "white" }}>Clear</AppText>
                </Pressable>
            </Animated.View>
        </View>
    );
}
export default AppTextInput;
