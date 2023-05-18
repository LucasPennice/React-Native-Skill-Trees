import { Animated, Dimensions, I18nManager } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import { colors } from "../../../parameters";

export const LeftAction =
    (onPress: () => void) => (progress: Animated.AnimatedInterpolation<string | number>, dragX: Animated.AnimatedInterpolation<string | number>) => {
        const { width } = Dimensions.get("window");

        const trans = progress.interpolate({
            inputRange: [0, 1],
            outputRange: [width, 0],
        });
        return (
            <RectButton
                style={{
                    flex: 1,
                    backgroundColor: colors.green,
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: I18nManager.isRTL ? "row" : "row-reverse",
                    borderRadius: 10,
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
        const { width } = Dimensions.get("window");

        const trans = progress.interpolate({
            inputRange: [0, 1],
            outputRange: [-width, 0],
        });
        return (
            <RectButton
                style={{
                    flex: 1,
                    backgroundColor: colors.red,
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: I18nManager.isRTL ? "row" : "row-reverse",
                    borderRadius: 10,
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
