import { Pressable, StyleProp, TextInput, TextInputProps, TextStyle, View, ViewProps } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { centerFlex, colors } from "../parameters";
import CloseIcon from "./Icons/CloseIcon";

export type AppTextInputProps = {
    textState: [string, (v: string) => void];
    placeholder: string;
    containerStyles?: ViewProps["style"];
    onBlur?: () => void;
    disable?: boolean;
    textStyle?: StyleProp<TextStyle>;
    pattern?: RegExp;
    inputProps?: TextInputProps;
    hideClearButton?: true;
};

function AppTextInput({
    textState,
    placeholder,
    containerStyles,
    onBlur,
    textStyle,
    inputProps,
    pattern,
    disable,
    hideClearButton,
}: AppTextInputProps) {
    const [text, setText] = textState;

    const updateText = (tentativeInput: string) => {
        if (pattern && tentativeInput !== "") {
            const shouldUpdate = pattern.test(tentativeInput);

            if (!shouldUpdate) return;
        }

        return setText(tentativeInput);
    };

    const blockMultilineOnSecureTextEmpty = inputProps?.secureTextEntry ? undefined : true;

    return (
        <View
            style={[
                centerFlex,
                { flexDirection: "row", position: "relative", backgroundColor: colors.darkGray, borderRadius: 10, height: 45 },
                containerStyles,
            ]}>
            <TextInput
                blurOnSubmit
                //@ts-ignore
                enterKeyHint="done"
                {...{ multiline: blockMultilineOnSecureTextEmpty }}
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
                        fontSize: 16,
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
            {hideClearButton ||
                (disable !== true && text !== "" && (
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
                        exiting={FadeOut}
                        entering={FadeIn}>
                        <Pressable style={[centerFlex, { flex: 1, paddingHorizontal: 10 }]} onPress={() => setText("")}>
                            <CloseIcon />
                        </Pressable>
                    </Animated.View>
                ))}
        </View>
    );
}
export default AppTextInput;
