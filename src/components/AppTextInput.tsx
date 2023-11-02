import { Pressable, StyleProp, TextInput, TextInputProps, TextStyle, View, ViewProps } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { centerFlex, colors } from "../parameters";
import CloseIcon from "./Icons/CloseIcon";

function AppTextInput({
    textState,
    placeholder,
    containerStyles,
    onBlur,
    textStyle,
    inputProps,
    pattern,
    disable,
}: {
    textState: [string, (v: string) => void];
    placeholder: string;
    containerStyles?: ViewProps["style"];
    onBlur?: () => void;
    disable?: boolean;
    textStyle?: StyleProp<TextStyle>;
    pattern?: RegExp;
    inputProps?: TextInputProps;
}) {
    const [text, setText] = textState;

    const updateText = (tentativeInput: string) => {
        if (pattern && tentativeInput !== "") {
            const shouldUpdate = pattern.test(tentativeInput);

            if (!shouldUpdate) return;
        }

        return setText(tentativeInput);
    };

    return (
        <View style={[centerFlex, { flexDirection: "row", position: "relative", backgroundColor: "#282A2C", borderRadius: 10 }, containerStyles]}>
            <TextInput
                blurOnSubmit
                //@ts-ignore
                enterKeyHint="done"
                multiline
                onChangeText={disable ? undefined : updateText}
                placeholder={placeholder}
                onBlur={disable ? undefined : onBlur}
                value={text}
                allowFontScaling={false}
                editable={!disable}
                selectTextOnFocus={!disable}
                placeholderTextColor={colors.line}
                style={[
                    {
                        fontSize: 20,
                        paddingTop: 15,
                        paddingBottom: 15,
                        paddingLeft: 20,
                        fontFamily: "helvetica",
                        color: colors.white,
                        flex: 1,
                        marginRight: disable ? 20 : 50,
                    },
                    textStyle,
                ]}
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
                    entering={FadeIn}>
                    <Pressable style={[centerFlex, { flex: 1, paddingHorizontal: 10 }]} onPress={() => setText("")}>
                        <CloseIcon />
                    </Pressable>
                </Animated.View>
            )}
        </View>
    );
}
export default AppTextInput;
