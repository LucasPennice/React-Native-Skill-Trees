import { Pressable } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { centerFlex, colors } from "../parameters";
import SettingsIcon from "./Icons/SettingsIcon";

function OpenSettingsMenu({ openModal, show }: { openModal: () => void; show?: boolean }) {
    const opacity = useAnimatedStyle(() => {
        if (show === false) return { opacity: withTiming(0.5, { duration: 150 }) };

        return { opacity: withTiming(1, { duration: 150 }) };
    }, [show]);

    return (
        <Animated.View style={[opacity, { position: "absolute", top: 70, right: 10 }]}>
            <Pressable
                style={[centerFlex, { width: 50, height: 50, borderRadius: 10, backgroundColor: colors.darkGray }]}
                onPress={() => {
                    if (show === false) return;
                    openModal();
                }}>
                <SettingsIcon />
            </Pressable>
        </Animated.View>
    );
}

export default OpenSettingsMenu;
