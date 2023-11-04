import { Pressable, View } from "react-native";
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";
import { MENU_HIGH_DAMPENING, centerFlex, colors } from "../parameters";
import AppText from "./AppText";

type Props = {
    toggleMode: () => void;
    isLeftSelected: boolean;
    containerWidth: number;
};

const HEIGHT = 45;

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
                    borderColor: "#282A2C",
                    borderWidth: 2,
                    height: HEIGHT,
                    borderRadius: 10,
                    position: "relative",
                    marginBottom: 10,
                },
            ]}>
            <Animated.View
                style={[
                    {
                        position: "absolute",
                        height: HEIGHT,
                        width: containerWidth,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: colors.accent,
                    },
                    transform,
                ]}
            />
            <Pressable onPress={toggleMode} style={[centerFlex, { flex: 1, height: HEIGHT }]}>
                <AppText fontSize={14} style={{ color: colors.white }}>
                    Details
                </AppText>
            </Pressable>
            <Pressable onPress={toggleMode} style={[centerFlex, { height: HEIGHT, flex: 1 }]}>
                <AppText fontSize={14} style={{ color: colors.white }}>
                    Edit
                </AppText>
            </Pressable>
        </View>
    );
}

export default SliderToggler;
