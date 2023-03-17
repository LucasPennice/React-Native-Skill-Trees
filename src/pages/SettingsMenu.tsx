import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, withDelay, withSpring } from "react-native-reanimated";
import { selectCanvasDisplaySettings, toggleSettingsMenuOpen, toggleShowLabel, toggleTreeSelector } from "../canvasDisplaySettingsSlice";
import { useAppDispatch, useAppSelector } from "../reduxHooks";

const SETTING_BUTTON_WIDTH = 70;

function SettingsMenu() {
    const dispatch = useAppDispatch();
    const { height, width } = Dimensions.get("window");

    const { menuOpen, showLabel, treeSelectorOpen } = useAppSelector(selectCanvasDisplaySettings);

    //The ammount of different settings the user can choose in the menu
    const QTY_OF_SETTINGS = 3;

    const animatedMenuStyles = useAnimatedStyle(() => {
        return {
            width: withSpring(menuOpen ? (QTY_OF_SETTINGS + 1) * SETTING_BUTTON_WIDTH + QTY_OF_SETTINGS * 20 + 20 : SETTING_BUTTON_WIDTH + 20, {
                damping: 27,
                stiffness: 300,
            }),
        };
    }, [menuOpen]);

    const animatedButtonContainer = useAnimatedStyle(() => {
        return {
            opacity: withDelay(200, withSpring(menuOpen ? 1 : 0, { damping: 27, stiffness: 300 })),
        };
    }, [menuOpen]);

    return (
        <View style={{ position: "absolute", bottom: 10, left: 10 }}>
            <Animated.View style={[animatedMenuStyles, styles.menu]}>
                <Pressable
                    style={{ backgroundColor: "white", opacity: showLabel ? 1 : 0.5, width: SETTING_BUTTON_WIDTH }}
                    onPress={() => dispatch(toggleSettingsMenuOpen())}>
                    <Text>Open</Text>
                </Pressable>
                {menuOpen && (
                    <Animated.View style={[animatedButtonContainer, { display: "flex", flexDirection: "row", gap: 20 }]}>
                        <Pressable
                            style={{ backgroundColor: "white", opacity: showLabel ? 1 : 0.5, width: SETTING_BUTTON_WIDTH }}
                            onPress={() => dispatch(toggleShowLabel())}>
                            <Text>Show Label</Text>
                        </Pressable>
                        <Pressable
                            style={{ backgroundColor: "white", opacity: showLabel ? 1 : 0.5, width: SETTING_BUTTON_WIDTH }}
                            onPress={() => dispatch(toggleTreeSelector())}>
                            <Text>Change Tree</Text>
                        </Pressable>
                        <Pressable
                            style={{ backgroundColor: "white", opacity: showLabel ? 1 : 0.5, width: SETTING_BUTTON_WIDTH }}
                            onPress={() => dispatch(toggleTreeSelector())}>
                            <Text>Center</Text>
                        </Pressable>
                    </Animated.View>
                )}
            </Animated.View>
        </View>
    );
}

export default SettingsMenu;

const styles = StyleSheet.create({
    menu: {
        position: "relative",
        height: 65,
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        gap: 20,
        backgroundColor: "white",
        padding: 10,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,

        elevation: 5,
    },
});
