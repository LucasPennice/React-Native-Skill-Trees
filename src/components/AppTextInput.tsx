import { KeyboardAvoidingView, Pressable, TextInput, TextInputProps, View, ViewProps } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { centerFlex } from "../parameters";
import CloseIcon from "./Icons/CloseIcon";

function AppTextInput({
    textState,
    placeholder,
    containerStyles,
    onlyContainsLettersAndNumbers,
    onBlur,
    inputProps,
    disable,
}: {
    textState: [string, (v: string) => void];
    placeholder: string;
    containerStyles?: ViewProps["style"];
    onlyContainsLettersAndNumbers?: boolean;
    onBlur?: () => void;
    disable?: boolean;
    inputProps: TextInputProps;
}) {
    const [text, setText] = textState;

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
        <KeyboardAvoidingView behavior={"height"}>
            <View
                style={[
                    centerFlex,
                    { flexDirection: "row", position: "relative", backgroundColor: "#282A2C", borderRadius: 10, paddingVertical: 10 },
                    containerStyles,
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
                    allowFontScaling={false}
                    style={{
                        fontSize: 20,
                        paddingLeft: 20,
                        fontFamily: "helvetica",
                        textAlign: "left",
                        textAlignVertical: "center",
                        color: "white",
                        flex: 1,
                        marginRight: disable ? 20 : 50,
                    }}
                    {...inputProps}
                />
                {disable !== true && (
                    <Animated.View
                        style={[
                            centerFlex,
                            {
                                position: "absolute",
                                height: "100%",
                                width: 50,
                                right: 0,
                            },
                        ]}
                        entering={FadeIn}
                        exiting={FadeOut}>
                        <Pressable style={[centerFlex, { flex: 1, paddingHorizontal: 10 }]} onPress={() => setText("")}>
                            <CloseIcon />
                        </Pressable>
                    </Animated.View>
                )}
            </View>
        </KeyboardAvoidingView>
    );
}
export default AppTextInput;
