import { Pressable, TextInput, View, ViewProps } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { centerFlex } from "../types";
import AppText from "./AppText";
import { colors } from "../pages/homepage/canvas/parameters";
import { useEffect } from "react";

function AppTextInput({
    textState,
    placeholder,
    containerStyles,
    onlyContainsLettersAndNumbers,
    onBlur,
}: {
    textState: [string, (v: string) => void];
    placeholder: string;
    containerStyles?: ViewProps["style"];
    onlyContainsLettersAndNumbers?: boolean;
    onBlur?: () => void;
}) {
    const [text, setText] = textState;

    const textInputEmpty = useSharedValue(false);

    useEffect(() => {
        textInputEmpty.value = text.length !== 0;
    }, [text]);

    const clearButtonStyles = useAnimatedStyle(() => {
        return {
            right: withSpring(textInputEmpty.value ? 0 : -35, { damping: 25, stiffness: 300 }),
            opacity: withSpring(textInputEmpty.value ? 1 : 0, { damping: 25, stiffness: 300 }),
        };
    }, [textInputEmpty]);

    const inputStyles = useAnimatedStyle(() => {
        return {
            marginRight: withSpring(textInputEmpty.value ? 55 : 0, { damping: 25, stiffness: 300 }),
        };
    }, [textInputEmpty]);

    const allowOnlyLettersInInput = (setter: (v: string) => void) => (tentativeInput: string) => {
        //@ts-ignore
        setter((prev) => {
            let result = tentativeInput;

            if (result === "") return result;

            const containsSpecialCharacter = !/^[a-zA-Z0-9_ ]*$/.test(result);

            const startWithWhitespace = !/^[^\ ]/.test(result);

            if (startWithWhitespace && result !== "") result = result.trimStart();

            const doubleWhitespace = !/^((?!\s{2}).)*$/.test(result);

            if (containsSpecialCharacter || startWithWhitespace || doubleWhitespace) return prev;

            return result;
        });
    };

    const updateText = (tentativeInput: string) => {
        if (onlyContainsLettersAndNumbers) return allowOnlyLettersInInput(setText)(tentativeInput);

        return setText(tentativeInput);
    };

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
                    multiline
                    onChangeText={updateText}
                    placeholder={placeholder}
                    onBlur={onBlur}
                    value={text}
                    style={{
                        backgroundColor: `${colors.line}4D`,
                        borderRadius: 15,
                        fontSize: 20,
                        paddingLeft: 20,
                        paddingTop: 18,
                        fontFamily: "helvetica",
                        textAlign: "left",
                        color: "white",
                        flex: 1,
                    }}
                />
            </Animated.View>
            <Animated.View style={[centerFlex, clearButtonStyles, { position: "absolute", height: 60 }]}>
                <Pressable style={[centerFlex, { flex: 1, paddingHorizontal: 10 }]} onPress={() => setText("")}>
                    <AppText style={{ color: "white" }}>Clear</AppText>
                </Pressable>
            </Animated.View>
        </View>
    );
}
export default AppTextInput;
