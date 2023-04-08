import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, withDelay, withSpring } from "react-native-reanimated";
import AppText from "../../../components/AppText";
import {
    selectCanvasDisplaySettings,
    toggleSettingsMenuOpen,
    toggleShowDnDGuides,
    toggleShowLabel,
    toggleTreeSelector,
} from "../../../redux/canvasDisplaySettingsSlice";
import { useAppDispatch, useAppSelector } from "../../../redux/reduxHooks";
import { centerFlex } from "../../../types";
import { colors } from "../canvas/parameters";

const SETTING_BUTTON_WIDTH = 70;

function SettingsMenu() {
    const dispatch = useAppDispatch();

    const { openMenu, showLabel, showDragAndDropGuides } = useAppSelector(selectCanvasDisplaySettings);

    const menuOpen = openMenu === "treeSettings";

    //The ammount of different settings the user can choose in the menu
    const QTY_OF_SETTINGS = 3;

    const animatedMenuStyles = useAnimatedStyle(() => {
        return {
            width: withSpring(menuOpen ? (QTY_OF_SETTINGS + 1) * SETTING_BUTTON_WIDTH + QTY_OF_SETTINGS * 20 + 20 : SETTING_BUTTON_WIDTH + 20, {
                damping: 27,
                stiffness: 400,
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
                <Pressable style={[centerFlex, { width: SETTING_BUTTON_WIDTH, height: 50 }]} onPress={() => dispatch(toggleSettingsMenuOpen())}>
                    <AppText style={{ color: colors.background, fontFamily: "helveticaBold" }}>{menuOpen ? "Close" : "Settings"}</AppText>
                </Pressable>
                {menuOpen && (
                    <>
                        <Animated.View style={[animatedButtonContainer, centerFlex, { display: "flex", flexDirection: "row", gap: 15 }]}>
                            <Pressable
                                style={[centerFlex, { width: 1.3 * SETTING_BUTTON_WIDTH, height: 50, paddingHorizontal: 10 }]}
                                onPress={() => dispatch(toggleShowLabel())}>
                                <AppText style={{ color: colors.background, fontFamily: "helveticaBold" }}>Label {showLabel ? `✓` : `⤫`}</AppText>
                            </Pressable>
                        </Animated.View>
                        <Animated.View style={[animatedButtonContainer, centerFlex, { display: "flex", flexDirection: "row", gap: 15 }]}>
                            <Pressable
                                style={[centerFlex, { width: 2 * SETTING_BUTTON_WIDTH, height: 50, paddingHorizontal: 10 }]}
                                onPress={() => dispatch(toggleShowDnDGuides())}>
                                <AppText style={{ color: colors.background, fontFamily: "helveticaBold" }}>
                                    Drag and Drop Guides {showDragAndDropGuides ? `✓` : `⤫`}
                                </AppText>
                            </Pressable>
                        </Animated.View>
                    </>
                )}
            </Animated.View>
        </View>
    );
}

export default SettingsMenu;

const styles = StyleSheet.create({
    menu: {
        position: "relative",
        height: 50,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        backgroundColor: colors.line,
        paddingHorizontal: 10,
        borderRadius: 10,
    },
});
