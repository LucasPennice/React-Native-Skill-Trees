import { Pressable, View } from "react-native";
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";
import { MENU_HIGH_DAMPENING, centerFlex, colors } from "../parameters";
import AppText from "./AppText";

type Props = {
    toggleMode: () => void;
    isLeftSelected: boolean;
    containerWidth: number;
};

function SliderToggler({ toggleMode, isLeftSelected, containerWidth }: Props) {
    const transform = useAnimatedStyle(() => {
        return { left: withSpring(isLeftSelected ? 0 : containerWidth, MENU_HIGH_DAMPENING) };
    }, [isLeftSelected]);

    return (
        <View
            style={[
                centerFlex,
                {
                    flexDirection: "row",
                    backgroundColor: "#282A2C",
                    height: 50,
                    borderRadius: 10,
                    position: "relative",
                    marginBottom: 10,
                },
            ]}>
            <Animated.View
                style={[
                    {
                        position: "absolute",
                        height: 50,
                        width: containerWidth,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: colors.accent,
                    },
                    transform,
                ]}
            />
            <Pressable onPress={toggleMode} style={[centerFlex, { flex: 1, height: 50 }]}>
                <AppText fontSize={16} style={{ color: colors.unmarkedText }}>
                    Details
                </AppText>
            </Pressable>
            <Pressable onPress={toggleMode} style={[centerFlex, { height: 50, flex: 1 }]}>
                <AppText fontSize={16} style={{ color: colors.unmarkedText }}>
                    Edit
                </AppText>
            </Pressable>
        </View>
    );
}

export default SliderToggler;
