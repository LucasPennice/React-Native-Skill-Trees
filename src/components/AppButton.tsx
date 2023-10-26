import AppText from "@/components/AppText";
import LoadingIcon from "@/components/LoadingIcon";
import { colors } from "@/parameters";
import { Pressable, StyleSheet, ViewStyle } from "react-native";
import Animated, { ZoomIn, ZoomOut, useAnimatedStyle, withTiming } from "react-native-reanimated";

export type ButtonState = "error" | "idle" | "loading" | "success";

const AppButton = ({
    onPress,
    disabled,
    style,
    state = "idle",
    text,
    disabledStyle,
    pressableStyle,
    color,
}: {
    onPress: () => void;
    disabled?: boolean;
    style?: ViewStyle;
    pressableStyle?: ViewStyle;
    disabledStyle?: ViewStyle;
    state?: ButtonState;
    text?: { [key in ButtonState]?: string };
    color?: { [key in ButtonState]?: string };
}) => {
    const styles = StyleSheet.create({
        container: {
            backgroundColor: colors.darkGray,
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 10,
            borderStyle: "solid",
            borderWidth: 1,
            height: 45,
            borderColor: colors.accent,
        },
    });
    const disabledStyles = disabled ? disabledStyle : undefined;

    const animatedContainerStyles = useAnimatedStyle(() => {
        let borderColor = "";

        switch (state) {
            case "idle":
                borderColor = color?.idle ?? colors.accent;
                break;
            case "error":
                borderColor = color?.error ?? colors.red;
                break;
            case "success":
                borderColor = color?.success ?? colors.green;
                break;
            case "loading":
                borderColor = color?.loading ?? "#E6E6E6";
                break;
            default:
                borderColor = "#E6E6E6";
                break;
        }

        return {
            borderColor: withTiming(borderColor),
        };
    });

    return (
        <Pressable onPressIn={onPress} disabled={disabled} style={pressableStyle}>
            <Animated.View style={[styles.container, animatedContainerStyles, disabledStyles, style]}>
                {state === "idle" && (
                    <Animated.View entering={ZoomIn} exiting={ZoomOut}>
                        <AppText children={text?.idle ?? "Send"} fontSize={14} style={{ color: "#E6E8E6" }} />
                    </Animated.View>
                )}
                {state === "error" && (
                    <Animated.View entering={ZoomIn} exiting={ZoomOut}>
                        <AppText children={text?.error ?? "Error"} fontSize={14} style={{ color: "#E6E8E6" }} />
                    </Animated.View>
                )}
                {state === "success" && (
                    <Animated.View entering={ZoomIn} exiting={ZoomOut}>
                        <AppText children={text?.success ?? "Sent!"} fontSize={14} style={{ color: "#E6E8E6" }} />
                    </Animated.View>
                )}
                {state === "loading" && (
                    <Animated.View entering={ZoomIn} exiting={ZoomOut}>
                        <LoadingIcon backgroundColor={"#00000000"} size={20} />
                    </Animated.View>
                )}
            </Animated.View>
        </Pressable>
    );
};
export default AppButton;
