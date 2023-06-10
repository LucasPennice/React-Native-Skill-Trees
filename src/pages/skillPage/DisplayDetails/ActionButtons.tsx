import { Animated, I18nManager } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import { colors } from "../../../parameters";

const ACTION_BUTTON_WIDTH = 100;

export const LeftAction =
    (onPress: () => void) => (progress: Animated.AnimatedInterpolation<string | number>, dragX: Animated.AnimatedInterpolation<string | number>) => {
        const trans = progress.interpolate({
            inputRange: [0, 1],
            outputRange: [ACTION_BUTTON_WIDTH, 0],
        });
        return (
            <RectButton
                style={{
                    backgroundColor: colors.green,
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: I18nManager.isRTL ? "row" : "row-reverse",
                    borderRadius: 10,
                    width: ACTION_BUTTON_WIDTH,
                }}
                onPress={onPress}>
                <Animated.Text
                    style={[
                        {
                            fontFamily: "helvetica",
                            fontSize: 15,
                            lineHeight: 15,
                            color: "#FFFFFF",
                            transform: [{ translateX: trans }],
                        },
                    ]}>
                    Edit
                </Animated.Text>
            </RectButton>
        );
    };
export const RightAction =
    (onPress: () => void) => (progress: Animated.AnimatedInterpolation<string | number>, dragX: Animated.AnimatedInterpolation<string | number>) => {
        const trans = progress.interpolate({
            inputRange: [0, 1],
            outputRange: [-ACTION_BUTTON_WIDTH, 0],
        });
        return (
            <RectButton
                style={{
                    backgroundColor: colors.red,
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: I18nManager.isRTL ? "row" : "row-reverse",
                    borderRadius: 10,
                    width: ACTION_BUTTON_WIDTH,
                }}
                onPress={onPress}>
                <Animated.Text
                    style={[
                        {
                            fontFamily: "helvetica",
                            fontSize: 15,
                            lineHeight: 15,
                            color: "#FFFFFF",
                            transform: [{ translateX: trans }],
                        },
                    ]}>
                    Delete
                </Animated.Text>
            </RectButton>
        );
    };
